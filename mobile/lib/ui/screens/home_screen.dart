import 'dart:async';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../data/models.dart';
import '../../state/app_state.dart';
import '../widgets/common.dart';
import 'product_screen.dart';
import 'shop_screen.dart';

/// Homepage UI aligned to the storefront wireframe:
/// Search → Hero carousel → Categories → Sale banner → Featured products.
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();

    if (state.loadingCatalog && state.catalog == null) {
      return const Center(child: CircularProgressIndicator(color: AppColors.accent, strokeWidth: 2));
    }
    if (state.catalogError != null && state.catalog == null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.wifi_off_rounded, size: 40, color: AppColors.gray500),
              const SizedBox(height: 14),
              Text('Connection issue', style: GoogleFonts.inter(fontWeight: FontWeight.w800, fontSize: 18)),
              const SizedBox(height: 8),
              Text(state.catalogError!, textAlign: TextAlign.center, style: GoogleFonts.inter(color: AppColors.gray500, fontSize: 13)),
              const SizedBox(height: 18),
              PrimaryButton(label: 'Try again', onPressed: state.refreshCatalog, expanded: false),
            ],
          ),
        ),
      );
    }

    final catalog = state.catalog!;
    final featured = catalog.products.where((p) => p.isPopular).take(10).toList();
    final featuredFallback = featured.isNotEmpty ? featured : catalog.products.take(10).toList();
    final banners = catalog.banners;
    final categories = catalog.categories;

    return Scaffold(
      backgroundColor: AppColors.white,
      body: SafeArea(
        bottom: false,
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            // ── Search ──────────────────────────────────────────────
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
                child: _SearchBar(
                  onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const ShopScreen())),
                  onFilter: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const ShopScreen(saleOnly: true))),
                ),
              ),
            ),

            // ── Hero carousel ───────────────────────────────────────
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
                child: _HeroCarousel(banners: banners),
              ),
            ),

            // ── Shop by Category ────────────────────────────────────
            if (categories.isNotEmpty) ...[
              SliverToBoxAdapter(
                child: _SectionTitle(
                  title: 'Shop by Category',
                  action: 'View All',
                  onAction: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const ShopScreen())),
                ),
              ),
              SliverToBoxAdapter(child: _CategoryRow(categories: categories)),
            ],

            // ── Sale banner + countdown ─────────────────────────────
            const ContainedSaleBanner(),

            // ── Featured products ───────────────────────────────────
            if (featuredFallback.isNotEmpty) ...[
              SliverToBoxAdapter(
                child: _SectionTitle(
                  title: 'Featured Products',
                  action: 'View All',
                  onAction: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const ShopScreen())),
                ),
              ),
              SliverToBoxAdapter(child: _FeaturedRail(products: featuredFallback)),
            ],

            // ── Brands strip (compact) ──────────────────────────────
            if (catalog.brands.isNotEmpty) ...[
              const SliverToBoxAdapter(child: _SectionTitle(title: 'Shop by Brand')),
              SliverToBoxAdapter(child: _BrandStrip(brands: catalog.brands)),
            ],

            const SliverToBoxAdapter(child: SizedBox(height: 28)),
          ],
        ),
      ),
    );
  }
}

// ─── Search ─────────────────────────────────────────────────────────────────

