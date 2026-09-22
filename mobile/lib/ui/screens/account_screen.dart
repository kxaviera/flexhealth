import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../data/models.dart';
import '../../state/app_state.dart';
import '../widgets/common.dart';
import 'login_screen.dart';
import 'product_screen.dart';

class AccountScreen extends StatefulWidget {
  const AccountScreen({super.key});

  @override
  State<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends State<AccountScreen> {
  List<OrderSummary> orders = [];
  bool loadingOrders = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadOrders());
  }

  Future<void> _loadOrders() async {
    final state = context.read<AppState>();
    if (!state.isLoggedIn) return;
    setState(() => loadingOrders = true);
    try {
      orders = await state.api.myOrders();
    } catch (_) {
      orders = [];
    }
    if (mounted) setState(() => loadingOrders = false);
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();

    if (!state.isLoggedIn) {
      return Scaffold(
        backgroundColor: AppColors.white,
        appBar: AppBar(title: const Text('Account')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const FhLogo(),
                const SizedBox(height: 20),
                Text('Your fitness store, personalized', style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w800), textAlign: TextAlign.center),
                const SizedBox(height: 8),
                Text('Sign in to track orders, wishlist & reviews', textAlign: TextAlign.center, style: GoogleFonts.inter(color: AppColors.gray500)),
                const SizedBox(height: 24),
                PrimaryButton(
                  label: 'Sign in with OTP',
                  onPressed: () async {
                    await Navigator.of(context).push(MaterialPageRoute(builder: (_) => const LoginScreen()));
                    _loadOrders();
                  },
                ),
              ],
            ),
          ),
        ),
      );
    }

    final wishProducts = state.wishlist.map(state.productById).whereType<Product>().toList();

    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: AppBar(
        title: const Text('My Account'),
        actions: [
          TextButton(onPressed: () async => state.logout(), child: const Text('Logout')),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadOrders,
        color: AppColors.accent,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [AppColors.topBarStart, AppColors.topBarMid]),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: AppColors.accent,
                    child: Text(
                      state.session!.name.isNotEmpty ? state.session!.name[0].toUpperCase() : 'F',
                      style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w800, color: Colors.white),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(state.session!.name, style: GoogleFonts.inter(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800)),
                        Text('+91 ${state.session!.phone}', style: GoogleFonts.inter(color: Colors.white70, fontSize: 13)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SectionHeader(title: 'Orders', subtitle: 'Track deliveries'),
            if (loadingOrders)
              const Padding(padding: EdgeInsets.all(24), child: Center(child: CircularProgressIndicator(color: AppColors.accent)))
            else if (orders.isEmpty)
              Padding(
                padding: const EdgeInsets.all(16),
                child: Text('No orders yet — shop your first stack.', style: GoogleFonts.inter(color: AppColors.gray500)),
              )
            else
              ...orders.map((o) => Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      border: Border.all(color: AppColors.gray100),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Flexible(child: Text(o.id, style: GoogleFonts.inter(fontWeight: FontWeight.w800), overflow: TextOverflow.ellipsis)),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(color: AppColors.accentSoft, borderRadius: BorderRadius.circular(6)),
                              child: Text(
                                o.status.replaceAll('_', ' '),
                                style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.accentDark),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text('${o.items.length} item(s) · ${formatPrice(o.total)}', style: GoogleFonts.inter(color: AppColors.gray500, fontSize: 13)),
                        if (o.awb != null) ...[
                          const SizedBox(height: 4),
                          Text('${o.courierName ?? 'Delhivery'} · AWB ${o.awb}', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                        ],
                      ],
                    ),
                  )),
            if (wishProducts.isNotEmpty) ...[
              const SectionHeader(title: 'Wishlist'),
              ...wishProducts.take(10).map((p) => ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(p.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 13)),
                    subtitle: Text(formatPrice(p.price)),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => ProductScreen(productId: p.id))),
                  )),
            ],
            const SizedBox(height: 16),
            const _TrackGuestCard(),
          ],
        ),
      ),
    );
  }
}

class _TrackGuestCard extends StatefulWidget {
  const _TrackGuestCard();

  @override
  State<_TrackGuestCard> createState() => _TrackGuestCardState();
}

class _TrackGuestCardState extends State<_TrackGuestCard> {
  final orderCtrl = TextEditingController();
  final phoneCtrl = TextEditingController();
  bool loading = false;

  @override
  void dispose() {
    orderCtrl.dispose();
    phoneCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.gray50,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.gray100),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Track an order', style: GoogleFonts.inter(fontWeight: FontWeight.w800, fontSize: 16)),
          const SizedBox(height: 4),
          Text('Enter Order ID + phone used at checkout', style: GoogleFonts.inter(fontSize: 12, color: AppColors.gray500)),
          const SizedBox(height: 12),
          TextField(controller: orderCtrl, decoration: const InputDecoration(hintText: 'Order ID')),
          const SizedBox(height: 8),
          TextField(controller: phoneCtrl, decoration: const InputDecoration(hintText: 'Phone'), keyboardType: TextInputType.phone),
          const SizedBox(height: 12),
          PrimaryButton(
            label: 'Track',
            loading: loading,
            onPressed: () async {
              setState(() => loading = true);
              try {
                final order = await context.read<AppState>().api.trackOrder(
                      orderId: orderCtrl.text.trim(),
                      phone: phoneCtrl.text.trim(),
                    );
                if (!context.mounted) return;
                showDialog(
                  context: context,
                  builder: (_) => AlertDialog(
                    title: Text(order.id),
                    content: Text('Status: ${order.status}\nTotal: ${formatPrice(order.total)}${order.awb != null ? '\nAWB: ${order.awb}' : ''}'),
                    actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('OK'))],
                  ),
                );
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
                }
              } finally {
                if (mounted) setState(() => loading = false);
              }
            },
          ),
        ],
      ),
    );
  }
}
