# Roadmap — Online Invoice Generator

> Diturunkan dari `invoice-generator-prd.md` (Section 3, 19, 20, 21) dan `task.md`. Dokumen ini menjawab pertanyaan "apa yang dikerjakan kapan, dan kenapa urutannya begitu" — dari MVP sampai ke visi jangka panjang produk.

---

## Cara Membaca Dokumen Ini

Roadmap ini punya 3 horizon:

- **Horizon 0 — MVP (client-side only):** versi tercepat yang bisa dipakai user nyata, scope sengaja dipangkas.
- **Horizon 1 — v1.0 Full (client-side only):** semua requirement di PRD, masih 100% tanpa backend.
- **Horizon 2+ — v2 dan seterusnya (backend-enabled):** hanya dikerjakan setelah v1 punya traksi nyata, bukan dikerjakan paralel.

Prinsip pengurutan: **tidak ada fitur backend yang dikerjakan sebelum v1 client-side selesai dan terbukti dipakai orang.** Ini konsisten dengan Non-Goals di Section 3.3 PRD — menambah backend lebih awal akan merusak proposisi "no signup, no server" yang jadi pembeda produk ini.

---

## Horizon 0 — MVP (Target: ~8–9 minggu)

Tujuan MVP: validasi bahwa orang mau pakai tool ini sampai ke titik download PDF, dengan effort paling minim yang tetap terasa "profesional", bukan "prototype".

**Scope MVP** (versi dipangkas dari Section 21 PRD):

- [ ] Form lengkap (business, client, invoice details, items, totals) — tidak dipangkas, karena ini inti value produk
- [ ] 3 template saja: Minimal, Modern, Corporate
- [ ] PDF export (single & multi-page)
- [ ] Draft autosave ke `localStorage`
- [ ] Responsive dasar (desktop + mobile, tablet best-effort)
- [ ] Light mode saja (dark mode ditunda)

**Sengaja ditunda dari MVP:**
- 7 template sisanya
- Undo/redo
- Watermark, stamp, signature, QR code payment
- Keyboard shortcuts
- Offline/service worker
- Dark mode

**Exit criteria Horizon 0:** user baru bisa isi form → pilih 1 dari 3 template → download PDF yang terlihat profesional, dalam satu sesi, tanpa bug blocking. Kalau ini belum mulus, jangan lanjut nambah template/fitur — perbaiki dulu jalur intinya.

---

## Horizon 1 — v1.0 Full (Target: +9–10 minggu setelah MVP, total ~18 minggu dari awal)

Setelah MVP tervalidasi, lanjut ke scope penuh PRD. Urutan mengikuti milestone `task.md` (M5–M10):

| Fase | Isi | Alasan urutan |
|---|---|---|
| **1.1 — Template lengkap** | 7 template sisanya (Elegant, Creative, Blue Business, Dark Professional, Startup, Agency, Classic) | Template baru = risiko rendah, bisa dikerjakan paralel tanpa ganggu fitur lain, langsung menambah nilai bagi user (pilihan visual lebih banyak) |
| **1.2 — Extras** | Logo/signature/stamp upload, watermark, QR code, multi-currency, keyboard shortcuts, undo/redo | Fitur "premium-feel" yang membedakan dari tool invoice generic — dikerjakan setelah jalur inti stabil supaya tidak menambah kompleksitas ke fondasi yang belum matang |
| **1.3 — Responsive & Theming penuh** | Layout tablet matang, dark mode, accessibility pass (AA) | Diprioritaskan sebelum launch karena sebagian besar traffic organik untuk tool semacam ini datang dari mobile |
| **1.4 — Polish & QA** | Unit/component/E2E test, visual regression 10 template, cross-browser QA, performance pass, offline service worker | Gate wajib sebelum launch — PDF fidelity dan performa adalah dua area risiko tertinggi (lihat Risks, Section 18 PRD) |
| **1.5 — Launch** | Landing page, About, Settings page, deployment pipeline, analytics privacy-conscious | Rilis publik |

**Exit criteria Horizon 1:** semua item di Section 5 PRD terpenuhi, seluruh checklist `task.md` M1–M10 selesai, dan checklist QA (Section 17 PRD) hijau di 4 browser utama.

---

## Horizon 2 — Post-Launch, Masih Client-Side (Evaluasi setelah v1 live ±4–6 minggu)

Sebelum mempertimbangkan backend sama sekali, ada ruang perbaikan yang **masih tidak butuh server**, berdasarkan feedback nyata dari Horizon 1:

