# Cart Customization Support

## Steps:
- [x] 1. Update Backend/models/cart.model.js: Add customizationType, customName fields
- [x] 2. Update Backend/controllers/cart.controller.js: Handle custom props in add/update, merge only same customization
- [x] 3. Update Frontend/src/services/cart.service.js: Send custom data in addToCart
- [x] 4. Update Frontend/src/components/CartContext.jsx: Include custom fields in mapCartItems
- [ ] 5. Update Frontend/src/pages/cart.jsx: Display/edit customization options
- [ ] 6. Backend new endpoint: PUT /cart/:userId/:cartItemId/update-custom (or extend updateCartItemQuantity)
- [ ] 7. Test full flow
- [ ] 8. Complete task
