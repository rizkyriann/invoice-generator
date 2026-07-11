# Wireframes — Online Invoice Generator

## 1. Sitemap
- Home (Landing Page)
- App (Generator Page - Main Workflow)
  - Settings (Drawer or Modal)
- About (Informational)
- 404 Page

## 2. Global Layout (Desktop)
```
+--------------------------------------------------------------+
| [Logo] Stitch    [About] [Settings]         [Dark/Light] [PDF]| (Navbar)
+--------------------------------------------------------------+
| [Undo] [Redo] | [Save Draft] [Clear Draft] [Duplicate]       | (Toolbar)
+-----------------------+--------------------------------------+
|                       |                                      |
|      INVOICE FORM     |           INVOICE PREVIEW            |
|   (Scrollable Area)   |           (Sticky/Fixed)             |
|                       |                                      |
| [Business Section]    |       +----------------------+       |
| [Client Section]      |       |                      |       |
| [Line Items Table]    |       |   RENDERED TEMPLATE  |       |
| [Totals Calculation]  |       |        (A4 Area)     |       |
| [Template Selector]   |       |                      |       |
|                       |       +----------------------+       |
|                       |                                      |
+-----------------------+--------------------------------------+
```

## 3. User Flow: Generate Invoice
1. **Landing**: User lands on `/`, clicks "Create Free Invoice".
2. **Form Entry**: App loads blank or last draft. User fills Business/Client details.
3. **Line Items**: User adds items, duplicates if needed, reorders.
4. **Visuals**: User uploads logo, selects "Modern" template.
5. **Review**: User checks split-screen preview for accuracy.
6. **Export**: User clicks "Download PDF". Spinner shows -> File downloads.

## 4. Main Page: Generator (/app)
```
+--------------------------------------------------------------+
| STITCH | About  Settings                       [Mode] [PDF]  |
+--------------------------------------------------------------+
| [Undo][Redo]  [Save] [Clear] [Duplicate]                     |
+--------------------------------------------------------------+
| FORM (Left)                   | PREVIEW (Right)              |
|                               |                              |
| [ Business Info ]             |  +------------------------+  |
| [Name] [Logo Dropzone]        |  | Business Name  INV-001 |  |
| [Email] [Address]             |  |                        |  |
|                               |  | Bill To:      Total:   |  |
| [ Client Info ]               |  | Client Name   $500.00  |  |
| [Name] [Company]              |  |                        |  |
|                               |  | Item        Qty   Price|  |
| [ Items Table ]               |  | Service A   2     $250 |  |
| :: [Desc] [Qty] [Price] [x]   |  |                        |  |
| :: [Desc] [Qty] [Price] [x]   |  | Notes:                 |  |
| [+ Add Item]                  |  +------------------------+  |
|                               |                              |
| [ Totals ]                    | [ Template Selector ]        |
| Subtotal: $500.00             | [M][M][C][E][C][B][D][S][A][C]|
| Grand Total: $500.00          | (Grid of 10 Thumbnails)      |
+-------------------------------+------------------------------+
```

## 5. Mobile Layout (Stacked)
```
+---------------------------+
| [Logo]           [Menu]   |
+---------------------------+
| [Undo] [Redo] [PDF Icon]  |
+---------------------------+
| [ TAB: FORM ] [ TAB: PREV]|
+---------------------------+
|                           |
|      BUSINESS INFO        |
| [ Name ]                  |
| [ Logo Upload ]           |
|                           |
|      CLIENT INFO          |
| [ Name ]                  |
|                           |
|      LINE ITEMS           |
| +-----------------------+ |
| | Item Title            | |
| | $250.00 x 2     [Del] | |
| +-----------------------+ |
| [ + Add Item ]            |
|                           |
+---------------------------+
| [ FLOAT: PDF DOWNLOAD ]   |
+---------------------------+
```

## 6. Form: Line Items Detail
```
+--------------------------------------------------------------+
| DESCRIPTION            | QTY | PRICE  | DISC | TAX | TOTAL   |
+--------------------------------------------------------------+
| :: Web Development     | 1.0 | 1500   | 0%   | 10% | 1650.00 |
| :: [Delete] [Duplicate]                                      |
+--------------------------------------------------------------+
| :: UI Design           | 5.0 | 100    | 5%   | 10% | 522.50  |
+--------------------------------------------------------------+
| [+ Add New Line Item]                                        |
+--------------------------------------------------------------+
```

## 7. Dashboard / Overview (Future v2)
```
+--------------------------------------------------------------+
| TOTAL REVENUE | OUTSTANDING | PAID | OVERDUE |   [New Inv]   |
|   $45,000     |    $2,500   | $40k |  $2,500 |               |
+--------------------------------------------------------------+
| RECENT INVOICES                               [Filter][Search]|
| ------------------------------------------------------------ |
| #INV-001 | Client A | $1,200 | July 10 | Paid     | [...]    |
| #INV-002 | Client B | $2,500 | July 15 | Pending  | [...]    |
| ------------------------------------------------------------ |
```

## 8. State Transitions
- **Empty State**: Generator shows blank fields + 1 default empty item row.
- **Loading State**: Skeleton cards for preview area during template switch (if slow) or PDF generation button spinner.
- **Error State**: 404 page with "Return to Home" button. Validation errors highlight inputs in red.

## 9. Interaction Notes
- **Primary CTA**: "Download PDF" (Desktop top-right, Mobile floating).
- **Reordering**: Pointer events for drag; Button fallback in item row menu.
- **Autosave**: Indicator (tick icon) appears briefly next to "Save Draft" on change.
- **Template Swap**: Instant UI update of the A4 preview pane.
