import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/app_colors.dart';
import '../../data/api_client.dart';
import '../../state/app_state.dart';
import '../widgets/common.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  int step = 1;
  final _formKey = GlobalKey<FormState>();
  final nameCtrl = TextEditingController();
  final phoneCtrl = TextEditingController();
  final addressCtrl = TextEditingController();
  final cityCtrl = TextEditingController();
  final pinCtrl = TextEditingController();
  final promoCtrl = TextEditingController();
  String payment = 'cod';
  bool placing = false;
  String? shippingMsg;
  bool phonePeAvailable = false;
  double shippingCharge = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final state = context.read<AppState>();
      if (state.session != null) {
        nameCtrl.text = state.session!.name;
        phoneCtrl.text = state.session!.phone;
      }
      try {
        final cfg = await state.api.paymentConfig();
        setState(() => phonePeAvailable = cfg['phonepe']?['enabled'] == true);
      } catch (_) {}
    });
  }

  @override
  void dispose() {
    nameCtrl.dispose();
    phoneCtrl.dispose();
    addressCtrl.dispose();
    cityCtrl.dispose();
    pinCtrl.dispose();
    promoCtrl.dispose();
    super.dispose();
  }

  Future<void> _checkPin(String pin) async {
    if (pin.length != 6) return;
    try {
      final res = await context.read<AppState>().api.checkShipping(pin);
      final charge = (res['shippingCharge'] as num?)?.toDouble() ?? 0;
      final etd = res['etd']?.toString() ??
          (res['estimatedDays'] != null ? '${res['estimatedDays']} days' : null);
      final title = res['rateTitle']?.toString() ?? res['courier']?.toString() ?? 'Shipping';
      setState(() {
        shippingCharge = charge;
        shippingMsg = res['available'] == true
            ? (charge > 0
                ? '$title · ${formatPrice(charge)}${etd != null ? ' · EDD $etd' : ''}'
                : 'Delivery available${etd != null ? ' · EDD $etd' : ''}')
            : 'Delivery may not be available to this pincode';
      });
    } catch (_) {
      setState(() {
        shippingMsg = null;
        shippingCharge = 0;
      });
    }
  }

  Future<void> _placeOrder() async {
    if (!_formKey.currentState!.validate()) return;
    final state = context.read<AppState>();
    if (state.cart.isEmpty) return;

    setState(() => placing = true);
    try {
      final customer = {
        'name': nameCtrl.text.trim(),
        'phone': phoneCtrl.text.trim(),
        'address': addressCtrl.text.trim(),
        'city': cityCtrl.text.trim(),
        'pincode': pinCtrl.text.trim(),
      };
      final items = state.cart
          .map((l) => {'id': l.product.id, 'name': l.product.name, 'qty': l.qty, 'price': l.product.price})
          .toList();

      final res = await state.api.placeOrder(
        customer: customer,
        items: items,
        payment: payment,
        promoCode: state.appliedPromo,
        shippingCost: shippingCharge,
      );

      final order = Map<String, dynamic>.from(res['order'] as Map);
      final paymentRec = res['payment'] is Map ? Map<String, dynamic>.from(res['payment'] as Map) : null;
      final requiresPayment = res['requiresPayment'] == true;

      if (requiresPayment && paymentRec != null && payment == 'phonepe') {
        final payToken = res['paymentAccessToken']?.toString();
        final pay = await state.api.createPhonePePayment(
          '${paymentRec['id']}',
          phone: customer['phone']?.toString(),
          paymentAccessToken: payToken,
        );
        final url = pay['redirectUrl']?.toString();
        if (url != null) {
          await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Complete payment for order ${order['id']}, then return to the app')),
            );
          }
        }
      }

      state.clearCart();
      if (!mounted) return;
      await showDialog(
        context: context,
        builder: (_) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Text(requiresPayment ? 'Order created' : 'Order placed!'),
          content: Text(
            requiresPayment
                ? 'Order ${order['id']} — finish PhonePe payment to confirm.'
                : 'Thank you! Order ID: ${order['id']}. We\'ll confirm on ${customer['phone']}.',
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('OK')),
          ],
        ),
      );
      setState(() => step = 1);
    } on ApiException catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    } finally {
      if (mounted) setState(() => placing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();

    if (state.cart.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Bag')),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.shopping_bag_outlined, size: 64, color: AppColors.gray300),
              const SizedBox(height: 16),
              const Text('Your bag is empty', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              const Text('Add supplements to get started', style: TextStyle(color: AppColors.gray500)),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text(step == 1 ? 'Your Bag' : step == 2 ? 'Delivery' : 'Payment')),
      body: Column(
        children: [
          _Steps(current: step),
          Expanded(
            child: step == 1
                ? _BagList(state: state, promoCtrl: promoCtrl)
                : step == 2
                    ? _DetailsForm(
                        formKey: _formKey,
                        nameCtrl: nameCtrl,
                        phoneCtrl: phoneCtrl,
                        addressCtrl: addressCtrl,
                        cityCtrl: cityCtrl,
                        pinCtrl: pinCtrl,
                        shippingMsg: shippingMsg,
                        onPin: _checkPin,
                      )
                    : _PaymentPick(
                        payment: payment,
                        phonePeAvailable: phonePeAvailable,
                        onChanged: (v) => setState(() => payment = v),
                        total: state.cartTotal,
                      ),
          ),
          _CheckoutBar(
            step: step,
            total: state.cartTotal,
            loading: placing,
            onBack: step > 1 ? () => setState(() => step--) : null,
            onNext: () {
              if (step == 1) {
                setState(() => step = 2);
              } else if (step == 2) {
                if (_formKey.currentState?.validate() ?? false) setState(() => step = 3);
              } else {
                _placeOrder();
              }
            },
          ),
        ],
      ),
    );
  }
}

