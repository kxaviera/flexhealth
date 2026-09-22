import 'package:flutter/material.dart';

/// Flex Health — matches website `css/styles.css` :root tokens.
abstract final class AppColors {
  static const primary = Color(0xFF111827);
  static const primaryDark = Color(0xFF030712);
  static const primaryLight = Color(0xFFF3F4F6);
  static const accent = Color(0xFF059669);
  static const accentDark = Color(0xFF047857);
  static const accentSoft = Color(0xFFECFDF5);
  static const sale = Color(0xFFDC2626);
  static const saleSoft = Color(0xFFFEF2F2);
  static const dark = Color(0xFF111827);
  static const darkSoft = Color(0xFF1F2937);
  static const gray900 = Color(0xFF111827);
  static const gray700 = Color(0xFF374151);
  static const gray500 = Color(0xFF6B7280);
  static const gray300 = Color(0xFFD1D5DB);
  static const gray200 = Color(0xFFE5E7EB);
  static const gray100 = Color(0xFFF3F4F6);
  static const gray50 = Color(0xFFF9FAFB);
  static const white = Color(0xFFFFFFFF);
  static const warning = Color(0xFFF59E0B);

  // Aliases used across app
  static const ink = primary;
  static const inkSoft = gray700;
  static const muted = gray500;
  static const line = gray100;
  static const canvas = white;
  static const surface = white;
  static const accentLight = accentSoft;
  static const imagePlate = gray50;
  static const brass = accent;
  static const brassSoft = accentSoft;
  static const topBarStart = Color(0xFF0F172A);
  static const topBarMid = Color(0xFF1E293B);
}