class _SearchBar extends StatelessWidget {
  const _SearchBar({required this.onTap, required this.onFilter});
  final VoidCallback onTap;
  final VoidCallback onFilter;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.gray50,
      borderRadius: BorderRadius.circular(28),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(28),
        child: Container(
          height: 52,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(28),
            border: Border.all(color: AppColors.gray100),
          ),
          child: Row(
            children: [
              const Icon(Icons.search_rounded, color: AppColors.gray500, size: 22),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Search for products, brands...',
                  style: GoogleFonts.inter(fontSize: 14, color: AppColors.gray500, fontWeight: FontWeight.w500),
                ),
              ),
              InkWell(
                onTap: onFilter,
                borderRadius: BorderRadius.circular(20),
                child: const Padding(
                  padding: EdgeInsets.all(6),
                  child: Icon(Icons.tune_rounded, color: AppColors.gray700, size: 20),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Hero ───────────────────────────────────────────────────────────────────

class _HeroCarousel extends StatefulWidget {
  const _HeroCarousel({required this.banners});
  final List<BannerSlide> banners;

  @override
  State<_HeroCarousel> createState() => _HeroCarouselState();
}

class _HeroCarouselState extends State<_HeroCarousel> {
  final _controller = PageController();
  int _index = 0;
  Timer? _timer;

  List<BannerSlide> get _slides {
    if (widget.banners.isNotEmpty) return widget.banners;
    return const [
      BannerSlide(
        title: 'Fuel Your Fitness Journey',
        subtitle: 'Genuine supplements that move with you.',
        cta: 'Shop Now',
        link: 'shop.html',
        tag: 'Up to 35% OFF',
        image: '',
      ),
    ];
  }

  @override
  void initState() {
    super.initState();
    if (_slides.length > 1) {
      _timer = Timer.periodic(const Duration(seconds: 5), (_) {
        if (!mounted || !_controller.hasClients) return;
        final next = (_index + 1) % _slides.length;
        _controller.animateToPage(next, duration: const Duration(milliseconds: 420), curve: Curves.easeInOut);
      });
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  void _open(BannerSlide b) {
    final sale = b.link.contains('sale=true');
    String? category;
    final m = RegExp(r'category=([^&]+)').firstMatch(b.link);
    if (m != null) category = Uri.decodeComponent(m.group(1)!);
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => ShopScreen(saleOnly: sale, categoryId: category)));
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final slides = _slides;

    return Column(
      children: [
        SizedBox(
          height: 200,
          child: PageView.builder(
            controller: _controller,
            itemCount: slides.length,
            onPageChanged: (i) => setState(() => _index = i),
            itemBuilder: (_, i) {
              final b = slides[i];
              final img = b.image.isNotEmpty ? state.api.mediaUrl(b.image) : null;
              return Container(
                decoration: BoxDecoration(
                  color: AppColors.gray50,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.gray100),
                ),
                clipBehavior: Clip.antiAlias,
                child: Stack(
                  children: [
                    if (img != null)
                      Positioned.fill(
                        child: Opacity(
                          opacity: 0.22,
                          child: CachedNetworkImage(imageUrl: img, fit: BoxFit.cover, errorWidget: (_, __, ___) => const SizedBox()),
                        ),
                      ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 20, 16, 18),
                      child: Row(
                        children: [
                          Expanded(
                            flex: 6,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  b.title,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w800, height: 1.15, letterSpacing: -0.5),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  b.subtitle,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: GoogleFonts.inter(fontSize: 13, color: AppColors.gray500, height: 1.35),
                                ),
                                const Spacer(),
                                Row(
                                  children: [
                                    ElevatedButton(
                                      onPressed: () => _open(b),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppColors.primary,
                                        foregroundColor: Colors.white,
                                        elevation: 0,
                                        minimumSize: const Size(0, 40),
                                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                        textStyle: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 13),
                                      ),
                                      child: Text(b.cta.isEmpty ? 'Shop Now' : b.cta),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 10),
                                Row(
                                  children: [
                                    const Icon(Icons.local_offer_outlined, size: 14, color: AppColors.sale),
                                    const SizedBox(width: 6),
                                    Flexible(
                                      child: Text(
                                        b.tag.isEmpty ? 'Special offer' : b.tag,
                                        style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.gray700),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            flex: 4,
                            child: Container(
                              height: double.infinity,
                              decoration: BoxDecoration(
                                color: AppColors.white,
                                borderRadius: BorderRadius.circular(14),
                              ),
                              padding: const EdgeInsets.all(10),
                              child: img != null
                                  ? CachedNetworkImage(
                                      imageUrl: img,
                                      fit: BoxFit.contain,
                                      errorWidget: (_, __, ___) => const Icon(Icons.fitness_center, color: AppColors.gray300, size: 40),
                                    )
                                  : const Icon(Icons.fitness_center, color: AppColors.gray300, size: 40),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
        if (slides.length > 1) ...[
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(slides.length, (i) {
              final active = i == _index;
              return AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                margin: const EdgeInsets.symmetric(horizontal: 3),
                width: active ? 8 : 6,
                height: active ? 8 : 6,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: active ? AppColors.primary : AppColors.gray200,
                ),
              );
            }),
          ),
        ],
      ],
    );
  }
}

// ─── Section title ──────────────────────────────────────────────────────────

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.title, this.action, this.onAction});
  final String title;
  final String? action;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 26, 8, 14),
      child: Row(
        children: [
          Expanded(
            child: Text(title, style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w800, letterSpacing: -0.3)),
          ),
          if (action != null && onAction != null)
            TextButton(
              onPressed: onAction,
              style: TextButton.styleFrom(
                foregroundColor: AppColors.gray700,
                padding: const EdgeInsets.symmetric(horizontal: 8),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(action!, style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 13)),
                  const SizedBox(width: 2),
                  const Icon(Icons.chevron_right_rounded, size: 18),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

// ─── Categories ─────────────────────────────────────────────────────────────

class _CategoryRow extends StatelessWidget {
  const _CategoryRow({required this.categories});
  final List<Category> categories;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 108,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        itemCount: categories.length.clamp(0, 12),
        separatorBuilder: (_, __) => const SizedBox(width: 14),
        itemBuilder: (_, i) {
          final c = categories[i];
          return GestureDetector(
            onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => ShopScreen(categoryId: c.id))),
            child: SizedBox(
              width: 72,
              child: Column(
                children: [
                  Container(
                    width: 68,
                    height: 68,
                    decoration: BoxDecoration(
                      color: AppColors.gray50,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.gray100),
                    ),
                    alignment: Alignment.center,
                    child: Text(c.icon, style: const TextStyle(fontSize: 28)),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    c.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.gray700),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

// ─── Sale banner ────────────────────────────────────────────────────────────

class ContainedSaleBanner extends StatelessWidget {
  const ContainedSaleBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 22, 16, 0),
        child: _SaleBanner(
          onShop: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const ShopScreen(saleOnly: true))),
        ),
      ),
    );
  }
}

class _SaleBanner extends StatefulWidget {
  const _SaleBanner({required this.onShop});
  final VoidCallback onShop;

  @override
  State<_SaleBanner> createState() => _SaleBannerState();
}

class _SaleBannerState extends State<_SaleBanner> {
  late Duration _left;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    // Rolling end-of-day style urgency countdown (resets daily at midnight local).
    final now = DateTime.now();
    final end = DateTime(now.year, now.month, now.day).add(const Duration(days: 1));
    _left = end.difference(now);
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      final n = DateTime.now();
      final e = DateTime(n.year, n.month, n.day).add(const Duration(days: 1));
      setState(() => _left = e.difference(n));
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String _two(int n) => n.toString().padLeft(2, '0');

  @override
  Widget build(BuildContext context) {
    final h = _left.inHours;
    final m = _left.inMinutes.remainder(60);
    final s = _left.inSeconds.remainder(60);

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.gray50,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.gray100),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 28,
                          height: 28,
                          decoration: BoxDecoration(
                            color: AppColors.saleSoft,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.percent_rounded, size: 16, color: AppColors.sale),
                        ),
                        const SizedBox(width: 8),
                        Text('Flash Sale is Live!', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.gray700)),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text('Flat 40% OFF', style: GoogleFonts.inter(fontSize: 26, fontWeight: FontWeight.w800, letterSpacing: -0.6)),
                    const SizedBox(height: 4),
                    Text(
                      'Limited time only. Shop before it\'s gone!',
                      style: GoogleFonts.inter(fontSize: 12, color: AppColors.gray500),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Column(
                children: [
                  ElevatedButton(
                    onPressed: widget.onShop,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      minimumSize: const Size(0, 40),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      textStyle: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 12),
                    ),
                    child: const Text('Shop the Sale'),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      _TimeBlock(value: _two(h), label: 'HRS'),
                      _TimeSep(),
                      _TimeBlock(value: _two(m), label: 'MIN'),
                      _TimeSep(),
                      _TimeBlock(value: _two(s), label: 'SEC'),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _TimeBlock extends StatelessWidget {
  const _TimeBlock({required this.value, required this.label});
  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: 0.5)),
        Text(label, style: GoogleFonts.inter(fontSize: 9, fontWeight: FontWeight.w600, color: AppColors.gray500)),
      ],
    );
  }
}

class _TimeSep extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: Text(':', style: GoogleFonts.inter(fontWeight: FontWeight.w800, fontSize: 14)),
    );
  }
}

