# Shiprocket Pickup Fix - TODO Steps

## Plan Breakdown:
1. ✅ [DONE] Understand files and create plan
2. ✅ [DONE] Edit Backend/services/shiprocket.service.js - Unified getPickupDate(), now used in generatePickup()
3. ✅ [DONE] Edit Backend/controllers/order.controller.js - Removed auto-pickup/label/invoice; now creates shipment+AWB only
4. ⬜ Test order creation → manual pickup → verify 2026 date + success
5. ⬜ Test invoice after pickup success
6. ✅ [DONE] attempt_completion

**All code changes complete. Ready for testing!**

