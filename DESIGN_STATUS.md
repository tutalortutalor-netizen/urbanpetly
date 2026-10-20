# UrbanPetly Design System Status

**Last Updated**: 2026-10-18  
**Phase**: Awaiting Board Review of Branding Directions

## Current Status

### ✅ SAM-65 Complete: Designer Branding Proposals
- **Deliverables**: 2 distinct branding direction proposals with:
  - Logo concepts for each direction
  - Color palettes with hex codes (WCAG AA compliant)
  - Typography scales and specifications
  - Brand tone descriptions
  - Strategic rationale for each approach

### 🔄 Next Phase: Board Decision
**BLOCKING TASK**: Board must review the 2 branding directions (SAM-65) and select one to proceed with.

**Selection Required**: Direction 1 or Direction 2

### 📋 Engineering Foundation (Pending Board Selection)

Once the board selects a branding direction, these tasks will be executed in order:

1. **Update Design Tokens** (`packages/ui/src/theme.css`)
   - Replace placeholder OKLCH colors with selected direction palette
   - Add typography tokens (font-size scale, line-height, letter-spacing)
   - Add spacing tokens (margins, padding scale)
   - Status: Ready to execute after board decision

2. **Set Up Storybook** (`packages/ui`)
   - Install Storybook with React integration
   - Create stories for core components (Button, Input, Card, etc.)
   - Document component states (default, hover, focus, disabled, error)
   - Status: Ready to implement

3. **Create Phase 0 UX Mockups**
   - Per docs/05-ux-spec.md (Key Screens section)
   - Mobile-first (360px base)
   - Key screens: Home, Search/Listing, Provider Profile, Request Flow, Account
   - Status: Design file location TBD after board direction selection

## Component Inventory (per docs/05-ux-spec.md)

**Core Components to Build**:
- Basic: Button, IconButton, Input, PhoneInput, OtpInput, Select, Combobox
- Input Controls: Checkbox, RadioGroup, Chip, Badge, Rating
- Content: Card, Tabs, Accordion, Modal, Toast, Skeleton, EmptyState
- Advanced: Pagination, Map, Gallery, ImageUploader, DateWindowPicker, Stepper, Table, FilterBar

**Each component requires**:
- All states (default, hover, focus, disabled, error, loading)
- Responsive behavior (mobile-first 360px base)
- Storybook documentation with examples

## Design Principles (from spec)

- Mobile first (360px), thumb-friendly (44px+ tap targets)
- Warm, trustworthy, friendly tone
- Photography-led cards
- Show: rating, distance/locality, price, at-home availability
- WCAG 2.1 AA compliance throughout
- Plain English copy, structured for Hindi translation

## Acceptance Criteria for Completion

✅ Task can proceed when:
- [ ] Board selects one branding direction from SAM-65 proposals
- [ ] Design tokens updated in `packages/ui/src/theme.css`
- [ ] Storybook installed and running
- [ ] Core component scaffold created with basic states
- [ ] Phase 0 mockups documented (Figma or equivalent)

## Files Affected

- `packages/ui/src/theme.css` - Design tokens
- `packages/ui/src/` - Components (Button.tsx exists, others TBD)
- `packages/ui/.storybook/` - Storybook configuration (TBD)
- `docs/05-ux-spec.md` - Reference for all design decisions

---

**Status**: 🟡 BLOCKED - Awaiting board direction selection (SAM-65 proposal review)
