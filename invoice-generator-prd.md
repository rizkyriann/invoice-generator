# Product Requirements Document
# Online Invoice Generator (Client-Side SPA)

**Version:** 1.0
**Status:** Draft for Development
**Document Owner:** Product & Engineering
**Last Updated:** July 10, 2026

---

## 1. Executive Summary

The Online Invoice Generator is a fully client-side Single Page Application (SPA) that lets freelancers, small business owners, and agencies create professional, print-ready invoices directly in the browser — with no account creation, no backend server, and no database. Every calculation, template render, and PDF export happens on the user's device, which means the product can be hosted as a static site (Vercel/Netlify), has near-zero operating cost, and gives users complete data privacy since nothing is transmitted to a server.

The application is built on React 18 with Vite and TypeScript, styled with Tailwind CSS, and validated with React Hook Form + Zod. State is centralized in Zustand and persisted to `localStorage` so users never lose in-progress work. A library of ten distinct visual templates lets users match the invoice's look to their brand, and a live split-screen preview shows the final invoice updating in real time as the form is filled in. When ready, the user exports a high-resolution, multi-page-aware A4 PDF generated with `html2canvas` + `jsPDF`.

This PRD defines the full functional scope, data models, component and folder architecture, state management strategy, PDF export pipeline, and non-functional requirements needed to take this product from design to a production-ready v1.0 release, along with a phased roadmap for an eventual backend-powered v2.

The document is written to be handed directly to a development team with no additional discovery work required: every functional requirement below maps to a concrete component in Section 10, a concrete data shape in Section 12, and a concrete milestone in Section 19. Where a requirement has non-obvious technical implications — for example, how "high resolution" PDF export is actually achieved with a canvas-based rendering pipeline, or how undo/redo interacts with a persisted Zustand store — this PRD spells out the mechanism, not just the outcome, so engineering estimates can be made with confidence rather than guesswork.

Two design principles run through every section of this document. First, **the absence of a backend is a feature, not a limitation to work around** — every requirement is deliberately scoped to what a browser can do unaided, and any feature that would normally imply server involvement (accounts, history, sync) is explicitly deferred to the roadmap rather than half-implemented with a workaround. Second, **the data model is the contract** — templates, PDF export, print, and the form itself all operate on the same `Invoice` object, so features can be added (a new template, a new export format) without touching unrelated parts of the system.

---

## 2. Product Vision

**Vision statement:** Anyone should be able to produce a polished, professional invoice in under two minutes, from any device, without signing up for anything or trusting a third party with their business and client data.

Invoicing tools today force users into one of two uncomfortable choices: heavyweight accounting suites that require account creation, subscriptions, and data hosted on someone else's server, or manual work in Word/Excel that looks unprofessional and is error-prone. The Online Invoice Generator sits in between — it has the visual polish and calculation reliability of a SaaS product, but the zero-friction, privacy-respecting nature of a local tool. Because there is no backend, the product can be trusted by users who are wary of handing over client contact details or financial figures to a cloud service.

The long-term vision (see Section 18, Future Roadmap) is for this client-only tool to become the free, no-signup entry point into a broader invoicing and small-business platform, but v1 deliberately and completely avoids any server dependency so it can ship fast and remain trustworthy by design.

This positioning also shapes how the product should be judged internally: success is not measured by account creation or retention metrics in the traditional SaaS sense, since there are no accounts. Instead, success looks like a first-time visitor reaching a downloaded PDF within a single session, returning later because the browser remembered their draft, and eventually recommending the tool to a peer because the output looked genuinely professional rather than "free-tool generic." Every design and engineering decision in this document should be weighed against that bar — does it get a first-time user to a polished PDF faster, or does it add friction in service of a feature that a no-signup tool doesn't actually need.

---

## 3. Goals

### 3.1 Business Goals
- Ship a production-ready v1 that can be deployed as a static site with zero infrastructure cost.
- Build a reusable, well-architected React codebase that can later be extended with a backend without a rewrite.
- Establish a template system that can grow to dozens of designs without touching core logic.
- Create a foundation that can be monetized later (e.g., premium templates, PDF branding removal) without redesigning the data model.

### 3.2 User Goals
- Generate a complete, accurate invoice in under two minutes.
- Never lose work in progress, even after closing the tab.
- Produce a PDF that looks like it came from a professional design tool, not a generic web form.
- Work comfortably on mobile, tablet, and desktop.
- Trust that no client or financial data leaves their device.

### 3.3 Non-Goals (v1)
- No user accounts, authentication, or multi-device sync.
- No invoice history, recurring invoices, or payment collection.
- No server-side rendering or persistent database.
- No multi-user collaboration.

---

## 4. Target Users

| Persona | Description | Primary Need |
|---|---|---|
| **Freelancer** | Independent designer, developer, or consultant billing 1–5 clients/month | Fast, professional-looking invoices without accounting software overhead |
| **Small Business Owner** | Runs a shop, studio, or small service business | Branded invoices with logo, consistent templates, tax/discount handling |
| **Agency Admin** | Handles billing for a small agency with several clients | Needs multiple template styles to match different client-facing brand needs, item-heavy invoices |
| **Occasional User** | Needs to send exactly one or two invoices a year (e.g., selling a one-off service) | Zero learning curve, no signup, just fill and download |

Common thread across all personas: **low tolerance for friction** (signup forms, mandatory accounts) and **high expectation of visual polish** in the final PDF, since the invoice represents their brand to their client.

It is worth noting explicitly what these personas are *not*: they are not accounting teams reconciling books across dozens of vendors, not enterprises needing approval workflows, and not businesses with compliance requirements around invoice numbering sequences or e-invoicing standards mandated by tax authorities. Those needs are real but belong to a different, heavier product category, and explicitly out of scope for this tool. Keeping the persona set narrow is what allows the "no account, no backend" promise to hold — the moment the product tries to serve an accounting team's needs, it will need history, multi-user access, and audit trails, all of which require a server. The roadmap in Section 18 exists precisely to capture that growth path without contaminating the v1 scope.

For the Indonesian SMB context in particular, the currency and language defaults (IDR / Bahasa Indonesia) matter more than a generic "just support many currencies" requirement would suggest — the settings defaults (Section 6, Settings page) should bias toward IDR and Indonesian-language invoice labels out of the box, while still allowing any user globally to switch to their own currency and language.

