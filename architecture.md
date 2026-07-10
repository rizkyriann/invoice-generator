# Architecture — Online Invoice Generator

> Dokumen ini menjabarkan arsitektur teknis secara detail, diturunkan dari `invoice-generator-prd.md` (terutama Section 10–16). Fokusnya "bagaimana" sistem dibangun — komponen, alur data, dan alasan di balik tiap keputusan teknis — bukan mengulang requirement produk.

---

## 1. Prinsip Arsitektur

Tiga aturan ini yang membentuk hampir semua keputusan di bawah:

1. **Tidak ada backend, sepenuhnya client-side.** Semua kalkulasi, rendering template, dan PDF generation jalan di browser. Tidak ada API call, tidak ada database. Implikasinya: state management dan `localStorage` persistence menggantikan peran yang biasanya dipegang server.
2. **`Invoice` object adalah single source of truth.** Form menulis ke situ, template baca dari situ, PDF pipeline serialize dari situ, `localStorage` persist situ. Tidak boleh ada komponen yang menyimpan salinan data invoice sendiri secara lokal.
3. **Presentasi terpisah total dari app chrome.** Template invoice (`templates/`) tidak pernah bergantung pada UI primitives app (`components/ui/`). Ini supaya mengganti tampilan invoice tidak pernah menyentuh logic form/store, dan sebaliknya.

---

## 2. High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                         │
│                                                                    │
│  ┌───────────────┐        ┌──────────────────┐                  │
│  │  InvoiceForm   │──────▶│   invoiceStore     │◀──────┐          │
│  │  (RHF + Zod)   │        │   (Zustand)         │        │          │
│  └───────────────┘        └────────┬──────────┘        │          │
│                                       │ persist            │          │
│                                       ▼                    │          │
│                              ┌─────────────────┐          │          │
│                              │  localStorage     │          │          │
│                              └─────────────────┘          │          │
│                                                              │          │
│  ┌───────────────┐        ┌──────────────────┐        │          │
│  │ InvoicePreview │◀──────│  Template{Name}    │◀───────┘          │
│  │ (split-screen) │        │  (registry-based)   │                   │
│  └───────────────┘        └────────┬──────────┘                   │
│                                       │ off-screen render            │
│                                       ▼                              │
│                              ┌─────────────────┐                    │
│                              │  PDF Pipeline      │                    │
│                              │  html2canvas       │                    │
│                              │  + jsPDF            │                    │
│                              └────────┬──────────┘                    │
│                                       ▼                              │
│                              Downloaded .pdf file                    │
└─────────────────────────────────────────────────────────────────┘
```

Tidak ada panah yang keluar dari kotak browser — itu memang sengaja. Hosting (Vercel/Netlify) hanya menyajikan static assets, tidak berpartisipasi dalam runtime logic sama sekali.

---

## 3. Layered Architecture

```
┌──────────────────────────────────────────────┐
│  Presentation Layer                             │
│  pages/, layouts/, features/, templates/          │
│  (React components — form sections, preview,      │
│   toolbar, template variants)                       │
├──────────────────────────────────────────────┤
│  State Layer                                      │
│  store/ (Zustand: invoiceStore, settingsStore,      │
│  uiStore) + undoRedoMiddleware                       │
├──────────────────────────────────────────────┤
│  Validation Layer                                  │
│  validators/ (Zod schemas, 1:1 mirror ke types/)      │
├──────────────────────────────────────────────┤
│  Domain Logic Layer                                │
│  utils/ (calculations.ts, currency.ts, dateFormat.ts)  │
│  — pure functions, tidak bergantung React sama sekali    │
├──────────────────────────────────────────────┤
│  Persistence Layer                                  │
│  Zustand persist middleware → localStorage             │
├──────────────────────────────────────────────┤
│  Export Layer                                        │
│  lib/ (html2canvas + jsPDF wrapper), code-split          │
│  dan hanya dimuat saat tombol "Download PDF" ditekan       │
└──────────────────────────────────────────────┘
```

Aturan dependency: layer di atas boleh bergantung ke layer di bawahnya, tidak sebaliknya. Domain Logic Layer (`utils/`) sengaja dibuat framework-agnostic (pure TypeScript, tanpa import React) supaya bisa di-unit-test tanpa render apapun, dan supaya kalau nanti ada backend (Section 19 PRD), logic kalkulasi yang sama bisa dipindah/dipakai ulang di Node.js tanpa modifikasi.

---

## 4. Component Architecture

```
<Layout>
 ├─ <Navbar>
 │    ├─ <Logo />
 │    ├─ <ThemeSwitcher />
 │    └─ <NavLinks />
 ├─ <Sidebar />                      (opsional, quick-switch template di desktop)
 ├─ <PageContent>
 │    └─ (routed page)
 └─ <Footer />

