# Flex Health — Flutter App (Android + iOS)

Professional mobile storefront matching the Flex Health website design system.

## Features

- Home (hero, stats, categories, popular, sale)
- Shop with search / category chips / sort
- Product detail + wishlist
- Cart → Delivery → Payment (COD + PhonePe)
- OTP login (same API as website)
- Orders + guest track
- Delhivery pincode check at checkout

## Setup

```bash
cd mobile
flutter pub get
```

### API URL

Default (Android emulator): `http://10.0.2.2:3000`

| Device | Set `API_BASE` |
|--------|----------------|
| Android emulator | `http://10.0.2.2:3000` |
| iOS simulator | `http://127.0.0.1:3000` |
| Physical phone | `http://YOUR_LAN_IP:3000` |
| Production | `https://yourdomain.com` |

```bash
# Example — run against local server from emulator
flutter run --dart-define=API_BASE=http://10.0.2.2:3000

# Production build
flutter build apk --dart-define=API_BASE=https://flexhealth.in
flutter build ios --dart-define=API_BASE=https://flexhealth.in
flutter build appbundle --dart-define=API_BASE=https://flexhealth.in
```

Start the website API first:

```bash
cd ../server
npm start
```

## Design tokens (matches website)

| Token | Value |
|-------|-------|
| Accent | `#059669` |
| Primary / dark | `#111827` |
| Font | Inter (Google Fonts) |
| Radius | 10–14px |
| Top bar | slate gradient + emerald border |

## Project structure

```
lib/
  core/theme/     # AppColors, AppTheme
  data/           # models + ApiClient
  state/          # AppState (Provider)
  ui/screens/     # Home, Shop, Product, Cart, Login, Account
  ui/widgets/     # Logo, ProductCard, shared UI
```

## Notes

- PhonePe opens the system browser / PhonePe app via redirect URL from the API.
- Session cookies from the API are kept in-memory for the app session; local session mirror is stored in SharedPreferences.
- Cleartext HTTP is enabled for debug/dev against LAN IPs; use HTTPS in production.
