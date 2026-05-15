# Bug Report: Pipeline Card Data Contamination (Two Bugs Found)

**Date:** 2026-05-07
**Reported by:** Shaun Lee
**Investigated by:** Claude (AI)
**File:** `ops.html` (Bug 1), `ghl-proxy` edge function (Bug 2)
**Severity:** High

---

## Summary

Shaun reported that clicking job cards in the fencing pipeline kanban caused the wrong job data to display — specifically, Bilal Khan's data was replacing other people's cards (Digby Veling, Chris Stacey). Investigation uncovered **two separate bugs**, one frontend and one backend.

---

## Bug 1: Frontend Race Condition in `openJobDetail()` (FIXED)

### Symptoms

- Clicking a card and seeing a different job's data render in the detail panel
- Chris Stacey's card turning into Bilal Khan when clicked

### Root Cause

`openJobDetail()` in `ops.html` (lines 9065-9106) fires an async fetch but had no protection against overlapping requests. If two fetches were in-flight simultaneously, whichever response arrived last would overwrite the screen — regardless of which card the user actually clicked.

The global variables `_currentJobId` and `_currentJobData` were written unconditionally with no stale-response check.

### Fix Applied (ops.html, 4 changes)

1. **New guard variables** — `_jobDetailRequestSeq` (monotonic counter) and `_jobDetailAbort` (AbortController)
2. **Five stale-response guards** in `openJobDetail()`:
   - Request sequence check (newer click superseded this one)
   - Current job ID check (ID changed by another code path)
   - Response identity check (API returned wrong job — logs console warning)
   - AbortError catch (cancelled fetch — silent exit)
   - Stale error guard (old request's error doesn't overwrite new request)
3. **`opsFetch()` now accepts optional `signal`** for AbortController (backward-compatible, existing callers unaffected)
4. **`closeJobDetail()` aborts in-flight fetch** on panel close

### Status: FIXED — pending deploy & testing

---

## Bug 2: Backend Data Contamination — Wrong Client Name on Job Record (NEEDS INVESTIGATION)

### Symptoms

- Digby Veling's card appeared under Accepted but showed "Bilal Khan"
- This wasn't just a display glitch — the database record itself is wrong

### Evidence

Querying the Supabase `jobs` table revealed:

| Job # | client_name | status | GHL Opportunity ID | GHL Contact ID | Created |
|-------|------------|--------|-------------------|---------------|---------|
| **SWF-26169** | **Bilal Khan** | accepted | **`5ccpryNKnCmhyAsybpgU`** | **null** | 2026-05-05 |
| SWF-26167 | Bilal Khan | quoted | `Jvo9KaWDvOUr8dzbDSev` | `TZ8YSOsYK6et7nCbviSs` | 2026-05-05 |
| SWF-26119 | Bilal Khan | order_materials | `CYemTP8XAOPTr9MP4rdS` | `PTEg6eOLhtAbjvg510ex` | 2026-04-28 |

**The problem:** GHL opportunity `5ccpryNKnCmhyAsybpgU` belongs to **Digby Veling** (confirmed via GHL API), but job **SWF-26169** has `client_name = "Bilal Khan"` and `ghl_contact_id = null`.

### What this means

- When the job was created via the scoping tool (`ghl-proxy` edge function, `create_job_for_opportunity` action), the wrong client name was written to the database
- The `ghl_contact_id` being `null` suggests the contact lookup failed or was skipped entirely
- The estimator may have had Bilal Khan's scope loaded, then loaded Digby's opportunity, and the `client_name` from the previous session bled through
- Alternatively, the `ghl-proxy` function may have a similar race condition or caching bug to Bug 1

### GHL vs Supabase comparison

**GHL (source of truth for leads):**
- Opportunity `5ccpryNKnCmhyAsybpgU` → **Digby Veling**, digby_v@hotmail.com, +61438294953
- Stage: "Following up Quote Sent (Site visit)"
- Value: $2,635.60

**Supabase (what the dashboard shows):**
- Job SWF-26169 linked to the same opportunity → **Bilal Khan**, status: accepted
- Contact ID: null (should be `L3d6UxTJas32bPkd1Waj`)

### Where the bug lives

The job creation code is in the `ghl-proxy` edge function, which lives in the **secureworks-site** repo (not ops-dashboard). The relevant action is `create_job_for_opportunity`, which:
1. Takes a GHL opportunity ID
2. Looks up the contact details from GHL
3. Creates a row in the Supabase `jobs` table

Something in this flow wrote Bilal Khan's name instead of Digby Veling's. The null `ghl_contact_id` confirms the contact data wasn't pulled correctly.

### Immediate data fix needed

SWF-26169 needs to be corrected:
- `client_name` → "Digby Veling"
- `client_email` → "digby_v@hotmail.com"
- `client_phone` → "+61438294953"
- `ghl_contact_id` → "L3d6UxTJas32bPkd1Waj"

### Root cause investigation needed

The `ghl-proxy` edge function (`secureworks-site/supabase/functions/ghl-proxy/index.ts`) needs to be reviewed for:
1. **Race conditions** — can two simultaneous `create_job_for_opportunity` calls cross-contaminate client data?
2. **Stale state** — does the scoping tool cache a previous client's details that bleed into the next job?
3. **Missing contact lookup** — why was `ghl_contact_id` null? Did the GHL API call fail silently?

### Status: OPEN — needs Soybean to review `ghl-proxy` code

---

## Bilal Khan Job Audit

For context, Bilal Khan currently has **5 job records** in Supabase. Two have no job number (legacy from Dec 2025). The three active ones:

| Job # | Status | Notes |
|-------|--------|-------|
| SWF-26169 | accepted | **WRONG** — this is actually Digby Veling's job |
| SWF-26167 | quoted | Appears to be a legitimate Bilal Khan job |
| SWF-26119 | order_materials | Appears to be a legitimate Bilal Khan job |

This explains why Shaun saw "Bilal Khan" appearing in multiple pipeline columns — he genuinely has multiple jobs, plus one that shouldn't be his.

---

## Action Items

| # | Action | Owner | Priority |
|---|--------|-------|----------|
| 1 | Deploy ops.html with Bug 1 fix (race condition) | Shaun/Deploy | High |
| 2 | Test rapid-click behaviour on live site | Shaun | High |
| 3 | Fix SWF-26169 data (change client_name to Digby Veling, set ghl_contact_id) | Soybean/Shaun | High |
| 4 | Review `ghl-proxy` `create_job_for_opportunity` for race condition / stale state | Soybean | High |
| 5 | Check if other jobs have mismatched client_name vs GHL opportunity contact | Soybean | Medium |