---

## 5. Functional Requirements

### 5.1 Invoice Form

**Business Information**
- Business Name (required, text)
- Logo upload (image file, drag & drop supported, client-side resize/compression before storing as base64)
- Email (validated email format)
- Phone (validated phone format, country-agnostic)
- Website (optional URL)
- Address (multi-line text)

**Client Information**
- Client Name (required)
- Company (optional)
- Email (validated)
- Phone (optional)
- Address (multi-line text)

**Invoice Details**
- Invoice Number (auto-generated suggestion, editable, e.g. `INV-2026-0001`)
- Issue Date (date picker, defaults to today via `dayjs`)
- Due Date (date picker, must be ≥ Issue Date, with quick-select options like "Net 15/30/60")
- Currency (dropdown of common currencies with symbol + code, e.g. IDR, USD, EUR)
- Language (dropdown; affects invoice labels only, not app UI, in v1 limited to English + Indonesian)
- Payment Terms (short text or preset dropdown: "Due on Receipt", "Net 15", "Net 30", "Custom")
- Notes (free text, shown on invoice)
- Terms & Conditions (free text, shown on invoice, supports basic line breaks)

All fields are managed with **React Hook Form**, schema-validated with **Zod**, and debounced into the Zustand store to avoid excessive re-renders of the live preview.

### 5.2 Invoice Items

A dynamic, reorderable line-item table backed by `react-hook-form`'s `useFieldArray`.

**Per-item fields:**
- Description (required, text)
- Quantity (number, ≥ 0, supports decimals for hourly/weight-based billing)
- Unit Price (number, ≥ 0, currency-formatted on blur)
- Discount (percentage or fixed amount, per-item toggle)
- Tax (percentage, per-item, defaults to a global tax rate but overridable)
- Total (read-only, computed field)

