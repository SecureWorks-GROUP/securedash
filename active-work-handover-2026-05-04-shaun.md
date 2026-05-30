---
title: Active Work Handover — Marnin → Shaun (Comprehensive)
date: 2026-05-04
from: Marnin (Cap 1 / job-stages terminal, Marnin's laptop)
to: Shaun (Shaun's laptop)
scope: Live ops fixes shipped + complete Cap 1 lane state + adjacent lanes + saved memory + plan ahead
status: ready for handover
---

# Comprehensive Handover — Marnin → Shaun, 2026-05-04

This handover is intentionally long. It contains everything this terminal knew so Shaun can pick up the Cap 1 lane (and adjacent lanes) without re-deriving context.

Read in this order:
1. **Section 1** — what shipped today (the only thing that mutated production this session).
2. **Section 2** — Cap 1 lane state + the activation sequence for the next protected step.
3. **Section 3** — Cap 1D and Cap 1E plans (next two loops in this lane).
4. **Section 4** — adjacent lanes (T1, T2, T4, T5, T7, T8) — summary + entry points.
5. **Section 5** — saved memory port (12 memory entries from Marnin's laptop).
6. **Sections 6–9** — references, doctrine, smoke tests, outstanding questions.

---

## 1. What just shipped today (live in production right now)

### Bug 1 — Ops kanban "missing jobs"

Two-part fix: backend column-bucketing + frontend preserve list. ~22 jobs that were silently invisible on the kanban now render.

| Layer | Repo | Merge SHA | Deploy state |
|---|---|---|---|
| Backend column-bucketing | secureworks-site | PR #31 → `7becc53` | **Live** — ops-api v349, verify_jwt: false |
| Frontend preserve list (`processing`, `deposit`) | securedash | PR #4 → `5169a71` | **Live** — GH Pages auto-deployed |

**Root cause:** Cap 1A widened the DB-side `.in('status', [...])` filter in `pipeline()` to all 19 active canonical statuses. The column-bucketing object only pre-allocated 8 keys, silently dropping jobs in `partially_accepted, awaiting_deposit, order_materials, awaiting_supplier, order_confirmed, schedule_install, rectification, final_payment, get_review`. Then on per-type kanbans (Fencing/Patio tabs), the `__renderedStagesFor` `preserve` array in ops.html was missing `processing` and `deposit` (despite the comment claiming they were preserved).

**Live impact (Q2 2026-05-03 row counts):**
- fencing: 6 final_payment + 3 awaiting_deposit + 3 order_materials + 1 awaiting_supplier + 1 order_confirmed + 1 rectification + 1 processing = **16 jobs become visible**
- patio: 1 final_payment + 1 awaiting_deposit + 1 order_confirmed + 2 schedule_install + 1 processing = **6 jobs become visible**

**Verify it's working:** reload ops.html → click Fencing tab → scroll to **Final Payment** column → expect ~6 jobs (was 0 yesterday).

### Bug 2 — `daily-digest:1 401`

| Item | State |
|---|---|
| `daily-digest` edge function | **Redeployed v30 with `verify_jwt: false`** to match `ops-api` posture |

**Root cause:** function had `verify_jwt: true`. Frontend at `ops.html:4609` (`loadAiAlerts`) sent only the anon `apikey` header, no user JWT. Supabase's JWT verifier returned 401 before the function ran. `ops-api` is `verify_jwt: false` and worked fine, so the kanban itself was unaffected — only the AI alerts side panel.

**Verify it's working:** reload ops.html → console error `loadAiAlerts error: Error: Digest API error: 401` should disappear → AI alerts panel populates.

---

## 2. Cap 1 lane — current state + activation sequence

### Live in production

| Cap | What | Status |
|---|---|---|
| **Cap 1A** | Canonical state machine (22 statuses) + Pipeline Visibility Guard + per-type validity | LIVE |
| **Cap 1B** | Stage-gate engine (19 gates, 8 families, 3 entry points) + display-only Gate Ledger UX behind `?cap1b=1` flag | LIVE |
| **Cap 1C** | Backend shadow-mode wrapper inside `ops-api updateJobStatus` + observations migration file | **Code merged, table NOT applied, flag NOT flipped — DORMANT** |
| **Cap 1D** | Override Flow + Soft-Block Mode | NOT STARTED — gated on ≥7 days clean Cap 1C shadow observations |
| **Cap 1E** | Selective Hard-Block + JARVIS state awareness + reconciliation + CHECK rebuild | NOT STARTED — gated on Cap 1D |

### Cap 1C activation sequence (the next protected step)

Cap 1C is fully merged (PR #24 `4395fdc`, PR #27 `b858cbd`) but the table doesn't exist yet. To activate:

```bash
# Step 1 — Apply migration to a Supabase branch DB first
mcp__supabase__create_branch  name=cap1c-shadow-mode  confirm_cost_id=<from get_cost>
mcp__supabase__apply_migration  name=state_engine_observations  query=<paste contents of supabase/migrations/20260503000000_state_engine_observations.sql>

# Step 2 — Verify on branch DB (these are SELECTs only)
mcp__supabase__execute_sql  query="SELECT to_regclass('public.state_engine_observations');"        # → 'state_engine_observations'
mcp__supabase__execute_sql  query="SELECT relrowsecurity FROM pg_class WHERE relname='state_engine_observations';"   # → t
mcp__supabase__execute_sql  query="SELECT indexname FROM pg_indexes WHERE tablename='state_engine_observations';"    # → 4 rows (PK + 3 indexes)
mcp__supabase__execute_sql  query="INSERT INTO state_engine_observations (writer_source, engine_verdict) VALUES ('test', 'invalid_xyz');"   # → ERROR (CHECK constraint blocks)

# Step 3 — Apply to production
mcp__supabase__merge_branch  branch_id=<from create_branch result>

# Step 4 — Flip the shadow flag
supabase secrets set STATE_ENGINE_SHADOW=on --project-ref kevgrhcjxspbxgovpmfl
supabase functions deploy ops-api --no-verify-jwt --project-ref kevgrhcjxspbxgovpmfl

# Step 5 — One synthetic transition on a clearly-marked test job
# Expect: 1 row in state_engine_observations, shadow_error IS NULL,
# engine_verdict in (allow|warn|block|overridden), no behavioural change to status writes.

# Step 6 — Soak ≥7 days. Check daily:
mcp__supabase__execute_sql  query="SELECT engine_verdict, count(*) FROM state_engine_observations WHERE observed_at > now() - interval '7 days' GROUP BY engine_verdict ORDER BY count(*) DESC;"
mcp__supabase__execute_sql  query="SELECT count(*) FROM state_engine_observations WHERE engine_verdict='error';"   # should trend to 0
```

**Stop conditions for Step 5:** if `shadow_error IS NOT NULL` on every row → engine import is broken; do NOT continue. If `engine_verdict='error'` rate > 5% → engine port has a bug; do NOT continue. If a real status write is rejected because of the wrapper → the wrapper is no longer a no-op; revert immediately (`STATE_ENGINE_SHADOW=off` + redeploy).

**DO NOT flip the flag without applying the migration first.** The wrapper handles a missing table gracefully (try/catch swallows insert errors, transition still proceeds), but you'd just be writing console noise.

---

## 3. Cap 1D + Cap 1E plans (next two loops)

These come from the controlling roadmap at `~/.claude/plans/graceful-growing-puppy.md` and `secureworks-docs/cio/operations/2026-05-01-cap1-stage-gate-autonomous-roadmap.md`. Quoted in summary form here so Shaun doesn't need to open them on day 1.

### Cap 1D — Override Flow + Soft-Block Mode

**Goal:** Real override mechanism live. Engine soft-blocks on configured gates with operator-facing override path. Marnin/Shaun can force-proceed with reason capture; every override leaves a complete audit trail. **No hard-block yet.**

**What ships:**
- **Override capture model:**
  - `business_events.event_type='gate.overridden'` row (audit trail) — written every override.
  - `job_context.kind='gate_override'` row (active state) — `value: { gate_id, stage_from, stage_to, reason_category, reason_free_text, by, by_role, risk_level, until? }`. **No automatic expiry by default** per Marnin governance.
  - Telegram alert to Marnin/Shaun group on every override (deliberate notification, not silent).
- **Force-proceed UX in ops.html:**
  - Button on cards where engine returns `block` or `legal-with-override`.
  - Modal captures: free-text reason ≥ 12 chars, category dropdown, evidence URL/note (optional), operator identity from JWT.
  - **Cap 1 v1 role allow-list: Marnin/Shaun only.** Other operators see a read-only "request override from Marnin/Shaun" prompt.
- **Default override categories:** `verbal_confirmation, low_value_po, bank_confirmed_deposit, supplier_known_ok, urgent_business_need, reopen_cancelled, multi_neighbour_handling, other`.
- **Soft-block mode in ops-api `transition_state`:**
  - For configured gates: engine returns `block` → write is rejected unless `override` is supplied with valid role + reason.
  - For non-configured gates: shadow mode continues (write succeeds, observation recorded).
  - Per-gate config in canonical source (`enforcement_tier: 'shadow' | 'soft_block' | 'hard_block'`). Cap 1D ships every soft-block-eligible gate at `'soft_block'`; Cap 1E selectively promotes to `'hard_block'`.
- **Override audit page in Secure Ops:** every override last 30 days, filterable by operator/category/job. Linked from each job card.
- **Daily-digest section:** "engine-discordant transitions in last 24h" — observations + overrides surfaced.
- **Engine result enrichment:** `override_options[]` lists which gates can be overridden by which roles, with reason-category requirements, so the UI can render the modal correctly.

**Files likely touched:**
- `secureworks-site/supabase/functions/ops-api/index.ts` (`transition_state` handler — soft-block branch)
- `securedash/ops.html` job detail + kanban card (force-proceed button + modal + lock-icon override badge)
- `securedash/modules/sw-overrides.js` (NEW — modal logic)
- `secureworks-site/supabase/functions/daily-digest/index.ts` (engine-discordant section)
- `secureworks-agent/src/mcp-server.ts` (`sw_list_pending_overrides` new tool)

**Tests to land:**
- Modal cannot submit without category + reason (≥ 12 chars).
- Override writes BOTH `business_events.gate.overridden` AND `job_context.kind='gate_override'` atomically.
- Hard-locked gates (e.g. `revision_present`, `accepted_at`, type-violations) cannot be overridden — modal does not appear.
- Soft gates display the override modal with correct allowed reason categories.
- Marnin/Shaun JWT roles can submit; other operator roles see read-only prompt.
- Telegram alert delivered on every override (verified by deliberate trigger in test mode).
- Synthetic test: override on a fixture job → re-evaluating gates returns the override-satisfied result; engine result includes the override in `current override flags` list.

**QA gate:** Marnin/Shaun walk through one end-to-end override on a safe synthetic job. CIO checks override cannot become a silent bypass (every soft-block override surfaces in alert + audit page). CIO reviews soft-block enforcement-tier list per gate before activation.

**Stop conditions:**
- `job_context` write path proves unreliable (Cap 1A's prod-verification SQL Q4 must clear before this loop — Q4a/b done, prod confirmed `job_context` is live with 3 kinds populated).
- Override UI encourages too-easy bypass (Marnin/Shaun feedback during walkthrough).
- A real operator gets blocked by soft-block without an override path — revert that gate's enforcement-tier to shadow.

**Rollback:**
- Per-gate `enforcement_tier` flag flip to `shadow` reverts soft-block on that gate.
- Hide override button via CSS.
- Audit data already written is harmless.

### Cap 1E — Hard-Block Graduation + JARVIS State Awareness + Reconciliation

**Goal:** Selected high-confidence transitions become enforced. JARVIS reads stage/gates and surfaces blockers, next actions, and override reliance. Legacy status data reconciled. CHECK constraint rebuilt to match canonical model — **one-way door, Marnin-approved.**

**What ships:**

*Hard-block graduation (per-transition flags):*
- Per-transition `enforcement_tier` flips from `soft_block` to `hard_block` based on ≥14 days clean soft-block evidence + Marnin sign-off per transition.
- Recommended initial promotion order:
  1. Status mapping / type validity gates (already structurally hard-locked — formalise enforcement).
  2. Illegal-jump rejection (e.g. `complete → draft`).
  3. `draft → quoted` requires released quote evidence (`revision.sent_at IS NOT NULL`).
  4. `quoted → accepted` requires `document.accepted_at IS NOT NULL`.
  5. `accepted → awaiting_deposit` requires acceptance evidence.
  6. `awaiting_deposit → order_materials` requires deposit cash truth (or override).

*JARVIS state awareness (read-only):*
- New MCP tools registered:
  - `sw_get_stage_gates(job_id)` — returns full `StageGateResult`.
  - `sw_check_state_transition(job_id, target_status, override?)` — read-only gate evaluation.
  - `sw_transition_state(job_id, target_status, override?, reason?)` — execute (chokepointed via ops-api, approval-gated; **JARVIS cannot call this autonomously in Cap 1**).
  - `sw_list_jobs_in_state(state, type?, include_overrides?)` — supports `state='status_mapping_gap'` for diagnostic queries.
- JARVIS chat output for any job-touching response includes:
  - Current stage + `jarvis_posture`.
  - Top blockers (≤3) with reason and evidence ref.
  - Suggested next action with owner.
  - **Explicit "this job has an active override on gate X (reason: …)"** when any `gate_override` row applies.
- JARVIS prompts updated so the assistant proposes/explains/drafts but never calls `sw_transition_state` autonomously.
- Tied to T5 `assembleJobBrain` so JARVIS reads are evidence-grounded.

*Data reconciliation (one-time SQL pass):*
- Map every `status` value to canonical; flag unmapped jobs to `Status Mapping Gap` (already happens) and either correct with reason or capture as override.
- 7 fencing + 1 patio `final_payment` rows → migrate to `invoiced` if Marnin confirms `invoiced` is operational closeout, else migrate to `complete` + `job_context.kind='final_invoice_pending'` flag.
- 1 fencing `rectification` row → migrate to `job_context.kind='rectification'` flag, reset underlying status to whatever it was before.
- 3 patio `processing` rows → bucket into the appropriate substage based on PO state at migration time.
- Jobs in `scheduled` without crew, `complete` without invoice, `quoted` without quote_revision → flag, then correct or capture as override with reason.
- `lost` → `cancelled` consolidation: `lost` rows get `job_context.kind='lifecycle_reason'` flag.
- **CHECK constraint rebuild:** drops drift between migration-tree (10 values) and prod CHECK (22 values, verified by Q1 today). Final CHECK matches canonical `STATUSES` set.
- **Pre-migration snapshot taken;** rollback requires snapshot restore.
- `validate_job_status_and_type` trigger function created (per Phase C spec) enforcing per-type rules and the legality graph.

**QA gates:**
- Per-transition Marnin sign-off before promotion to hard-block.
- CIO reviews 14-day soft-block evidence per gate.
- **Marnin explicit approval before CHECK rebuild migration runs (one-way door).**
- First production hard-block transition watched live with Marnin/Shaun on call.
- Per-PR Marnin gate for the JARVIS prompt + MCP tool changes.

**Rollback:**
- Per-transition flag flip to `soft_block`.
- Disable individual MCP state-machine tools.
- CHECK rebuild and data reconciliation: snapshot restore (named one-way door).

---

## 4. The 9 direct status writers (Cap 1D / 1E migration order)

Cap 1A audit found 14 writers that mutate `jobs.status`. Only 1 is the chokepoint (`ops-api updateJobStatus`). The other 9 (after dedup) bypass it. Cap 1C ships shadow-mode observation only — **no writer is migrated yet**. Cap 1D / 1E migrate them in this order (lowest-risk first):

| # | Writer | File:line | Statuses written | Notes |
|---|---|---|---|---|
| 1 | `reporting-api/salesQuickAction archive` | `reporting-api/index.ts:3690` | `cancelled` | Lowest traffic, terminal-only. **Template patch already drafted at `cio/evidence/cap1c-shadow-mode-2026-05-02/writer-migration-template-reporting-api.md`** — this is the proof-of-pattern. |
| 2 | `reporting-api/salesQuickAction mark_lost` | `reporting-api/index.ts:3721` | `lost` (or `cancelled` post-Phase-C) | Same shape as #1 |
| 3 | `ghl-proxy` (complete via GHL) | `ghl-proxy/index.ts:1065` | `complete` | Treat GHL as transition-period sales mirror only — Supabase wins post-acceptance |
| 4 | `xero-sync` (invoice paid → complete) | `xero-sync/index.ts:571` | `complete` | **Pair with `invoiced` writer wiring** — Cap 1A audit found `invoiced` has zero writers (Q6 confirmed 0 prod rows). Decision: wire xero-sync to write `complete → invoiced` on first ACCREC issue, OR retire `invoiced` from canonical. |
| 5 | `ghl-webhook` (form submission) | `ghl-webhook/index.ts:493` | `draft` | New-lead path. Test end-to-end after migration. |
| 6 | `ghl-webhook` (stage change) | `ghl-webhook/index.ts:42-76` | maps 24 GHL stages → 5 canonical | Same treatment as #5 |
| 7 | `ghl-proxy` (legacy paths) | `ghl-proxy/index.ts:846, 1089, 2730` | `complete` and others | Remaining ghl-proxy writers |
| 8 | `send-quote` (5 writers — most complex) | `send-quote/index.ts:539, 948, 1385, 1405, 1714` | `quoted, accepted, partially_accepted, lost, quoted` | **Multi-neighbour all-or-nothing rule must be preserved.** Most complex migration. |
| 9 | MCP `sw_update_job_status` | `secureworks-agent/src/mcp-server.ts:1612-1618` | passes through | Already chokepointed; rename to `sw_transition_state` in Cap 1D for override semantics |

**Auto-advance side effect to watch:** `ops-api/index.ts:4711-4714` (`createAssignment`) auto-flips `accepted → processing` when crew assigned. This is a stealth direct writer inside ops-api itself. Cap 1C's wrapper does NOT cover it. Cap 1D/1E must route this through `transition_state` so the auto-advance is gated.

**Per-writer migration checklist** (apply to each):
- Replace `sb.from('jobs').update({ status })` with HTTP fetch to ops-api `update_job_status`.
- Pass `source` identifier matching the writer name (e.g. `reporting_api_archive, ghl_webhook_form, xero_sync_paid_invoice`).
- Pass `correlation_id` (use job_id or upstream correlation if available).
- Preserve existing `job_events` / `business_events` writes (separate audit trail).
- Synthetic probe before/after: trigger the writer's normal path, verify identical job state.
- Verify `state_engine_observations` row appears with correct `writer_source`.

---

## 5. Adjacent lanes (T1, T2, T4, T5, T7, T8) — entry points

These lanes run in parallel terminals. Status as of CIO command-room-brief (last updated 2026-05-03).

### T1 — Cap 0 / Quote Revision / Job Release Packet

- Day 2 closed via PR #14 (`172becd`). `ops-api` v324, `send-quote` v93 live, both `verify_jwt: false`.
- Three slices live: Quick Quote race-safety + revision recording + private `release-manifests` bucket.
- Synthetic probe Q-Q-1 PASS (manifest stored, hash verified, privacy posture confirmed).
- All three release paths now produce real manifest URLs.
- **Next:** 72h passive soak watch (~2026-05-03 11:00 UTC — should be done now). Then `sw_get_release_packet` MCP wire-up in `secureworks-agent`.
- **Entry point:** `secureworks-docs/cio/evidence/cap-0/quote-revision-minimal-2026-04-30/README.md`

### T2 — MCP Assurance

- Iteration 3 prep — design-hole closure shipped as PR #20 (B.1.t telegram allowlist + B.6 initiate_call existence gate).
- 27/27 smoke + MCP assurance harness green.
- MCP drift check fires on 1 intentional new finding (`sw_initiate_call::contact::contactId`) — needs Marnin to regenerate baseline (`UPDATE_BASELINE=1`).
- P0 I5 17/19. CI still warn-only.
- **Next:** Marnin to (1) regenerate drift baseline + push to unblock PR #20 CI; (2) run live curl probes against `ops-api` v324 with `SW_API_KEY` to confirm Bilal/Cohen rejection is deployed; (3) provide `TELEGRAM_ALLOWED_CHAT_IDS` values; (4) authorize Iteration 3 deploy bundle.
- **Entry point:** `secureworks-docs/cio/evidence/mcp-assurance-iteration-2/README.md`

### T4 — Secure Sale

- Live `sale.html` proves the read layer in browser: GHL fencing + patio opportunities and Supabase jobs render together.
- **This is a queue, not the finished product.** Marnin clarified 2026-05-03 in ADR `decisions/2026-05-03-secure-sale-jarvis-manual-approval-loop.md`:
  ```
  Secure Sale must be a JARVIS-powered manual approval cockpit:
    GHL/Supabase event → JARVIS reads context → JARVIS writes proposed action
    → sale.html shows proposal → salesperson Approves / Edits / Rejects / Snoozes
    → approved action executes through backend
    → audit + business_events + evidence + extraction + job_context update
    → JARVIS uses memory on next loop
  ```
- **Do NOT** ship `sale.html` as "done" if it's only a live read queue. Do NOT ship customer-facing auto-send from the sales loop.
- **Next:** Build the JARVIS proposal loop and approval surface: proposed action cards with `Approve & Send`, `Edit`, `Reject`, `Snooze`; wire approved actions into audit/evidence/business_events/memory.
- **Entry point:** `secureworks-docs/cio/evidence/secure-sale-cockpit-2026-04-30/README.md`

### T5 — JARVIS Memory / Evidence Spine

- Iteration 1 (Job Dossier Assembler V1) live verified 2026-05-01.
- Site PRs #15/#16/#17 + agent PR #21 merged + deployed.
- 9/9 verification gates passed.
- `job_context` authenticated SELECT policy applied (`authenticated_read_org_job_context`).
- Iteration 2 (Raw Evidence Audit) complete (read-only). Source matrix + gap split filed as `T5-DEVQ-8`.
- **Next:** Iteration 3 — async extraction queue + Railway worker shell. Stop-before-migration-apply rule still in force. M4 transcripts blocked on privacy/consent.
- **Entry point:** `secureworks-docs/cio/evidence/t5-iteration-1-2026-05-01/README.md`

### T7 — Evidence Capture Spine

- Active in another terminal. Has WIP for `evidence_health`, `evidence_body`, `record_evidence`.
- Uncommitted on Marnin's laptop in stash form (won't follow to Shaun's laptop).
- 7 draft migrations queued in `_drafts/`: `20260502000001_t7_spine_envelope.sql`, `_v_unresolved_evidence`, `_monitored_mailboxes`, `_agent_audit_log`, `_spine_backref`, `_evidence_storage_buckets`, `_v_evidence_health.sql`.
- **Entry point:** `secureworks-docs/cio/operations/2026-05-01-t5-conversation-transcript-job-brain-roadmap.md`

### T8 — Sales performance attribution

- Proposed/starting. Owns GHL, Google Ads, and sales metrics visibility.
- Edge functions present: `google-ads-ingest, attribution-backfill, ghl-call-data, ghl-conversation-stats, transcribe-call, followup-signal-sync`.
- **Entry point:** to be created.

### Sale UX production skin

- Active/supporting. Must not overwrite existing production file without audit.
- **Don't:** edit `sale.html` from this terminal without coordinating with the UX terminal.

---

## 6. Saved memory port (12 entries from Marnin's laptop)

Auto-memories at `~/.claude/projects/-Users-marninstobbe-Projects/memory/MEMORY.md` on Marnin's laptop. **These do NOT auto-transfer to Shaun's laptop.** Below is the durable content so Shaun's session has the same governance + feedback context.

### Memory 1: Supabase is operational truth; GHL is comms/mobile mirror only

Operational truth lives in Supabase: `jobs, business_events, purchase_orders, work_orders, job_assignments, job_context, xero_invoices, quote_revisions`. GHL is a communications layer + mobile-app convenience + transition-period sales/status mirror.

- **After acceptance/deposit, GHL must NOT drive operational job stages.**
- When Supabase and GHL disagree, Supabase wins.
- Sales-side stages (pre-accept) may continue to flow GHL → Supabase as a mirror during the transition period.
- Old direct GHL writers (`ghl-proxy/index.ts:1065, 1090`, `ghl-webhook/index.ts:42-76, 493`) should be retired or routed through ops-api.
- **Never** recommend a design that gives GHL authority over post-acceptance operational stages.

### Memory 2: Methodology — large autonomous Claude Code loops with QA gates

Old T-Build (40m planner) + T-Verify (50m adversary) cadence retired 2026-05-01. Replaced by single large autonomous loops.

Inside a loop, agent: inspects code/docs, makes scoped changes, writes tests, runs locally, writes evidence packets, creates PRs/commits if approved, prepares deploy packets.

**Loop stops only on named live-effect gates:**
- production deploy without upfront approval
- irreversible production migration (esp. CHECK constraint changes)
- real customer send / external mutation
- core product decision blocking implementation
- tests fail beyond scope-bounded repair
- a job could disappear from live ops surface

End-of-loop output: files changed, tests run, what's live vs local, risks, rollback, next-loop prompt.

### Memory 3: Cap 1 governance — Marnin decisions 2026-05-01

**Sales / Ops boundary:**
- Sales hands over when **deposit cash truth is confirmed** (not on accept alone).
- "Accepted" usually means "client accepted, now awaiting deposit" — state model must not pretend ops work is green just because quote accepted.

**Gate rules:**
- **Never order materials before deposit truth**, except where Marnin/Shaun explicitly override because bank deposit is confirmed outside Xero.
- **Patio council/approvals only block where approval is actually required.** Otherwise mark `not_applicable`, NOT `failed`.
- Scheduling needs materials logistics plan (delivered / picked up / explicit).
- Calendar can hold placeholders, but confirmed scheduling needs assigned trade confirmation + ops gate checks.
- Client/access confirmation usually a warning, not blocker — unless job needs it.

**Multi-neighbour fencing:**
- All-or-nothing at the job/scheduling level.
- Complex shared fences split into smaller neighbour-pair jobs.
- `partially_accepted` until every party confirms; party declines → revert to `quoted` with revised scope OR `cancelled`.
- "shared_fence_all_parties_required" rule is canonical.

**Invoicing / completion:**
- `invoiced` = "final invoice issued / awaiting final payment" — operational closeout stage.
- Completion needs client/trade sign-off shape.
- Multi-neighbour completion/invoice/review is its own complexity.

**Cap 1 override discipline:**
- **Cap 1 v1 overrides are Marnin/Shaun only.** No widening to Khairo/Tinnes/Nithin.
- Reason category AND free-text reason both mandatory.
- **No automatic expiry by default** (earlier 7-day default rejected by Marnin).
- **JARVIS must always mention when a gate/state relied on an override.**

**JARVIS posture in Cap 1:**
- May explain stages/gates and propose stage moves or next actions.
- May draft supplier/client/trade messages based on blocked gates, provided evidence + gates accurate AND action remains approval-gated.
- **Must NOT move stages automatically in Cap 1.** Auto-transition reserved for post-Cap-1.

### Memory 4: Pipeline visibility guard — never filter out unmapped statuses

Ops dashboards must never drop jobs when backend status drifts from frontend bucket map. Unmapped statuses render in a visible "Status mapping gap" bucket with `confidence='low'` and a `next_action='Update backend/frontend status map'`.

- Maintain explicit backend-status → frontend-bucket map.
- Preserve `source_status, normalized_status, frontend_bucket` in any per-job result.
- Add `status_mapped_for_pipeline` check (severity warning if mapped to fallback, blocker if unmapped).
- Test fixtures must include at least one mapping mismatch (e.g. `order_materials, schedule_install`) and one unknown future status (e.g. `waiting_on_new_stage`). Both must remain visible.
- Document the current map with the line "unmapped statuses are visible, never filtered out".

Apply to: securedash ops.html, sale-preview, readiness-preview, future Shaun board, Trade view, any future pipeline surface.

**Known backend statuses to seed the map with (per Marnin 2026-05-01):** `draft, quoted, accepted, partially_accepted, approvals, deposit, processing, scheduled, in_progress, complete, invoiced, cancelled, lost, awaiting_deposit, order_materials, awaiting_supplier, order_confirmed, schedule_install, rectification, final_payment, get_review, archived` — 22 values matching prod CHECK exactly.

### Memory 5: MCP recipient verification must fail closed when no anchor

No anchor + external recipient → reject before delivery. Never fall through to schema-only protection.

### Memory 6: JARVIS Job Brain checkpoint (architecture)

**Core model:**
- Grounding layer = operational truth + raw evidence.
- `business_events` is the primary event spine.
- `job_context` = semantic extracted facts with provenance/safety.
- `ai_proposed_actions` = action cockpit.
- `ai_reasoning_traces` / `ai_feedback_outcomes` = reasoning and feedback, not truth.
- JARVIS assembles a fresh working job brain on demand before each smart loop/action.
- Smart loops apply procedural memory/playbooks and gates, then log reasoning/actions/outcomes.
- Staff notes/corrections enter evidence first; useful durable facts promote into `job_context`.
- Secure Sale should use the same shared job brain/context contract, not a separate sales brain.

**Known gaps:**
- unified watcher audit
- broader fact extractors beyond supplier_delay
- staff note → business_events payload → job_context path
- Layer 7 job_id linkage for reasoning/feedback
- shared reader contract for Secure Sale and Railway JARVIS

Reference: `secureworks-docs/cio/evidence/context-loop-v1/jarvis-job-brain-architecture-checkpoint-2026-04-30/README.md`

### Memory 7: Blanket auth doesn't override specific security boundaries

When Marnin gives broad permission ("you have it all", "deploy it all"), security hooks STILL hold the line on specific actions:

**Always require specific per-action authorization for:**
- Drift baseline regeneration (`UPDATE_BASELINE=1` / `REGRESSION_EVAL_OVERRIDE=1`)
- Pulling live production secrets into the transcript (`railway variables`, `supabase secrets list`)
- Querying production DB for PII to populate prod config (e.g., harvesting telegram chat_ids)
- Repeated production deploy preparation after one deploy already happened
- Reading `.env` files even with broad "search my Mac" auth
- Live customer-facing actions (SMS, email, calls, invoices)

**Pattern that works:** do the safe work, document what's blocked, ask for the specific authorization phrase the hook is waiting for. If a hook blocks an action, do NOT try variations to work around — the hook's reasoning IS the right answer.

### Memory 8: Present policy drafts; don't implement safety changes without approval

When MCP / send / customer-facing safety work surfaces a missing policy, draft as markdown under `secureworks-docs/cio/evidence/<batch>/policy-draft-<tool>.md`. Do NOT implement until Marnin approves.

Always include explicit "Decision needed from Marnin" section with 2-4 options. Do not auto-merge or auto-deploy after drafting.

### Memory 9: Data layer first when Marnin says "make the sales hub useful"

When Marnin asks to "make the sales hub useful" or improve sale.html, **default scope is data-layer work** (pulling real GHL + Supabase signals into a unified shape), NOT UI polish.

Hard boundary, Marnin's words: "If your next edit is cosmetic, stop. The task is data layer first."

Two-loop model:
- Booking loop via GHL (pre-quote)
- Follow-up loop via Supabase jobs (post-quote)

Use existing read endpoints first (`cloud.ghl.*`, `ghl-proxy` actions). Only add a new read-only endpoint if a needed one is missing — never add writes.

### Memory 10: MCP assurance session log 2026-05-01

Pointer to consolidated session log + policy drafts + PR list for the MCP roadmap completed 2026-05-01.

Reference: `secureworks-docs/cio/evidence/mcp-assurance-batch-a/`

### Memory 11: MCP functional verification pack 2026-05-02

Second MCP workstream: per-tool target states (1-6), canary designs, send-po-email policy implementation, and Shape A design for sw_send_quote.

Reference: relevant pack under `cio/evidence/mcp-functional-verification-2026-05-02/` (verify path on Shaun's laptop — exact filename may vary).

### Memory 12: Current build board checkpoint 2026-04-30

Doctrine:
- JARVIS assembles a working job brain on demand.
- Operational truth + raw evidence ground the system.
- `job_context` stores promoted semantic facts with provenance.
- Smart loops produce proposed actions, then reasoning/actions/outcomes/staff corrections write back as evidence.
- Secure Sale, Railway JARVIS, debt, scheduling, supplier chasing, finance should share one Job Brain Reader contract with loop-specific playbooks.
- **No permanent AI-opinion blob is truth.**

Production boundary as of 2026-04-30: GitHub main was ahead of production. (Now reduced — many deploys completed since.)

---

## 7. Reference: file paths Shaun will need

| Need | Path |
|---|---|
| **Plan documents** | |
| Cap 1 5-loop plan (controlling frame) | `~/.claude/plans/graceful-growing-puppy.md` (also referenced by `secureworks-docs/cio/operations/2026-05-01-cap1-stage-gate-autonomous-roadmap.md`) |
| Cap 0 / Cap 1 understanding brief | `secureworks-docs/cio/operations/2026-05-01-cap0-cap1-stage-gate-understanding.md` |
| Cap 1 stage-gate contract | `secureworks-docs/operations/cap-1-stage-gate-contract.md` |
| Phase C jobs.status spec | `secureworks-docs/operations/phase-c-jobs-status-spec.md` |
| **Engine + state machine source** | |
| Stage-gate engine (TS, Deno) | `secureworks-site/supabase/functions/_shared/stage-gate/engine.ts` (1132 lines) |
| Canonical state machine (TS) | `secureworks-site/supabase/functions/_shared/stage-gate/job-state-machine.ts` |
| Engine Deno tests | `secureworks-site/supabase/functions/_shared/stage-gate/engine_test.ts` (16 tests, run via `deno test --no-check --allow-env --allow-read`) |
| Browser mirror of state machine | `securedash/modules/sw-state-machine.js` |
| Browser stage-gate engine | `securedash/modules/ops-stage-gate-engine.js` |
| Browser fixtures (Cap 1B 25 fixtures) | `securedash/modules/ops-stage-gate-fixtures.js` |
| Browser test harness | `securedash/modules/ops-stage-gate-engine.test.html` (live at `https://secureworks-group.github.io/securedash/modules/ops-stage-gate-engine.test.html`) |
| **Cap 1 evidence packets** | |
| Cap 1A audit | `secureworks-docs/cio/evidence/cap1-stage-engine-audit-2026-05-01/` (6 files: README, writer-inventory, hardcoded-list-inventory, before-after-diffs, manual-qa-checklist, prod-verification-sql) |
| Cap 1B engine evidence | `secureworks-docs/cio/evidence/cap1b-stage-gate-engine-2026-05-02/` |
| Cap 1C shadow-mode evidence | `secureworks-docs/cio/evidence/cap1c-shadow-mode-2026-05-02/` (README + writer-migration-template) |
| Cap 1C sub-ADR (table-vs-event choice) | `secureworks-docs/decisions/2026-05-02-cap1c-observations-surface.md` |
| **CIO operating layer** | |
| Front door | `secureworks-docs/CLAUDE.md` |
| Command-room brief | `secureworks-docs/cio/command-room-brief.md` |
| Operating map | `secureworks-docs/OPERATING-MAP.md` |
| Context map (vocabulary) | `secureworks-docs/CONTEXT-MAP.md` |
| Domain map | `secureworks-docs/cio/domain-map.md` |
| Devqueue (parked work + tickets) | `secureworks-docs/operations/devqueue.md` |
| Evidence index | `secureworks-docs/cio/evidence/README.md` |
| ADR — CIO control plane + update protocol | `secureworks-docs/decisions/2026-05-02-cio-control-plane-and-update-protocol.md` |
| ADR — Secure Sale JARVIS manual approval loop | `secureworks-docs/decisions/2026-05-03-secure-sale-jarvis-manual-approval-loop.md` |
| ADR — Notion retired | `secureworks-docs/decisions/2026-04-23-no-notion.md` |
| **Code repos** | |
| Edge functions | `secureworks-site/supabase/functions/` |
| Operational dashboards | `securedash/` (`ceo.html, ops.html, trade.html, sale.html`) |
| JARVIS agent (Railway) | `secureworks-agent/` |
| Sale dashboard (sale.html) | `secureworks-sale/` |
| Patio scoping tool | `patio-tool/` |
| Fence scoping tool | `fence-designer/` |
| Marketing website | `secureworks-website/` |

---

## 8. Marnin governance constraints (carry forward — non-negotiable)

These are the rules that survived Cap 1 design 2026-05-01:

- **Supabase is operational truth.** GHL is comms/mobile/transition-period sales mirror.
- **Sales hands over at deposit cash truth confirmed**, not on accept alone.
- **Never order materials before deposit truth**, except Marnin/Shaun bank-confirmed override.
- **Patio approvals gate is conditional**: marks `not_applicable` when no approval required, NOT `failed`.
- **Multi-neighbour fencing is all-or-nothing** at the job/scheduling level.
- **Cap 1 v1 overrides: Marnin/Shaun only.** Reason category + free-text required. **No automatic expiry by default.**
- **JARVIS in Cap 1**: explain / propose / draft only. **Never moves stages automatically.** Must always mention when it relied on an override.
- **Pipeline Visibility Invariant**: jobs never disappear due to status drift. Unknown/unmapped statuses render in a visible `status_mapping_gap` bucket with `confidence='low'`.
- **Email routing**: PO/supplier via `sw_send_po_email` (orders@secureworksgroup.app), client via `sw_send_email`. **Never Gmail.**
- **Comms tone**: no em dashes in any outbound text (SMS, email, client copy). AI giveaway. Business name is "SecureWorks Group", never "SecureWorks WA" (old name).
- **Blanket auth doesn't override specific boundaries**: per-action explicit phrases required for protected actions (drift baseline regen, secret pulls, PII harvesting, etc).

---

## 9. Don't do (without explicit Marnin sign-off)

- Don't flip `STATE_ENGINE_SHADOW=on` until the migration has been applied to a branch DB and verified.
- Don't migrate the 9 direct status writers — Cap 1D-era ticket gated on ≥7 days clean shadow evidence.
- Don't start Cap 1D until ≥7 days of clean Cap 1C shadow observations.
- Don't start Cap 1E until ≥14 days clean soft-block evidence per gate + Marnin sign-off per transition.
- Don't run a real customer/job status mutation as a probe — use a dedicated synthetic test job.
- Don't bypass the deposit-truth boundary in writer migrations (sales/ops handover rule).
- Don't touch GHL/Xero writers without auditing the chase that follows.
- Don't ship `sale.html` as "done" if it's only a live read queue (Marnin's correction 2026-05-03).
- Don't auto-expire overrides by default in Cap 1D (Marnin governance rejected default expiry).
- Don't widen Cap 1 v1 override role allow-list beyond Marnin/Shaun.
- Don't enable JARVIS auto-transitions in Cap 1.
- Don't rebuild the CHECK constraint without explicit Marnin one-way-door approval (Cap 1E).

---

## 10. Smoke test checklist (run on Shaun's laptop or browser after pulling)

```bash
# 1. Verify ops-api v349 deployed
mcp__supabase__list_edge_functions
# Look for: ops-api version >= 349, daily-digest version >= 30

# 2. Verify GH Pages has frontend fix
curl -s https://secureworks-group.github.io/securedash/ops.html | grep -c "'processing', 'deposit'"
# Should output: 1

# 3. Visual: open ops.html, click Fencing tab, scroll to Final Payment column.
# Expect: ~6 jobs visible (was 0 yesterday).

# 4. Visual: open browser console on ops.html. No "Digest API error: 401".

# 5. Verify Cap 1B harness still passes
# Open: https://secureworks-group.github.io/securedash/modules/ops-stage-gate-engine.test.html
# Expect: 25/25 ✓ green banner

# 6. Verify Cap 1A canonical state machine harness
# Open: https://secureworks-group.github.io/securedash/modules/sw-state-machine.test.html
# Expect: all green
```

If any of these fail → don't continue with Cap 1C activation; investigate first.

---

## 11. Outstanding questions (none blocking — for Cap 1A.1 sweep + Cap 1E reconciliation)

- **Cap 1A.1 SQL queue:** Q3, Q5, Q6, Q7, Q8 still unrun (sandbox-blocked or doc bug). Q1, Q2, Q4a/b, Q9, Q10 ran; Q10 confirmed canonical map complete. Path: `cio/evidence/cap1-stage-engine-audit-2026-05-01/prod-verification-sql.md`.
- **Q5 SQL bug:** has a `uuid = text` mismatch — needs `j.id::text` cast OR query rewrite. Doc bug, not data bug. Fix during the Q3-Q8 read-only sweep.
- **`processing` status:** 2 live jobs (1 fencing, 1 patio). Cap 1E reconciliation should decide whether to migrate them to a real canonical substage or keep `processing` as a transient state.
- **`deposit` status:** 0 rows. Decide if `deposit` should be retired in favour of `awaiting_deposit + xero_invoice.status='paid'` derivation.
- **`invoiced` status:** 0 writers in code, 0 rows in prod (Q6 unrun but Q2 confirms). Cap 1E reconciliation should either wire `xero-sync` to write it OR retire it as a derived view.
- **`final_payment` status:** 6 fencing + 1 patio rows. Cap 1E reconciliation should migrate these to either `invoiced` (if kept) or `complete` + `job_context.kind='final_invoice_pending'` flag.
- **`rectification` status:** 1 fencing row. Cap 1E reconciliation should migrate to `job_context.kind='rectification'` flag, reset underlying status to whatever it was before.
- **`combo, renovation, insurance, roofing, miscellaneous, general` types:** prod CHECK admits 9 types. Cap 1B engine treats decking-as-patio + quick_quote, maps unknown types to `confidence='low'`. Worth tracking for Cap 1E reconciliation.

---

## 12. Marnin's laptop local state (for completeness)

These artefacts live on Marnin's laptop and may not auto-transfer:

| Branch / file | What | Action needed |
|---|---|---|
| `cap1c-shadow-mode-importfix` (`b58418e`) | Original import-fix that turned out to already be on main via PR #24's merge. | **Stale — can be deleted.** No action. |
| `cap1c-promote-observations-migration` | Migration promote — already merged as PR #27. | Already merged. |
| `fix-ops-pipeline-column-bucketing` | Bug 1 backend fix — already merged as PR #31. | Already merged. |
| Stash list (~3 entries on site repo) | T7 evidence-health WIP. Different lane. | Marnin should restore on his next session, or transfer to Shaun if T7 work continues here. |
| `~/.claude/plans/graceful-growing-puppy.md` | Cap 1 5-loop roadmap. | Read on Shaun's laptop too — it's portable. |
| Session JSONL transcript | Full conversation history this session | `/Users/marninstobbe/.claude/projects/-Users-marninstobbe-Projects/e958b7ac-7829-4271-a588-8daaa088ebc6.jsonl` (Marnin's laptop only) — useful for "why did we decide X" archaeology. |

---

## 13. PR build-up history (chronology)

| PR | Repo | What | Date |
|---|---|---|---|
| #19 | secureworks-site | Cap 1A: canonical state-machine TS source + daily-digest typo fix (`825c161`) | ~2026-05-02 |
| #21 | secureworks-site | cap0-v2: Loop 2 / P1 — patio + fence + quick_quote adapters (`c8f657d`) | ~2026-05-02 |
| #22 | secureworks-site | send-po-email: server-side recipient verification (FV Loop 3) (`9117c9d`) | ~2026-05-02 |
| #23 | secureworks-site | cap0-v2: Loop 3 / P2 — V2 write path in soft-warn mode + migration applied (`3d61cc1`) | ~2026-05-02 |
| #25 | secureworks-site | cap0-v2: persist V2 manifest_canonical_text to bucket [Loop 3 / P2.8] (`5d1d0f2`) | ~2026-05-02 |
| #26 | secureworks-site | revert cap0-v2: remove Cap 1C contamination from PR #25 (`86a0d64`) | ~2026-05-02 |
| #8 | secureworks-docs | Cap 1A stage-gate contract + audit evidence packet (`14e31df`) | ~2026-05-02 |
| #9 | secureworks-docs | Cap 1B stage-gate engine evidence packet (`0e12175`) | 2026-05-02 |
| #3 | securedash | Cap 1B stage-gate engine deploy (`2076eda`) | 2026-05-02 |
| #10 | secureworks-docs | Cap 1C shadow-mode evidence packet + sub-ADR (`2d38e77`) | 2026-05-03 |
| #24 | secureworks-site | Cap 1C backend shadow-mode wrapper + engine port + observations draft (`4395fdc`) | 2026-05-03 |
| #27 | secureworks-site | Cap 1C promote state_engine_observations migration draft (`b858cbd`) | 2026-05-03 |
| #29 | secureworks-site | Sale: add manual dispatch canary endpoint (`9756e62`) | 2026-05-03 |
| **#31** | secureworks-site | **Bug 1: Pipeline kanban column-bucketing widening (`7becc53`) — TODAY** | 2026-05-04 |
| **#4** | securedash | **Bug 1: ops.html preserve list widening (`5169a71`) — TODAY** | 2026-05-04 |

Plus the daily-digest redeploy (no PR — just a `--no-verify-jwt` flag flip on the existing function).

---

## 14. The 19 gate definitions (Cap 1B engine reference)

For reference when designing Cap 1D enforcement-tier per gate. Full source: `secureworks-site/supabase/functions/_shared/stage-gate/engine.ts`.

Gates by family:
1. **System** — `gate_status_mapped_for_pipeline` (Pipeline Visibility Guard)
2. **Cap 0 release** — `gate_revision_present`, `gate_revision_quoted_at`, `gate_revision_accepted_at`
3. **Acceptance** — `gate_accepted_at`, `gate_partial_acceptance_complete`
4. **Packet** — `gate_release_packet_v2`
5. **Compliance** — `gate_patio_approvals` (conditional `not_applicable` per Marnin governance)
6. **Finance** — `gate_deposit_paid` (override path: bank-confirmed)
7. **Materials** — `gate_po_present`, `gate_supplier_confirmed`
8. **Logistics** — `gate_materials_logistics_plan`
9. **Crew** — `gate_crew_assigned`, `gate_assignment_confirmed`
10. **Install** — `gate_install_started`, `gate_install_completed`
11. **Client** — `gate_client_confirmation` (warning by default), `gate_access_note_required`, `gate_access_strict`
12. **Lifecycle** — `gate_terminal_state` (cancelled/archived reversibility rules)

**Hard-locked gates** (cannot be overridden, even by Marnin/Shaun):
- `gate_status_mapped_for_pipeline` — type-violation (e.g. `fencing → approvals`) is structurally impossible.
- `gate_revision_present` — without an actual quote_revision row, no transition past `quoted` is meaningful.
- `gate_accepted_at` — without an `accepted_at` timestamp, "accepted" is unverified.

---

**Live status as of 2026-05-04 02:12 UTC:** Cap 1A live. Cap 1B live. Cap 1C dormant (code merged, flag off, table not applied). Today's two bugs (kanban + AI alerts) fixed and deployed. Lane is clean for Shaun.

**One-line resume for Shaun:** "Cap 1A/1B live, Cap 1C merged-but-dormant. Today's ops fixes shipped (PR #31 + securedash PR #4 + daily-digest redeploy). Next protected step: apply Cap 1C migration to a Supabase branch DB, verify, apply to prod, deploy ops-api with shadow flag off, flip to on, soak ≥7 days, then Cap 1D."
