# SecureWorks System Testing Guide — For Shaun

**Date:** Monday 23 March 2026
**Time needed:** About 2 hours
**What this is:** A step-by-step checklist to test the new system features. Go through each section, try each step, and write down what happened. This helps us find and fix anything that's not working right.

**How to use this:** For each step, try it and tick the box. If something doesn't work, write what happened in the Notes column.

---

## Section 1: Open the Dashboards (5 minutes)

Open each dashboard in your browser and check it loads properly.

| # | Step | Expected | Pass? | Notes |
|---|------|----------|-------|-------|
| 1 | Open ops dashboard (ops.html) | Page loads, you see the Today tab | [ ] | |
| 2 | Click **Calendar** tab | Calendar shows with this week's schedule | [ ] | |
| 3 | Click **Jobs** tab | Job list appears | [ ] | |
| 4 | Click **Materials** tab | PO kanban board shows | [ ] | |
| 5 | Click **Financials** tab | Invoice list loads | [ ] | |
| 6 | Click **Approvals** tab (NEW) | Council/engineering kanban shows (may be empty) | [ ] | |
| 7 | In Financials, click **Unreconciled** sub-tab (NEW) | Shows unreconciled transactions or "All clear" | [ ] | |
| 8 | Open CEO dashboard (ceo.html) | Revenue, margins, and team section loads | [ ] | |
| 9 | On CEO dashboard, click **Team** tab (NEW) | Shows team performance section | [ ] | |

---

## Section 2: AI Chat Tests (15 minutes)

Open the AI chat on the ops dashboard. Type each question and record what happens.

| # | Question to type | What you should see | Time (count seconds) | Pass? | Notes |
|---|-----------------|--------------------|--------------------|-------|-------|
| 1 | "How many active jobs do we have?" | A number (currently ~3 active: 2 accepted + 1 scheduled) | Under 15 seconds | [ ] | |
| 2 | "What's on today?" | Today's schedule or "no jobs scheduled" if it's the weekend | Under 5 seconds | [ ] | |
| 3 | "What's the status of SWP-25029?" | Info about Liam Drennan's patio job in Quinns Rocks (accepted) | Under 10 seconds | [ ] | |
| 4 | "What's the status of SWF-25025?" | Info about Rachael Torre's fencing job in Fremantle (accepted) | Under 10 seconds | [ ] | |
| 5 | "What's our revenue this month?" | A dollar amount. Should say when the Xero data was last synced | Under 15 seconds | [ ] | |
| 6 | "What invoices are overdue?" | A list of overdue invoices with amounts | Under 15 seconds | [ ] | |
| 7 | "How much do we have in the bank?" | Bank balance figure | Under 15 seconds | [ ] | |
| 8 | "What jobs are scheduled this week?" | List of scheduled jobs (SWP-25005 Wendy Walley in Padbury should be there) | Under 10 seconds | [ ] | |
| 9 | "Who's working tomorrow?" | Crew assignments for Monday — Isaac should be scheduled | Under 10 seconds | [ ] | |
| 10 | "What quotes are going stale?" | List of quotes older than 7 days | Under 10 seconds | [ ] | |
| 11 | "What should I focus on today?" | A numbered priority list (max 5 items) with specific actions | Under 15 seconds | [ ] | |
| 12 | "Which jobs need POs?" | Any accepted/scheduled jobs without purchase orders | Under 10 seconds | [ ] | |
| 13 | "What's our margin on patio jobs?" | Margin percentage for patio division | Under 15 seconds | [ ] | |
| 14 | "Create a note on SWP-25005 saying crew is confirmed for Tuesday" | Should ask for confirmation before creating | Under 15 seconds | [ ] | |

---

## Section 3: Telegram Bot Tests (15 minutes)

Open Telegram and message the SecureBot directly (DM, not group chat).

| # | Message to send | What you should see | Pass? | Notes |
|---|----------------|--------------------|----|-------|
| 1 | "What's on today?" | Today's schedule, plain text, under 8 sentences | [ ] | |
| 2 | "What jobs need attention?" | Priority list, plain text, no tables or bullet points | [ ] | |
| 3 | "What's our revenue this month?" | Dollar amount with "synced X minutes ago" note | [ ] | |
| 4 | "What's the address for SWP-25005?" | Wendy Walley's address in Padbury | [ ] | |
| 5 | "Who's working this week?" | Crew schedule for the week | [ ] | |

**Group chat test (if Telegram group exists):**

| # | Message to send in group | What you should see | Pass? | Notes |
|---|-------------------------|--------------------|----|-------|
| 6 | "@SecureBot what's our revenue?" | Should NOT show financial data — should say "DM me for that" | [ ] | |
| 7 | "@SecureBot who's working today?" | Should show schedule (non-financial info is OK in group) | [ ] | |

---

## Section 4: Job Lifecycle Test (30 minutes)

Walk through a job from start to finish using real data.

