import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'core/constants.dart';
import 'core/theme/app_colors.dart';
import 'core/theme/app_theme.dart';
import 'data/api_client.dart';
import 'state/app_state.dart';
import 'ui/screens/main_shell.dart';
import 'ui/widgets/common.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
  ));
  runApp(const FlexHealthApp());
}

class FlexHealthApp extends StatelessWidget {
  const FlexHealthApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) {
        final state = AppState(ApiClient());
        state.init();
        return state;
      },
      child: MaterialApp(
        title: 'Flex Health',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light,
        home: const SplashGate(),
      ),
    );
  }
}

class SplashGate extends StatelessWidget {
  const SplashGate({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final loading = state.loadingCatalog && state.catalog == null && state.catalogError == null;

    if (loading) {
      return const Scaffold(
        backgroundColor: AppColors.white,
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _SplashLogo(),
              SizedBox(height: 28),
              SizedBox(
                width: 28,
                height: 28,
                child: CircularProgressIndicator(strokeWidth: 2.5, color: AppColors.accent),
              ),
            ],
          ),
        ),
      );
    }

    if (state.catalog == null && state.catalogError != null) {
      return Scaffold(
        backgroundColor: AppColors.white,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const _SplashLogo(),
                const SizedBox(height: 20),
                Text('Could not connect to server', style: GoogleFonts.inter(fontWeight: FontWeight.w800, fontSize: 18)),
                const SizedBox(height: 8),
                Text(
                  'API: ${AppConfig.apiBaseUrl}\n${state.catalogError}',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(color: AppColors.gray500, fontSize: 12, height: 1.4),
                ),
                const SizedBox(height: 20),
                PrimaryButton(
                  label: 'Retry',
                  expanded: false,
                  onPressed: () => state.refreshCatalog(),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return const MainShell();
  }
}

class _SplashLogo extends StatelessWidget {
  const _SplashLogo();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 64,
          height: 64,
          decoration: BoxDecoration(
            color: AppColors.dark,
            borderRadius: BorderRadius.circular(14),
          ),
          alignment: Alignment.center,
          child: Text('F', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 28)),
        ),
        const SizedBox(height: 16),
        RichText(
          text: TextSpan(
            style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w800, letterSpacing: -0.5, color: AppColors.gray900),
            children: const [
              TextSpan(text: 'Flex '),
              TextSpan(text: 'Health', style: TextStyle(color: AppColors.accent, fontWeight: FontWeight.w700)),
            ],
          ),
        ),
      ],
    );
  }
}
