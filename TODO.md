# Courier Partner Selection Implementation Plan

## Current Status: ✅ Plan Approved

## Step-by-Step Implementation:

### Phase 1: Backend API (2 files)
- [ ] **Backend/controllers/order.controller.js**: 
  - Add `getServiceability(req, res)`: Extract pincode/weight/cod from query, call shiprocket.checkServiceability(), return {success: true, couriers: [...]}
  - Modify `createOrder()`: Accept `req.body.selectedCourier`, use it if exists else auto-select cheapest. Save `order.selectedCourier = selectedCourier`
  - Add to exports

- [ ] **Backend/routes/order.routes.js**:
  - Add `router.get('/serviceability', auth, orderController.getServiceability)`

### Phase 2: Backend Order Creation Updates (2 files)
- [ ] **Backend/controllers/payment.controller.js**:
  - In `verifyPayment()` order creation: Copy `paymentAttempt.selectedCourier` (add field to PaymentAttempt model if needed), pass to Order.create()
  
- [ ] **Backend/models/PaymentAttempt.model.js** (check/add selectedCourier field if missing)

### Phase 3: Frontend Service (1 file)
- [ ] **Frontend/src/services/order.service.js**:
  - Add `getServiceability(pincode, isCod)` endpoint call
  - Update `createPaymentOrder()` and `createOrderCOD()`: Accept/send `selectedCourier`

### Phase 4: Frontend UI (1 file)
- [ ] **Frontend/src/pages/checkout.jsx**:
  - Add states: `availableCouriers`, `selectedCourier`, `courierLoading`
  - useEffect: On address change → fetch couriers (use paymentMethod for COD flag)
  - Add Courier Selection UI section: Radios with courier_name + rate
  - Pass selectedCourier to service calls
  - Disable Pay if no couriers or no selection
  - Show selected courier in summary

### Phase 5: Testing & Polish
- [ ] Test serviceability API: curl or Postman GET /api/orders/serviceability?pincode=400001&cod=false
- [ ] Test full flow: Checkout → select courier → pay → check order.courierName in MyOrders
- [ ] Edge cases: No couriers → disable Pay + message; COD vs Prepaid rates

## Progress Tracking:
**Phase 1 Complete: Backend API ✅**
- order.controller.js: getServiceability + createOrder courier logic
- order.routes.js: /serviceability route

**Completed: 1/5 phases**

**Next Step:** Phase 2 - Backend Payment Flow (payment.controller.js + PaymentAttempt model)