// ─── Featured rail ──────────────────────────────────────────────────────────

class _FeaturedRail extends StatelessWidget {
  const _FeaturedRail({required this.products});
  final List<Product> products;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 268,
      child: ListView.separated(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
        scrollDirection: Axis.horizontal,
        itemCount: products.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (_, i) => SizedBox(
          width: 168,
          child: _FeaturedCard(product: products[i]),
        ),
      ),
    );
  }
}

class _FeaturedCard extends StatelessWidget {
  const _FeaturedCard({required this.product});
  final Product product;

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final imageUrl = state.api.mediaUrl(product.image);
    final wishlisted = state.isWishlisted(product.id);
    // Stable display rating from product id hash (UI social proof).
    final rating = 4.5 + (product.id.hashCode.abs() % 5) / 10;

    return GestureDetector(
      onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => ProductScreen(productId: product.id))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Stack(
              fit: StackFit.expand,
              children: [
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.gray50,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.gray100),
                  ),
                  padding: const EdgeInsets.all(12),
                  child: CachedNetworkImage(
                    imageUrl: imageUrl,
                    fit: BoxFit.contain,
                    errorWidget: (_, __, ___) => const Icon(Icons.fitness_center, color: AppColors.gray300),
                  ),
                ),
                Positioned(
                  top: 8,
                  right: 8,
                  child: Material(
                    color: Colors.white,
                    shape: const CircleBorder(),
                    elevation: 1,
                    child: InkWell(
                      customBorder: const CircleBorder(),
                      onTap: () => state.toggleWishlist(product.id),
                      child: Padding(
                        padding: const EdgeInsets.all(7),
                        child: Icon(
                          wishlisted ? Icons.favorite : Icons.favorite_border,
                          size: 16,
                          color: wishlisted ? AppColors.sale : AppColors.gray500,
                        ),
                      ),
                    ),
                  ),
                ),
                if (product.inStock)
                  Positioned(
                    right: 8,
                    bottom: 8,
                    child: Material(
                      color: AppColors.primary,
                      shape: const CircleBorder(),
                      child: InkWell(
                        customBorder: const CircleBorder(),
                        onTap: () {
                          state.addToCart(product);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Added to bag'), duration: Duration(milliseconds: 900)),
                          );
                        },
                        child: const Padding(
                          padding: EdgeInsets.all(9),
                          child: Icon(Icons.shopping_bag_outlined, color: Colors.white, size: 16),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              ...List.generate(5, (i) => Icon(Icons.star_rounded, size: 13, color: i < rating.floor() ? AppColors.warning : AppColors.gray200)),
              const SizedBox(width: 4),
              Text('(${rating.toStringAsFixed(1)})', style: GoogleFonts.inter(fontSize: 11, color: AppColors.gray500, fontWeight: FontWeight.w500)),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            product.name,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 2),
          Text(
            formatPrice(product.price),
            style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w800),
          ),
        ],
      ),
    );
  }
}

// ─── Brands ─────────────────────────────────────────────────────────────────

class _BrandStrip extends StatelessWidget {
  const _BrandStrip({required this.brands});
  final List<Brand> brands;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 64,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        itemCount: brands.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (_, i) {
          final b = brands[i];
          final logo = b.logo;
          final url = logo != null && logo.isNotEmpty ? context.read<AppState>().api.mediaUrl(logo) : null;
          return InkWell(
            onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => ShopScreen(brandId: b.name))),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              width: 100,
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.gray100),
              ),
              child: url != null
                  ? CachedNetworkImage(
                      imageUrl: url,
                      fit: BoxFit.contain,
                      errorWidget: (_, __, ___) => Center(
                        child: Text(b.name, textAlign: TextAlign.center, maxLines: 2, style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700)),
                      ),
                    )
                  : Center(
                      child: Text(b.name, textAlign: TextAlign.center, maxLines: 2, style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700)),
                    ),
            ),
          );
        },
      ),
    );
  }
}
