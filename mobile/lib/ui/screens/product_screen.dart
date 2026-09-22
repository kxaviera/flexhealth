import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../state/app_state.dart';
import '../widgets/common.dart';

class ProductScreen extends StatefulWidget {
  const ProductScreen({super.key, required this.productId});
  final String productId;

  @override
  State<ProductScreen> createState() => _ProductScreenState();
}

class _ProductScreenState extends State<ProductScreen> {
  int qty = 1;

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final product = state.productById(widget.productId);

    if (product == null) {
      return Scaffold(
        appBar: AppBar(),
        body: const Center(child: Text('Product not found')),
      );
    }

    final imageUrl = state.api.mediaUrl(product.image);
    final wishlisted = state.isWishlisted(product.id);

    return Scaffold(
      backgroundColor: AppColors.white,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          SliverAppBar(
            expandedHeight: 360,
            pinned: true,
            backgroundColor: AppColors.white,
            actions: [
              IconButton(
                onPressed: () => state.toggleWishlist(product.id),
                icon: Icon(
                  wishlisted ? Icons.favorite : Icons.favorite_border,
                  color: wishlisted ? AppColors.sale : AppColors.gray700,
                ),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: ColoredBox(
                color: AppColors.gray50,
                child: CachedNetworkImage(imageUrl: imageUrl, fit: BoxFit.contain),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 120),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.brand.toUpperCase(),
                    style: GoogleFonts.inter(
                      color: AppColors.accent,
                      fontWeight: FontWeight.w700,
                      fontSize: 12,
                      letterSpacing: 0.8,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    product.name,
                    style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w800, letterSpacing: -0.5, height: 1.25),
                  ),
                  const SizedBox(height: 14),
                  PriceBlock(price: product.price, originalPrice: product.originalPrice, large: true),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: product.inStock ? AppColors.accentSoft : AppColors.gray100,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      product.inStock ? 'In stock — ships across India' : 'Currently out of stock',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: product.inStock ? AppColors.accentDark : AppColors.gray500,
                      ),
                    ),
                  ),
                  if (product.shortDescription != null && product.shortDescription!.isNotEmpty) ...[
                    const SizedBox(height: 20),
                    Text(product.shortDescription!, style: GoogleFonts.inter(fontSize: 14, height: 1.5, color: AppColors.gray700)),
                  ],
                  if (product.description != null && product.description!.isNotEmpty) ...[
                    const SizedBox(height: 24),
                    Text('About this product', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 8),
                    Text(
                      product.description!.replaceAll(RegExp(r'<[^>]*>'), ' ').replaceAll(RegExp(r'\s+'), ' ').trim(),
                      style: GoogleFonts.inter(fontSize: 14, height: 1.55, color: AppColors.gray700),
                    ),
                  ],
                  const SizedBox(height: 24),
                  const Row(
                    children: [
                      _Perk(icon: Icons.local_shipping_outlined, label: 'Free shipping'),
                      _Perk(icon: Icons.payments_outlined, label: 'COD available'),
                      _Perk(icon: Icons.verified_outlined, label: '100% genuine'),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(top: BorderSide(color: AppColors.gray100)),
          ),
          child: Row(
            children: [
              Container(
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.gray200),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: qty > 1 ? () => setState(() => qty--) : null,
                      icon: const Icon(Icons.remove, size: 18),
                    ),
                    Text('$qty', style: GoogleFonts.inter(fontWeight: FontWeight.w700)),
                    IconButton(
                      onPressed: () => setState(() => qty++),
                      icon: const Icon(Icons.add, size: 18),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: product.inStock
                      ? () {
                          state.addToCart(product, qty: qty);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Added to bag')),
                          );
                        }
                      : null,
                  child: Text(product.inStock ? 'Add to Bag · ${formatPrice(product.price * qty)}' : 'Out of Stock'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Perk extends StatelessWidget {
  const _Perk({required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Icon(icon, color: AppColors.accent, size: 22),
          const SizedBox(height: 6),
          Text(label, textAlign: TextAlign.center, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.gray700)),
        ],
      ),
    );
  }
}
