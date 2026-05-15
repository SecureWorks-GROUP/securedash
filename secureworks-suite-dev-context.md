# SecureWorks Suite — Developer Context & Rules

**Last updated:** 17 March 2026
**Purpose:** Give this to any Claude terminal or developer working on the SecureWorks Suite so they understand the architecture, what's been built, and how to work without breaking things.

---

## What SecureWorks Is

SecureWorks WA is a Perth construction company (patios, fencing, decking). $1.4M revenue, ~45 jobs/month, 5-6 people. The "Secure Suite" is a custom-built operations platform replacing off-the-shelf tools.

---

## The Codebase — Where Everything Lives

### Git Repos (GitHub Pages — live on push to main)

| Repo | GitHub | What | URL |
|------|--------|------|-----|
| **securedash** | `marninms98-dotcom/securedash` | CEO, Ops, Trade dashboards | `marninms98-dotcom.github.io/securedash/` |
| **secureworks-sale** | `marninms98-dotcom/secureworks-sale` | Sale dashboard | `marninms98-dotcom.github.io/secureworks-sale/` |
| **patio-tool** | `marninms98-dotcom/patio` | Patio + decking scoping tool | `marninms98-dotcom.github.io/patio/` |
| **fence-designer** | `marninms98-dotcom/fence-designer` | Fencing scoping tool | `marninms98-dotcom.github.io/fence-designer/` |

### Local Paths

| Path | What | Git? |
|------|------|------|
| `~/Projects/securedash-temp/` | Local clone of securedash repo | YES — push to go live |
| `~/Projects/secureworks-sale/` | Local clone of sale repo | YES — push to go live |
| `~/Projects/patio-tool/` | Local clone of patio tool | YES — push to go live |
| `~/Projects/secureworks-site/` | Edge functions, migrations, docs, landing pages | NO git — Supabase deploys directly |
| `~/Projects/secureworks-website/` | Astro website (Cloudflare Pages) | YES |

### Edge Functions (Supabase — deploy via CLI)

All live at: `https://kevgrhcjxspbxgovpmfl.supabase.co/functions/v1/{name}`

| Function | Lines | What | Deploy Command |
|----------|-------|------|---------------|
| **ops-api** | 4,199 | Backend for Ops + Trade dashboards. CRUD for jobs, POs, WOs, assignments, invoicing. | `supabase functions deploy ops-api --no-verify-jwt` |
| **ops-ai** | 1,714 | AI chat with 31 tools. Financial intelligence, reasoning traces, prompt caching. | `supabase functions deploy ops-ai --no-verify-jwt` |
| **reporting-api** | 3,226 | Read-only reporting for CEO + Sale dashboards. Sales metrics, pipeline, trends. | `supabase functions deploy reporting-api --no-verify-jwt` |
| **daily-digest** | 1,063 | 15 alert rules, AI narrative, financial snapshots, weekly pulse. Scheduled via pg_cron. | `supabase functions deploy daily-digest --no-verify-jwt` |
| **ghl-proxy** | 1,525 | Proxy to GoHighLevel API. Contact lookup, conversations, SMS, scope linking. | `supabase functions deploy ghl-proxy --no-verify-jwt` |
| **xero-sync** | 2,074 | Syncs data from Xero (invoices, reports, bank balances, payables, transactions). | `supabase functions deploy xero-sync --no-verify-jwt` |
| **ghl-webhook** | ~600 | Receives GHL form submissions, creates draft jobs, captures UTM attribution. | `supabase functions deploy ghl-webhook --no-verify-jwt` |
| **send-po-email** | 222 | Sends supplier emails via Resend API (not yet configured — DNS pending). | `supabase functions deploy send-po-email --no-verify-jwt` |
| **receive-po-email** | 242 | Inbound email webhook for supplier replies. | `supabase functions deploy receive-po-email --no-verify-jwt` |
| **send-quote** | ~300 | Sends client quotes via GHL. | `supabase functions deploy send-quote --no-verify-jwt` |
| **completion-pack** | ~400 | Generates completion packages. | `supabase functions deploy completion-pack --no-verify-jwt` |

**Deploy command prefix** (always needed):
```bash
export FNM_DIR="$HOME/.local/share/fnm" && export PATH="$HOME/.local/bin:$FNM_DIR:$PATH" && eval "$(fnm env)"
cd ~/Projects/secureworks-site
/Users/marninstobbe/.local/bin/supabase functions deploy {name} --no-verify-jwt --project-ref kevgrhcjxspbxgovpmfl
```

---

## Architecture Overview

