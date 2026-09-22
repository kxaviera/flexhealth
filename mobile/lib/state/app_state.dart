import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/constants.dart';
import '../data/api_client.dart';
import '../data/models.dart';

class AppState extends ChangeNotifier {
  AppState(this.api);

  final ApiClient api;

  Catalog? catalog;
  bool loadingCatalog = true;
  String? catalogError;
  bool apiOnline = false;

  final List<CartLine> cart = [];
  final Set<String> wishlist = {};
  UserSession? session;
  String? appliedPromo;
  double promoDiscount = 0;

  bool get isLoggedIn => session != null;
  int get cartCount => cart.fold(0, (s, l) => s + l.qty);
  double get cartSubtotal => cart.fold(0, (s, l) => s + l.lineTotal);
  double get cartTotal => (cartSubtotal - promoDiscount).clamp(0, double.infinity);

  Future<void> init() async {
    try {
      await _loadLocal().timeout(const Duration(seconds: 3));
    } catch (_) {}
    try {
      apiOnline = await api.health();
      if (apiOnline) {
        try {
          final me = await api.me().timeout(AppConfig.requestTimeout);
          if (me != null) session = me;
        } catch (_) {}
      }
    } catch (_) {
      apiOnline = false;
    }
    await refreshCatalog();
  }

  Future<void> refreshCatalog() async {
    loadingCatalog = true;
    catalogError = null;
    notifyListeners();
    try {
      catalog = await api.getCatalog();
      apiOnline = true;
      restoreCartAfterCatalog();
    } catch (e) {
      catalogError = e.toString().replaceFirst('TimeoutException: ', 'Timed out — ');
      apiOnline = false;
    }
    loadingCatalog = false;
    notifyListeners();
  }

  Product? productById(String id) {
    try {
      return catalog?.products.firstWhere((p) => p.id == id);
    } catch (_) {
      return null;
    }
  }

  void addToCart(Product product, {int qty = 1}) {
    final i = cart.indexWhere((l) => l.product.id == product.id);
    if (i >= 0) {
      cart[i] = cart[i].copyWith(qty: cart[i].qty + qty);
    } else {
      cart.add(CartLine(product: product, qty: qty));
    }
    _saveCart();
    notifyListeners();
  }

  void setQty(String productId, int qty) {
    final i = cart.indexWhere((l) => l.product.id == productId);
    if (i < 0) return;
    if (qty <= 0) {
      cart.removeAt(i);
    } else {
      cart[i] = cart[i].copyWith(qty: qty);
    }
    _saveCart();
    notifyListeners();
  }

  void removeFromCart(String productId) {
    cart.removeWhere((l) => l.product.id == productId);
    _saveCart();
    notifyListeners();
  }

  void clearCart() {
    cart.clear();
    appliedPromo = null;
    promoDiscount = 0;
    _saveCart();
    notifyListeners();
  }

  void toggleWishlist(String productId) {
    if (wishlist.contains(productId)) {
      wishlist.remove(productId);
    } else {
      wishlist.add(productId);
    }
    _saveWishlist();
    notifyListeners();
  }

  bool isWishlisted(String id) => wishlist.contains(id);

  Future<void> applyPromo(String code) async {
    final res = await api.validatePromo(code, cartSubtotal);
    if (res['ok'] == true) {
      appliedPromo = res['code']?.toString();
      promoDiscount = (res['discountAmount'] as num?)?.toDouble() ?? 0;
      notifyListeners();
    } else {
      throw ApiException(res['msg']?.toString() ?? 'Invalid promo');
    }
  }

  void clearPromo() {
    appliedPromo = null;
    promoDiscount = 0;
    notifyListeners();
  }

  Future<void> setSession(UserSession s) async {
    session = s;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('fh_session', jsonEncode(s.toJson()));
    notifyListeners();
  }

  Future<void> logout() async {
    try {
      await api.logout();
    } catch (_) {}
    session = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('fh_session');
    notifyListeners();
  }

  Future<void> _loadLocal() async {
    final prefs = await SharedPreferences.getInstance();
    final cartRaw = prefs.getString('fh_cart');
    if (cartRaw != null) {
      // cart restored after catalog loads via ids — store soft
      _pendingCart = cartRaw;
    }
    final wish = prefs.getStringList('fh_wishlist') ?? [];
    wishlist.addAll(wish);
    final sess = prefs.getString('fh_session');
    if (sess != null) {
      try {
        session = UserSession.fromJson(jsonDecode(sess) as Map<String, dynamic>);
      } catch (_) {}
    }
  }

  String? _pendingCart;

  void restoreCartAfterCatalog() {
    if (_pendingCart == null || catalog == null) return;
    try {
      final list = jsonDecode(_pendingCart!) as List;
      cart.clear();
      for (final e in list) {
        final m = Map<String, dynamic>.from(e as Map);
        final p = productById('${m['id']}');
        if (p != null) {
          cart.add(CartLine(product: p, qty: (m['qty'] as num?)?.toInt() ?? 1));
        }
      }
    } catch (_) {}
    _pendingCart = null;
    notifyListeners();
  }

  Future<void> _saveCart() async {
    final prefs = await SharedPreferences.getInstance();
    final data = cart.map((l) => {'id': l.product.id, 'qty': l.qty}).toList();
    await prefs.setString('fh_cart', jsonEncode(data));
  }

  Future<void> _saveWishlist() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList('fh_wishlist', wishlist.toList());
  }
}
