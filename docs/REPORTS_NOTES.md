# Reports: Filters, PDF Export, and Compliance Packs

This note summarizes the latest additions to Tax Reports.

## What's new

- PDF export across Tax Overview, VAT/Corporate/Withholding, and Custom Tax Reports
- Advanced filters on reports APIs and UI:
  - customerId, vendorId, currency, warehouseId
- Compliance formatting hook (server-side) for jurisdiction-specific summaries:
  - `jurisdiction=sa` (Saudi VAT)
  - `jurisdiction=eu` (Generic EU VAT)

## How to use

- From the report header, optionally set:
  - Customer ID (filters sales invoices)
  - Vendor ID (filters bills / purchases)
  - Currency (filters both sides)
- Exports:
  - “Export” → Excel (XLSX)
  - “Export PDF” → generates a formatted PDF with title/subtitle and table
- Compliance format (optional): pass `jurisdiction` query param to the report API:
  - Example: `/api/reports/tax?startDate=2025-01-01&endDate=2025-03-31&jurisdiction=sa`

## Line-level tax id

We now support per-line `tax_id`:

- Schema updated: added `tax_id` on `document_lines`
- Runtime upgrade: on server startup, if the column is missing it will be added and backfilled from `items.default_tax_id`
- Reports prefer `document_lines.tax_id` when present (falls back to `items.default_tax_id`)

## Warehouse filter

Implemented via `stock_movements` joins for invoice/bill line items:

- API: pass `warehouseId` in query to `/api/reports/tax` and `/api/reports/taxes/:taxId`
- UI: dropdown added on report pages to pick a warehouse
- Behavior: only line items that have movements in the selected warehouse are included; service-only lines without stock movements are excluded when filtering by a warehouse

## Quick API examples

All endpoints require Firebase Bearer token in the Authorization header.

- Tax overview with date range and SA compliance
  - GET `/api/reports/tax?startDate=2025-01-01&endDate=2025-03-31&jurisdiction=sa`

- Per-tax report filtered by warehouse and currency
  - GET `/api/reports/taxes/<taxId>?warehouseId=wh_1&currency=SAR`

- Warehouses listing for current company
  - GET `/api/warehouses`

## UI usage tips

- Use the Customer/Vendor dropdowns to narrow sales or purchase lines.
- Choose a Warehouse to include only items moved in that warehouse (services are excluded).
- Set Jurisdiction to add a compliance summary block (SA or EU) to the results and PDF export.