```
Google Ads → GHL Form → GHL Contact
                              ↓
                    GHL Webhook → Supabase (draft job + contact_matches)
                              ↓
                    Nathan scopes on site (patio-tool or fence-designer)
                              ↓
                    QA Pass → ghl-proxy link action:
                      - Creates job with SWP/SWF number
                      - Links GHL contact → Supabase job
                      - Creates/matches Xero contact
                      - Pushes monetary value to GHL
                      - Auto-creates draft PO from scope
                              ↓
                    Shaun manages in Ops Dashboard:
                      - Creates POs, assigns crew, tracks status
                      - All writes go to ops-api
                              ↓
                    Crew works via Trade App:
                      - Clock in/out, photos, completion reports
                      - Writes to ops-api (trade actions)
                              ↓
                    Job completes → Invoice via Xero
                      - xero-sync pulls financial data back
                              ↓
                    AI Layer monitors everything:
                      - daily-digest: 15 alert rules + AI narrative (7am daily)
                      - ops-ai: 31 tools for chat queries
                      - business_events: immutable event log
                      - ai_reasoning_traces: every AI decision logged
```

---

## Key Database Tables

**Supabase project:** `kevgrhcjxspbxgovpmfl`

### Core Business
- `jobs` — central entity. Has `legacy` boolean (true = GHL import, filtered from all queries)
- `purchase_orders` — POs linked to jobs
- `job_assignments` — crew scheduling with confirmation workflow
- `job_events` — legacy event log (being supplemented by business_events)
- `job_documents` — PDFs (quotes, work orders)
- `job_media` — photos and videos
- `users` — team members (admin, estimator, installer roles)

### Financial (Xero sync)
- `xero_invoices` — sales invoices (ACCREC) and bills (ACCPAY)
- `xero_reports` — P&L reports by tracking category
- `xero_projects` — per-job project data
- `xero_bank_balances` — daily cash position
- `xero_aged_payables` — what's owed to suppliers
- `xero_bank_transactions` — 90-day reconciled transactions

### AI Intelligence Layer
- `business_events` — immutable CloudEvents log (dual-write from ops-api)
- `ai_alerts` — proactive warnings from daily-digest
- `ai_reasoning_traces` — every AI decision with full context snapshot
- `ai_decision_links` — connects traces to outputs
- `ai_feedback_outcomes` — human responses to AI proposals
- `ai_scores` — flexible evaluation
- `ai_proposed_actions` — pending state for HITL approval
- `action_permissions` — autonomy tiers (auto/notify/approve/block)
- `financial_snapshots` — pre-computed daily/weekly business intelligence
- `material_price_ledger` — supplier prices extracted from POs
- `weekly_reports` — periodic executive analysis
- `market_intelligence` — external world knowledge

### Attribution
- `contact_matches` — links GHL contacts → Supabase jobs with lead source + UTM data
- `google_ads_daily` — campaign spend/clicks/conversions

### Other
- `crew_availability` — crew scheduling availability
- `po_communications` — PO email thread tracking
- `daily_digests` — stored morning briefings

---

## Critical Rules for Working on This Codebase

### 1. ALWAYS git pull before editing

```bash
cd ~/Projects/securedash-temp && git fetch origin && git pull origin main
cd ~/Projects/secureworks-sale && git fetch origin && git pull origin main
cd ~/Projects/patio-tool && git fetch origin && git pull origin main
```

Multiple people edit these repos. If you don't pull first, you'll push over someone else's work.

### 2. The `legacy` filter

Every query that lists or aggregates jobs MUST include `.eq('legacy', false)`. This filters out 1,226 GHL imports that pollute every metric. Only 8 real jobs exist from the new scoping system.

**Do NOT filter:** single-job lookups by ID, write operations, trade app queries.

### 3. Supabase config

- **Project ref:** `kevgrhcjxspbxgovpmfl`
- **Anon key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtldmdyaGNqeHNwYnhnb3ZwbWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNTQxMDUsImV4cCI6MjA4NzkzMDEwNX0.lPUEvx8u98WL86PcMNv8yfLnd6OQKzTUOCsRewfQiZc`
- **URL:** `https://kevgrhcjxspbxgovpmfl.supabase.co`
- **CLI path:** `/Users/marninstobbe/.local/bin/supabase`
- **fnm setup:** `export FNM_DIR="$HOME/.local/share/fnm" && export PATH="$HOME/.local/bin:$FNM_DIR:$PATH" && eval "$(fnm env)"`

### 4. Shared files — cloud.js and brand.js

`cloud.js` is the Supabase auth + CRUD module used by all scoping tools and dashboards.
- **Canonical source:** `~/Projects/patio-tool/tools/shared/cloud.js`
- Copies exist in: fence-designer, secureworks-sale, secureworks-site/dashboard/shared/
- If you change cloud.js, update ALL copies or they drift

`brand.js` has brand colours and PDF helpers.
- **Canonical source:** `~/Projects/secureworks-site/dashboard/shared/brand.js`

### 5. Single-file HTML approach

All dashboards and tools are single-file HTML. CSS in `<style>`, JS in `<script>`, no build step. This is intentional — Marnin is not a developer. Don't split files unless explicitly asked.

### 6. CSS Variables (match across all dashboards)

```css
--sw-orange: #F15A29;
--sw-dark: #293C46;
--sw-mid: #4C6A7C;
--sw-light: #F0F4F7;
--sw-bg: #F7F8FA;
--sw-border: #EAEDF0;
--sw-text: #1A2332;
--sw-text-sec: #7C8898;
--sw-green: #27AE60;
--sw-red: #E74C3C;
--sw-yellow: #E67E22;
```

