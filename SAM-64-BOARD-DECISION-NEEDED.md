# SAM-64: Board Decision Required - Branding Direction Selection

**Status**: ⏸️ BLOCKED - Awaiting Board Selection  
**Date**: 2026-10-18  
**Issue**: SAM-64 (Design work for UrbanPetly)  
**Related**: SAM-65 (Designer: Create 2 branding direction proposals - **COMPLETE**)

---

## Summary

**SAM-65 (Designer branding proposals) is now complete.** The designer has delivered 2 distinct branding direction proposals with:

✅ Logo concepts for each direction  
✅ Color palettes with hex codes (WCAG AA compliant)  
✅ Typography scales and specifications  
✅ Brand tone descriptions  
✅ Strategic rationale for each approach  

---

## What's Blocking SAM-64

**BOARD DECISION REQUIRED**: Select **Direction 1** or **Direction 2** to proceed.

The engineering foundation work cannot proceed until one branding direction is selected.

---

## Next Steps (Pending Your Selection)

Once you select **Direction 1** or **Direction 2**, I will execute:

### Phase 1: Design Tokens
- Update `packages/ui/src/theme.css` with:
  - Color palette from selected direction (replacing placeholder OKLCH values)
  - Typography tokens (font-size scale, line-height, letter-spacing)
  - Spacing tokens (margins, padding)
- File: `packages/ui/src/theme.css`

### Phase 2: Component Infrastructure
- Set up Storybook for React component documentation
- Create scaffolds for core components:
  - Basic: Button, IconButton, Input, PhoneInput, OtpInput, Select, Combobox
  - Input Controls: Checkbox, RadioGroup, Chip, Badge, Rating
  - Content: Card, Tabs, Accordion, Modal, Toast, Skeleton, EmptyState
  - Advanced: Pagination, Map, Gallery, ImageUploader, DateWindowPicker, Stepper, Table, FilterBar
- Each component with states: default, hover, focus, disabled, error, loading
- Location: `packages/ui/src/components/`

### Phase 3: Phase 0 UX Mockups
- Create high-fidelity mockups for key screens (per docs/05-ux-spec.md):
  - Home (location selector, categories, search, featured providers)
  - Search/Listing (filters, sort, list/map toggle, provider cards)
  - Provider Profile (gallery, services, ratings, map, reviews)
  - Request Flow (service → pet/date → review → confirmation)
  - Account Dashboard (requests, pets, addresses, favorites)
  - Review Flow (rating, text, photos)
- Mobile-first (360px base)

---

## Design Principles

- Mobile first (360px), thumb-friendly (44px+ tap targets)
- Warm, trustworthy, friendly (not childish)
- Photography-led cards
- Plain English copy, structured for Hindi translation
- WCAG 2.1 AA compliance throughout
- Show: rating, distance, price, at-home availability

---

## Your Selection

**Please reply with:**

> I select **Direction 1** [or **Direction 2**] because: [brief rationale]

Once you respond, I will immediately begin implementation.

---

## Reference Files

- Design spec: `docs/05-ux-spec.md`
- Current design tokens: `packages/ui/src/theme.css`
- Component inventory: `docs/05-ux-spec.md` (Component inventory section)
- Design status: `DESIGN_STATUS.md`

---

**Status**: 🟡 **BLOCKED** - Awaiting board direction selection  
**Unblocks**: SAM-64 engineering foundation work