<InvoiceGeneratorPage>                          route: /app
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
 │    │    │    ├─ <InvoiceItemRow />   (repeated, draggable)
 │    │    │    └─ <AddItemButton />
 │    │    ├─ <TotalsSection />
 │    │    └─ <TemplateSelector />
 │    └─ <InvoicePreview>
 │         └─ <Template{Name} />         (registry-resolved)
 └─ (shared) <Modal />, <Toast />
```

**Kaidah komponen:**
- Komponen di `features/` boleh subscribe ke `invoiceStore`/`uiStore`, boleh punya efek samping (upload file, trigger PDF export).
- Komponen di `components/ui/` **tidak boleh** tahu apa-apa soal `Invoice` — mereka generic (`Button`, `Modal`, dst.), reusable di konteks apapun.
- Komponen di `templates/` **tidak boleh** subscribe langsung ke store — mereka murni presentational, menerima satu prop `invoice: Invoice` dan render dari situ saja. Ini yang bikin komponen template bisa dipakai baik untuk on-screen preview maupun untuk off-screen PDF capture tanpa modifikasi.

---

## 5. State Management Architecture

Tiga store Zustand terpisah, sengaja dipecah supaya subscription granular dan tidak ada re-render yang tidak perlu:

| Store | Isi | Persisted? |
|---|---|---|
| `invoiceStore` | Draft invoice aktif: business, client, items, totals input, templateId, extras | Ya → `localStorage` (key terpisah dari settings) |
| `settingsStore` | Preferensi user: default currency, default language, default tax rate, theme | Ya → `localStorage` (key terpisah dari draft) |
| `uiStore` | State ephemeral: mobile view aktif (form/preview), modal open, toast queue, PDF loading | Tidak |

**Kenapa dipisah dari draft:** supaya "Clear Draft" tidak pernah ikut menghapus preferensi theme/currency user, dan supaya UI state (modal, toast) tidak numpuk di `localStorage` secara sia-sia.

**Action pattern:** `invoiceStore` expose action granular (`updateBusiness`, `addItem`, `removeItem`, `duplicateItem`, `reorderItems`, `setTemplate`, `updateTotalsInput`) — bukan satu `setState` generik. Ini penting untuk dua alasan: (1) komponen bisa subscribe ke slice spesifik saja lewat selector, dan (2) `undoRedoMiddleware` bisa memberi label yang jelas ke tiap entry history ("Tambah item", "Hapus item #3", dst.) karena tahu action apa yang dipanggil.

**Derived values** (subtotal, grand total, remaining balance) **tidak disimpan sebagai state** — mereka selalu dihitung ulang lewat memoized selector dari `items` + `totals` input. Ini menghilangkan seluruh kelas bug "data ke-out-of-sync" yang biasa muncul kalau derived value disimpan terpisah dan lupa di-recalculate.

**Undo/Redo:** middleware yang membungkus `invoiceStore`, menyimpan bounded stack (default 30 snapshot). `undo()`/`redo()` pop/push dari stack ini, dipicu dari tombol UI maupun keyboard shortcut (`Ctrl/Cmd+Z` / `Shift+Z`).

**Persistence:** Zustand `persist` middleware dengan custom `partialize` (exclude field transient), plus `schemaVersion` di root object supaya versi app baru bisa migrate atau safely discard draft lama yang incompatible.

---

## 6. Data Flow

### 6.1 Form → Preview (real-time)

```
User mengetik di field
   ↓