| # | Step | Expected | Pass? | Notes |
|---|------|----------|-------|-------|
| 1 | Open ops dashboard, search for "SWP-25029" (Liam Drennan) | Job appears in search results | [ ] | |
| 2 | Click to open the job | Job detail panel opens with tabs: Overview, Money, Build, Files, Comms, History | [ ] | |
| 3 | Click **Overview** tab | Shows job status (accepted), client details, suburb (Quinns Rocks) | [ ] | |
| 4 | Check if **Council/Engineering** section appears in Overview (NEW) | Shows step progress if council submission exists, or nothing if not required | [ ] | |
| 5 | Click **Money** tab | Shows quote value, invoiced amount, costs, purchase orders | [ ] | |
| 6 | Check for **Labour** section in Money tab (NEW) | Shows crew hours and costs if any assignments exist | [ ] | |
| 7 | Click **Comms** tab | Shows GHL conversation (if linked) + "Automated Communications" section (NEW) | [ ] | |
| 8 | Check the **Automated Communications** section | Shows any automated messages sent (quotes, follow-ups, etc.) or "No automated communications" | [ ] | |
| 9 | Click **History** tab | Shows timeline of events for this job | [ ] | |

**Repeat with a fencing job:**

| # | Step | Expected | Pass? | Notes |
|---|------|----------|-------|-------|
| 10 | Search for "SWF-25025" (Rachael Torre, Fremantle) | Job appears | [ ] | |
| 11 | Open job detail and check each tab | All tabs load with correct data | [ ] | |

---

## Section 5: Trade App Tests (20 minutes)

Open the Trade App on your iPad or phone (trade.html).

| # | Step | Expected | Pass? | Notes |
|---|------|----------|-------|-------|
| 1 | Open Trade App in browser | Login screen or job list appears | [ ] | |
| 2 | See a list of jobs | Jobs assigned to you appear | [ ] | |
| 3 | Tap on a job | Job detail loads: work order, schedule, photos | [ ] | |
| 4 | Find "Clock On" button | Tap it — timer should start | [ ] | |
| 5 | Find "Clock Off" button | Tap it — end-of-day form should appear | [ ] | |
| 6 | Fill the end-of-day form: drag the slider to 50%, type a note "test note", take 1 photo | Form accepts all inputs | [ ] | |
| 7 | Submit the form | Success message, form closes | [ ] | |
| 8 | Reopen the same job | Should show "Previous Days" with your submitted entry | [ ] | |

---

## Section 6: PO & Materials Tests (15 minutes)

| # | Step | Expected | Pass? | Notes |
|---|------|----------|-------|-------|
| 1 | Go to **Materials** tab on ops dashboard | PO kanban loads with columns: Draft, Approved, Sent, Quoted, Confirmed, Delivered | [ ] | |
| 2 | Find PO-467989 (B&D, submitted) | Card should be in "Sent" column | [ ] | |
| 3 | Check if email thread preview shows on PO card (NEW) | If emails were sent for this PO, you should see "X emails — last: ..." | [ ] | |
| 4 | Open a job and click **Money** tab | PO list should be expandable — tap a PO to see line items and email thread (NEW) | [ ] | |
| 5 | Try clicking "+ New PO" button | PO compose modal should open | [ ] | |

---

## Section 7: Financial Data Tests (10 minutes)

| # | Step | Expected | Pass? | Notes |
|---|------|----------|-------|-------|
| 1 | Open **Financials** tab, **Invoices** sub-tab | Invoice list loads with status badges | [ ] | |
| 2 | Click **Unreconciled** sub-tab (NEW) | Shows bank transactions not yet matched to jobs, or "All clear" | [ ] | |
| 3 | If any unreconciled items show, try the "Match to Job" dropdown | Dropdown shows recent jobs to match against | [ ] | |
| 4 | Open CEO dashboard | Revenue number should roughly match what Xero shows | [ ] | |
| 5 | On CEO dashboard, scroll to **Team** section (NEW) | Team activity cards should show for each person | [ ] | |
| 6 | Check **Shaun's KPIs** section (NEW) | KPI table with targets and RAG status indicators | [ ] | |

---

## Section 8: Calendar & Scheduling (10 minutes)

| # | Step | Expected | Pass? | Notes |
|---|------|----------|-------|-------|
| 1 | Open **Calendar** tab | Shows this week's assignments — Isaac should be scheduled Mon 23 Mar | [ ] | |
| 2 | Try switching between views: Crew, Week, Month | Each view loads and shows data correctly | [ ] | |
| 3 | Check if delivery markers show on calendar | Any POs with delivery dates should show as markers | [ ] | |
| 4 | Try dragging a job to a different day | Job should move (unless it's locked) | [ ] | |

---

## Section 9: Overall Rating

After completing all sections, answer these questions:

1. **What worked well?**



2. **What was broken or confusing?**



3. **What was slow?**



4. **What's missing that you expected to see?**



5. **Rate the system 1-10 for daily ops use:**



6. **Rate the AI chat 1-10 for usefulness:**



7. **Any other comments?**



---

**When you're done:** Save this document and send it to Marnin. Note anything that needs urgent fixing before the team starts using this daily.
