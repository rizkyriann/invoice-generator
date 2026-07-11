# Design System — Online Invoice Generator

## 1. Project Overview
- **Product Summary**: A fully client-side Single Page Application (SPA) for generating professional, print-ready invoices without accounts or backends.
- **Target Users**: Freelancers, small business owners, agencies, and occasional users requiring low-friction invoicing.
- **Primary Goals**: Speed (PDF in <2 mins), Privacy (data never leaves device), Visual Polish (10 designer templates), and Persistence (local draft recovery).
- **UX Principles**: Zero friction, transparency (privacy), immediate feedback (live preview), and reliability (accurate math).

## 2. Design Philosophy
- **Direction**: Minimalist Utility / "Tool-First" Aesthetic.
- **Style**: Modern, clean, and productivity-focused. Inspired by Stripe and Linear.
- **Rationale**: The app should feel like a professional tool. The UI stays neutral to allow the user's chosen invoice template (which can be colorful or creative) to take center stage without visual clashing.

## 3. Brand Identity
- **Primary**: #2563eb (Blue 600)
- **Primary Foreground**: #ffffff
- **Secondary**: #64748b (Slate 500)
- **Accent**: #3b82f6 (Blue 500)
- **Success**: #10b981 (Emerald 500)
- **Warning**: #f59e0b (Amber 500)
- **Danger**: #ef4444 (Red 500)
- **Info**: #0ea5e9 (Sky 500)
- **Background**: #ffffff (Light) / #0f172a (Dark)
- **Surface**: #f8fafc (Light) / #1e293b (Dark)
- **Border**: #e2e8f0 (Light) / #334155 (Dark)

## 4. Typography
- **Font Family**: Inter (Sans-serif)
- **Heading 1**: 2.25rem (36px) / 2.5rem line-height / Bold
- **Heading 2**: 1.5rem (24px) / 2rem line-height / SemiBold
- **Heading 3**: 1.125rem (18px) / 1.75rem line-height / SemiBold
- **Body**: 0.875rem (14px) / 1.25rem line-height / Regular
- **Labels**: 0.75rem (12px) / 1rem line-height / Medium / Uppercase (optional)
- **Buttons**: 0.875rem (14px) / Medium / Tracking-tight

## 5. Spacing System (4px Base)
- **4 (1)**: 4px
- **8 (2)**: 8px
- **12 (3)**: 12px
- **16 (4)**: 16px (Base Gutter)
- **24 (6)**: 24px (Standard Section Gap)
- **32 (8)**: 32px
- **48 (12)**: 48px
- **64 (16)**: 64px

## 6. Border Radius
- **sm**: 4px (Inputs, Small buttons)
- **md**: 8px (Standard buttons, Cards)
- **lg**: 12px (Modals, Large sections)
- **full**: 9999px (Pills, Badges)

## 7. Shadows
- **sm**: 0 1px 2px 0 rgb(0 0 0 / 0.05)
- **md**: 0 4px 6px -1px rgb(0 0 0 / 0.1)
- **lg**: 0 10px 15px -3px rgb(0 0 0 / 0.1)

## 8. Icons
- **Library**: Heroicons (Outline for default, Solid for active).
- **Guidelines**: 20px for standard UI buttons; 24px for section headers. Consistent stroke width (1.5px or 2px).

## 9. Layout System
- **Desktop (>=1280px)**: Split-screen (50% Form / 50% Preview).
- **Tablet (768-1279px)**: Stacked with sticky "Preview" toggle tab.
- **Mobile (<768px)**: Single column scroll. Form first, Preview via FAB/Modal.
- **Navbar Height**: 64px.
- **Content Max-Width**: 1440px (constrained to viewport for split-screen).

## 10. Navigation
- **Top Navigation**: Logo (left), Links (About, Settings), Theme Toggle + CTA (right).
- **Mobile Navigation**: Bottom bar for quick actions (Form, Preview, Export).
- **Toolbar (Generator Page)**: Sticky bar below Navbar with Save, Clear, Undo/Redo, and Export buttons.

## 11. Component Library
### Button
- **Variants**: Primary (Blue), Secondary (Slate/Outline), Danger (Red/Ghost), Ghost (Transparent).
- **Sizes**: Small (px-3, py-1.5), Base (px-4, py-2), Large (px-6, py-3).
- **States**: Hover (bg-darken), Active (scale-95), Loading (spinner + disabled).

### Input / Textarea
- **Style**: Subtle border, bg-white, focus: ring-2 ring-primary-500.
- **Validation**: Red border + inline error message below field.

### Card
- **Purpose**: Section containers (Business, Client, Items).
- **Style**: White background, 1px border, shadow-sm, rounded-md.

### Modal / Drawer
- **Purpose**: Confirmation (Clear Draft), Mobile Preview.
- **Style**: Centered (Modal), Slide-up (Drawer/Sheet). Backdrop: blur-sm bg-black/40.

### Toast / Notification
- **Rules**: Auto-dismiss after 3s. "Undo" capability for item deletion.

## 12. Forms & Validation
- **Validation**: Zod-backed, trigger on-blur.
- **Errors**: High contrast red (#ef4444).
- **Multi-step**: Logical grouping via collapsible sections (Business -> Client -> Items -> Totals).

## 13. Tables (Line Items)
- **Layout**: Fluid columns (Desc, Qty, Price, Disc, Tax, Total).
- **Reordering**: Drag handles (left side of row). Move up/down buttons for keyboard access.
- **Responsive**: Switch to card-list on small mobile view.

## 14. Accessibility
- **Keyboard**: Full tab-nav support. Focus-visible rings.
- **Contrast**: AA minimum (4.5:1) for all text.
- **ARIA**: Live regions for validation errors and "Saved" status.
- **Touch**: 44x44px minimum target for mobile buttons.

## 15. Dark Mode
- **Support**: Application UI only. Invoice templates remain white/print-ready.
- **Mapping**: Background -> Slate 950; Surface -> Slate 900; Text -> Slate 50.

## 16. AI Implementation Notes
- **Tokens**: Use CSS variables for all design tokens (e.g., `--color-primary`).
- **Templates**: Treat invoice templates as purely functional React components; do not mix with UI primitives.
- **Persistence**: Zustand `persist` middleware is the source of truth for all form state.
- **PDF**: Pipeline must use high-resolution scaling (2x) via `html2canvas`.
