import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/constants.dart';
import 'models.dart';

class ApiException implements Exception {
  final String message;
  final int? status;
  ApiException(this.message, [this.status]);
  @override
  String toString() => message;
}

class ApiClient {
  ApiClient({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;
  String? _cookie;

  Uri _uri(String path, [Map<String, String>? query]) {
    final base = AppConfig.apiBaseUrl.replaceAll(RegExp(r'/$'), '');
    return Uri.parse('$base$path').replace(queryParameters: query);
  }

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        if (_cookie != null) 'Cookie': _cookie!,
      };

  Map<String, String> _headersWithPayToken(String? paymentAccessToken) => {
        ..._headers,
        if (paymentAccessToken != null && paymentAccessToken.isNotEmpty)
          'X-Payment-Token': paymentAccessToken,
      };

  Future<http.Response> _get(Uri uri) =>
      _client.get(uri, headers: _headers).timeout(AppConfig.requestTimeout);

  Future<http.Response> _post(Uri uri, {Object? body, Map<String, String>? headers}) => _client
      .post(uri, headers: headers ?? _headers, body: body)
      .timeout(AppConfig.requestTimeout);

  void _captureCookies(http.Response res) {
    final setCookie = res.headers['set-cookie'];
    if (setCookie == null) return;
    final parts = setCookie.split(',').expand((e) => e.split(';')).map((e) => e.trim());
    final cookies = <String>[];
    for (final p in parts) {
      if (p.startsWith('fh_token=') || p.startsWith('fh_admin=') || p.startsWith('fh_pay=')) {
        cookies.add(p);
      }
    }
    if (cookies.isNotEmpty) {
      // Merge with existing cookie jar (keep other roles)
      final existing = <String, String>{};
      if (_cookie != null) {
        for (final c in _cookie!.split('; ')) {
          final i = c.indexOf('=');
          if (i > 0) existing[c.substring(0, i)] = c;
        }
      }
      for (final c in cookies) {
        final i = c.indexOf('=');
        if (i > 0) existing[c.substring(0, i)] = c;
      }
      _cookie = existing.values.join('; ');
    }
  }

  Future<Map<String, dynamic>> _json(http.Response res) async {
    _captureCookies(res);
    Map<String, dynamic> body = {};
    if (res.body.isNotEmpty) {
      final decoded = jsonDecode(res.body);
      if (decoded is Map<String, dynamic>) body = decoded;
    }
    if (res.statusCode >= 400) {
      throw ApiException(body['msg']?.toString() ?? 'Request failed', res.statusCode);
    }
    return body;
  }

  Future<bool> health() async {
    try {
      final res = await _get(_uri('/api/health'));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  Future<Catalog> getCatalog() async {
    final res = await _get(_uri('/api/catalog'));
    final body = await _json(res);
    if (body.containsKey('products')) return Catalog.fromJson(body);
    throw ApiException('Invalid catalog response');
  }

  Future<Map<String, dynamic>> sendOtp({
    required String phone,
    required String mode,
    Map<String, dynamic>? signupData,
  }) async {
    final res = await _post(
      _uri('/api/auth/send-otp'),
      body: jsonEncode({'phone': phone, 'mode': mode, 'signupData': signupData}),
    );
    return _json(res);
  }

  Future<UserSession> verifyOtp({required String phone, required String otp}) async {
    final res = await _post(
      _uri('/api/auth/verify-otp'),
      body: jsonEncode({'phone': phone, 'otp': otp}),
    );
    final body = await _json(res);
    return UserSession.fromJson(Map<String, dynamic>.from(body['session'] as Map));
  }

  Future<UserSession?> me() async {
    final res = await _get(_uri('/api/auth/me'));
    final body = await _json(res);
    if (body['session'] == null) return null;
    return UserSession.fromJson(Map<String, dynamic>.from(body['session'] as Map));
  }

  Future<void> logout() async {
    await _post(_uri('/api/auth/logout'), body: '{}');
    _cookie = null;
  }

  Future<Map<String, dynamic>> placeOrder({
    required Map<String, dynamic> customer,
    required List<Map<String, dynamic>> items,
    required String payment,
    String? promoCode,
    double shippingCost = 0,
  }) async {
    final res = await _post(
      _uri('/api/orders'),
      body: jsonEncode({
        'customer': customer,
        'items': items,
        'payment': payment,
        if (promoCode != null) 'promoCode': promoCode,
        'shippingCost': shippingCost,
      }),
    );
    return _json(res);
  }

  Future<List<OrderSummary>> myOrders() async {
    final res = await _get(_uri('/api/orders/my'));
    final body = await _json(res);
    return (body['orders'] as List? ?? [])
        .map((e) => OrderSummary.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }

  Future<OrderSummary> trackOrder({required String orderId, required String phone}) async {
    final res = await _get(_uri('/api/orders/track', {'orderId': orderId, 'phone': phone}));
    final body = await _json(res);
    return OrderSummary.fromJson(Map<String, dynamic>.from(body['order'] as Map));
  }

  Future<Map<String, dynamic>> paymentConfig() async {
    final res = await _get(_uri('/api/payments/config'));
    return _json(res);
  }

  Future<Map<String, dynamic>> createPhonePePayment(
    String paymentId, {
    String? phone,
    String? paymentAccessToken,
  }) async {
    final res = await _post(
      _uri('/api/payments/$paymentId/phonepe/create'),
      headers: _headersWithPayToken(paymentAccessToken),
      body: jsonEncode({
        if (phone != null && phone.isNotEmpty) 'phone': phone,
        if (paymentAccessToken != null && paymentAccessToken.isNotEmpty)
          'paymentAccessToken': paymentAccessToken,
      }),
    );
    return _json(res);
  }

  Future<Map<String, dynamic>> verifyPhonePePayment(String paymentId) async {
    final res = await _post(_uri('/api/payments/$paymentId/phonepe/verify'), body: '{}');
    return _json(res);
  }

  Future<Map<String, dynamic>> validatePromo(String code, double subtotal) async {
    final res = await _post(
      _uri('/api/promo/validate'),
      body: jsonEncode({'code': code, 'subtotal': subtotal}),
    );
    return _json(res);
  }

  Future<Map<String, dynamic>> checkShipping(String pincode) async {
    final res = await _get(_uri('/api/shipping/serviceability', {'pincode': pincode, 'cod': '1'}));
    return _json(res);
  }

  String mediaUrl(String path) {
    if (path.startsWith('http')) return path;
    final base = AppConfig.apiBaseUrl.replaceAll(RegExp(r'/$'), '');
    final clean = path.startsWith('/') ? path : '/$path';
    return '$base$clean';
  }
}
