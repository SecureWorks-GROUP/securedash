# SecureWorks System Guide -- Onboarding for Shaun

> Last updated: 9 April 2026
> Read this after shaun-role-spec.md

## Section 1: The Business System

SecureWorks runs on a custom-built operations platform called SecureSuite. Five modules:

| Module | What | Where Live | URL Pattern |
|--------|------|-----------|-------------|
| Secure Scope | Patio + fencing scoping/quoting tools | GitHub Pages | patio-tool, fence-designer repos |
| Secure CEO | CEO dashboard (revenue, margins, pipeline) | GitHub Pages | securedash/ceo.html |
| Secure Ops | Operations dashboard (jobs, calendar, financials, materials) | GitHub Pages | securedash/ops.html |
| Secure Trade | Installer PWA (job list, check-in, photos, service reports) | GitHub Pages | securedash/trade.html |
| Secure Sale | Sales performance dashboard | GitHub Pages | secureworks-sale/sale.html |

### The Stack
- **Frontend:** Single-file HTML/JS dashboards. No frameworks. Each dashboard is one HTML file with inline JavaScript.
- **Backend:** Supabase Edge Functions (Deno/TypeScript). 19 functions, ~39,000 lines of code. The main one is ops-api which handles most operations.
- **Database:** Supabase Postgres. All client-side queries go through edge functions (direct DB access is blocked by RLS).
- **CRM:** GoHighLevel (GHL). Sales pipelines, contacts, opportunities, SMS. This is where leads come in and where the sales team works.
- **Accounting:** Xero. Invoices, bills, P&L, contacts, purchase orders. Source of truth for money.
- **AI Agent:** JARVIS. Runs on Railway. Connects to everything via MCP (Model Context Protocol) tools.
- **Wiki:** secureworks-docs repo. Obsidian-compatible markdown files. The knowledge base for the entire business.

### Data Flow
```
Leads --> GHL (CRM)
          | (ghl-proxy syncs)
       Supabase (ops brain: jobs, POs, assignments, events)
          | (xero-sync)
       Xero (accounting: invoices, bills, P&L)
          | (reporting-api)
       Dashboards (visibility: ops.html, ceo.html, trade.html, sale.html)
          | (daily-digest, monitor-inbox)
       JARVIS (intelligence: morning brief, nudges, email classification)
```

### Key Rules
- ALL client-side Supabase queries fail (RLS blocks them). Always use edge functions.
- PostgREST has a 1000-row limit. Use fetchAll() with .range() for large queries.
- ops.html module JS files in the repo are DEAD CODE. All ops functions live inline in ops.html.
- Every job MUST sync to GHL before Supabase. No orphan jobs.
- The Supabase table is 'organisations' not 'organizations' (Australian spelling).
- ops-api needs the --no-verify-jwt flag when deploying.
- Sale dashboard is desktop-first. Everything else is mobile-first.

## Section 2: How JARVIS Works

JARVIS is the AI operations agent. It monitors the business, proposes actions, and (with approval) executes them.

### The Autonomy Scale (1-10)

This is the north star for JARVIS development. Currently at 2.5/10.

| Level | Name | Status | What It Means |
|-------|------|--------|--------------|
| 1 | Eyes Open | DONE | JARVIS can see all business data (50 read tools) |
| 2 | Hands Working | 80% | JARVIS can take actions when asked (47 write tools) |
| 3 | Memory Forming | 20% | JARVIS remembers job history, learns from outcomes |
| 4 | Ears Listening | 10% | JARVIS monitors email, GHL, and supplier replies in real-time |
| 5 | Mouth Speaking | 10% | JARVIS sends the right message at the right time |
| 6 | Brain Connecting | 5% | JARVIS links cause and effect across the business |
| 7 | Early Warnings | 0% | JARVIS spots problems before they blow up |
| 8 | Team Player | 0% | JARVIS works with the whole team, not just Marnin |
| 9 | Running the Show | 0% | JARVIS operates the business autonomously |
| 10 | Franchise Engine | 0% | Someone runs a SecureWorks branch with just JARVIS and a crew |

### What JARVIS Can Do Today
- Read all business data (jobs, invoices, contacts, calendar, POs, pipeline)
- Send SMS and email on request
- Create POs, invoices, work orders, assignments
- Classify incoming emails (7 categories across 6 mailboxes)
- Generate smart nudges (stale quotes, overdue invoices, missing deposits)
- Compute job intelligence (risk scores, health, margin forecasts)
- Morning brief via Telegram (schedule, KPIs, attention items, stale quotes)

### What's Broken Right Now
- Nudge delivery: 119+ nudges generated, 0 delivered to Telegram. The #1 blocker.
- Feedback loops: chase_outcomes table exists but nothing writes to it. System can't learn.
- Proposed actions: table is empty. Nudges generate but don't convert to actionable approval cards.
- Trust context: built and working in shadow mode, but not enforcing (still proposes contradictory actions).
- Email to job routing: emails classified but don't appear in job timelines.

These are all being fixed in the Cohesion Sprint (see specs/cohesion-framework.md).

### Trust Graduation Model