- Tambahan template berdasarkan permintaan (template ke-11, ke-12, dst. — arsitektur sudah mendukung ini tanpa ubah core, lihat Section 7 `architecture.md`)
- Manual JSON export/import sebagai backup draft (mitigasi risiko kehilangan data `localStorage`, lihat Risks Section 18 PRD)
- Perluasan bahasa invoice (di luar EN/ID) — masih murni client-side, tinggal tambah dictionary label
- Optimasi performa PDF export lebih lanjut kalau ada laporan lambat di device low-end

Horizon ini tidak punya "akhir" yang tegas — jalan terus selama traksi organik masih tumbuh dan belum ada sinyal kuat bahwa user butuh sesuatu yang secara fundamental butuh backend (misal: riwayat invoice lintas device).

**Sinyal untuk lanjut ke Horizon 3 (backend):** kalau feedback dominan berbunyi "saya butuh buka invoice lama saya dari HP lain" atau "saya butuh kirim invoice langsung ke email client" — itu tanda kebutuhan sudah keluar dari batas yang bisa dipenuhi tool client-only.

---

## Horizon 3 — v2, Backend-Enabled (Baru dimulai kalau Horizon 2 menunjukkan demand jelas)

Berdasarkan Future Improvements (Section 19 PRD), dikelompokkan jadi 3 gelombang rilis supaya tidak jadi "big bang backend project":

### Gelombang 2A — Identity & Persistence (fondasi backend)
- Authentication (opsional, bukan wajib — tetap ada mode "pakai tanpa akun" untuk jaga proposisi asli)
- Cloud storage untuk sync draft/invoice terkirim lintas device
- Invoice history (list, cari, filter)

> Ini gelombang paling berisiko secara arsitektur karena baru pertama kali app ini punya server — prioritas utamanya *tidak merusak* pengalaman client-only yang sudah ada, bukan menambah fitur baru sebanyak mungkin.

### Gelombang 2B — Relationship & Operasional
- Customer management (direktori client tersimpan)
- Email invoice langsung dari app
- Recurring invoice (billing berulang otomatis)
- Analytics dashboard (revenue over time, outstanding balance, top client)

### Gelombang 2C — Uang & Skala
- Online payments (payment link, terhubung ke QR section yang sudah ada di v1)
- Tax reports
- Multi-user workspace (akses tim/agency)
- API integration publik
- Template marketplace

**Catatan arsitektur:** karena `Invoice`, `Business`, `Client`, `InvoiceItem` (Section 12 PRD) sudah dinormalisasi sejak v1, Gelombang 2A tidak perlu redesign data model — cukup dipetakan langsung ke schema database (mis. Prisma). Ini yang membuat v2 "additive", bukan rewrite (lihat Section 11 `architecture.md`).

---

## Horizon 4 — Visi Jangka Panjang (arah, bukan komitmen)

Tidak dijadwalkan, tapi jadi arah kalau produk terus tumbuh:

- Template marketplace komunitas/premium sebagai model monetisasi utama (selaras dengan Business Goals Section 3.1 PRD: monetisasi lewat template & branding, bukan lewat mengunci fitur inti)
- Ekspansi ke dokumen bisnis lain di luar invoice (kuitansi, quotation/penawaran, purchase order) — dengan reuse arsitektur template + PDF pipeline yang sama
- Full i18n untuk pasar di luar Indonesia

---

## Ringkasan Visual Timeline

```
Minggu 1–9        MVP (3 template, form lengkap, PDF export, autosave)
                   └─ exit criteria: user bisa selesai 1 invoice utuh

Minggu 10–18       v1.0 Full (7 template lagi, extras, responsive/theme, QA, launch)
                   └─ exit criteria: semua requirement PRD terpenuhi

Pasca-launch        Horizon 2: perbaikan client-side berbasis feedback
(berkelanjutan)      └─ berhenti kalau demand backend jelas muncul

Kondisional            Horizon 3 (v2): backend, 3 gelombang rilis
                        └─ hanya jalan kalau Horizon 2 kasih sinyal kuat

Jangka panjang           Horizon 4: marketplace, ekspansi dokumen, i18n penuh
```

---

## Prinsip Keputusan "Kapan Pindah Horizon"

- **MVP → v1 Full:** pindah begitu exit criteria MVP terpenuhi, bukan berdasarkan tanggal kalender semata.
- **v1 Full → Horizon 2:** pindah otomatis begitu v1 live — ini bukan keputusan besar, sekadar mode "maintenance + perbaikan kecil berbasis feedback".
- **Horizon 2 → Horizon 3 (backend):** ini satu-satunya keputusan besar di roadmap ini, dan sengaja dibuat butuh bukti (bukan asumsi) sebelum dieksekusi — karena begitu backend masuk, biaya operasional, kompleksitas, dan janji privasi produk berubah permanen.

---

*Referensi requirement produk: `invoice-generator-prd.md`. Referensi breakdown kerja teknis: `task.md`. Referensi struktur sistem: `architecture.md`.*
