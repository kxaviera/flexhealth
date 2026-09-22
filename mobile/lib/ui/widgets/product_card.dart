import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../data/models.dart';
import '../../state/app_state.dart';
import 'common.dart';

/// Website-style product card: border, badge, wishlist, Add to Bag.
class ProductCard extends StatelessWidget {
  const ProductCard({super.key, required this.product, required this.onTap, this.rail = false});
  final Product product;
  final VoidCallback onTap;
  final bool rail;

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final imageUrl = state.api.mediaUrl(product.image);
    final wishlisted = state.isWishlisted(product.id);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.gray100),
          boxShadow: const [BoxShadow(color: Color(0x0A000000), blurRadius: 8, offset: Offset(0, 2))],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              flex: rail ? 5 : 5,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  ColoredBox(
                    color: AppColors.gray50,
                    child: Padding(
                      padding: const EdgeInsets.all(10),
                      child: CachedNetworkImage(
                        imageUrl: imageUrl,
                        fit: BoxFit.contain,
                        placeholder: (_, __) => const Center(
                          child: SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.accent)),
                        ),
                        errorWidget: (_, __, ___) => const Icon(Icons.fitness_center, color: AppColors.gray300),
                      ),
                    ),
                  ),
                  if (!product.inStock || product.badge != null)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: !product.inStock
                              ? AppColors.gray900
                              : product.isSale
                                  ? AppColors.saleSoft
                                  : AppColors.accentSoft,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(
                            color: !product.inStock
                                ? AppColors.gray900
                                : product.isSale
                                    ? const Color(0xFFFECACA)
                                    : AppColors.accent.withValues(alpha: 0.3),
                          ),
                        ),
                        child: Text(
                          !product.inStock ? 'Sold out' : product.badge!,
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: !product.inStock
                                ? Colors.white
                                : product.isSale
                                    ? const Color(0xFFB91C1C)
                                    : AppColors.accentDark,
                          ),
                        ),
                      ),
                    ),
                  Positioned(
                    top: 4,
                    right: 4,
                    child: IconButton(
                      visualDensity: VisualDensity.compact,
                      onPressed: () => state.toggleWishlist(product.id),
                      icon: Icon(
                        wishlisted ? Icons.favorite : Icons.favorite_border,
                        size: 18,
                        color: wishlisted ? AppColors.sale : AppColors.gray500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              flex: rail ? 5 : 5,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.brand.toUpperCase(),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.6,
                        color: AppColors.gray500,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      product.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, height: 1.25),
                    ),
                    const Spacer(),
                    PriceBlock(price: product.price, originalPrice: product.originalPrice),
                    const SizedBox(height: 8),
                    SizedBox(
                      width: double.infinity,
                      height: 34,
                      child: ElevatedButton(
                        onPressed: product.inStock
                            ? () {
                                state.addToCart(product);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Added to bag'), duration: Duration(milliseconds: 900)),
                                );
                              }
                            : null,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          padding: EdgeInsets.zero,
                          textStyle: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        child: const Text('Add to Bag'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
