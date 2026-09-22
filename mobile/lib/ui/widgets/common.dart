import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_colors.dart';

final _inr = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

String formatPrice(num value) => _inr.format(value);

class FhLogo extends StatelessWidget {
  const FhLogo({super.key, this.compact = false});
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: compact ? 32 : 36,
          height: compact ? 32 : 36,
          decoration: BoxDecoration(
            color: AppColors.dark,
            borderRadius: BorderRadius.circular(10),
          ),
          alignment: Alignment.center,
          child: Text(
            'F',
            style: GoogleFonts.inter(
              color: Colors.white,
              fontWeight: FontWeight.w800,
              fontSize: compact ? 14 : 16,
            ),
          ),
        ),
        if (!compact) ...[
          const SizedBox(width: 10),
          RichText(
            text: TextSpan(
              style: GoogleFonts.inter(fontSize: 17, fontWeight: FontWeight.w800, letterSpacing: -0.4, color: AppColors.dark),
              children: const [
                TextSpan(text: 'Flex '),
                TextSpan(text: 'Health', style: TextStyle(color: AppColors.accent, fontWeight: FontWeight.w700)),
              ],
            ),
          ),
        ],
      ],
    );
  }
}

class SectionHeader extends StatelessWidget {
  const SectionHeader({super.key, required this.title, this.subtitle, this.actionLabel, this.onAction});
  final String title;
  final String? subtitle;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 28, 8, 14),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (subtitle != null) ...[
                  Text(
                    subtitle!.toUpperCase(),
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.2,
                      color: AppColors.accent,
                    ),
                  ),
                  const SizedBox(height: 6),
                ],
                Text(
                  title,
                  style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w800, letterSpacing: -0.6),
                ),
              ],
            ),
          ),
          if (actionLabel != null && onAction != null)
            TextButton(
              onPressed: onAction,
              child: Text(actionLabel!, style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 13)),
            ),
        ],
      ),
    );
  }
}

class PrimaryButton extends StatelessWidget {
  const PrimaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.loading = false,
    this.expanded = true,
  });
  final String label;
  final VoidCallback? onPressed;
  final bool loading;
  final bool expanded;

  @override
  Widget build(BuildContext context) {
    final child = loading
        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2.2, color: Colors.white))
        : Text(label);
    final btn = ElevatedButton(onPressed: loading ? null : onPressed, child: child);
    return expanded ? SizedBox(width: double.infinity, child: btn) : btn;
  }
}

class PriceBlock extends StatelessWidget {
  const PriceBlock({super.key, required this.price, this.originalPrice, this.large = false});
  final double price;
  final double? originalPrice;
  final bool large;

  @override
  Widget build(BuildContext context) {
    final discount = originalPrice != null && originalPrice! > price
        ? (((originalPrice! - price) / originalPrice!) * 100).round()
        : null;
    return Wrap(
      crossAxisAlignment: WrapCrossAlignment.center,
      spacing: 6,
      children: [
        Text(
          formatPrice(price),
          style: GoogleFonts.inter(
            fontSize: large ? 24 : 15,
            fontWeight: FontWeight.w800,
            color: AppColors.gray900,
            letterSpacing: -0.4,
          ),
        ),
        if (originalPrice != null && originalPrice! > price)
          Text(
            formatPrice(originalPrice!),
            style: GoogleFonts.inter(
              fontSize: large ? 13 : 12,
              color: AppColors.gray500,
              decoration: TextDecoration.lineThrough,
            ),
          ),
        if (discount != null)
          Text(
            '-$discount%',
            style: GoogleFonts.inter(
              fontSize: large ? 13 : 12,
              fontWeight: FontWeight.w700,
              color: AppColors.sale,
            ),
          ),
      ],
    );
  }
}

/// Matches website `.top-bar` marquee (free shipping etc).
class TopPromoBar extends StatefulWidget {
  const TopPromoBar({super.key});

  static const items = [
    'Free shipping across India',
    '100% genuine since 2005',
    'Cash on delivery available',
    '+91 924 650 1017',
  ];

  @override
  State<TopPromoBar> createState() => _TopPromoBarState();
}

class _TopPromoBarState extends State<TopPromoBar> {
  late final ScrollController _scroll;

  @override
  void initState() {
    super.initState();
    _scroll = ScrollController();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loop());
  }

  Future<void> _loop() async {
    while (mounted) {
      await Future<void>.delayed(const Duration(milliseconds: 40));
      if (!_scroll.hasClients) continue;
      final max = _scroll.position.maxScrollExtent;
      if (max <= 0) continue;
      final next = _scroll.offset + 0.6;
      if (next >= max) {
        _scroll.jumpTo(0);
      } else {
        _scroll.jumpTo(next);
      }
    }
  }

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final doubled = [...TopPromoBar.items, ...TopPromoBar.items, ...TopPromoBar.items];
    return Container(
      width: double.infinity,
      height: 36,
      margin: const EdgeInsets.only(top: 4),
      decoration: const BoxDecoration(
        gradient: LinearGradient(colors: [AppColors.topBarStart, AppColors.topBarMid, AppColors.topBarStart]),
        border: Border(bottom: BorderSide(color: AppColors.accent, width: 2)),
      ),
      child: ListView.separated(
        controller: _scroll,
        scrollDirection: Axis.horizontal,
        physics: const NeverScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: doubled.length,
        separatorBuilder: (_, __) => Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14),
          child: Center(child: Text('·', style: GoogleFonts.inter(color: Colors.white54, fontSize: 18))),
        ),
        itemBuilder: (_, i) => Center(
          child: Text(
            doubled[i],
            style: GoogleFonts.inter(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w500),
          ),
        ),
      ),
    );
  }
}