### 7. Mobile-first

80% of traffic is mobile. Touch targets ≥44px. Test on iPad Safari. Bottom nav on mobile, header nav on desktop (≥769px).

### 8. Edge function gotchas

- ALL client Supabase queries fail due to RLS. Use edge functions with service role key.
- PostgREST has a 1000-row limit. Use `fetchAll()` with `.range()` for large tables.
- Edge functions timeout at 60 seconds. Don't do heavy processing in a single call.
- Deploy with `--no-verify-jwt` — all functions handle their own auth.

### 9. Don't delete legacy data

The 1,226 legacy GHL jobs stay in the database. They're filtered from all views via the `legacy` boolean. Some of those contacts will become future leads. When they do, a NEW job gets created through the scope tool with a proper job number.

### 10. Dual-write pattern

Key ops-api actions (createAssignment, updateJobStatus, createPO, completeAndInvoice, addNote) write to BOTH:
- `job_events` (legacy, dashboards read from this)
- `business_events` (new CloudEvents log, AI reads from this)

If you add a new action to ops-api, add a `logBusinessEvent()` call alongside the existing `job_events` insert.

---

## What's Been Built (as of 17 March 2026)

### Secure Sale (brand new, built 16 March)
- Full sales dashboard with Today/Pipeline/Performance/Leads tabs
- GHL client chat in job detail panel (SMS, email, call logging)
- Admin view with salesperson dropdown + leaderboard

### AI Intelligence Layer (built 16-17 March)
- 15 fire prevention alert rules in daily-digest (scheduled 7am AWST via pg_cron)
- 31 AI chat tools in ops-ai including 5 financial intelligence tools
- Reasoning traces on every AI interaction (Langfuse 4-table pattern)
- Prompt caching (90% input cost reduction)
- Business events dual-write (CloudEvents immutable log)
- Supplier price extraction from POs (material_price_ledger)
- Price review UI in ops.html Materials tab
- Financial snapshots (daily pre-computed from Xero + job data)
- Weekly executive pulse (Monday 7am via pg_cron)
- Action permissions table (autonomy tiers for AI)

### Ops Dashboard Improvements (16 March)
- AI alerts panel in Today tab
- Searchable job pickers (all selectors filter by name/number/suburb)
- Lost job reason capture (dropdown when marking lost)
- PO supplier reason field (optional)
- Pending price review section in Materials tab

### CEO Dashboard (16 March)
- AI alerts panel with narrative

### Data Quality (17 March)
- Legacy flag on jobs table — filters 1,226 GHL imports from all queries
- 41 queries updated across 4 edge functions

### Infrastructure
- Xero bank balance sync, aged payables sync, bank transaction sync
- GHL conversation thread (get_conversation, get_my_messages)
- SMS logging to job_events
- Crew availability + assignment confirmation
- PO email system (send + receive, blocked on DNS)

---

## Architecture Documents

| Document | Path | What |
|----------|------|------|
| Data architecture spec | `~/Projects/secureworks-site/docs/data-architecture-spec.md` | 6-layer data architecture, all CREATE TABLE statements, design decisions |
| AI implementation roadmap | `~/Projects/secureworks-site/docs/ai-implementation-roadmap.md` | Phased build plan, costs, ROI, what to build when |
| Fencing ops analysis | `~/Projects/secureworks-site/docs/fencing-ops-chat-analysis.md` | 12-month WhatsApp chat analysis — issue patterns, SOPs needed |
| Research HTML brief | `~/Projects/secureworks-site/dashboard/research-data-architecture.html` | Interactive research brief on data logging architecture |

---

## Concurrent Editing Rules

When multiple people are working on the codebase simultaneously:

1. **Always pull before editing.** Always push after committing. Don't sit on local changes.
2. **Communicate which files you're editing.** If two people edit ops.html at the same time, one person's changes get overwritten on push.
3. **Edge functions are safe to edit concurrently** — they're deployed individually. Editing ops-api doesn't affect reporting-api.
4. **Dashboard HTML files are NOT safe to edit concurrently** — they're single files in one repo. Only one person should edit ops.html at a time.
5. **Database migrations** — coordinate. Don't both try to ALTER the same table.
6. **If you break something**, check the Supabase function logs: `https://supabase.com/dashboard/project/kevgrhcjxspbxgovpmfl/functions`

---

## Key People

| Name | Role | In the system as |
|------|------|-----------------|
| **Marnin Stobbe** | CEO, founder | Admin user. Sees all data. |
| **Shaun Lee** | Ops Manager (remote, KL) | Uses Ops dashboard daily. |
| **Nathan** | Patio salesperson/scoper | Uses patio scope tool + Sale dashboard. |
| **Khairo Pomare** | Fencing salesperson/scoper | Uses fence scope tool + Sale dashboard. |
| **Brother Emeka (Henry)** | Lead fencing installer | Uses Trade app. |
| **Isaac** | Patio installer | Uses Trade app (not yet fully onboarded). |
