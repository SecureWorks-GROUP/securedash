# ops-api Stability Plan — Stop the Breakage

## The Current Situation

`ops-api/index.ts` is a **13,000-line monolith** handling **191 API actions** in a single file. It serves:
- Ops dashboard (Shaun's daily driver)
- Trade app (crews in the field)
- Finance/invoicing
- AI automation
- Comms/email/SMS
- Job management

---

## What keeps breaking and why

There are **4 categories of breakage** we've been hit by — all seen in production:

### 1. Deploy desync (most common)
**How:** Frontend (`ops.html`) auto-deploys on `git push`. Backend (`ops-api`) required a separate manual CLI deploy. Someone pushes frontend changes that expect new API fields, but forgets to deploy the backend.

**Real examples:**
- `visible_to_trades` field missing → file toggle permanently stuck on "Hidden"
- `file_name` field missing → documents showing as "undefined"
- Notes not saving → backend action handler not deployed
- Ops notes broken → same cause

**Status: FIXED.** GitHub Action now auto-deploys ops-api when `index.ts` changes on push.

### 2. Silent field mismatch
**How:** Backend returns data missing a field the frontend expects. No error is thrown — the value is just `undefined`. The UI renders wrong but nobody gets an alert.

**Real example:** `job_detail` documents mapping was missing `visible_to_trades`, `file_name`, `storage_url` in the deployed version. The toggle button always rendered "Hidden" because `doc.visible_to_trades` was `undefined` (falsy).

**Status: NOT FIXED.** Nothing validates that API responses contain the fields the frontend needs.

### 3. Uncommitted changes
**How:** A fix is made to `index.ts` locally but never committed. It looks correct on disk. A deploy happens later from the committed version, which doesn't include the fix. Or the fix sits locally for days/weeks and everyone assumes it's live.

**Real example:** Pipeline query had `invoiced` in the exclusion list. A local edit removed it, but was never committed. We deployed ops-api earlier today — the deploy used the committed version which still excluded `invoiced`. Stephanie Councilor (SWF-26049) was invisible on the fencing kanban.

**Status: PARTIALLY FIXED.** Auto-deploy triggers on committed changes to `index.ts`. But if someone edits the file without committing, the fix won't deploy. Need discipline: **every edit must be committed.**

### 4. Edit side-effects (monolith risk)
**How:** All 191 actions share one file. A syntax error anywhere kills every endpoint. A variable name collision or bad import breaks unrelated features.

**Real example:** Not yet seen in production, but the risk grows with every edit. One bad line in the invoicing code could take down the trade app for crews in the field.

**Status: NOT FIXED.** Structural problem — can only be solved by splitting the monolith.

---

## What's already in place

| Protection | When added | What it catches |
|-----------|-----------|----------------|
| Auto-deploy GitHub Action | Today (2026-05-07) | Deploy desync — frontend/backend always in sync |
| `SUPABASE_ACCESS_TOKEN` secret | Today | Enables the auto-deploy |
| Deploy guide in secureworks-docs | Today | Human reference so this doesn't get forgotten |

---

## What's still needed (Options)

### Option A: Post-Deploy Health Check
**Effort:** 1 hour
**Add to:** GitHub Action (runs after deploy)

A `health_check` action in ops-api that:
- Confirms the function boots and responds
- Returns the deployed version number
- Validates that critical actions exist (job_detail, pipeline, toggle_document_visibility)

If the health check fails after deploy, the GitHub Action fails and you get notified.

**Catches:** Total outages, syntax errors, broken imports
**Doesn't catch:** Silent field mismatches, wrong data being returned

---

### Option B: Response Contract Tests
**Effort:** 3-4 hours
**Add to:** GitHub Action (runs after deploy)

A test file that defines what fields each critical endpoint MUST return:

```
job_detail:
  .job         → id, status, client_name, job_number, type, site_address
  .documents[] → id, file_name, visible_to_trades, type, storage_url, created_at
  .events[]    → id, event_type, created_at
  .media[]     → id, storage_url

pipeline:
  .columns.*[] → id, status, client_name, job_number, value, type
  must include statuses: accepted, scheduled, complete, invoiced

toggle_document_visibility:
  POST → { success: true }
```

After every deploy, the GitHub Action:
1. Calls each endpoint against a known test job
2. Checks every required field exists and is not undefined
3. Fails the deploy check if anything is missing

**Catches:** Everything from Option A + the exact class of bugs that keep hitting you (missing fields, excluded statuses)
**Doesn't catch:** UI rendering bugs (rare — the data is usually the problem, not the rendering)

---

### Option C: Split the Monolith
**Effort:** Multi-day project (needs its own plan)

Break ops-api into domain-specific edge functions:

```
ops-api       → dashboard reads/writes (job_detail, pipeline, notes, files, assignments)
                ~4,000 lines — the core of what Shaun uses daily

trade-api     → trade app (my_jobs, clock_on/off, upload_photo, service_reports)
                Already partially exists — needs migration of remaining actions

finance-api   → invoicing, POs, expenses, Xero sync
                ~3,000 lines — isolated from ops dashboard

comms-api     → email, SMS, chase workflows, client updates
                ~2,000 lines — can break without affecting job management

ai-api        → AI analysis, nudges, morning brief, proposed actions
                ~1,500 lines — experimental, changes frequently
```

**Benefits:**
- A bad edit to invoicing can't take down the trade app
- Each function is small enough to understand at a glance
- Separate deploy lifecycles — deploy finance changes without touching ops
- Easier to add contract tests per function

**Trade-offs:**
- More files to manage, more GitHub Actions to configure
- Shared utilities need extracting to `_shared/`
- Cross-cutting concerns (auth, error handling) need a shared pattern
- Biggest change — should be planned and executed carefully, not rushed

---

### Option D: Process Rules (free, today)
**Effort:** 0 — just discipline

1. **Every edit to `index.ts` must be committed immediately** — no uncommitted fixes sitting on disk
2. **Never change a data mapping (job_detail, pipeline response shape) without updating the matching frontend code in the same commit**
3. **After any ops-api change, check the dashboard** — open a job, switch tabs, confirm data loads
4. **Don't edit code you're not asked to edit** — especially data mappings that the frontend depends on

Works today. Fragile (relies on humans remembering), but combined with Option B it covers most scenarios.

---

## Recommendation

**Now:** Option A + B (health check + contract tests) — 4-5 hours total. This catches every bug class we've seen except monolith blast radius, which hasn't caused a production incident yet.

**Next sprint:** Option C (split the monolith) — plan it properly as a standalone project. The 13,000-line file is a liability that grows with every feature.

**Always:** Option D (process rules) — costs nothing, reduces risk immediately.

---

## Protection Matrix

| Bug type | Auto-deploy | Health check | Contract tests | Monolith split |
|----------|:-----------:|:------------:|:--------------:|:--------------:|
| Deploy desync | DONE | - | - | - |
| Total outage (syntax error) | - | Option A | Option A | Option C |
| Silent field mismatch | - | - | Option B | - |
| Uncommitted changes | Process rule | - | Option B catches it post-deploy | - |
| Edit side-effects (blast radius) | - | - | - | Option C |
