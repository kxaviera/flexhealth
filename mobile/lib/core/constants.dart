import 'package:flutter/foundation.dart';

/// API base URL.
/// - Chrome / web: http://127.0.0.1:3000
/// - Android emulator: http://10.0.2.2:3000
/// - iOS simulator / desktop: http://127.0.0.1:3000
/// - Override: --dart-define=API_BASE=https://yourdomain.com
abstract final class AppConfig {
  static String get apiBaseUrl {
    const fromEnv = String.fromEnvironment('API_BASE');
    if (fromEnv.isNotEmpty) return fromEnv;
    if (kIsWeb) return 'http://127.0.0.1:3000';
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return 'http://10.0.2.2:3000';
      default:
        return 'http://127.0.0.1:3000';
    }
  }

  static const appName = 'Flex Health';
  static const currency = '₹';
  static const supportPhone = '+919246501017';
  static const whatsapp = '919246501017';
  static const requestTimeout = Duration(seconds: 12);
}
