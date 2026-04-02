# Variant Stock Fix - Progress Tracker
✅ **APPROVED PLAN**: Add variants schema + fix order/cart flow per steps 1-10.

## Steps to Complete:

### Phase 1: Schema Updates (Dependencies)
1. [ ] Update Backend/models/product.model.js - Add variants array {color, size, price, discountPercent, stock}
2. [ ] Update Backend/models/cart.model.js - Add color, size to items
3. [ ] Update Backend/models/order.model.js - Add color, size to items

### Phase 2: Backend Logic 
4. [ ] Fix Backend/controllers/order.controller.js - Remove stock filter, add variant matching/validation/price/store
5. [ ] Fix Backend/controllers/payment.controller.js - Same fixes
6. [ ] Update Backend/controllers/cart.controller.js - Accept/match/validate color/size

### Phase 3: Frontend 
7. [ ] Frontend/src/components/CartContext.jsx - Handle color/size
8. [ ] Frontend/src/services/cart.service.js - Send color/size
9. [ ] Frontend/src/pages/ProductDetails.jsx - Capture color/size selection
10. [ ] Frontend/src/pages/cart.jsx - Display color/size
11. [ ] Frontend/src/pages/checkout.jsx - Send color/size to order

### Phase 4: Test & Admin
12. [ ] Update Frontend/src/components/admin/ProductForm.jsx - Variant input
13. [ ] Test full flow: ProductDetails → Cart → Checkout → Order
14. [ ] Backend restart + sample data creation
15. [ ] [COMPLETED]

**Next Action**: Phase 1 Step 1 - Edit product.model.js