JARVIS earns autonomy per action type, not globally:

| Tier | Name | How It Works |
|------|------|-------------|
| T1 | Human Approval | JARVIS drafts, you approve/edit/skip before it sends |
| T2 | Human Review | JARVIS auto-sends low-risk actions. You review daily. 30-second recall window. |
| T3 | Human on Loop | Auto-send routine. Manual approval only for high-risk/high-value. Spot-check 5%. |
| T4 | Autonomous | Full auto. You monitor metrics weekly. Auto-reverts to T3 if performance drops. |

Everything starts at T1. Graduation requires 30+ approvals with less than 5% edit rate.

### Your Daily JARVIS Workflow
1. Morning: Check Telegram for the morning brief. Review attention items.
2. Action cards appear for proposed actions (once nudge delivery is fixed). Tap approve/edit/skip.
3. If JARVIS flags something uncertain, it routes to you. Handle the exception manually.
4. End of day: Spot-check a few automated messages in GHL/email to make sure tone is right.

## Section 3: The Wiki (secureworks-docs)

The wiki is at ~/Projects/secureworks-docs/. It's a git repo of markdown files that works as an Obsidian vault.

### Three Layers (Karpathy Pattern)
1. **_raw/** : Immutable source documents. Drop articles, meeting notes, data dumps here. The AI reads but NEVER writes here.
2. **Wiki (everything else)** : AI-written and maintained. Entity pages, concept pages, synthesis, playbooks, decisions, intelligence. Cross-linked via [[wikilinks]].
3. **Schema (CLAUDE.md files)** : Defines conventions, file formats, workflows. Every domain has one. Read the CLAUDE.md first when entering a domain.

### How to Navigate
1. Start at the root CLAUDE.md. It has a routing table.
2. Identify which domain your task falls in (features/, specs/, intelligence/, playbooks/, etc.).
3. Read that domain's CLAUDE.md for the index.
4. Read the specific file you need.

### Wikilink Resolution

| Link Pattern | Resolves To |
|-------------|------------|
| [[vendor-name]] | intelligence/vendors/vendor-name.md |
| [[spec-name]] | specs/spec-name.md |
| [[feature-name]] | features/feature-name.md |
| [[playbook-name]] | playbooks/playbook-name.md |

### Key Operations
- **Ingest:** New info comes in, terminal reads it, creates/updates wiki pages, adds wikilinks.
- **Query Write-Back:** If answering a question requires 3+ wiki pages, write the synthesis back as a new page.
- **Lint:** Monthly health check. Find contradictions, orphan pages, stale claims, broken links.

## Section 4: Terminal Workflow

You run three Claude Code terminals simultaneously. You don't write code. You direct the AI to write code for you.

### Terminal 1: Ops (Daily Operations)
- Connected to SecureSuite MCP tools (101 tools for jobs, invoices, contacts, calendar, POs, email, SMS)
- Connected to MS365 (Outlook email search, calendar)
- Use this for: checking job status, sending emails, creating POs, reviewing invoices, answering "what's happening with X?" questions
- Example: "Check the calendar for this week and tell me if any jobs are missing deposits"

### Terminal 2: Code (Development)
- For working on dashboards, edge functions, and system improvements
- Always start with: read the wiki (secureworks-docs/CLAUDE.md), then read the feature spec
- Always git pull before editing any repo
- Always git push after completing work
- Use plan mode before any non-trivial code changes
- Example: "Fix the calendar view in ops.html so it shows crew names on each assignment"

### Terminal 3: Oversight (Monitoring & Quality)
- Review what JARVIS has done (check Telegram logs, email_events, smart_nudges)
- Run wiki lint checks
- Audit the dev queue (operations/devqueue.md)
- Monitor system health (edge function logs, Railway agent status)
- Update wiki with anything you learned during the day
- Example: "Check the last 24 hours of inbox_events and tell me if any emails were misclassified"

### Claude Code Basics (for non-coders)

**Starting a session:**
```bash
claude
```
That opens the Claude Code terminal. You type natural language. It reads files, writes code, runs commands.

**Key commands:**
- `/help` : See all available commands
- `/clear` : Start fresh (clears conversation context)
- Type your request in plain English. Be specific about what you want.

**Plan mode:**
Before any significant code change, the AI should enter plan mode. It explores the codebase, designs an approach, and shows you the plan before writing anything. You approve or redirect.

**Git workflow (the AI handles this, but you should understand it):**
1. `git pull origin main` : Get the latest code before starting
2. Make changes (the AI does this)
3. `git add` + `git commit` : Save changes locally
4. `git push origin main` : Push to GitHub (makes it live on GitHub Pages)

**MCP Tools:**
The terminal has access to 101+ SecureSuite tools (sw_list_jobs, sw_send_email, sw_calendar, etc.), Supabase (execute SQL, deploy functions), MS365 (search emails, calendar), and more. Just ask for what you need in plain English.

### The Dev Queue

All development work is tracked in operations/devqueue.md. Format:

```
### TICKET-ID | Priority | Short description
**What:** Detailed spec
**Files:** Which files to modify
**Deploy:** How to deploy
**Test:** How to verify
**Status:** [READY] [IN-PROGRESS] [TESTING] [DONE] [BLOCKED]
**Terminal Notes:** T1 writes what was done
**Actual:** T2 writes test results
```

When you pick up a ticket:
1. Change status to [IN-PROGRESS]
2. Do the work
3. Change status to [TESTING]
4. Test it
5. If it passes, change to [DONE]
6. If it fails, document what's wrong and either fix or change to [BLOCKED]

## Section 5: Access & Accounts

You need access to all of these. Check each one and flag any you can't get into.

| System | URL/Access | What You Use It For |
|--------|-----------|-------------------|
| Supabase | Dashboard (ask Marnin for invite) | Database, edge functions, logs |
| GitHub | github.com/SecureWorks-GROUP | All code repos (securedash, patio-tool, fence-designer, secureworks-sale, secureworks-agent) |
| GHL | app.gohighlevel.com | CRM, pipelines, contacts, SMS, conversations |
| Xero | xero.com (read access) | Invoices, bills, P&L, contacts, POs |
| MS365/Outlook | outlook.office365.com | Email (marnin@, admin@, patios@, fencing@, shaun@) |
| Railway | railway.app | JARVIS agent deployment and logs |
| Cloudflare | dash.cloudflare.com | secureworks-website (Astro site) deployment |
| Google Ads | ads.google.com | Ad campaigns, spend, keywords, conversions |
| Telegram | JARVIS bot | Morning briefs, action approvals, alerts |
| Obsidian | Local install | Wiki (secureworks-docs) reading and graph view |
| Claude Code | Terminal (CLI) | AI-powered development and operations |

## Section 6: Current State (April 2026)

### What's Working
- All 5 dashboards live and functional
- 101 MCP tools operational
- Email monitoring across 6/8 mailboxes (84+ emails processed)
- Email classification (7 categories, working well)
- Smart nudge generation (19+ stale quote nudges)
- Job intelligence and risk scoring
- Trust context layer (shadow mode, evaluating correctly)
- Morning brief via Telegram (comprehensive)
- PO system complete (compose, AI analysis, ghost detection, PDF, email)
- Xero sync (invoices, contacts, projects)

### What's Broken (Cohesion Sprint Fixes)
- Nudge delivery (0 of 119 nudges reaching Telegram)
- Proposed actions table empty (no approval cards)
- Chase outcomes not tracked (feedback loop broken)
- Trust context in shadow mode only (not enforcing)
- Email classification doesn't write to job_events (invisible in timelines)
- Scope to PO extraction empty
- 2 of 8 mailboxes not flowing (shaun@, khairo@)

### Active Work
- **Sprint 3** : Current development sprint
- **Cohesion Sprint** : Wiring existing components into one integrated chain (see specs/cohesion-framework.md)
- **Client Lifecycle Comms** : AI-driven follow-up system (see specs/client-lifecycle-comms.md)

### Key Specs to Read
1. specs/cohesion-framework.md : The integration plan. Understand this first.
2. specs/client-lifecycle-comms.md : The smart follow-up system being built.
3. specs/council-pipeline.md : Council submission workflow.
4. specs/po-pricing-loop.md : PO and pricing feedback system.

## Section 7: Code Repos

| Repo | Path | Live On | What |
|------|------|---------|------|
| secureworks-ux | ~/Projects/securedash/ | GitHub Pages | CEO, Ops, Trade dashboards |
| patio-tool | ~/Projects/patio-tool/ | GitHub Pages | Patio + decking scoping tools |
| fence-designer | ~/Projects/fence-designer/ | GitHub Pages | Fencing scoping tool |
| secureworks-sale | ~/Projects/secureworks-sale/ | GitHub Pages | Sales dashboard |
| secureworks-website | ~/Projects/secureworks-website/ | Cloudflare Pages | New Astro website |
| secureworks-jarvis | ~/Projects/secureworks-agent/ | Railway | JARVIS AI agent |
| Edge functions | ~/Projects/secureworks-site/supabase/functions/ | Supabase | API layer |
| secureworks-docs | ~/Projects/secureworks-docs/ | GitHub | Wiki/knowledge base |

**Mandatory before editing any repo:**
1. git fetch origin
2. git pull origin main
3. Resolve conflicts if any
4. After finishing: commit + push so live versions stay current

Multiple people edit these repos. Always pull first or you'll create merge conflicts.

## Section 8: Quick Reference

- **Supabase project ID:** kevgrhcjxspbxgovpmfl
- **Brand colours:** Orange #F15A29 | Dark Blue #293C46 | Mid Blue #4C6A7C
- **Supabase CLI:** /Users/marninstobbe/.local/bin/supabase
- **Business phone:** 0489 267 771
- **Email routing:** Client emails via sw_send_email (marnin@ or fencing@). PO/supplier emails via sw_send_po_email (orders@secureworksgroup.app). Council emails via Outlook. NEVER send PO emails from personal Outlook.
- **GHL numbers:** Ops uses +61 489 267 776. See memory/ghl_phone_numbers.md for full mapping.
- **Never use Gmail.** All email is via MS365 Outlook or SecureSuite tools.
