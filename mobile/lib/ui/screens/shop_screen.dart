import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../data/models.dart';
import '../../state/app_state.dart';
import '../widgets/product_card.dart';
import 'product_screen.dart';

class ShopScreen extends StatefulWidget {
  const ShopScreen({super.key, this.categoryId, this.brandId, this.saleOnly = false});
  final String? categoryId;
  final String? brandId;
  final bool saleOnly;

  @override
  State<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends State<ShopScreen> {
  String _query = '';
  String? _category;
  String _sort = 'popular';

  @override
  void initState() {
    super.initState();
    _category = widget.categoryId;
  }

  List<Product> _filter(AppState state) {
    var list = List<Product>.from(state.catalog?.products ?? []);
    if (_category != null && _category!.isNotEmpty) {
      list = list.where((p) => p.category == _category).toList();
    }
    if (widget.brandId != null) {
      list = list.where((p) => p.brand.toLowerCase().contains(widget.brandId!.toLowerCase())).toList();
    }
    if (widget.saleOnly) list = list.where((p) => p.isSale).toList();
    if (_query.trim().isNotEmpty) {
      final q = _query.toLowerCase();
      list = list.where((p) => p.name.toLowerCase().contains(q) || p.brand.toLowerCase().contains(q)).toList();
    }
    switch (_sort) {
      case 'price_asc':
        list.sort((a, b) => a.price.compareTo(b.price));
      case 'price_desc':
        list.sort((a, b) => b.price.compareTo(a.price));
      case 'name':
        list.sort((a, b) => a.name.compareTo(b.name));
      default:
        list.sort((a, b) => (b.isPopular ? 1 : 0).compareTo(a.isPopular ? 1 : 0));
    }
    return list;
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final products = _filter(state);
    final categories = state.catalog?.categories ?? [];
    final canPop = Navigator.of(context).canPop();

    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: AppBar(
        title: Text(widget.saleOnly ? 'Sale' : 'Shop'),
        leading: canPop ? const BackButton() : null,
        actions: [
          PopupMenuButton<String>(
            initialValue: _sort,
            onSelected: (v) => setState(() => _sort = v),
            itemBuilder: (_) => const [
              PopupMenuItem(value: 'popular', child: Text('Popular')),
              PopupMenuItem(value: 'price_asc', child: Text('Price: Low–High')),
              PopupMenuItem(value: 'price_desc', child: Text('Price: High–Low')),
              PopupMenuItem(value: 'name', child: Text('Name')),
            ],
            icon: const Icon(Icons.tune_rounded),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 10),
            child: TextField(
              decoration: const InputDecoration(
                hintText: 'Search products, brands…',
                prefixIcon: Icon(Icons.search_rounded, color: AppColors.gray500),
              ),
              onChanged: (v) => setState(() => _query = v),
            ),
          ),
          SizedBox(
            height: 40,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                _FilterChip(label: 'All', selected: _category == null, onTap: () => setState(() => _category = null)),
                ...categories.map((c) => _FilterChip(
                      label: c.name,
                      selected: _category == c.id,
                      onTap: () => setState(() => _category = c.id),
                    )),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 6),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text(
                '${products.length} products',
                style: GoogleFonts.inter(color: AppColors.gray500, fontSize: 13, fontWeight: FontWeight.w600),
              ),
            ),
          ),
          Expanded(
            child: products.isEmpty
                ? Center(child: Text('Nothing matched', style: GoogleFonts.inter(color: AppColors.gray500)))
                : GridView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                    physics: const BouncingScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      mainAxisSpacing: 12,
                      crossAxisSpacing: 12,
                      childAspectRatio: 0.58,
                    ),
                    itemCount: products.length,
                    itemBuilder: (_, i) => ProductCard(
                      product: products[i],
                      onTap: () => Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => ProductScreen(productId: products[i].id)),
                      ),
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({required this.label, required this.selected, required this.onTap});
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) => onTap(),
        showCheckmark: false,
        selectedColor: AppColors.primary,
        labelStyle: GoogleFonts.inter(
          fontWeight: FontWeight.w600,
          fontSize: 12,
          color: selected ? Colors.white : AppColors.gray700,
        ),
        backgroundColor: AppColors.white,
        side: BorderSide(color: selected ? AppColors.primary : AppColors.gray100),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        padding: const EdgeInsets.symmetric(horizontal: 4),
      ),
    );
  }
}
