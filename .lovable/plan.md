# Multiwings Ops ERP — Build Plan

This is a large, multi-module buildout on top of the existing HAWB form + customer tracking page. I'll keep both untouched and layer everything else around them. Below is the full scope broken into phases so we can review before I start shipping migrations and screens.

---

## Phase 1 — Database foundation (one migration)

New tables in `public` (all with RLS: authenticated staff full access, anon read only where customer tracking needs it):

- `jobs` — job_no (auto MW/YY-YY/00001), date, status, invoice_status, linked shipper/consignee/airline, notes
- `mawbs` — mawb_no, airline, flight_no, origin, destination, dep_date, total_pieces, total_weight
- `shipments` — **extended** with `job_id`, `mawb_id`, `is_dgr`, plus DGR fields (un_number, shipping_name, class_division, packing_group, net_qty, gross_qty, packing_instructions)
- `shipment_status_events` — shipment_id, status, event_at, location, remarks (anon SELECT for tracking)
- `invoices` — invoice_no (auto MW/INV/YY-YY/00001), job_id, party, bill_to address + gstin, date, totals, gst_mode (cgst_sgst/igst), paid status, paid_at
- `invoice_lines` — invoice_id, description, sac_hsn, qty, rate, amount
- `expenses` — job_id, description, vendor, amount, date
- `awb_stock` — airline_id, prefix, serial_from, serial_to, plus per-number status table `awb_stock_numbers` (number, status: unused/used/void, shipment_id)
- `rate_cards` — airline_id, per_kg_rate, min_charge, fuel_pct, security_per_kg, agent_id (nullable for agent-specific)
- `shippers`, `consignees`, `airlines` (with iata_code, awb_prefix), `agents` — party masters with GSTIN where relevant
- `courier_consignments` — consignment_no (auto), sender/receiver blocks, contents, weight, declared_value, mode, instructions

Sequences + `BEFORE INSERT` triggers generate `job_no`, `invoice_no`, `consignment_no`. `updated_at` trigger on all mutable tables. Standard GRANTs to authenticated + service_role; anon SELECT only on `shipments` (already), `shipment_status_events`.

---

## Phase 2 — Masters & Rates

Routes under `_authenticated/`:
- `/masters/shippers`, `/masters/consignees`, `/masters/airlines`, `/masters/agents` — CRUD tables w/ search
- `/masters/rates` — rate card editor
- `/masters/awb-stock` — add block, mark used/void, unused report

A shared `<PartyPicker>` combobox (searches masters, "+ New" inline) used by HAWB, invoice, courier forms. Volumetric weight helper in `src/lib/cargo.ts`.

---

## Phase 3 — Job module

- `/dashboard` becomes the new **Dashboard Overview** (KPIs, charts via recharts, recent 10 jobs)
- `/jobs` — searchable/filterable jobs table (date range, status, invoice status)
- `/jobs/$id` — Job Detail with tabs: Overview, HAWB, MAWB, Invoice, Expenses, Status Timeline, Documents (Pre-Alert / DGR / HAWB / Invoice PDFs)
- HAWB form (existing) extended: now requires a Job (auto-creates one if none selected) and writes `job_id`. DGR checkbox reveals DGR fieldset.

Old `/dashboard` shipments table moves to `/shipments` (kept for ops who want flat view).

---

## Phase 4 — MAWB + Pre-Alert + DGR

- `/mawbs` list, `/mawbs/new`, `/mawbs/$id` — attach HAWBs (multi-select from unassigned shipments)
- **Manifest PDF** (MAWB header + HAWB table) via `@react-pdf/renderer`
- **Pre-Alert PDF** generated from Job Detail (one button)
- **DGR Declaration PDF** in IATA layout when `is_dgr=true`

All PDFs share a `<DocShell>` component with Multiwings blue/white header, logo, footer.

---

## Phase 5 — Invoicing

- `/invoices` register (filter: date, party, paid)
- `/invoices/new?job=…` and `/invoices/$id`
- Auto-pulled defaults: party from job, line items seeded from rate card (Freight, Fuel Surcharge, Security, Handling, Documentation)
- GST logic: if bill-to state = MH (Multiwings home state) → CGST 9 + SGST 9, else IGST 18. Toggle override allowed.
- "Amount in words" via `number-to-words` (Indian style)
- Invoice PDF (professional GST format with bank details)
- Mark Paid action
- Unbilled Jobs report = jobs where no invoice exists

---

## Phase 6 — Courier + Status Timeline

- `/courier` list, `/courier/new`, `/courier/$id` — separate from air freight
- Label-style printable PDF
- Status Timeline component on Job Detail: add event (status, datetime, location, remarks). Anon-readable so `/track/$awb` shows the same timeline visually (vertical stepper).

---

## Phase 7 — Reports

`/reports` hub with sub-pages, each filterable + "Export PDF" + "Export Excel" (`xlsx` lib):
- AWB Register
- Airline-wise Sales
- Agent-wise Sales
- Job Profitability (revenue − expenses)
- Outstanding Invoices (aging buckets 0-30/31-60/61-90/90+)
- GSTR-1 Summary (grouped by GST rate + HSN/SAC)
- Unbilled AWB

---

## Phase 8 — Navigation & polish

Header nav restructured into groups: Dashboard · Jobs · Shipments · MAWB · Courier · Invoices · Masters ▾ · Reports. Mobile: collapsible drawer. Multiwings blue (`--primary`) kept throughout.

---

## Technical notes (for the technical reader)

- **PDFs**: `@react-pdf/renderer` (client-side render → download). Avoids server-side native deps in the Worker runtime.
- **Excel**: `xlsx` (SheetJS) for report export.
- **Charts**: `recharts` (likely already pulled in by shadcn deps; will add if not).
- **Forms**: react-hook-form + zod for new modules. Existing HAWB form stays as-is and gets two new field groups (Job link, DGR) appended.
- **Number generation**: Postgres sequences keyed by fiscal year (Apr–Mar). A `get_or_create_fy_sequence(prefix, fy)` plpgsql function returns the next value; triggers call it on insert.
- **Job auto-creation**: HAWB submit → if no `job_id`, insert a job in same transaction (via a serverFn) and link it.
- **Anon tracking**: `shipment_status_events` policy `SELECT TO anon USING (true)` so `/track/$awb` still works without auth.
- **No edge functions**; everything is `createServerFn` + RLS.

---

## Scope confirmation

This is roughly **12–15 new routes, 13 new tables, 5 PDF templates, 7 reports**. I'll ship it phase-by-phase starting with the migration (Phase 1) so you can approve schema first, then I'll proceed through Phases 2–8 in subsequent turns.

**Two things I want to confirm before I start:**

1. **Home state for GST split** — Multiwings billing state is **Maharashtra**? (Used to decide CGST+SGST vs IGST.) I'll default to MH; you can change it in a constants file.
2. **Order of execution** — OK to ship in 8 phases across multiple turns (each phase = 1 migration where needed + screens), or do you want everything in a single mega-batch?

Reply "go" and I'll start with the Phase 1 migration.
