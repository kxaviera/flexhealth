import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../data/api_client.dart';
import '../../state/app_state.dart';
import '../widgets/common.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with SingleTickerProviderStateMixin {
  late TabController _tabs;
  final phoneCtrl = TextEditingController();
  final otpCtrl = TextEditingController();
  final nameCtrl = TextEditingController();
  bool otpSent = false;
  bool loading = false;
  String? pendingPhone;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabs.dispose();
    phoneCtrl.dispose();
    otpCtrl.dispose();
    nameCtrl.dispose();
    super.dispose();
  }

  Future<void> _sendOtp({required bool signup}) async {
    final phone = phoneCtrl.text.replaceAll(RegExp(r'\D'), '');
    if (phone.length != 10) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Enter a valid 10-digit mobile number')));
      return;
    }
    if (signup && nameCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter your name')));
      return;
    }
    setState(() => loading = true);
    try {
      await context.read<AppState>().api.sendOtp(
            phone: phone,
            mode: signup ? 'signup' : 'login',
            signupData: signup ? {'name': nameCtrl.text.trim()} : null,
          );
      setState(() {
        otpSent = true;
        pendingPhone = phone;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('OTP sent to your mobile')));
      }
    } on ApiException catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> _verify() async {
    final phone = pendingPhone ?? phoneCtrl.text.replaceAll(RegExp(r'\D'), '');
    setState(() => loading = true);
    try {
      final session = await context.read<AppState>().api.verifyOtp(phone: phone, otp: otpCtrl.text.trim());
      if (!mounted) return;
      await context.read<AppState>().setSession(session);
      if (!mounted) return;
      Navigator.of(context).pop(true);
    } on ApiException catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Account')),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const FhLogo(),
          const SizedBox(height: 12),
          const Text(
            'Sign in with your mobile number',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, letterSpacing: -0.4),
          ),
          const SizedBox(height: 6),
          const Text('Secure OTP login — same as the Flex Health website', style: TextStyle(color: AppColors.gray500)),
          const SizedBox(height: 24),
          TabBar(
            controller: _tabs,
            labelColor: AppColors.accent,
            unselectedLabelColor: AppColors.gray500,
            indicatorColor: AppColors.accent,
            labelStyle: const TextStyle(fontWeight: FontWeight.w700),
            tabs: const [Tab(text: 'Login'), Tab(text: 'Sign up')],
            onTap: (_) => setState(() => otpSent = false),
          ),
          const SizedBox(height: 20),
          AnimatedBuilder(
            animation: _tabs,
            builder: (_, __) {
              final signup = _tabs.index == 1;
              return Column(
                children: [
                  if (signup) ...[
                    TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Full name'), textCapitalization: TextCapitalization.words),
                    const SizedBox(height: 12),
                  ],
                  TextField(
                    controller: phoneCtrl,
                    decoration: const InputDecoration(labelText: 'Mobile number', prefixText: '+91 '),
                    keyboardType: TextInputType.phone,
                    enabled: !otpSent,
                  ),
                  if (otpSent) ...[
                    const SizedBox(height: 12),
                    TextField(
                      controller: otpCtrl,
                      decoration: const InputDecoration(labelText: 'Enter OTP'),
                      keyboardType: TextInputType.number,
                      maxLength: 6,
                    ),
                  ],
                  const SizedBox(height: 20),
                  PrimaryButton(
                    label: otpSent ? 'Verify & Continue' : 'Send OTP',
                    loading: loading,
                    onPressed: () => otpSent ? _verify() : _sendOtp(signup: signup),
                  ),
                  if (otpSent)
                    TextButton(
                      onPressed: () => setState(() => otpSent = false),
                      child: const Text('Change number'),
                    ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}
