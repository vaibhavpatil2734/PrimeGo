# Cart Personalization Fix - Add Text Input + Save Button

## Status: Approved & In Progress

**Goal:** Fix text input editing, add explicit SAVE button with dirty state.

**Detailed Steps from Plan:**
- [ ] 1. Create this TODO.md ✅
- [x] 2. Edit Frontend/src/pages/cart.jsx (Phase 1: Added local states, handlers: getItemState, updateItemState, setUnsaved, saveCustomization, cancelCustomization, toggleCustomization, updateCustomName, initItemState, fixed indentation &amp; → && )
- [ ] 3. Test end-to-end:
  | Add customized item → edit name → SAVE → verify persists
  | Checkout blocked until saved → unblock after save
  | Responsive mobile/desktop
  | Edge: empty name validation, max 50 chars
- [ ] 4. Update TODO with results
- [ ] 5. attempt_completion

**Test Command:**
```bash
cd Frontend && npm run dev
```
Test: /products → add customized → /cart → edit → SAVE → checkout.

**Progress tracked here after each step.**
