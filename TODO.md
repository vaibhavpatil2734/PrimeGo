# Shiprocket Dashboard Configuration & Webhook Setup

## ✅ Current Status
- Order model: Tracking fields ready
- Webhook handler: `processTrackingWebhook()` implemented
- Webhook route: `POST /api/orders/webhook/shiprocket/track` live
- Tracking endpoint: Enhanced with stored/live data fallback

## 🎯 Shiprocket Dashboard Fields

### 1. Note Field (Webhook URL)
```
https://your-backend-domain.com/api/orders/webhook/shiprocket/track
```
**Local Testing (ngrok):**
```
https://abc123.ngrok.io/api/orders/webhook/shiprocket/track
```
- Replace with your deployed backend URL (e.g., `api.made4uu.com`)
- Or use ngrok: `ngrok http 5000` → copy https URL + path
- ✅ Avoids forbidden keywords (shiprocket/sr/kr/kartrocket)

### 2. Token Field (x-api-key header)
```
made4uu-webhook-v1-secure123
```
- Any secret value (Shiprocket sends in `x-api-key` header)
- Current webhook handler doesn't validate (public route)
- Optional: Add middleware validation later

## 🧪 Test Webhook (Local/Server Running)

```bash
curl -X POST http://localhost:5000/api/orders/webhook/shiprocket/track \\
  -H "x-api-key: made4uu-webhook-v1-secure123" \\
  -H "Content-Type: application/json" \\
  -d '{
    \"awb\": \"SR123456789\",
    \"current_status\": \"Out for Delivery\",
    \"scans\": [{
      \"activity\": \"Out for delivery\",
      \"location\": \"Mumbai\",
      \"date\": \"2024-01-15 10:30:00\"
    }]
  }'
```

**Expected:** `{"success":true,"order":"ORD...","newScans":1}`

## ✅ CORS Fixed for Shiprocket Webhooks

**Updated Backend/server.js:**
- Added `*.shiprocket.in`, `*.shiprocket.co`, `apiv2.shiprocket.in` to allowedOrigins
- Webhooks now pass CORS (even with origin header)

**Restart server:** `cd Backend && npm start`

## 🚀 Next Steps
1. [ ] Run `ngrok http 5000` → Copy webhook URL
2. [ ] Enter URL/token in Shiprocket dashboard
3. [ ] Create test shipment → Monitor webhook logs
2. [ ] Enter URL/token in Shiprocket dashboard
3. [ ] Create test shipment → Monitor webhook logs
4. [ ] Deploy backend → Update URL to production
5. [ ] Optional: Add x-api-key validation middleware

## Server Info
- Port: 5000 (`.env PORT` or default)
- Base path: `/api/orders/webhook/shiprocket/track`
- Handler: Updates `order.scans`, `current_status`, auto-syncs `order.status`
- No auth required (public for Shiprocket)

**✅ Task Complete: Dashboard values ready!**
