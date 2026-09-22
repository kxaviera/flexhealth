import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../state/app_state.dart';
import 'login_screen.dart';

/// Order / promo style notifications (app shell tab).
class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  static const _items = [
    _Notif(
      icon: Icons.local_shipping_outlined,
      title: 'Free shipping on every order',
      body: 'We deliver genuine supplements across India at no extra shipping cost.',
      time: 'Promo',
      color: AppColors.accent,
    ),
    _Notif(
      icon: Icons.local_offer_outlined,
      title: 'Flash sale is live',
      body: 'Limited-time deals on whey, mass gainers and combos. Shop Featured Offers.',
      time: 'Deals',
      color: AppColors.sale,
    ),
    _Notif(
      icon: Icons.verified_outlined,
      title: '100% genuine guarantee',
      body: 'Authorized brand distributors only — lab-tested products since 2005.',
      time: 'Trust',
      color: AppColors.primary,
    ),
    _Notif(
      icon: Icons.payments_outlined,
      title: 'COD & PhonePe available',
      body: 'Pay on delivery or checkout securely with PhonePe.',
      time: 'Payments',
      color: AppColors.accentDark,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final loggedIn = context.watch<AppState>().isLoggedIn;

    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: AppBar(
        title: Text('Notifications', style: GoogleFonts.inter(fontWeight: FontWeight.w800)),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
        children: [
          if (!loggedIn)
            Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.accentSoft,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.accent.withValues(alpha: 0.2)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.notifications_active_outlined, color: AppColors.accentDark),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Sign in to get order tracking alerts.',
                      style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.accentDark),
                    ),
                  ),
                  TextButton(
                    onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const LoginScreen())),
                    child: const Text('Sign in'),
                  ),
                ],
              ),
            ),
          ..._items.map((n) => Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.gray100),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: n.color.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(n.icon, color: n.color, size: 22),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(n.title, style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 14)),
                              ),
                              Text(n.time, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.gray500)),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(n.body, style: GoogleFonts.inter(fontSize: 13, height: 1.4, color: AppColors.gray700)),
                        ],
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }
}

class _Notif {
  const _Notif({
    required this.icon,
    required this.title,
    required this.body,
    required this.time,
    required this.color,
  });
  final IconData icon;
  final String title;
  final String body;
  final String time;
  final Color color;
}
