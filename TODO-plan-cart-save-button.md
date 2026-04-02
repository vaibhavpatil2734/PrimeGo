# Cart Save Button Fix - Show on Selection Change ✅ APPROVED

**User Task:** Show save button also when user changes the selected button (radio toggle)

## Detailed Plan (Approved):
**Frontend/src/pages/cart.jsx**:
1. Move Save/Cancel buttons **outside** name input div → bottom of customization panel, visible for ANY dirty state.
2. Update saveCustomization: Remove !localName?.trim() req for 'plain'; require for 'customized'.
3. Ensure toggleCustomization → isDirty=true → buttons show immediately.
4. Visual: Panel glow/badge if dirty, buttons always at bottom if dirty.
5. No other changes (state reactive, logs optional).

**Status:** Ready to implement → create TODO.md steps → edit.

**Test after:** Toggle radio plain↔customized → Save shows immediately → save → toggle again → shows.

Next: Breakdown into TODO.md → implement step-by-step.
