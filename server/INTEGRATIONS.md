# Flex Health — Payment & Shipping Setup

This guide explains how to connect **PhonePe Payment Gateway** and **Delhivery** (courier shipping, AWB, tracking).

---

## Quick start

1. Copy env file:
   ```powershell
   cd D:\FlexHealh.in\server
   copy .env.example .env
   ```

2. Add your API keys to `.env` (see sections below)

3. Set a strong `ADMIN_PASSWORD` and run:
   ```powershell
   npm run reset-admin
   ```

4. Set `APP_URL` to your live domain (required for PhonePe redirect)

5. Restart server:
   ```powershell
   npm start
   ```

6. Check status:
   - API: http://localhost:3000/api/health
   - Admin → Backend Settings → Payments & Shipping

---

## MSG91 (SMS OTP login)

Required for customer phone login when Firebase is not used.

1. Sign up at https://msg91.com
2. Create an **OTP template** (6-digit code)
3. Add to `.env`:
   ```
   MSG91_AUTH_KEY=your_auth_key
   MSG91_TEMPLATE_ID=your_template_id
   ```

---

## PhonePe (Online payments)

Supports **UPI, PhonePe, credit/debit cards, netbanking** via PhonePe Standard Checkout (V2).

### 1. Create PhonePe merchant account
- Sign up at https://business.phonepe.com
- Complete KYC for live payments
- Dashboard → **Developer Settings** → get **Client ID**, **Client Secret**, **Client Version**

### 2. Add to `.env`
```
PHONEPE_CLIENT_ID=your_client_id
PHONEPE_CLIENT_SECRET=your_client_secret
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENV=sandbox
APP_URL=https://yourdomain.com
```

For live payments set `PHONEPE_ENV=production` and use your production domain in `APP_URL`.

### 3. How checkout works
- Customer selects **PhonePe — UPI / Cards** at checkout
- Order is created, then customer is redirected to PhonePe secure checkout
- After payment, PhonePe redirects to `/payment-return.html`
- Server verifies payment and confirms the order

**Sandbox testing:** Use `PHONEPE_ENV=sandbox` with UAT credentials from PhonePe.

---

## Delhivery (Shipping & delivery)

Handles **pincode serviceability, AWB generation, and tracking**.

### 1. Create Delhivery account
- Sign up at https://www.delhivery.com
- Request **API access** from your Delhivery account manager
- Add your **pickup warehouse** in the Delhivery client panel

### 2. Add to `.env`
```
DELHIVERY_API_TOKEN=your_api_token
DELHIVERY_CLIENT_NAME=your_registered_client_name
DELHIVERY_PICKUP_LOCATION=Primary
DELHIVERY_DEFAULT_WEIGHT_KG=0.5
DELHIVERY_ENV=production
```

Use `DELHIVERY_ENV=staging` for Delhivery test environment.

### 3. How shipping works
- Checkout checks pincode serviceability via Delhivery API
- Admin → Orders → expand an order → click **Create Delhivery Shipment**
- AWB and tracking URL are saved on the order

**Without Delhivery keys:** Pincode check returns a default “available” response; manual shipping still works.

---

## Go-live checklist

| Step | Action |
|------|--------|
| 1 | Add PhonePe credentials, set `PHONEPE_ENV=production` |
| 2 | Set `APP_URL` to your HTTPS domain |
| 3 | Add Delhivery API token and client name |
| 4 | Set `TEST_MODE=false` |
| 5 | Place test order with PhonePe — redirect should work |
| 6 | In Admin → Orders → **Create Delhivery Shipment** |

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PHONEPE_CLIENT_ID` | For online pay | PhonePe Client ID |
| `PHONEPE_CLIENT_SECRET` | For online pay | PhonePe Client Secret |
| `PHONEPE_CLIENT_VERSION` | Yes | Usually `1` |
| `PHONEPE_ENV` | Yes | `sandbox` or `production` |
| `APP_URL` | For PhonePe | Your public site URL (HTTPS in production) |
| `DELHIVERY_API_TOKEN` | For shipping | Delhivery API token |
| `DELHIVERY_CLIENT_NAME` | For shipping | Client name registered with Delhivery |
| `DELHIVERY_PICKUP_LOCATION` | Optional | Warehouse name in Delhivery panel |
| `TEST_MODE` | Yes | `true` = dev only, `false` = production |

---

## Links

- PhonePe docs: https://developer.phonepe.com/
- Delhivery API: https://delhivery-express-api-doc.readme.io/
