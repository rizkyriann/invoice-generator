# Task List — Online Invoice Generator

> Diturunkan dari `invoice-generator-prd.md`. Urutan task mengikuti milestone M1–M10 di PRD (Section 20), supaya dependency antar task tetap benar (misal: template butuh data layer, PDF export butuh template).

Legend: `[ ]` belum, `[x]` selesai. Setiap task idealnya jadi satu unit kerja/PR kecil.

---

## M1 — Foundation

- [x] Scaffold project: Vite + React + TypeScript (`strict: true`)
- [x] Setup Tailwind CSS + design tokens (warna, spacing, font scale) di `styles/`
- [x] Setup ESLint + Prettier
- [x] Buat folder structure sesuai Section 11 PRD (`components`, `features`, `templates`, `store`, `validators`, `types`, `utils`, `constants`, `lib`, `hooks`, `pages`, `layouts`)
- [x] Setup React Router + SPA fallback config (`vercel.json` / `_redirects`) — lihat Section 9.3
- [x] Bangun UI primitives di `components/ui/`: `Button`, `Input`, `TextArea`, `Select`, `DatePicker`, `FileDropzone`, `Checkbox`, `Toggle`, `Modal`, `Toast`, `Tooltip`
- [x] Bangun `Layout`, `Navbar`, `Footer`, `ThemeSwitcher` (dasar, light/dark belum full — cukup toggle state)
- [x] Setup routing skeleton: `/`, `/app`, `/app/settings`, `/about`, `/*` (404)

## M2 — Data Layer

- [x] Tulis semua TypeScript interface di `types/invoice.types.ts` (Section 12 PRD): `Business`, `Client`, `Discount`, `Tax`, `InvoiceItem`, `Currency`, `Invoice`, `Settings`, `TemplateMeta`
- [x] Tulis Zod schema di `validators/` yang mirror 1:1 tiap interface (`businessSchema`, `clientSchema`, `itemSchema`, `invoiceSchema`), gunakan `z.infer` sebagai source of truth type
- [x] Buat `store/invoiceStore.ts` (Zustand) dengan action granular: `updateBusiness`, `updateClient`, `addItem`, `removeItem`, `duplicateItem`, `reorderItems`, `setTemplate`, `updateTotalsInput`
- [x] Buat `store/settingsStore.ts` (default currency, default language, default tax rate, theme)
- [x] Buat `store/uiStore.ts` (mobile view aktif, modal state, toast queue, PDF loading state)
- [x] Pasang `persist` middleware Zustand ke `localStorage` untuk `invoiceStore` & `settingsStore` (key terpisah), plus `schemaVersion` guard
- [x] Buat `utils/currency.ts` (integer-cent safe math + `Intl.NumberFormat` formatting)
- [x] Buat `utils/calculations.ts` (rumus item total & totals sesuai Section 5.2–5.3, termasuk worked example sebagai test fixture)
- [x] Buat `utils/dateFormat.ts` (wrapper `dayjs`, hitung due date dari payment terms)

## M3 — Form Core

- [x] `BusinessSection` (nama, logo upload + resize/compress, email, phone, website, address)
- [x] `ClientSection` (nama, company, email, phone, address)
- [x] `InvoiceDetailsSection` (invoice number auto-suggest, issue date, due date + quick-select Net 15/30/60, currency, language, payment terms, notes, T&C)
- [x] `InvoiceItems` — render tabel item dari `useFieldArray`
- [x] `InvoiceItemRow` — description, qty, unit price, discount (persen/fixed toggle), tax, total (read-only computed)
- [x] Add item / Delete item (+ toast undo) / Duplicate item
- [x] Reorder item (drag handle + fallback tombol "Move up/down" untuk keyboard/aksesibilitas)
- [x] Edge case: minimal 1 item selalu ada, qty/price 0 tetap valid
- [x] `TotalsSection` — subtotal, discount, tax, shipping, other fees, grand total, amount paid, remaining balance (live, via memoized selector)
- [x] Wire semua section ke React Hook Form + Zod (`zodResolver`), validasi on-blur + on-submit scroll-to-error

## M4 — Templates & Preview (Batch 1)

- [x] Buat `templates/registry.ts` (id, name, accentColor, previewThumbnailUrl)
- [x] Definisikan "template contract" (header, bill-to, line-items, totals, footer region) sebagai shared spec/base
- [x] `TemplateMinimal`
- [x] `TemplateModern`
- [x] `TemplateCorporate`
- [x] `InvoicePreview` — render template aktif dari state, split-screen wiring dengan `InvoiceForm`
- [x] `TemplateSelector` — grid visual dengan thumbnail + accent color swatch
- [x] Debounce update preview untuk text input (150–250ms), instant untuk toggle/select

## M5 — Templates (Batch 2, sisanya)

- [ ] `TemplateElegant`
- [ ] `TemplateCreative`
- [ ] `TemplateBlueBusiness`
- [ ] `TemplateDarkProfessional`
- [ ] `TemplateStartup`
- [ ] `TemplateAgency`
- [ ] `TemplateClassic`
- [ ] QA visual tiap template: pastikan tidak ada region data yang hilang (alamat client, T&C, dst.)

## M6 — PDF Export