**Item actions:**
- **Add item** — appends a blank row, auto-focuses the description field
- **Delete item** — removes a row, with an "Undo" toast (see Undo/Redo, Section 5.11)
- **Duplicate item** — clones a row including all values, inserted directly below
- **Reorder items** — drag handle using pointer events (no external DnD library required beyond what's already in the stack; implemented with native HTML5 drag events or a lightweight custom hook)

Item total formula:
```
itemTotal = (quantity × unitPrice) − itemDiscount + itemTax
```
Where `itemDiscount` and `itemTax` are resolved from either percentage or fixed mode before applying.

**Edge cases the implementation must handle explicitly:**
- Zero-quantity or zero-price items are valid (e.g., a free line item noting a waived fee) and must not be treated as validation errors, only as items contributing 0 to the subtotal.
- Deleting the last remaining item should not leave the table empty — either block the deletion with a tooltip explanation ("An invoice needs at least one item") or auto-insert a fresh blank row immediately after.
- Reordering must update both the visual order and the underlying `items` array order in the same operation, since the array order is what determines rendering order in every template and in the PDF — there is no separate "display order" field to keep in sync.
- On touch devices, the drag handle uses a long-press-to-activate pattern to avoid conflicting with normal vertical page scrolling; as a fully keyboard-accessible fallback, each row also exposes "Move up" / "Move down" icon buttons (visually hidden but focusable, revealed on keyboard focus) so reordering never depends on pointer/touch input alone.
- Duplicating an item generates a new `id` (never reuses the source item's id) so that per-item React keys, undo/redo history, and any future backend persistence never collide on identity.

### 5.3 Totals

Automatically recalculated on every relevant field change (memoized selector in Zustand, not recalculated on unrelated state changes):

- **Subtotal** = sum of all item totals before invoice-level discount/tax/shipping
- **Discount** (invoice-level, percentage or fixed)
- **Tax** (invoice-level, percentage, applied after discount)
- **Shipping / Other Fees** (flat amount, optional, labeled by user)
- **Grand Total** = Subtotal − Discount + Tax + Shipping + Other Fees
- **Amount Paid** (optional field, for partial payments)
- **Remaining Balance** = Grand Total − Amount Paid

All monetary math is done using integer-cent arithmetic internally (via a small currency-safe math utility) to avoid floating-point rounding errors, then formatted for display using `Intl.NumberFormat` per the selected currency/locale.

**Worked example**, to make the calculation order unambiguous for implementation:

```
Item 1: 2 × $150.00, 10% item discount, 0% item tax → $270.00
Item 2: 5 × $40.00,  no discount, 5% item tax        → $210.00
Subtotal                                              = $480.00
Invoice-level discount (5% of subtotal)               = −$24.00
Invoice-level tax (11%, applied after discount)        = +$50.16
Shipping                                                = +$10.00
Other Fees ("Handling")                                 = +$5.00
Grand Total                                              = $521.16
Amount Paid                                               = $200.00
Remaining Balance                                          = $321.16
```

This example should be used as a reference fixture in unit tests for the calculation utilities (Section 14), since totals logic is the single most error-sensitive part of the product — a wrong subtotal undermines trust in the entire tool far more than a cosmetic template bug would.

### 5.4 Invoice Templates

Ten templates ship in v1, each a self-contained React component receiving the same `Invoice` object as props:

1. **Minimal** — plenty of whitespace, thin rules, single accent color
2. **Modern** — bold sans-serif header, colored total block
3. **Corporate** — structured grid, muted palette, formal tone
4. **Elegant** — serif typography, subtle borders, ivory background
5. **Creative** — asymmetric header, diagonal accent shapes
6. **Blue Business** — blue header band, white card body
7. **Dark Professional** — dark header/footer, light content area, high-contrast accent
8. **Startup** — rounded corners, gradient accent, friendly typography
9. **Agency** — two-column header (logo + big invoice number), stat-style total callouts
10. **Classic** — traditional black-and-white ledger style, monospace totals

Each template independently defines its own layout, typography scale, accent color token, and header treatment, but all templates share the same underlying data contract (Section 12) so switching templates never loses or reformats user data — it is a pure presentational swap. Template switching updates the live preview instantly (no reload, no loading state needed since templates are pre-bundled, not lazy-fetched over a network).

**Template contract.** Every template component must render the following regions, even if a given template chooses to style or position them very differently: a header region (business identity + invoice number/dates), a bill-to region (client details), a line-items region (table or card-list rendering of `items`), a totals region (subtotal through remaining balance), and a footer region (notes, terms & conditions, and any populated extras such as QR code, signature, or stamp). A template is free to omit a region's visual chrome (e.g., no divider line) but must never omit the underlying data if it is present on the `Invoice` object — a template that silently drops the client's address, for instance, would be a functional bug, not a design choice.

**Template metadata.** Each template is registered in `templates/registry.ts` with an id, display name, accent color (used for the `TemplateSelector` swatch), and a static preview thumbnail image, so the selector UI can render a visual gallery rather than a plain dropdown — this matters because template choice is a visual decision and users should be able to compare options at a glance rather than reading names blind.

**Adding an eleventh template later** should require only: creating the new component under `templates/`, implementing the shared region contract above, and adding one entry to the registry — no changes to `InvoiceForm`, `invoiceStore`, or the PDF pipeline, which is the concrete test of whether the template system is properly decoupled from the rest of the app.

### 5.5 Live Preview

Two-column split-screen layout on desktop (`InvoiceForm` left, `InvoicePreview` right); on tablet/mobile it collapses into a tabbed or stacked view with a "Preview" toggle button (see Section 13, UI/UX Guidelines).

The preview subscribes only to the invoice data slice of the Zustand store, and updates are debounced (150–250ms) on text inputs to avoid preview jank while typing, while toggles/selects (template, currency, theme) update immediately.

### 5.6 PDF Export

**Requirements:**
- Output format: A4 Portrait
- High resolution (minimum 2x device pixel ratio scale for crisp text/logo rendering)
- Printable (correct margins, no UI chrome captured)
- Multi-page support (invoices with many line items automatically flow onto additional pages with repeated header/footer as appropriate per template)
- Fonts preserved (web fonts pre-loaded and embedded via canvas rendering before capture)
- Colors preserved (including gradients/accent colors defined per template)
- Filename convention: `Invoice-{invoiceNumber}-{clientName}.pdf`

Full technical approach is detailed in Section 15 (PDF Export Architecture).

### 5.7 Local Storage (Draft Persistence)

- The entire invoice state (business info, client info, items, totals inputs, selected template, theme, settings) is persisted to `localStorage` on every debounced state change.
- On page load, the app checks for an existing draft and restores it automatically (no prompt needed — it should feel seamless, like the data was simply "still there").
- **Save Draft** button gives an explicit confirmation ("Draft saved") for user peace of mind, even though autosave already runs continuously.
- **Clear Draft** button resets the form to blank state after a confirmation modal, and purges the persisted `localStorage` key.
- Storage versioning: persisted data includes a `schemaVersion` field so future app updates can migrate or safely discard incompatible old drafts.

### 5.8 Theme

- Light Mode and Dark Mode toggle, applied to the **application UI only** (the form, navbar, sidebar) — not to the invoice preview/PDF, which always renders per the selected template's own color scheme.
- Theme preference persisted in `localStorage` independently of invoice draft data.
- Respects `prefers-color-scheme` on first load if no explicit preference is stored.

### 5.9 Responsive Design

- **Desktop (≥1280px):** full split-screen form + live preview
- **Tablet (768–1279px):** stacked layout with sticky "Preview" tab/button; form and preview each take full width when active
- **Mobile (<768px):** single-column form flow, preview accessible via a full-screen modal/sheet triggered by a floating action button

Touch targets, drag-and-drop item reordering, and file upload all have mobile-specific interaction patterns (e.g., long-press to drag on touch devices, tap-to-upload for logo instead of relying solely on drag & drop).

### 5.10 Validation

- All form sections use **Zod schemas** composed into a single `invoiceSchema`, integrated with **React Hook Form** via `zodResolver`.
- Validation is field-level (on blur) and section-level (on attempting PDF export — export is blocked with a scroll-to-first-error if required fields are missing).
- Friendly, human-readable error messages (e.g., "Please enter a valid email address" rather than raw Zod error codes).

### 5.11 Extra / Premium-style Features

- **QR Code Payment** — optional QR code (generated client-side, e.g. encoding a payment link or bank details) rendered in the invoice footer.
- **Company Logo** — upload, drag-and-drop, auto-resize/compress to a reasonable max dimension before storing as base64 in state.
- **Signature upload** — optional image, rendered near the totals/footer section.
- **Stamp upload** — optional image overlay, positioned per template design.
- **Watermark** — optional text (e.g., "PAID", "DRAFT") rendered semi-transparently across the invoice body.
- **Multi-Currency** — currency selector affects symbol and `Intl.NumberFormat` locale formatting throughout.
- **Number/Date Formatting** — locale-aware via `dayjs` (dates) and `Intl.NumberFormat` (numbers/currency).
- **Invoice Duplication** — "Duplicate Invoice" action clones the entire current draft into a new draft, incrementing the invoice number suggestion.
- **Print Invoice** — a "Print" action that opens the browser print dialog scoped to the preview node via a print-specific CSS stylesheet (independent of the PDF export pipeline).
- **Keyboard Shortcuts** — e.g., `Ctrl/Cmd+S` to save draft, `Ctrl/Cmd+P` to trigger PDF export, `Ctrl/Cmd+Z`/`Shift+Z` for undo/redo.
- **Drag & Drop Logo** — dedicated dropzone with hover state feedback.
- **Undo / Redo** — a bounded history stack (e.g., last 30 state snapshots) implemented as a Zustand middleware, covering item add/remove/reorder and major field changes; keyboard-shortcut accessible.

None of the items above are gated behind any kind of paywall or login in v1 — "premium-style" describes the *quality bar* of these features (they should feel like they belong in a paid product), not a monetization mechanism. If premium tiers are introduced later (see Section 18), the natural candidates for gating are template count and PDF branding removal, not core functionality like items, totals, or drafts, since gating core invoicing functionality would undermine the "no friction" value proposition that differentiates this product.

---

## 6. Non-Functional Requirements

Non-functional requirements are held to the same rigor as functional ones in this product specifically because there is no backend to compensate for client-side shortcomings later — there is no server-side caching layer to paper over a slow render, no database index to fix a sluggish query, and no server log to diagnose a bug after the fact. Everything the user experiences is a direct function of what runs in their browser, so performance, accessibility, and offline-resilience are treated as first-class requirements rather than a post-launch polish pass.

| Category | Requirement |
|---|---|
| **Performance** | First Contentful Paint < 1.5s on 4G; preview updates render within one animation frame after debounce; PDF generation for a 1–2 page invoice completes in under 3 seconds on mid-range hardware |
| **Accessibility** | WCAG 2.1 AA target: semantic form labels, keyboard navigability across all interactive elements (including drag-to-reorder, which must have a keyboard-accessible alternative such as move-up/move-down buttons), sufficient color contrast in both themes, ARIA live region for validation errors |
| **SEO** | Since this is a mostly-authenticated-free, single-purpose tool, SEO focuses on the marketing/landing page: proper meta tags, Open Graph tags, semantic headings, fast load time |
| **Responsiveness** | Fully functional and visually correct at 320px–2560px viewport widths |
| **Browser Compatibility** | Latest two versions of Chrome, Firefox, Safari, Edge; graceful degradation messaging for unsupported browsers (e.g., very old Safari without modern Canvas API support) |
| **Offline Capability** | Once loaded, the app should be usable offline (draft editing, template switching, PDF export) via a service worker cache of static assets; a "You're offline — changes are saved locally" indicator is shown |
| **Maintainability** | Strict TypeScript, ESLint + Prettier enforced, component-level unit tests for calculation logic, no implicit `any` |
| **Scalability (of codebase)** | New templates addable by dropping a new component + registering it in a template registry, without touching form/state logic |
| **Code Quality** | Consistent file/component naming, colocated types, no business logic inside presentational components |
| **Reusability** | Shared UI primitives (Button, Input, Select, Modal, Toast) built once and reused across all form sections and templates |

The offline capability requirement deserves particular emphasis: because the entire feature set (form, calculations, template rendering, PDF export) has no network dependency once the JavaScript bundle is loaded, offline support is largely a matter of correctly configuring a service worker to cache the app shell and static assets (fonts, template thumbnails) — it is not a separate feature to build from scratch so much as a deployment/configuration concern that should be validated explicitly in the M9 milestone (Section 20) rather than assumed to "just work" because the app happens to be client-only.

---

## 7. User Stories

- *As a freelancer,* I want to fill out my business and client details once per invoice so I can send a professional document without any design work.
- *As a small business owner,* I want to upload my logo and pick a template that matches my brand so my invoices look consistent with my other materials.
- *As an agency admin,* I want to add, duplicate, and reorder many line items quickly so I can bill for large multi-service projects without re-typing repeated entries.
- *As any user,* I want the app to remember my in-progress invoice if I accidentally close the tab, so I don't lose my work.
- *As any user,* I want to see exactly what my invoice will look like as I type, so there are no surprises when I download the PDF.
- *As any user,* I want to download a crisp, correctly-paginated PDF so I can email or print it immediately.
- *As a privacy-conscious user,* I want assurance that my client's contact and financial data never leaves my browser.
- *As a mobile user,* I want to create and download an invoice entirely from my phone while on-site with a client.
- *As a returning user,* I want to duplicate a previous invoice as a starting point for a new one, so recurring billing to the same client is fast.
- *As a power user,* I want keyboard shortcuts and undo/redo so I can work quickly without relying on the mouse for every action.
- *As a user working in low light,* I want a dark mode for the app itself so I'm not staring at a bright white form late at night, even though my invoice PDF stays in its chosen template style.
- *As a user issuing a partial-payment invoice,* I want to record an amount already paid and see the exact remaining balance, so my client knows precisely what they still owe.
- *As a user who made a data-entry mistake mid-invoice,* I want a quick undo rather than having to manually re-type a deleted item or overwritten field.

---

## 8. User Flow

```
Landing Page
     │
     ▼
Create Invoice  ──────────────► (Existing draft detected → auto-restored)
     │
     ▼
Fill Form (Business → Client → Invoice Details)
     │
     ▼
Add Items (add / duplicate / reorder / delete, live totals update)
     │
     ▼
Choose Template (instant preview swap)
     │
     ▼
Live Preview (continuous, side-by-side or toggled on mobile)
     │
     ▼
Validate (on export attempt; scroll-to-error if invalid)
     │
     ▼
Download PDF  ──────────────►  Optionally: Print / Duplicate Invoice / Clear Draft
```

Secondary flows: Theme toggle (available at any point, global), Settings (currency/language defaults, persisted separately from any single invoice draft), Clear Draft (confirmation-gated, returns user to a blank Create Invoice state).

---

## 9. Information Architecture

### 9.1 Page Structure

```
/                     Home (marketing/landing page: value prop, CTA to app)
/app                  Invoice Generator (the core SPA experience)
/app/settings         Settings (default currency, language, tax rate, theme)
/about                About (product info, privacy/no-backend explanation)
/*                    404 (Not Found)
```

Since the product has no accounts, there is no `/login`, `/dashboard`, or `/history` in v1 — `/app` always operates on the single active draft in `localStorage`.

### 9.2 Navigation

- Global **Navbar**: logo/home link, theme switcher, link to Settings, link to About.
- Within `/app`: a **Toolbar** above the split view with Save Draft, Clear Draft, Duplicate Invoice, Print, Download PDF, and Undo/Redo controls.

### 9.3 Deep-Linking and Static Hosting Considerations

Because routing is entirely client-side (React Router) and there is no server to resolve arbitrary paths, the static host (Vercel/Netlify) must be configured with a catch-all rewrite so that a direct visit or refresh on `/app/settings`, for instance, still serves `index.html` and lets the client-side router take over, rather than returning a host-level 404. This is a one-line hosting configuration (`vercel.json` rewrites or Netlify's `_redirects` file) but is called out explicitly here because it is a common gap when a team assumes "static site" means "no configuration needed."

The 404 page itself is a genuine in-app route (not just a host-level fallback), so that a mistyped path still renders inside the app's Layout (Navbar/Footer intact) with a friendly message and a link back to `/app`, rather than a bare, unbranded browser error page.

---

## 10. Component Architecture

```
<Layout>
 ├─ <Navbar>
 │    ├─ <Logo />
 │    ├─ <ThemeSwitcher />
 │    └─ <NavLinks />
 ├─ <Sidebar />                      (optional, template quick-switch on desktop)
 ├─ <PageContent>
 │    └─ (routed page, e.g. <InvoiceGeneratorPage>)
 └─ <Footer />

<InvoiceGeneratorPage>
 ├─ <Toolbar>
 │    ├─ <SaveDraftButton />
 │    ├─ <ClearDraftButton />
 │    ├─ <DuplicateInvoiceButton />
 │    ├─ <PrintButton />
 │    ├─ <PDFButton />
 │    └─ <UndoRedoControls />
 ├─ <SplitView>
 │    ├─ <InvoiceForm>
 │    │    ├─ <BusinessSection />
 │    │    ├─ <ClientSection />
 │    │    ├─ <InvoiceDetailsSection />
 │    │    ├─ <InvoiceItems>
 │    │    │    ├─ <InvoiceItemRow />  (repeated, draggable)
 │    │    │    └─ <AddItemButton />
 │    │    ├─ <TotalsSection />
 │    │    └─ <TemplateSelector />
 │    └─ <InvoicePreview>
 │         └─ <Template{Name} />        (one of the 10 template components)
 └─ (shared) <Modal />, <Toast />
```

Shared/reusable primitives (used across the above): `Button`, `Input`, `TextArea`, `Select`, `DatePicker`, `FileDropzone`, `Checkbox`, `Toggle`, `Modal`, `Toast`, `Tooltip`.

These primitives are built once, early (Milestone M1), specifically so that every later feature — from `BusinessSection`'s logo dropzone to `InvoiceItems`' delete confirmation — is assembling existing pieces rather than each engineer inventing a slightly different button or modal implementation. Each primitive is theme-aware (light/dark) out of the box and exposes the minimal prop surface needed (e.g., `Button` supports `variant` — primary/secondary/danger/ghost — and `size`, rather than accepting arbitrary style overrides that would erode visual consistency over time). Template components under `templates/` deliberately do **not** consume these UI primitives, since template output represents the invoice document itself, not app chrome, and mixing the two concerns would make it harder to reason about which styles affect the PDF output versus the surrounding tool.

---

## 11. Folder Structure

```
src/
├── assets/                 # static images, icons not covered by Heroicons
├── components/             # shared, reusable presentational components
│   ├── ui/                 # Button, Input, Select, Modal, Toast, etc.
│   └── layout/              # Navbar, Sidebar, Footer, Layout
├── features/                # feature-scoped logic + components
│   ├── invoice-form/
│   │   ├── BusinessSection.tsx
│   │   ├── ClientSection.tsx
│   │   ├── InvoiceDetailsSection.tsx
│   │   ├── InvoiceItems/
│   │   │   ├── InvoiceItemRow.tsx
│   │   │   └── useItemCalculations.ts
│   │   └── TotalsSection.tsx
│   ├── invoice-preview/
│   │   └── InvoicePreview.tsx
│   ├── template-selector/
│   │   └── TemplateSelector.tsx
│   └── pdf-export/
│       ├── PDFButton.tsx
│       └── generatePdf.ts
├── templates/                # one file per invoice template
│   ├── TemplateMinimal.tsx
│   ├── TemplateModern.tsx
│   ├── TemplateCorporate.tsx
│   ├── TemplateElegant.tsx
│   ├── TemplateCreative.tsx
│   ├── TemplateBlueBusiness.tsx
│   ├── TemplateDarkProfessional.tsx
│   ├── TemplateStartup.tsx
│   ├── TemplateAgency.tsx
│   ├── TemplateClassic.tsx
│   └── registry.ts            # maps template id → component + metadata
├── hooks/                    # cross-cutting hooks (useDebounce, useUndoRedo, useLocalStorage)
├── pages/                    # route-level components (Home, InvoiceGeneratorPage, Settings, About, NotFound)
├── layouts/                  # page-level layout wrappers
├── store/                    # Zustand stores + middleware
│   ├── invoiceStore.ts
│   ├── settingsStore.ts
│   ├── uiStore.ts
│   └── undoRedoMiddleware.ts
├── validators/                # Zod schemas
│   ├── businessSchema.ts
│   ├── clientSchema.ts
│   ├── itemSchema.ts
│   └── invoiceSchema.ts
├── types/                     # shared TypeScript types/interfaces
│   └── invoice.types.ts
├── utils/                     # currency math, formatting, id generation
│   ├── currency.ts
│   ├── dateFormat.ts
│   └── calculations.ts
├── constants/                 # currency list, tax presets, template metadata
├── lib/                        # thin wrappers around 3rd-party libs (jsPDF, html2canvas config)
├── styles/                      # Tailwind config extensions, global CSS
├── App.tsx
├── main.tsx
└── router.tsx
```

---

## 12. Data Models

The `Invoice` interface below is the single source of truth for the entire application: it is what the form writes to, what every template reads from, what gets persisted to `localStorage`, and what gets serialized for PDF generation. No component should maintain its own parallel copy of invoice data — if a value needs to be displayed in more than one place (e.g., the grand total shown in both `TotalsSection` and the preview), it should be derived from this shape via a memoized selector rather than duplicated in local component state, so there is never a risk of the on-screen preview and the exported PDF disagreeing with each other.

A few modeling decisions are worth calling out explicitly:

- **`InvoiceItem.total` is a cached, computed field**, not something the user edits directly. It exists on the interface so templates and the PDF pipeline can render it without re-running calculation logic, but it must be recomputed by the store's update actions any time `quantity`, `unitPrice`, `discount`, or `tax` changes — never left stale.
- **`Discount` and `Tax` are structured objects, not bare numbers**, specifically so the UI can offer a percentage/fixed toggle without needing a second shadow field to track which mode is active.
- **`Currency` bundles `code`, `symbol`, and `locale` together** rather than deriving symbol/locale from code at render time, because doing so keeps `Intl.NumberFormat` calls trivial (`new Intl.NumberFormat(currency.locale, { style: 'currency', currency: currency.code })`) without a lookup table scattered across components.
- **`schemaVersion` lives on the `Invoice` object itself**, not just in the persistence layer, so that a "Duplicate Invoice" or manual JSON export/import feature (Section 17, Risks) always carries its own version marker regardless of how it later re-enters the app.

```typescript
// types/invoice.types.ts

export interface Business {
  name: string;
  logoDataUrl?: string;     // base64, resized/compressed client-side
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
}

export interface Client {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export type DiscountMode = "percentage" | "fixed";

export interface Discount {
  mode: DiscountMode;
  value: number;             // percentage (0-100) or fixed amount
}

export interface Tax {
  label: string;             // e.g. "VAT", "PPN"
  rate: number;               // percentage
}

export interface InvoiceItem {
  id: string;                 // uuid
  description: string;
  quantity: number;
  unitPrice: number;          // in smallest currency unit-safe decimal
  discount?: Discount;
  tax?: Tax;
  total: number;               // computed, cached for display
}

export interface Currency {
  code: string;                // ISO 4217, e.g. "IDR"
  symbol: string;               // e.g. "Rp"
  locale: string;                // e.g. "id-ID"
}

export type ThemeMode = "light" | "dark";

export interface InvoiceTotalsInputs {
  discount?: Discount;
  tax?: Tax;
  shipping?: number;
  otherFees?: { label: string; amount: number }[];
  amountPaid?: number;
}

export interface Invoice {
  id: string;                    // uuid, local draft id
  schemaVersion: number;
  invoiceNumber: string;
  issueDate: string;              // ISO date
  dueDate: string;                 // ISO date
  currency: Currency;
  language: "en" | "id";
  paymentTerms: string;
  notes?: string;
  termsAndConditions?: string;
  business: Business;
  client: Client;
  items: InvoiceItem[];
  totals: InvoiceTotalsInputs;
  templateId: string;              // references templates/registry.ts
  extras?: {
    qrCodePayload?: string;
    signatureDataUrl?: string;
    stampDataUrl?: string;
    watermarkText?: string;
  };
}

export interface Settings {
  defaultCurrency: Currency;
  defaultLanguage: "en" | "id";
  defaultTaxRate?: number;
  theme: ThemeMode;
}

export interface TemplateMeta {
  id: string;
  name: string;
  accentColor: string;
  previewThumbnailUrl: string;
}
```

All Zod schemas in `validators/` are written to structurally mirror these interfaces one-for-one (e.g., `invoiceItemSchema` validates the exact shape of `InvoiceItem`), and `z.infer<typeof invoiceSchema>` is used to derive the TypeScript type rather than maintaining the interface and schema as two independently-hand-written sources of truth that could drift apart.

---

## 13. UI/UX Guidelines

- **Split-first mental model:** the form and the preview are always conceptually side-by-side, even when the mobile layout stacks them — every form change should feel like it's "drawing" the invoice live.
- **Typography:** a clear, neutral UI font (e.g., Inter) for the app chrome, distinct from whatever typography each invoice *template* defines for the invoice content itself — the two should never be visually confused.
- **Color:** app UI uses a restrained neutral palette (light/dark themes); template accent colors are scoped strictly to the preview/PDF and never bleed into the app chrome.
- **Feedback:** every destructive action (Clear Draft, Delete Item) is confirmed via a lightweight modal or an "Undo" toast rather than a blocking `confirm()` dialog.
- **Empty states:** a fresh invoice starts with one blank item row pre-added (not zero rows) so the table never looks broken.
- **Progressive disclosure:** advanced/extra features (QR code, stamp, watermark, signature) live behind a collapsible "Advanced" section within the form so the default flow stays short and unintimidating.
- **Motion:** subtle, fast transitions (150–200ms) for template switching and section expand/collapse; no motion that delays the user's ability to keep typing.
- **Error states:** validation errors appear inline, directly beneath the offending field, in a consistent red/amber tone that meets contrast requirements in both light and dark themes; a summary is never shown in a separate disconnected panel, since that forces the user to context-switch between "what's wrong" and "where do I fix it."
- **Loading/processing states:** the only operation with a meaningful processing time is PDF generation (Section 15); it uses a button-level spinner plus disabled state rather than a full-page blocking overlay, since the rest of the app remains interactive and there's no reason to prevent a user from continuing to edit while a previous export finishes.
- **Consistency across templates and app chrome:** while templates each have their own personality, the *interaction* patterns around them (how you select one, how you preview, how you export) must feel identical regardless of which template is active — visual variety lives in the invoice content, not in how the surrounding tool behaves.
- **First-run guidance:** a lightweight, dismissible hint (not a mandatory onboarding tour) points a first-time visitor toward the template selector and the PDF button, since these are the two actions most tied to the product's core value and easiest to miss on a form-dense page.

---

## 14. Technical Architecture

- **Framework:** React 18 + Vite for fast dev server and optimized production builds.
- **Language:** TypeScript throughout, `strict: true` in `tsconfig.json`.
- **Styling:** Tailwind CSS with a custom design-token extension (colors, spacing, font sizes) shared between the app UI and, where relevant, template base styles.
- **Routing:** React Router (client-side only, since there is no server to handle deep-link routes — the static host must be configured with a SPA fallback/rewrite rule to `index.html`).
- **State Management:** Zustand, split into purpose-specific stores (`invoiceStore`, `settingsStore`, `uiStore`) to avoid a single monolithic store causing unnecessary re-renders.
- **Forms & Validation:** React Hook Form for performant, uncontrolled-by-default form state; Zod schemas shared between form validation and (optionally) runtime-checking `localStorage`-restored data.
- **Persistence:** thin `useLocalStorage`-style hook wrapping Zustand's `persist` middleware, with a manual `schemaVersion` guard.
- **Icons:** Heroicons for all UI iconography (outline for default state, solid for active/selected state).
- **Date handling:** `dayjs` for parsing, formatting, and due-date calculations (e.g., "Net 30" = issueDate + 30 days).
- **Deployment:** static build output (`vite build`) deployed to Vercel or Netlify; no serverless functions required for v1.
- **Build/CI:** lint + type-check + unit test gate on every PR; preview deployments per branch (Vercel/Netlify native feature).
- **Environment configuration:** because there is no backend, there are effectively no environment-specific secrets to manage; the only environment-level concerns are the base path (if deployed under a subpath) and analytics keys, both of which are safe to bake into the client build via Vite's `import.meta.env` mechanism.
- **Bundle size discipline:** since `html2canvas` and `jsPDF` are non-trivial in size, the PDF export code path is code-split via dynamic `import()` so it is only downloaded when a user actually clicks "Download PDF," keeping the initial app shell fast to load even though the full feature set is sizable.

This architecture intentionally avoids any premature complexity that a backend would introduce (API layers, auth middleware, database migrations) while still following the same engineering discipline a backend-connected app would — typed data contracts, validated inputs, and a clear separation between state, presentation, and side effects (like PDF generation) — so that if a backend is added later per the roadmap in Section 19, it is additive rather than a rewrite.

---

## 15. PDF Export Architecture

The PDF pipeline runs entirely client-side using **html2canvas** to rasterize the rendered invoice DOM node and **jsPDF** to assemble the resulting image(s) into a paginated PDF document.

**Pipeline steps:**

1. **Isolate the render target.** The currently active `<Template{Name}>` component is rendered into an off-screen (or visually hidden but layout-present) container sized to exact A4 proportions at a fixed base pixel width (e.g., 794px wide at 96 DPI, matching A4 at 100%), independent of whatever zoom/scroll state the on-screen preview is in.
2. **Wait for assets.** Before capture, the pipeline waits for all embedded images (logo, signature, stamp, QR code) to finish loading (`Promise.all` over image `onload`/`decode()`), and confirms web fonts are loaded via the `document.fonts.ready` promise, to avoid capturing a flash-of-unstyled-content state.
3. **Capture with html2canvas.** `html2canvas(node, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })` — the `scale: 2` factor is what delivers "high resolution" output on standard-DPI displays; `useCORS` is required for any externally-hosted assets (not typically needed since logo/signature/stamp are user-uploaded base64 data URLs, but included for robustness).
4. **Slice into pages.** If the rendered content's height exceeds one A4 page, the canvas is sliced into page-height segments (canvas-to-canvas cropping) rather than naively stretching content, so text is never split mid-line in a jarring way — templates define natural "page-break-friendly" section boundaries (e.g., never splitting a single line item row) that the slicing logic respects by measuring row boundaries before slicing.
5. **Assemble with jsPDF.** Each page-sized canvas slice is added via `pdf.addImage(...)` as a PNG (for crisp text/logo edges) sized to fill the A4 page with correct margins; `pdf.addPage()` is called between slices.
6. **Trigger download.** `pdf.save('Invoice-{invoiceNumber}-{clientName}.pdf')`.

**Error handling.** If `html2canvas` throws (e.g., an unsupported CSS feature slipped into a template, or a corrupted uploaded image fails to decode), the pipeline must fail gracefully with a toast explaining that export failed and suggesting the user try again, rather than leaving the button stuck in a "Generating…" state indefinitely — a hard timeout (e.g., 15 seconds) should force this fallback path even if no explicit error is thrown.

**Why html2canvas + jsPDF instead of browser print-to-PDF.** The browser's native print dialog (used separately for the "Print Invoice" action, Section 5.11) is not suitable as the *primary* export path because its output varies by browser/OS print driver, cannot be triggered programmatically to a silent file download, and gives far less control over exact pagination and margins. The canvas-based pipeline trades a small amount of implementation complexity for full control over the final artifact's appearance, which is essential when the artifact is a business document representing the user's professional image.

**Scaling & fidelity notes:**
- All template CSS uses fixed, print-safe units (px-based layout tuned specifically for the A4 render width) rather than relying on the on-screen responsive breakpoints, so the exported PDF is deterministic regardless of the user's actual screen size when they clicked "Download."
- Colors preserved by ensuring templates avoid CSS features `html2canvas` handles poorly (e.g., certain CSS gradients or `backdrop-filter`); templates are visually QA'd specifically against their PDF output, not just their on-screen rendering.
- A loading state ("Generating PDF…") with a disabled button prevents duplicate export triggers during the (typically 1–3 second) capture/assemble process.

---

## 16. State Management

Zustand is organized into three primary stores:

**`invoiceStore`** — the single source of truth for the active invoice draft (business, client, items, totals inputs, templateId, extras). Exposes granular actions (`updateBusiness`, `updateClient`, `addItem`, `removeItem`, `duplicateItem`, `reorderItems`, `setTemplate`, `updateTotalsInput`) rather than a single generic `setState`, so the undo/redo middleware can label each history entry meaningfully and so components only need to subscribe to the slices they actually render. Wrapped in Zustand's `persist` middleware targeting `localStorage`, with a custom `partialize` to exclude any transient/derived fields from being persisted redundantly.

**`settingsStore`** — user-level preferences that outlive any single invoice draft: default currency, default language, default tax rate, theme mode. Also persisted to `localStorage`, under a separate key from the invoice draft, so clearing a draft never resets the user's preferences.

**`uiStore`** — ephemeral UI state that should *not* persist: active mobile view (form vs. preview), modal open/close state, toast queue, PDF-generation loading state.

**Undo/Redo:** implemented as a Zustand middleware wrapping `invoiceStore` that maintains a bounded stack (default 30 entries) of serialized state snapshots keyed to labeled actions; `undo()`/`redo()` pop/push against this stack and are wired to both UI buttons and keyboard shortcuts.

**Derived/computed values** (subtotal, grand total, remaining balance) are implemented as memoized selectors rather than stored state, so they are always consistent with the underlying items/totals-inputs and never require a separate "recalculate" action to stay in sync.

---

## 17. Testing Strategy

- **Unit tests** for all pure calculation logic in `utils/calculations.ts` and `utils/currency.ts`, including the worked example in Section 5.3 as a regression fixture, plus explicit edge cases: zero-quantity items, 100% discounts, negative remaining balance (overpayment), and zero-decimal currencies (e.g., IDR, JPY).
- **Component tests** (React Testing Library) for `InvoiceItems` covering add/delete/duplicate/reorder interactions and their effect on the underlying store state, and for form sections covering Zod validation error display.
- **Store tests** for `invoiceStore` actions in isolation, and for the undo/redo middleware specifically (push/pop boundary conditions at the 30-entry cap, redo-stack invalidation after a new action following an undo).
- **Visual regression tests** for each of the ten templates, both in on-screen preview form and in their captured PDF-pipeline output, since these are two separate render paths (Section 15) that must stay visually consistent.
- **End-to-end tests** (e.g., Playwright) covering the full user flow in Section 8: fill form → add items → switch template → export PDF → assert a PDF file was produced with the expected filename pattern; and a second flow covering draft persistence: fill form → reload page → assert data was restored.
- **Manual cross-browser QA checklist** run before each release against the latest two versions of Chrome, Firefox, Safari, and Edge, specifically targeting the PDF export pipeline (Section 15's known risk area) and drag-and-drop item reordering on touch devices.

---

## 18. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| `localStorage` data loss (user clears browser data, private browsing mode) | User loses in-progress invoice | Clear messaging that data is local-only; "Save Draft" gives explicit confirmation; consider an optional manual JSON export/import as a backup mechanism |
| PDF rendering fidelity differs across browsers (canvas rendering quirks) | Exported PDF looks different than preview | Extensive cross-browser QA specifically on the PDF pipeline; pin `html2canvas`/`jsPDF` versions; avoid CSS features known to render inconsistently |
| Large base64 images (logo/signature/stamp) bloating `localStorage` (5–10MB browser limit) | Draft fails to save, silent data loss | Client-side image compression/resizing on upload before storing; enforce a max stored-image size with user-facing warning |
| Multi-page PDF pagination splitting content awkwardly | Unprofessional-looking output | Page-break-aware slicing logic that respects row/section boundaries (Section 15) |
| No backend means no analytics on real usage patterns beyond client-side/privacy-respecting telemetry | Harder to prioritize v2 features | Use privacy-conscious, aggregate-only analytics (e.g., page views, feature-usage counts) without capturing invoice content |
| Template visual QA effort scales with template count | Slower to ship new templates | Establish a template checklist/spec (Section 5.4) and a shared base layout system templates extend rather than building each from scratch |
| Currency/number formatting edge cases (e.g., currencies with 0 decimal places like JPY/IDR) | Incorrect-looking totals | Centralize all formatting through a single currency utility driven by `Intl.NumberFormat`, tested against edge-case currencies |
| Users mistake "Save Draft" for "Send Invoice" and believe the client has received it | Missed payments, user confusion, support burden | Clear UI copy distinguishing "saved locally on this device" from "sent," and no button language that implies transmission (e.g., avoid the word "Submit") |
| Undo/redo history growing unbounded in memory on very long editing sessions | Performance degradation over time | Hard cap the history stack (default 30 entries, oldest entries evicted first) and store only diffs or lightweight snapshots rather than deep-cloning the full invoice object on every change |

---

## 19. Future Improvements (Backend-Enabled Roadmap)

While v1 is intentionally backend-free, the data model and architecture are designed so the following can be layered on in a v2+ without a rewrite:

- **Authentication** — optional account creation for users who want persistence beyond a single device.
- **Cloud Storage** — sync drafts and sent invoices across devices.
- **Customer Management** — a saved client directory to avoid re-entering client details.
- **Invoice History** — list of all past invoices, searchable/filterable by client, date, status.
- **Analytics Dashboard** — revenue over time, outstanding balances, top clients.
- **Email Invoice** — send the PDF directly to the client's email from within the app.
- **Online Payments** — payment link integration (e.g., Stripe, regional Indonesian payment gateways) tied to the QR/payment section already present in v1.
- **Tax Reports** — export summaries for accounting/tax filing purposes.
- **Recurring Invoices** — scheduled auto-generation and sending for retainer-style billing.
- **Multi-user Workspace** — shared access for small teams/agencies with role-based permissions.
- **Expanded Multi-language** — beyond English/Indonesian, full i18n of both app UI and invoice templates.
- **API Integration** — public API for developers to generate invoices programmatically.
- **Template Marketplace** — community or premium templates beyond the core ten.

Because the `Invoice`, `Business`, `Client`, and `InvoiceItem` interfaces (Section 12) are already normalized and framework-agnostic, they can be reused directly as the shape of a future database schema (e.g., Prisma models) with minimal transformation.

---

## 20. Development Milestones

| Milestone | Scope |
|---|---|
| **M1 — Foundation** | Project scaffold (Vite + TS + Tailwind), design tokens, shared UI primitives (Button, Input, Select, Modal, Toast), routing skeleton, Layout/Navbar/Footer |
| **M2 — Data Layer** | Zod schemas, TypeScript data models, Zustand stores (`invoiceStore`, `settingsStore`, `uiStore`), `localStorage` persistence + schema versioning |
| **M3 — Form Core** | BusinessSection, ClientSection, InvoiceDetailsSection, InvoiceItems (add/delete/duplicate/reorder), TotalsSection with live calculation |
| **M4 — Templates & Preview** | Template registry, first 3 templates (Minimal, Modern, Corporate), InvoicePreview split-screen wiring, TemplateSelector |
| **M5 — Remaining Templates** | Remaining 7 templates (Elegant, Creative, Blue Business, Dark Professional, Startup, Agency, Classic) |
| **M6 — PDF Export** | html2canvas/jsPDF pipeline, multi-page slicing logic, print stylesheet for the separate Print action |
| **M7 — Extras** | Logo/signature/stamp upload, watermark, QR code, multi-currency formatting, keyboard shortcuts, undo/redo |
| **M8 — Responsive & Theming** | Mobile/tablet layouts, light/dark theme, accessibility pass (keyboard nav, ARIA, contrast) |
| **M9 — Polish & QA** | Cross-browser PDF fidelity QA, performance pass, empty/error states, offline service worker |
| **M10 — Launch** | Landing page, About page, deployment pipeline (Vercel/Netlify), analytics wiring, final QA sign-off |

---

## 21. Estimated Timeline

Assuming a small team (1–2 frontend engineers, part-time design support):

| Phase | Duration | Milestones Covered |
|---|---|---|
| Weeks 1–2 | Foundation + Data Layer | M1, M2 |
| Weeks 3–4 | Form Core | M3 |
| Weeks 5–6 | Templates & Preview (initial set) | M4 |
| Weeks 7–8 | Remaining Templates | M5 |
| Weeks 9–10 | PDF Export | M6 |
| Weeks 11–12 | Extras | M7 |
| Weeks 13–14 | Responsive & Theming | M8 |
| Weeks 15–16 | Polish, QA, Offline Support | M9 |
| Weeks 17–18 | Landing Page, Deployment, Launch | M10 |

**Total estimated timeline: ~18 weeks (4.5 months)** for a full-featured v1, with a possible **reduced-scope MVP** (3 templates instead of 10, no undo/redo, no watermark/stamp/QR extras, no offline support) achievable in roughly **8–9 weeks** if a faster initial launch is prioritized over full template/feature breadth.

---

*End of Document.*
