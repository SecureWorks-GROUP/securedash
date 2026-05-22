# Plan: SMS Contact Mismatch Safeguard

## Problem
MCP tool `sw_send_sms` accepts a raw `contact_id` with no validation against the job context. When an agent works across multiple clients in one session, stale contact IDs from a previous client can be passed, sending real SMS messages to the wrong person.

**Incident:** Michael Andrzejewski received Leanne Hampson's deposit SMS because the agent reused Michael's `contact_id` from earlier in the conversation.

## Current Flow
1. MCP tool receives `contact_id` + `message` (+ optional `phone`)
2. Calls `ghl-proxy?action=send_sms` with `{ contactId, message }`
3. `ghl-proxy` sends via GHL conversations API
4. No validation that the contact matches the intended recipient

## Proposed Fix

### Option A: Add `job_id` cross-check to `ghl-proxy` `send_sms` (recommended)

**Where:** `secureworks-site/supabase/functions/ghl-proxy/index.ts` ~line 2466

**What:** When both `contactId` and `jobId` are supplied, verify the contact matches the job before sending:

```
// After extracting contactId, message, jobId from body:
if (contactId && jobId) {
  const { data: job } = await sb.from('jobs')
    .select('ghl_contact_id, client_name')
    .eq('id', jobId)
    .single()

  if (job && job.ghl_contact_id && job.ghl_contact_id !== contactId) {
    return json({
      error: 'Contact mismatch: contactId does not match the job contact',
      expected_contact: job.ghl_contact_id,
      expected_name: job.client_name,
      supplied_contact: contactId
    }, 409)
  }
}
```

**Impact:**
- Non-breaking. Only triggers when both `contactId` and `jobId` are supplied AND they don't match.
- Existing calls without `jobId` are unaffected.
- The `jobId` param already exists in the endpoint signature.

### Option B: Make MCP tool auto-resolve contact from job

**Where:** MCP server (Grafana-hosted, outside this repo)

**What:** If the MCP tool receives a `job_id`, it looks up the job's `ghl_contact_id` and uses that instead of requiring the caller to supply `contact_id`. This removes the agent from the contact resolution entirely.

**Tradeoff:** Requires MCP server changes (Marnin's domain). Could be done as a follow-up.

## Recommendation

Do **Option A** now (small, safe, in our codebase). Log Option B for Marnin.

## Files to Change
1. `secureworks-site/supabase/functions/ghl-proxy/index.ts` - add cross-check at ~line 2468
2. Deploy `ghl-proxy` edge function

## Risk
- Low. Guard only fires on mismatch. No existing flows broken.
- Does NOT block sends without a `jobId` (e.g. ad-hoc SMS to suppliers/crew).