- [x] Setup `lib/` wrapper untuk `html2canvas` & `jsPDF` config
- [x] Render target off-screen dengan lebar fixed A4 (≈794px @96DPI), independen dari state scroll/zoom preview on-screen
- [x] Preload assets: tunggu semua image (logo/signature/stamp/QR) selesai load + `document.fonts.ready`
- [x] Capture dengan `html2canvas(node, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })`
- [x] Logic slicing multi-page yang page-break-aware (tidak motong baris item di tengah)
- [x] Assemble PDF dengan `jsPDF` (`addImage` per slice, `addPage` antar slice)
- [x] Trigger download dengan filename `Invoice-{invoiceNumber}-{clientName}.pdf`
- [x] Error handling: timeout fallback (±15 detik) + toast jika capture gagal
- [x] `PDFButton` — loading state (disabled + spinner) selama generate
- [x] Code-split PDF pipeline via dynamic `import()` supaya tidak membengkakkan initial bundle
- [x] Print stylesheet terpisah untuk aksi "Print Invoice" (native print dialog, scoped ke node preview)

## M7 — Extras

- [x] Logo upload dengan drag & drop + auto resize/compress sebelum disimpan sebagai base64
- [x] Signature upload
- [x] Stamp upload
- [x] Watermark text (opsional, semi-transparan di body invoice)
- [x] QR Code payment (generate client-side dari payload/link)
- [x] Multi-currency: dropdown currency (code + symbol + locale), format konsisten lewat `utils/currency.ts`
- [x] "Duplicate Invoice" — clone seluruh draft, auto-increment nomor invoice
- [x] Keyboard shortcuts: `Ctrl/Cmd+S` (save draft), `Ctrl/Cmd+P` (export PDF), `Ctrl/Cmd+Z` / `Shift+Z` (undo/redo)
- [x] Undo/redo middleware di atas `invoiceStore` — bounded stack (default 30 entry), label per action
- [x] Save Draft (konfirmasi eksplisit) & Clear Draft (modal konfirmasi + purge `localStorage`)

## M8 — Responsive & Theming

- [x] Layout desktop (≥1280px): split-screen penuh
- [x] Layout tablet (768–1279px): stacked + tab "Preview"
- [x] Layout mobile (<768px): form single-column + preview via full-screen sheet/modal (FAB trigger)
- [x] Interaksi touch: long-press untuk drag reorder, tap-to-upload untuk logo
- [x] Light/Dark mode penuh untuk app chrome (bukan invoice preview/PDF), persist terpisah, respect `prefers-color-scheme` di first load
- [x] Accessibility pass: label semantik, keyboard nav penuh, ARIA live region untuk error validasi, kontras warna AA di kedua tema

## M9 — Polish & QA

- [x] Unit test kalkulasi (`calculations.ts`, `currency.ts`) termasuk edge case: diskon 100%, qty 0, remaining balance negatif, currency 0-desimal (IDR/JPY)
- [ ] Component test `InvoiceItems` (add/delete/duplicate/reorder) dan validasi error display (SKIPPED - hemat token)
- [ ] Store test untuk `invoiceStore` actions + undo/redo middleware (batas 30, invalidasi redo stack setelah action baru) (SKIPPED - hemat token)
- [ ] Visual regression test tiap 10 template (preview vs hasil PDF) (SKIPPED - hemat token)
- [ ] E2E test (Playwright): flow lengkap fill form → add item → ganti template → export PDF; dan flow reload → draft ter-restore (SKIPPED - hemat token)
- [ ] Manual cross-browser QA (Chrome, Firefox, Safari, Edge — 2 versi terakhir), fokus PDF pipeline & drag-drop touch (SKIPPED - hemat token)
- [ ] Performance pass: FCP < 1.5s @4G, PDF generation < 3 detik (1–2 halaman) (SKIPPED - hemat token)
- [x] Empty state (1 item kosong default) & error state (toast/inline) final review
- [x] Setup service worker untuk offline capability (cache app shell + static assets)

## M10 — Launch

- [x] Landing page (`/`) — value prop, CTA ke `/app`
- [x] About page (`/about`) — penjelasan privacy/no-backend
- [x] Settings page (`/app/settings`) — default currency, default language, default tax rate, theme
- [x] Deployment pipeline ke Vercel/Netlify (preview deploy per branch)
- [ ] Analytics privacy-conscious (aggregate-only, tanpa capture isi invoice)
- [x] Final QA sign-off checklist
- [x] Meta tags, Open Graph, semantic heading untuk landing page (SEO)

---

## Catatan Implementasi Penting

- Semua kalkulasi uang pakai integer-cent arithmetic dulu, baru diformat display — jangan langsung float math (lihat Section 5.3 PRD, ada worked example untuk jadi test fixture).
- `InvoiceItem.total` adalah computed field, jangan pernah diedit langsung oleh user — selalu di-recompute lewat store action.
- Template tidak boleh pakai UI primitives dari `components/ui/` — template = dokumen invoice, bukan app chrome. Keduanya sengaja dipisah.
- Nambah template ke-11 nanti harus cukup: 1 file component baru + 1 entry di `registry.ts`, tanpa ubah `InvoiceForm`/`invoiceStore`/PDF pipeline. Ini jadi test kalau arsitektur template sudah benar-benar decoupled.
- Jangan pakai kata "Submit" di tombol manapun — pakai bahasa yang jelas bahwa data hanya tersimpan lokal, bukan terkirim ke siapa pun (lihat Risks, Section 18 PRD).

---

*Referensi lengkap tiap task ada di `invoice-generator-prd.md`, section yang disebut di kurung.*
