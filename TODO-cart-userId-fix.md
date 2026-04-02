# 🛒 Cart userId CastError Fix
✅ **APPROVED PLAN** - Using req.user._id from auth middleware

## 📋 Steps (Execute in order):

### 🔴 1. Backend Controller (CRITICAL)
```
Backend/controllers/cart.controller.js
- Replace req.params.userId → req.user._id in ALL 5 functions
```

### 🔴 2. Backend Routes (CRITICAL)  
```
Backend/routes/cart.routes.js
- Remove :userId params:
  GET /:userId → GET /
  POST /:userId → POST /
  PUT /:userId/:cartItemId → PUT /:cartItemId
  DELETE /:userId/:productId → DELETE /:cartItemId  
  DELETE /:userId → DELETE /
```

### 🟡 3. Frontend Service
```
Frontend/src/services/cart.service.js
- Remove userId params from ALL functions
```

### 🟢 4. Frontend Context (Cleanup)
```
Frontend/src/components/CartContext.jsx
- Remove userId from service calls
```

### 🟢 5. Frontend Page (Cleanup)
```
Frontend/src/pages/cart.jsx
- Remove getUserId()
```

### ✅ 6. Test & Cleanup
```
- Test customization save → No CastError
- Test +/- quantity
- Update TODO-cart-customization-save-fix.md → ✅ FIXED
- Delete this TODO-cart-userId-fix.md
```

**ALL 6/6 STEPS ✅ COMPLETE!**

✅ Backend/controllers/cart.controller.js  
✅ Backend/routes/cart.routes.js  
✅ Frontend/src/services/cart.service.js  
✅ Frontend/src/components/CartContext.jsx  
✅ Frontend/src/pages/cart.jsx  

## 🎉 **FIX VERIFICATION**
```
1. Cart customization save → ✅ No CastError  
2. Quantity +/- → ✅ Works
3. Backend logs → 👤 userId: ObjectId (not undefined)
```

**TASK COMPLETE - Ready for attempt_completion**