class _Steps extends StatelessWidget {
  const _Steps({required this.current});
  final int current;

  @override
  Widget build(BuildContext context) {
    final labels = ['Bag', 'Details', 'Pay'];
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 24),
      decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppColors.gray100))),
      child: Row(
        children: List.generate(3, (i) {
          final n = i + 1;
          final active = n == current;
          final done = n < current;
          return Expanded(
            child: Row(
              children: [
                Container(
                  width: 28,
                  height: 28,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: done || active ? AppColors.accent : AppColors.gray100,
                    shape: BoxShape.circle,
                  ),
                  child: done
                      ? const Icon(Icons.check, size: 16, color: Colors.white)
                      : Text('$n', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: active ? Colors.white : AppColors.gray500)),
                ),
                const SizedBox(width: 8),
                Text(labels[i], style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: active || done ? AppColors.gray900 : AppColors.gray500)),
                if (i < 2) Expanded(child: Container(height: 1, margin: const EdgeInsets.symmetric(horizontal: 8), color: AppColors.gray100)),
              ],
            ),
          );
        }),
      ),
    );
  }
}

class _BagList extends StatelessWidget {
  const _BagList({required this.state, required this.promoCtrl});
  final AppState state;
  final TextEditingController promoCtrl;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        ...state.cart.map((line) {
          final img = state.api.mediaUrl(line.product.image);
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              border: Border.all(color: AppColors.gray100),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: CachedNetworkImage(imageUrl: img, width: 72, height: 72, fit: BoxFit.contain),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(line.product.name, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                      const SizedBox(height: 4),
                      Text(formatPrice(line.product.price), style: const TextStyle(fontWeight: FontWeight.w800)),
                      Row(
                        children: [
                          IconButton(
                            visualDensity: VisualDensity.compact,
                            onPressed: () => state.setQty(line.product.id, line.qty - 1),
                            icon: const Icon(Icons.remove_circle_outline, size: 20),
                          ),
                          Text('${line.qty}', style: const TextStyle(fontWeight: FontWeight.w700)),
                          IconButton(
                            visualDensity: VisualDensity.compact,
                            onPressed: () => state.setQty(line.product.id, line.qty + 1),
                            icon: const Icon(Icons.add_circle_outline, size: 20),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => state.removeFromCart(line.product.id),
                  icon: const Icon(Icons.delete_outline, color: AppColors.gray500),
                ),
              ],
            ),
          );
        }),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: promoCtrl,
                decoration: const InputDecoration(hintText: 'Promo code'),
                textCapitalization: TextCapitalization.characters,
              ),
            ),
            const SizedBox(width: 8),
            ElevatedButton(
              onPressed: () async {
                try {
                  await state.applyPromo(promoCtrl.text.trim());
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Promo applied')));
                  }
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
                  }
                }
              },
              child: const Text('Apply'),
            ),
          ],
        ),
        if (state.appliedPromo != null)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(
              '${state.appliedPromo} · −${formatPrice(state.promoDiscount)}',
              style: const TextStyle(color: AppColors.accent, fontWeight: FontWeight.w700),
            ),
          ),
        const SizedBox(height: 16),
        _SummaryRow(label: 'Subtotal', value: formatPrice(state.cartSubtotal)),
        if (state.promoDiscount > 0) _SummaryRow(label: 'Discount', value: '−${formatPrice(state.promoDiscount)}'),
        _SummaryRow(label: 'Total', value: formatPrice(state.cartTotal), bold: true),
      ],
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({required this.label, required this.value, this.bold = false});
  final String label;
  final String value;
  final bool bold;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontWeight: bold ? FontWeight.w800 : FontWeight.w500, color: AppColors.gray700)),
          Text(value, style: TextStyle(fontWeight: bold ? FontWeight.w800 : FontWeight.w600, fontSize: bold ? 18 : 14)),
        ],
      ),
    );
  }
}

