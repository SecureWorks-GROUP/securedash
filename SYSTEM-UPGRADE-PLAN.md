# SecureWorks System Upgrade Plan

**Version:** 1.0 — 9 March 2026
**Authors:** Marnin Stobbe + [Friend's name]
**Status:** Draft — ready for review and editing
**Context:** This plan synthesises two rounds of deep research (23 sources across JobTread, Fergus, ServiceTitan, CompanyCam, Paidnice, GHL MCP, and construction AI trends) into a buildable architecture for the existing GHL → Supabase → Xero custom stack.

---

## How This System Compounds

This isn't a feature list — it's three interlocking flywheels where each layer creates the data the next layer needs. Build out of order and you waste time. Build in sequence and each phase pays for itself.

```
FLYWHEEL 1: COST & MARGIN
Fix Data → PO Workflow → Per-Job P&L → Predictive Estimating

FLYWHEEL 2: CASH FLOW
Photo AI → Auto-Complete → Same-Day Invoice → AR Automation

FLYWHEEL 3: REVENUE
Clean Addresses → Cross-Sell Triggers → Neighbourhood Marketing → Voice Agent
```

---

## Current System (What Exists)

### Stack
- **Frontend:** Vanilla HTML/JS dashboards — CEO (`dashboard/index.html`), Ops (`dashboard/ops.html`), Trade (`dashboard/trade.html`)
- **Backend:** Supabase Edge Functions (Deno/TypeScript) — 9 functions
- **Database:** Supabase Postgres (15 migrations, RLS enabled)
- **CRM:** GoHighLevel — sales + execution pipelines, contacts, opportunities
- **Accounting:** Xero — invoices, P&L, projects, contacts, POs
- **Scoping Tools:** Patio + Fencing tools on GitHub Pages
- **AI:** ops-ai edge function (Claude claude-sonnet-4-6 with tool_use, CEO + Ops views)

### What Works
- Job number generation (SWP/SWF/SWD-25XXX)
- GHL ↔ Supabase sync (sales + execution pipelines)
- Xero contact matching (65% match rate, was 22%)
- Invoice sync with auto-reference matching (316 linked)
- Xero Projects matched (108/171 — real per-job P&L data)
- P&L reports by business unit
- Google Ads ingest and marketing metrics
- CEO/Ops/Trade dashboards all functional
- Trade app: PWA, receipts, GPS check-in, signatures, service reports

### Critical Data Gaps (MUST FIX FIRST)
| Gap | Current State | Impact |
|-----|--------------|--------|
| `site_address` | NULL on 100% of jobs | Nav buttons, suburb labels, neighbourhood marketing — all broken |
| `scope_json` | Empty on all jobs | Can't auto-generate POs, can't do itemised invoicing |
| `pricing_json` | Totals only (no line items) | Xero invoices are single-line, can't track cost categories |
| `INITIAL_SESSION` bug | `cloud.js` only handles `SIGNED_IN` | Login unreliable on all dashboards |
| Channel attribution | Mostly "Unknown" | Can't track marketing ROI per channel |

### Architecture Debt
| Issue | Risk | Fix |
|-------|------|-----|
| `ops-api` at 2,100 lines | Single point of failure, hard to maintain | Break into modular functions |
| No audit trail | Can't track who changed what | Database triggers for change logging |
| RLS blocks all client queries | Everything routes through edge functions | By design, but adds latency |

---

## Phase 1: Plug the Bleed (Weeks 1-4)

**Goal:** Fix broken data, start collecting cash, enforce same-day invoicing.
**ROI:** Immediate cash flow improvement + data foundation for everything else.

### Week 1: Data Integrity + AR Automation

#### 1.1 Fix INITIAL_SESSION Bug [FIX]
**File:** `tools/shared/cloud.js`
**Change:** `onAuthStateChange` callback must handle `INITIAL_SESSION` event, not just `SIGNED_IN`.
```
// Current (broken):
onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') { ... }
})

// Fixed:
onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') { ... }
})
```
**Test:** Open each dashboard in incognito → magic link login → confirm session persists on refresh.

#### 1.2 Fix site_address Sync [FIX]
**Where:** GHL webhook handler (`supabase/functions/ghl-webhook/`) and/or `ghl-proxy` sync logic.
**Change:** When creating/updating jobs from GHL opportunity data, map address fields:
```sql
-- Jobs table already has site_address column
UPDATE jobs SET
  site_address = ghl_opportunity.contact.address,
  site_suburb = ghl_opportunity.contact.city
WHERE ghl_opportunity_id = $1;
```
**Backfill:** Write a one-off edge function that iterates all jobs with NULL site_address, fetches the GHL contact via API, and writes the address. Use pagination (1000-row limit).

#### 1.3 Connect Paidnice [BUY — $39/mo]
**What:** Paidnice plugs directly into Xero. No custom code needed.
**Setup:**
1. Sign up at paidnice.com → connect Xero account
2. Configure escalation sequence:
   - 3 days before due: friendly email reminder
   - Due date: email + SMS with payment link
   - 3 days overdue: firmer email + SMS
   - 7 days overdue: statement + late fee warning
   - 14 days overdue: auto-apply late fee ($50 or 2%)
   - 21 days overdue: final notice before collections
3. Enable customer portal (branded, one-click payment)
4. Set up Stripe or Pinch Payments for card processing

**Expected results:** DSO from 28 → ~17 days. 90+ AR from $19K → <$10K within 2 months. Users report recovering $90K in unpaid invoices within 2 months.

### Week 2: Scope & Pricing Line Items

#### 2.1 Fix scope_json Population [FIX]
**Where:** Scoping tools (`~/Projects/patio-tool/index.html`, `decking.html`, fence-designer)
**Change:** When scope is saved via `cloud.js` → `ghl-proxy` → `save_scope` action, ensure `scope_json` includes full line items:
```json
{
  "items": [
    {
      "category": "roofing",
      "description": "SolarSpan 75mm Surfmist",
      "quantity": 24,
      "unit": "m²",
      "unit_cost": 180,
      "total": 4320,
      "supplier": "Bondor"
    },
    {
      "category": "steel",
      "description": "100x100 SHS posts x 2.7m",
      "quantity": 6,
      "unit": "ea",
      "unit_cost": 95,
      "total": 570,
      "supplier": "CMI"
    }
  ],
  "totals": {
    "materials": 12400,
    "labour": 4800,
    "margin": 3200,
    "total_ex_gst": 20400,
    "total_inc_gst": 22440
  }
}
```

#### 2.2 Fix pricing_json Line Items [FIX]
**Where:** Same scoping tools, `save_scope` / `link` action in `ghl-proxy`.
**Change:** `pricing_json` must mirror the line items, not just totals. This enables itemised Xero invoices later.

#### 2.3 Auto-Create Xero Project on Job Win [BUILD]
**Where:** `ghl-proxy` → `link` action (runs when scope is completed).
**New step in the `link` flow:**
1. ✅ Move GHL stage
2. ✅ Add GHL note
3. ✅ Generate job number (next_job_number())
4. ✅ Create Xero contact
5. ✅ Push $ to GHL
6. **NEW:** `POST /api.xro/2.0/projects` → create Xero Project with job number as name
7. **NEW:** Store `xero_project_id` on the jobs table

```sql
ALTER TABLE jobs ADD COLUMN xero_project_id TEXT;
```

### Week 3: Stage Duration Tracking

#### 3.1 Create job_stage_history Table [BUILD]
```sql
CREATE TABLE job_stage_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) NOT NULL,
  stage_name TEXT NOT NULL,
  entered_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  exited_at TIMESTAMPTZ,
  duration_hours NUMERIC GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (COALESCE(exited_at, now()) - entered_at)) / 3600
  ) STORED,
  org_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'
);

CREATE INDEX idx_stage_history_job ON job_stage_history(job_id);
CREATE INDEX idx_stage_history_stage ON job_stage_history(stage_name);
```

#### 3.2 Log Stage Changes [BUILD]
**Where:** `ghl-proxy` sync logic — wherever job status is updated.
**Logic:** On every status change:
1. Close previous stage: `UPDATE job_stage_history SET exited_at = now() WHERE job_id = $1 AND exited_at IS NULL`
2. Open new stage: `INSERT INTO job_stage_history (job_id, stage_name) VALUES ($1, $2)`

#### 3.3 Stage Duration Targets [BUILD]
```sql
INSERT INTO org_config (org_id, key, value) VALUES
('00000000-0000-0000-0000-000000000001', 'stage_targets', '{
  "quoted_to_accepted": 7,
  "accepted_to_materials_ordered": 2,
  "materials_ordered_to_received": 5,
  "scheduled_to_installed": 14,
  "completed_to_invoiced": 0.5,
  "invoiced_to_paid": 14
}');
```

#### 3.4 Dashboard: Bottleneck Alerts [BUILD]
**Where:** Ops dashboard (`dashboard/ops.html`)
**Display:** Red-flag jobs exceeding target days per stage. Show as attention items in the Daily Huddle view.

### Week 4: Same-Day Invoicing Engine

#### 4.1 Auto-Invoice on Completion [BUILD]
**Trigger:** When job status changes to `complete` in GHL → webhook → edge function.
**New edge function action** in `ops-api` (or new dedicated function):

```
action: 'complete_and_invoice'
1. Mark job complete in Supabase
2. Close stage duration entry
3. Read pricing_json line items
4. POST /api.xro/2.0/Invoices → create itemised ACCREC invoice
   - Tag with xero_project_id (from Week 2)
   - Set DueDate = today + 14 days
   - Include payment link (Paidnice portal URL)
5. Update jobs.status = 'invoiced'
6. Send SMS to customer via GHL API: "Your project is complete! Invoice sent to your email."
```

**Note:** `ops-api` already has a `complete_and_invoice` action stub — flesh it out with real Xero API calls using the itemised pricing_json.

---

## Phase 2: Cost Control (Weeks 5-8)

**Goal:** Stop margin leakage through automated purchasing and live cost tracking.
**ROI:** $50K-$100K/year in material savings + $275K/year in margin leak prevention.

### Week 5: Material BOM & PO Auto-Generation

#### 5.1 Extend Suppliers Table [BUILD]
The `suppliers` table already exists (synced from Xero). Add mapping fields:
```sql
ALTER TABLE suppliers ADD COLUMN material_categories TEXT[];
-- e.g. ['roofing', 'insulation'] for Bondor, ['steel', 'fabrication'] for CMI
```

#### 5.2 Auto-Generate POs from scope_json [BUILD]
**New action in ops-api:** `scope_to_po`
**Logic:**
1. Read `scope_json.items` for the job
2. Group items by `supplier`
3. For each supplier group:
   - Create `purchase_orders` row in Supabase (PO number from `po_number_seq`)
   - POST to Xero API: `POST /api.xro/2.0/PurchaseOrders`
   - Tag with `xero_project_id`
   - Link PO back to job
4. Update job with `materials_status = 'ordered'`

**Note:** `ops-api` already has a `scope_to_po` action stub.

#### 5.3 PO Approval Threshold [BUILD]
```sql
INSERT INTO org_config (org_id, key, value) VALUES
('00000000-0000-0000-0000-000000000001', 'po_approval_threshold', '5000');
```
POs over $5,000 require CEO approval (flag in dashboard, don't auto-send to Xero).

### Week 6: Materials Readiness Gate

#### 6.1 Materials Status on Jobs [BUILD]
```sql
ALTER TABLE jobs ADD COLUMN materials_status TEXT DEFAULT 'not_ordered'
  CHECK (materials_status IN ('not_ordered', 'ordered', 'partial', 'received', 'n/a'));
```

#### 6.2 Two-Way PO Sync [BUILD]
**Where:** `xero-sync` → `sync_purchase_orders` action (already runs every 30 min).
**Enhancement:** When a PO status changes in Xero to "BILLED" or a custom "RECEIVED" status:
1. Update `purchase_orders.status` in Supabase
2. Check if ALL POs for the job are received
3. If yes → `UPDATE jobs SET materials_status = 'received'`
4. If partial → `UPDATE jobs SET materials_status = 'partial'`

#### 6.3 Scheduling Gate [BUILD]
**Where:** `ops-api` → scheduling logic.
**Rule:** When creating a `job_assignment` (scheduling a job), check:
```
IF job.materials_status NOT IN ('received', 'n/a')
  THEN return error: "Cannot schedule — materials not yet received"
```
**UI:** Ops dashboard shows warning icon on jobs where materials aren't ready. Allow manual override with confirmation ("Schedule anyway — materials not confirmed").

### Week 7: Per-Job P&L Dashboard

#### 7.1 Enhanced Xero Projects Sync [BUILD]
**Where:** `xero-sync` → `sync_projects` (already runs daily at 4am UTC).
**Enhancement:** Pull detailed project financials:
```
GET /api.xro/2.0/projects/{projectId}
→ totalInvoiced, totalExpense, estimate, status
```
Store in `xero_projects` table with breakdown fields.

#### 7.2 Per-Job Profitability View [BUILD]
**Where:** CEO dashboard (`dashboard/index.html`)
**New section or tab:** Job Profitability

| Column | Source |
|--------|--------|
| Job # | jobs.job_number |
| Client | jobs.client_name |
| Quoted | pricing_json.totals.total_ex_gst |
| Material POs | SUM(purchase_orders.amount) for job |
| Xero Expenses | xero_projects.totalExpense |
| Invoiced | xero_projects.totalInvoiced |
| Projected Margin | (Quoted - Expenses) / Quoted × 100 |
| Status | 🟢 on track / 🟡 watch / 🔴 over budget |

**Variance alert:** If (Expenses / Quoted) > 0.85 → flag as 🔴 on CEO dashboard.

#### 7.3 Reporting API Enhancement [BUILD]
**Where:** `reporting-api` → new action `job_profitability_detail`
**Returns:** Array of jobs with quoted, PO totals, Xero project financials, calculated margins.

### Week 8: Daily Huddle + Weekly Scorecard

#### 8.1 Daily Huddle — Default Ops View [BUILD]
**Where:** `dashboard/ops.html` — make this the default tab/view Shaun sees.

**Layout:**
```
┌─────────────────────────────────────────────┐
│ TODAY: [date]                               │
├─────────────────┬───────────────────────────┤
│ YESTERDAY        │ TODAY                     │
│ 3 jobs completed │ 4 jobs scheduled          │
│ $24,500 invoiced │ Crew A: Smith patio       │
│ 2 payments recv  │ Crew B: Jones fence       │
│                  │ Crew C: Park deck         │
│                  │ Unassigned: 1 job         │
├─────────────────┴───────────────────────────┤
│ ⚠️  ATTENTION ITEMS                         │
│ • SWP-25043: 12 days in "accepted" (target 7)│
│ • SWF-25061: Materials not received (sched  │
│   for Thursday)                              │
│ • 3 invoices 30+ days overdue ($11,178)     │
│ • SWP-25038: 18% over material budget       │
└─────────────────────────────────────────────┘
```

#### 8.2 Weekly Scorecard [BUILD]
**Where:** CEO dashboard — new tab or section.

| Metric | This Week | Last Week | Target | Status |
|--------|-----------|-----------|--------|--------|
| Leads | 12 | 15 | 15+ | 🟡 |
| Quotes sent | 6 | 8 | 8+ | 🔴 |
| Quotes accepted | 4 | 3 | 4+ | 🟢 |
| Jobs scheduled | 5 | 4 | 4+ | 🟢 |
| Jobs completed | 3 | 4 | 4+ | 🟡 |
| Revenue invoiced | $28K | $25K | $25K+ | 🟢 |
| Revenue collected | $22K | $18K | $20K+ | 🟢 |
| AR 30+ days | $22K | $24K | <$20K | 🟡 |
| Avg job value | $9.2K | $8.1K | $8K+ | 🟢 |
| DSO | 19 | 22 | <30 | 🟢 |

**EOS 2-week rule:** If any metric shows 🔴 for 2 consecutive weeks → automatically add to an "IDS Issues" list that surfaces in the weekly L10 meeting view.

```sql
CREATE TABLE scorecard_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
  week_start DATE NOT NULL,
  metric_name TEXT NOT NULL,
  value NUMERIC,
  target NUMERIC,
  on_track BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, week_start, metric_name)
);

CREATE TABLE ids_issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
  title TEXT NOT NULL,
  source TEXT, -- 'scorecard', 'stage_duration', 'manual'
  source_metric TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
```

---

## Phase 3: AI Multipliers (Weeks 9-12)

**Goal:** Leverage clean data to generate new revenue and automate field workflows.
**ROI:** 10-15% revenue increase + operational efficiency gains.

### Week 9: Cross-Sell Automation

#### 9.1 Cross-Sell Fields on Forms [BUILD]
**Where:** Trade app completion form + scoping tool.
**Add fields:**
- Scope form: "What else could this customer use?" (dropdown multi-select: fencing, decking, screening, lighting, outdoor kitchen)
- Completion form: "Additional opportunities spotted on site" (same dropdown)

**Store in:** `jobs.cross_sell_json`
```sql
ALTER TABLE jobs ADD COLUMN cross_sell_json JSONB DEFAULT '{}';
-- e.g. {"scope_opportunities": ["fencing", "lighting"], "completion_opportunities": ["decking"]}
```

#### 9.2 Service Gap Detection [BUILD]
**New reporting-api action:** `cross_sell_opportunities`
**Logic:** Query contact_matches → find customers with only one division:
```sql
SELECT cm.client_name, cm.ghl_contact_id,
  array_agg(DISTINCT j.type) as services_used,
  CASE
    WHEN NOT 'fencing' = ANY(array_agg(j.type)) THEN 'fencing'
    WHEN NOT 'patio' = ANY(array_agg(j.type)) THEN 'patio'
    WHEN NOT 'decking' = ANY(array_agg(j.type)) THEN 'decking'
  END as missing_service
FROM contact_matches cm
JOIN jobs j ON j.ghl_contact_id = cm.ghl_contact_id
WHERE j.status IN ('complete', 'invoiced')
GROUP BY cm.client_name, cm.ghl_contact_id
HAVING COUNT(DISTINCT j.type) < 3;
```

#### 9.3 GHL Workflow Triggers [BUILD]
**Where:** GHL workflow builder (no code — configure in GHL UI).
**Triggers:**
1. Job completed + 6 months → SMS: "It's been 6 months since your [patio]. Time to think about [fencing/decking]?"
2. Cross-sell field populated → create new GHL opportunity in relevant pipeline
3. Job completed → SMS to customer asking for Google review (wait until invoice paid)

### Week 10: GHL MCP Server Integration

#### 10.1 Generate Private Integration Token [BUY/BUILD]
**Where:** GHL Settings → Private Integrations → Create new.
**Scopes needed:**
- contacts.readonly, contacts.write
- conversations.readonly, conversations.write
- opportunities.readonly, opportunities.write
- calendars.readonly
- payments.readonly

**MCP endpoint:** `https://services.leadconnectorhq.com/mcp/`
**Config:**
```json
{
  "url": "https://services.leadconnectorhq.com/mcp/",
  "headers": {
    "Authorization": "Bearer pit-XXXXX",
    "locationId": "YOUR_LOCATION_ID"
  }
}
```

#### 10.2 Connect to AI Assistant [BUILD]
**Where:** `ops-ai` edge function — add MCP tools alongside existing Supabase tools.
**Capability:** AI can now directly read/write GHL contacts, conversations, pipeline stages, calendar events — without routing through `ghl-proxy` for many operations.

**Use cases:**
- "Show me all stuck deals" → AI queries GHL pipeline via MCP
- "Send John a follow-up" → AI sends SMS via MCP conversations endpoint
- "Book a site visit for Friday" → AI creates calendar event via MCP

### Week 11: Neighbourhood Marketing + Customer Timeline

#### 11.1 Neighbourhood Marketing Agent [BUILD]
**Trigger:** Job status → "complete" AND site_address is populated.
**Logic:**
1. Query Supabase: find all contacts within same suburb or street
2. Filter to leads (not existing customers)
3. Draft personalised SMS: "We just completed a [patio/fence] on [Street Name]. Would you like a free quote for your property?"
4. Send via GHL MCP `conversations_send-a-new-message` or GHL API
5. Log in `webhook_log` for audit

#### 11.2 Customer Project Timeline [BUILD]
**What:** Shareable link showing project progress photos + milestones.
**Where:** New lightweight HTML page (similar to service report share links).
**URL pattern:** `/dashboard/timeline.html?token={share_token}`
**Data:** Pull from `job_media` (scope/in_progress/completion phases) + `job_stage_history` timestamps.
**Share:** Auto-text timeline link to customer when first in_progress photo is uploaded.

### Week 12: Technical Debt + Audit Trail

#### 12.1 Break Up ops-api [FIX]
**Current:** 2,100 lines handling ops + trade + AI/automation endpoints.
**Target:** Split into logical modules:
- `ops-api` → scheduling, POs, WOs, pipeline views
- `trade-api` → my_jobs, upload_photo, service_report, GPS check-in
- Keep shared Supabase client helper as imported module

**Risk:** Coordinate deploy carefully — both old and new functions must be deployed, and dashboard code updated to point to new endpoints.

#### 12.2 Audit Trail [BUILD]
```sql
CREATE TABLE audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
  user_id UUID,
  user_email TEXT,
  action TEXT NOT NULL, -- 'update_job', 'create_po', 'move_stage', etc.
  entity_type TEXT NOT NULL, -- 'job', 'purchase_order', 'assignment', etc.
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_date ON audit_log(created_at);
```

**Implementation:** Add audit logging to every write operation in edge functions. Log the before/after state.

---

## What to BUY vs BUILD

| Decision | Approach | Why |
|----------|----------|-----|
| AR automation | **BUY** Paidnice ($39/mo) | No code needed, proven results, Xero App of Year 2025 |
| Photo storage/documentation | **BUILD** into existing trade app | Already have job_media table + signed URL upload flow |
| AI photo quality scoring | **BUILD LATER** (Phase 4+) | CompanyCam costs $19/user/mo but custom triggers are the real value |
| PO workflow | **BUILD** (custom) | Off-the-shelf can't enforce your specific materials gate + GHL pipeline rules |
| Per-job P&L | **BUILD** on top of Xero Projects API | Already syncing 108 projects — just need better UI |
| Cross-sell automation | **BUILD** triggers in GHL + Supabase | Only you know your multi-division cross-sell logic |
| GHL MCP | **BUY** (free, GHL-hosted) | Just connect — no custom code for the server itself |
| AI voice agent | **DEFER** to Phase 4+ | Evaluate after cross-sell triggers are generating leads |
| Predictive scheduling | **DEFER** to Phase 4+ | Need weather API + more crew data first |

---

## Database Migrations Summary

All new tables/columns needed (create as migration 016+):

```sql
-- Migration 016: System Upgrade Phase 1
ALTER TABLE jobs ADD COLUMN xero_project_id TEXT;
ALTER TABLE jobs ADD COLUMN materials_status TEXT DEFAULT 'not_ordered'
  CHECK (materials_status IN ('not_ordered', 'ordered', 'partial', 'received', 'n/a'));
ALTER TABLE jobs ADD COLUMN cross_sell_json JSONB DEFAULT '{}';

CREATE TABLE job_stage_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) NOT NULL,
  stage_name TEXT NOT NULL,
  entered_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  exited_at TIMESTAMPTZ,
  duration_hours NUMERIC GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (COALESCE(exited_at, now()) - entered_at)) / 3600
  ) STORED,
  org_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'
);

CREATE TABLE scorecard_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
  week_start DATE NOT NULL,
  metric_name TEXT NOT NULL,
  value NUMERIC,
  target NUMERIC,
  on_track BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, week_start, metric_name)
);

CREATE TABLE ids_issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
  title TEXT NOT NULL,
  source TEXT,
  source_metric TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
  user_id UUID,
  user_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_stage_history_job ON job_stage_history(job_id);
CREATE INDEX idx_stage_history_stage ON job_stage_history(stage_name);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_date ON audit_log(created_at);
CREATE INDEX idx_scorecard_week ON scorecard_history(week_start);
```

---

## Edge Function Changes Summary

| Function | Changes |
|----------|---------|
| `ghl-proxy` | Add site_address mapping on sync; add Xero Project creation in `link` action; log stage changes to `job_stage_history` |
| `ghl-webhook` | Map address fields from GHL form submissions |
| `ops-api` | Flesh out `scope_to_po` and `complete_and_invoice` stubs; add materials gate check on scheduling; add cross-sell field handling |
| `xero-sync` | Enhanced `sync_projects` with detailed financials; PO status → materials_status sync |
| `reporting-api` | New actions: `job_profitability_detail`, `cross_sell_opportunities`, `weekly_scorecard` |
| **NEW: `trade-api`** | Split from ops-api: my_jobs, upload_photo, service_report, GPS |

---

## Projected P&L Impact (Day 90)

| Category | Mechanism | Annual Impact |
|----------|-----------|---------------|
| Cash flow | Paidnice + same-day invoicing → DSO 28→17, 90+ AR <$10K | Cash unlock |
| Material savings | PO workflow + materials gate → eliminate 5-10% waste | $50,000-$100,000 |
| Margin protection | Per-job P&L + variance alerts → catch 5% leak | $275,000 |
| Cross-sell revenue | Automated triggers → 10-15% top-line increase | $550,000-$825,000 |
| **Total** | | **$875,000-$1,200,000** |

**Cost to implement:** $39/mo (Paidnice) + developer time. No new platform subscriptions.

---

## Future Phases (Post-90 Days)

These become viable once Phase 1-3 data is flowing:

| Feature | Depends On | Estimated Impact |
|---------|-----------|-----------------|
| AI Photo Quality Scoring | Clean completion photo flow + checklist data | Automated QA, fewer callbacks |
| AI Voice Agent (inbound) | GHL MCP + calendar integration | 60% fewer missed calls |
| Predictive Weather Scheduling | site_address data + weather API + crew assignments | Eliminate rain day scramble |
| Predictive Estimating | 6+ months of scope_json vs actual PO data | Auto-calibrating quotes |
| Customer Portal | Xero Projects + job_media + timeline | Premium customer experience |
| Route Optimisation | site_address data + multiple crew assignments | Labour efficiency gains |

---

## Notes for Collaborators

1. **Supabase CLI path:** `/Users/marninstobbe/.local/bin/supabase` (NOT npx)
2. **Deploy command:** `/Users/marninstobbe/.local/bin/supabase functions deploy <name> --project-ref kevgrhcjxspbxgovpmfl`
3. **Functions needing `--no-verify-jwt`:** ghl-proxy, reporting-api, ops-api, ops-ai
4. **RLS is on:** ALL client-side queries fail — route everything through edge functions
5. **PostgREST 1000-row limit:** Use fetchAll() with .range() pagination for bulk queries
6. **Xero rate limit:** 60 req/min — batch operations with pauses
7. **Perth timezone:** AWST = UTC+8, no daylight saving
8. **Other people edit scoping tools repos** — always `git pull` before working on patio-tool or fence-designer
