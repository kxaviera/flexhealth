# Flex Health — Production E-Commerce

Node.js API with SQLite. Serves the storefront and admin panel on one port.

## Quick start

```bash
cd server
npm install
copy .env.example .env
# Edit .env — set ADMIN_PASSWORD, MSG91, PhonePe, Delhivery keys
npm run reset-admin
npm start
```

Open **http://localhost:3000**

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | Storefront |
| http://localhost:3000/admin.html | Admin dashboard |
| http://localhost:3000/api/health | API health check |

## Required configuration (`server/.env`)

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET` | Random string, min 32 chars |
| `ADMIN_PASSWORD` | Strong admin password — run `npm run reset-admin` after changing |
| `APP_URL` | Public site URL (for PhonePe payment redirect) |
| `MSG91_AUTH_KEY` / `MSG91_TEMPLATE_ID` | SMS OTP login |
| `PHONEPE_CLIENT_ID` / `PHONEPE_CLIENT_SECRET` | PhonePe payment gateway |
| `DELHIVERY_API_TOKEN` / `DELHIVERY_CLIENT_NAME` | Delhivery shipping |

Set `TEST_MODE=true` only for local development.

## Payments (PhonePe)

1. Get credentials from [PhonePe Business Dashboard](https://business.phonepe.com) → Developer Settings
2. Add `PHONEPE_CLIENT_ID`, `PHONEPE_CLIENT_SECRET`, `PHONEPE_ENV` to `.env`
3. Set `APP_URL` to your domain
4. Customers pay via PhonePe checkout (UPI, cards, netbanking)

Without PhonePe, only Cash on Delivery is available.

## Shipping (Delhivery)

1. Get API token from Delhivery client panel
2. Add `DELHIVERY_API_TOKEN` and `DELHIVERY_CLIENT_NAME` to `.env`
3. Admin can create shipments and get AWB/tracking from **Orders** panel

See `server/INTEGRATIONS.md` for detailed setup.

## Admin login

- URL: `/admin.html`
- Use username/password from `.env`
- Reset password: `npm run reset-admin`

## Production deployment

1. Set `NODE_ENV=production` and `TEST_MODE=false`
2. Use HTTPS — required for secure cookies and PhonePe
3. Set `APP_URL=https://yourdomain.com`
4. Configure MSG91 + PhonePe + Delhivery keys