class _DetailsForm extends StatelessWidget {
  const _DetailsForm({
    required this.formKey,
    required this.nameCtrl,
    required this.phoneCtrl,
    required this.addressCtrl,
    required this.cityCtrl,
    required this.pinCtrl,
    required this.shippingMsg,
    required this.onPin,
  });
  final GlobalKey<FormState> formKey;
  final TextEditingController nameCtrl, phoneCtrl, addressCtrl, cityCtrl, pinCtrl;
  final String? shippingMsg;
  final ValueChanged<String> onPin;

  @override
  Widget build(BuildContext context) {
    return Form(
      key: formKey,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          TextFormField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Full name'), validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null),
          const SizedBox(height: 12),
          TextFormField(
            controller: phoneCtrl,
            decoration: const InputDecoration(labelText: 'Mobile number'),
            keyboardType: TextInputType.phone,
            validator: (v) => v == null || v.replaceAll(RegExp(r'\D'), '').length < 10 ? 'Valid 10-digit number' : null,
          ),
          const SizedBox(height: 12),
          TextFormField(controller: addressCtrl, decoration: const InputDecoration(labelText: 'Address'), maxLines: 2, validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: TextFormField(controller: cityCtrl, decoration: const InputDecoration(labelText: 'City'), validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null)),
              const SizedBox(width: 12),
              Expanded(
                child: TextFormField(
                  controller: pinCtrl,
                  decoration: const InputDecoration(labelText: 'Pincode'),
                  keyboardType: TextInputType.number,
                  onChanged: onPin,
                  validator: (v) => v == null || v.length != 6 ? '6-digit pincode' : null,
                ),
              ),
            ],
          ),
          if (shippingMsg != null)
            Padding(
              padding: const EdgeInsets.only(top: 10),
              child: Text(shippingMsg!, style: const TextStyle(color: AppColors.accent, fontWeight: FontWeight.w600, fontSize: 13)),
            ),
        ],
      ),
    );
  }
}

class _PaymentPick extends StatelessWidget {
  const _PaymentPick({required this.payment, required this.phonePeAvailable, required this.onChanged, required this.total});
  final String payment;
  final bool phonePeAvailable;
  final ValueChanged<String> onChanged;
  final double total;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('Amount payable: ${formatPrice(total)}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
        const SizedBox(height: 16),
        _PayTile(
          value: 'cod',
          group: payment,
          title: 'Cash on Delivery',
          subtitle: 'Pay when you receive',
          icon: Icons.payments_outlined,
          onChanged: onChanged,
        ),
        if (phonePeAvailable)
          _PayTile(
            value: 'phonepe',
            group: payment,
            title: 'PhonePe — UPI / Cards',
            subtitle: 'Secure checkout via PhonePe',
            icon: Icons.phone_android_outlined,
            onChanged: onChanged,
          ),
      ],
    );
  }
}

class _PayTile extends StatelessWidget {
  const _PayTile({
    required this.value,
    required this.group,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.onChanged,
  });
  final String value, group, title, subtitle;
  final IconData icon;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    final selected = value == group;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        onTap: () => onChanged(value),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: BorderSide(color: selected ? AppColors.accent : AppColors.gray300, width: selected ? 1.5 : 1),
        ),
        tileColor: selected ? AppColors.accentLight : Colors.white,
        leading: Icon(icon, color: AppColors.accent),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
        subtitle: Text(subtitle),
        trailing: Icon(
          selected ? Icons.radio_button_checked : Icons.radio_button_off,
          color: selected ? AppColors.accent : AppColors.gray300,
        ),
      ),
    );
  }
}

class _CheckoutBar extends StatelessWidget {
  const _CheckoutBar({required this.step, required this.total, required this.onNext, this.onBack, this.loading = false});
  final int step;
  final double total;
  final VoidCallback onNext;
  final VoidCallback? onBack;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: AppColors.gray100)),
        ),
        child: Row(
          children: [
            if (onBack != null)
              OutlinedButton(onPressed: onBack, child: const Text('Back')),
            if (onBack != null) const SizedBox(width: 10),
            Expanded(
              child: ElevatedButton(
                onPressed: loading ? null : onNext,
                child: loading
                    ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : Text(step < 3 ? 'Continue' : 'Place Order · ${formatPrice(total)}'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