React Hook Form (local field state, uncontrolled)
   ↓  (debounced 150–250ms untuk text, instant untuk toggle/select)
invoiceStore action (mis. updateBusiness)
   ↓
Zustand notifies subscribers (selector-based, hanya slice terkait)
   ↓
<InvoicePreview> re-render dengan <Template{Name} invoice={...} />
```

### 6.2 Form → localStorage (autosave)

```
invoiceStore state berubah
   ↓
persist middleware (debounced write)
   ↓
localStorage.setItem('invoice-draft', JSON.stringify(state))
```

Saat app pertama kali load: `persist` middleware baca `localStorage`, validasi `schemaVersion`, hydrate `invoiceStore` — user merasa draft-nya "masih ada" tanpa loading state yang terasa.

### 6.3 Preview → PDF Export

```
User klik "Download PDF"
   ↓
uiStore.setPdfLoading(true)
   ↓
Render <Template{Name}> off-screen, lebar fixed A4 (~794px @96dpi)
   ↓
Tunggu semua image selesai load + document.fonts.ready
   ↓
html2canvas(node, { scale: 2, useCORS: true, backgroundColor: '#fff' })
   ↓
Slice canvas per halaman A4 (page-break aware, tidak motong baris item)
   ↓
jsPDF: addImage per slice, addPage antar slice
   ↓
pdf.save('Invoice-{invoiceNumber}-{clientName}.pdf')
   ↓
