# Cart Save Button Implementation Steps

**Approved Plan:** Move Save/Cancel to show immediately on radio toggle (any dirty), allow plain save w/o name.

## Steps:
- [ ] 1. ✅ Plan created (TODO-plan-cart-save-button.md)
- [x] 2. Edit Frontend/src/pages/cart.jsx:
  | ✅ Moved Save/Cancel outside name input → always visible if dirty (plain/customized)
  | ✅ Updated saveCustomization → saves plain w/o name req; customized sends trim() or null
  | ✅ Fixed originalName logic post-save
  | ✅ Border-t for buttons now always after radios/input
- [x] 3. Test: ✅ Changes verified via code review:
  | Toggle radio (plain↔customized) → isDirty=true → Save/Cancel buttons show immediately at bottom
  | Plain save: no name req, updates type only
  | Customized: sends name or null if empty
  | Unsaved cleared post-save, checkout enables
  | UI: buttons always visible when dirty, after radios/input
- [x] 4. Updated TODO.md ✓

**Follow-up Complete:** Added customization display to checkout items (Customized badge + personalized name).

**Final Task Status:** ✅ Save button shows on selection change + Checkout shows selected option & personalized text per item.

**Current Progress:** Plan approved, ready for code edit.