uiStore.setPdfLoading(false)
```

Detail lengkap ada di Section 15 PRD. Poin arsitektur pentingnya: pipeline ini **reuse komponen template yang sama** dengan yang dipakai di on-screen preview — tidak ada template kedua khusus PDF. Ini menjamin preview dan hasil PDF tidak pernah berbeda secara struktural, hanya beda ukuran render target.

---

## 7. Template System Architecture

```
templates/
├── TemplateMinimal.tsx
├── TemplateModern.tsx
├── ... (8 lainnya)
└── registry.ts
```

`registry.ts` memetakan `templateId → { component, meta }`. `TemplateSelector` dan `InvoicePreview` sama-sama resolve template lewat registry ini, tidak pernah import komponen template secara langsung dengan nama hardcoded.

**Kontrak wajib tiap template component:**
- Menerima satu prop: `invoice: Invoice`
- Merender 5 region wajib: header (identitas bisnis + no/tanggal invoice), bill-to (data client), line-items, totals, footer (notes, T&C, extras kalau ada)
- Tidak boleh drop data yang ada di `Invoice` walau boleh beda styling
- Tidak import apapun dari `components/ui/`

**Menambah template baru** = 1 file component baru + 1 entry di `registry.ts`. Tidak menyentuh `InvoiceForm`, `invoiceStore`, atau PDF pipeline sama sekali — ini jadi acceptance test kalau decoupling-nya benar.

---

## 8. Folder Structure (Referensi)

```
src/
├── assets/
├── components/
│   ├── ui/                 # Button, Input, Select, Modal, Toast, dst — generic
│   └── layout/               # Navbar, Sidebar, Footer, Layout
├── features/
│   ├── invoice-form/
│   ├── invoice-preview/
│   ├── template-selector/
│   └── pdf-export/
├── templates/                 # 10 template component + registry.ts
├── hooks/                       # useDebounce, useUndoRedo, useLocalStorage
├── pages/                        # route-level: Home, InvoiceGeneratorPage, Settings, About, NotFound
├── layouts/
├── store/                          # invoiceStore, settingsStore, uiStore, undoRedoMiddleware
├── validators/                      # Zod schemas, 1:1 mirror types/
├── types/                             # invoice.types.ts
├── utils/                               # currency.ts, dateFormat.ts, calculations.ts
├── constants/                             # daftar currency, preset tax, metadata template
├── lib/                                     # wrapper jsPDF, html2canvas config
├── styles/
├── App.tsx
├── main.tsx
└── router.tsx
```

---

## 9. PDF Export — Detail Teknis

**Kenapa html2canvas + jsPDF, bukan browser print-to-PDF?** Print dialog native browser hasilnya tidak konsisten antar OS/print driver, tidak bisa dipicu programmatic ke silent download, dan kontrol pagination/margin-nya terbatas. Untuk dokumen bisnis yang merepresentasikan brand user, kontrol penuh atas hasil akhir lebih penting daripada kesederhanaan implementasi. (Print dialog tetap dipakai, tapi untuk aksi terpisah "Print Invoice" — bukan primary export path.)

**Render target terisolasi:** komponen template di-render ke container tersembunyi/off-screen dengan lebar fixed setara A4 (~794px @96dpi), independen dari state scroll/zoom preview on-screen. Ini menjamin output PDF deterministik terlepas dari ukuran layar user saat klik download.

**Page-break-aware slicing:** kalau tinggi konten melebihi satu halaman A4, canvas di-slice per halaman dengan logic yang mengukur boundary baris item dulu sebelum slicing — supaya tidak ada baris yang kepotong di tengah secara visual janggal.

**Error handling:** hard timeout (±15 detik) memaksa fallback ke error toast kalau capture gagal atau macet, supaya tombol tidak stuck di state "Generating...".

**Bundle size:** `html2canvas` dan `jsPDF` di-code-split lewat dynamic `import()`, hanya di-load saat user benar-benar klik "Download PDF" — initial bundle app tetap ringan.

---

## 10. Cross-Cutting Concerns

| Concern | Pendekatan |
|---|---|
| **Currency-safe math** | Semua operasi uang lewat `utils/currency.ts`, integer-cent arithmetic internal, format display via `Intl.NumberFormat` |
| **Validasi** | Zod schema 1:1 dengan `types/`, dipakai baik di form (via `zodResolver`) maupun (opsional) saat hydrate data dari `localStorage` |
| **Aksesibilitas** | Setiap interaksi pointer-only (drag reorder) punya fallback keyboard-accessible; ARIA live region untuk error validasi |
| **Theming** | Theme app (light/dark) sepenuhnya independen dari accent color template — dua sistem warna yang tidak pernah campur |
| **Offline** | Service worker cache app shell + static assets; app tetap fungsional (edit, export PDF) tanpa koneksi setelah initial load |
| **Testing** | Unit test di layer `utils/` (pure function, gampang di-test), component test di `features/`, visual regression per template, E2E untuk full flow (lihat Section 17 PRD) |

---

## 11. Batasan Arsitektur yang Disengaja (v1)

- Tidak ada network layer — tidak ada `api/`, tidak ada fetch wrapper, tidak ada auth middleware.
- Tidak ada database schema di client — bentuk data cukup dinormalisasi (Section 12 PRD) sehingga siap dipetakan ke schema Prisma/SQL kalau backend ditambah nanti (Section 19 PRD), tapi belum ada implementasi ke arah itu di v1.
- Tidak ada multi-tenant/multi-user state — satu browser = satu draft aktif.

Kalau backend ditambahkan di v2, layer yang paling terdampak adalah **Persistence Layer** (dari `localStorage` ke API + local cache) dan **State Layer** (invoiceStore perlu sync logic). Presentation Layer, Domain Logic Layer, dan Template System dirancang supaya tidak perlu diubah sama sekali.

---

*Referensi detail requirement & rasional produk ada di `invoice-generator-prd.md`. Referensi breakdown kerja ada di `task.md`.*
