# Operations & Growth Manager, Role Specification

> **For:** Shaun Lee
> **Effective:** 14 April 2026
> **Version:** 1.0

## Your Role

You are the Operations & Growth Manager for SecureWorks WA. Your job is to run the operational engine of the business, grow revenue, and maintain the technology platform that powers everything.

This is not a static role. As JARVIS (our AI operations agent) gets smarter, the routine ops work will progressively shift to the AI. Your role evolves with it. The operational work shrinks, and your time shifts into higher-value domains: business growth, marketing, and system development.

## Three Domains

Your time splits across three domains. The balance shifts over time as the AI takes over routine operations.

### Domain 1: Operations (starts at 70%, reduces over time)

**Now (Apr-Jun 2026):**
You own the full operational lifecycle. JARVIS assists but you make the decisions.

- Review the JARVIS morning brief daily and approve/reject proposed actions via Telegram
- Handle exceptions: client complaints, supplier disputes, schedule conflicts, crew issues
- Weekly finance reconciliation (Wednesdays) with the bookkeeper
- Friday supplier payment run
- Supplier relationship management (pricing, lead times, quality)
- Purchase order oversight (PO in Xero before any spend, no exceptions)
- Council submission tracking (status updates, chasing vendors, liaising with certifiers)
- Quality oversight: spot-check 5% of automated messages JARVIS sends to clients/suppliers
- Job lifecycle management: quotes aging, deposit collection, scheduling, completion, invoicing, payment collection

**6 months (Oct 2026):**
JARVIS handles routine follow-ups, stage notifications, and standard chase sequences. You handle complex escalations, dispute resolution, and relationship-heavy supplier/council work. Target: 40% of your time.

**12 months (Apr 2027):**
JARVIS is largely autonomous on routine ops. You oversee, handle exceptions, and intervene when the AI flags uncertainty. Target: 20% of your time.

### Domain 2: Growth & Marketing (starts at 10%, expands over time)

**Now (Apr-Jun 2026):**
Learn the tools. Get familiar with the data.

- Get access to Google Ads, learn the current campaign structure
- Monitor lead flow and response times in GHL
- Start requesting Google reviews after job completion
- Observe the marketing generator (suburb pages) and understand SEO basics

**6 months (Oct 2026):**
Own the marketing function. Replace external marketing spend with in-house capability.

- Manage Google Ads (budget allocation, keyword strategy, bidding, A/B testing landing pages)
- Google review generation system (post-job review requests, responding to all reviews)
- Social media content (job photos, before/after posts, testimonials, project showcases)
- Lead response time monitoring (target: under 5 minutes)
- Cross-sell campaign execution (past clients, seasonal offers)
- Competitor monitoring (pricing, positioning, what they're doing on Google/social)
- Suburb page SEO (marketing generator tool)

**12 months (Apr 2027):**
Full marketing ownership. Responsible for lead volume, lead quality, conversion rates, and brand presence. Target: 40% of your time.

### Domain 3: Systems & Development (starts at 20%, expands over time)

**Now (Apr-Jun 2026):**
Learn the terminal workflow. Get comfortable with Claude Code, git, and the system architecture.

- Run three terminals daily: ops terminal, code terminal, oversight terminal
- Learn to navigate the codebase using Claude Code (you don't need to know how to code, the AI writes the code, you direct it)
- Understand git basics: pull, commit, push, branches, merges
- Learn the dashboard structure (ops.html, trade.html, ceo.html, sale.html)
- Follow the dev queue system for tracking what's being built

**6 months (Oct 2026):**
Build and maintain dashboards, fix UI bugs, deploy edge functions with AI assistance.

- Dashboard maintenance and improvements (HTML/JS with Claude Code doing the heavy lifting)
- Edge function deployment and monitoring via Supabase CLI
- Wiki maintenance (update specs, playbooks, intelligence pages after sessions)
- JARVIS monitoring (track autonomy scale progress, verify nudge delivery, check feedback loops)
- Git workflow (PRs, code reviews, merges, deployments to GitHub Pages and Supabase)

**12 months (Apr 2027):**
Own all application interfaces, integrations, and system reliability. Build new features end-to-end using AI terminals. Target: 40% of your time.

## What You Do NOT Own

- **AI/ML strategy and development.** Marnin's domain. You don't build the AI brain, you manage the system it runs on.
- **Strategic business decisions.** Marnin sets direction, you execute. You will be consulted and your input matters, but final calls on strategy, pricing, hiring, and major investments are Marnin's.
- **Sales scoping.** Nithin (patios) and Khairo (fencing) handle client-facing sales. You may support with systems and data but you don't scope jobs.
- **On-site installation.** Henry and the crews handle physical work. You coordinate scheduling and materials, not builds.
- **Bookkeeping data entry.** JARVIS and the bookkeeper handle transaction-level work. You oversee the process and reconcile weekly.

## How You're Measured

Five KPIs, reviewed quarterly. These are the metrics that matter.

| KPI | What It Measures | Why It Matters |
|-----|-----------------|----------------|
| **Google Reviews** | New reviews per quarter | Social proof drives leads. Every review is future revenue. |
| **Lead Response Time** | Average time to first response | Speed to lead is the #1 predictor of conversion in trades. Under 5 minutes is the target. |
| **Days Sales Outstanding** | How fast clients pay | Cash flow is oxygen. Every day an invoice sits unpaid costs the business money. |
| **Job Completion Rate** | % of jobs completed on or before scheduled date | On-time delivery drives reviews, referrals, and repeat business. |
| **System Reliability** | How fast bugs get fixed, how often systems go down | The platform has to work. If the Trade app is broken, crews can't log hours. If ops.html is down, nobody can see the pipeline. |

These KPIs link directly to a quarterly bonus. The better you perform, the more you earn. Details discussed separately.

## Growth Share

Beyond your base and KPI bonus, there is a growth share tied to the gross profit of the business. As the business grows and you help drive that growth, your earnings grow with it. The percentage increases with tenure, rewarding long-term commitment.

This is designed so that your financial upside is directly tied to the success of the business. The more the business grows, the more you earn. Details discussed separately.

## Daily & Weekly Rhythms

### Every Day

1. **Morning (start of your day).** Review JARVIS morning brief in Telegram. Approve/reject proposed actions. Check for urgent flags.
2. **Mid-morning.** Open ops terminal. Handle exceptions, process any manual tasks (council follow-ups, supplier chases, client escalations).
3. **Midday.** Open code terminal. Work on 1-2 dev queue tickets or dashboard improvements.
4. **Afternoon.** Oversight terminal. Check system health, review what JARVIS has done, spot-check automated messages, update wiki if you learned something.
5. **End of day.** Update operations/snapshot.md with what you worked on. Flag anything for Marnin if needed.

### Weekly

- **Monday.** Weekly planning. Review dev queue priorities, check sprint progress, set your focus for the week.
- **Wednesday.** Finance reconciliation with bookkeeper. Review Xero, match invoices, chase outstanding payments.
- **Friday.** Supplier payment run. Weekly KPI check (lead response times, DSO, review count). Update scorecard.

### Monthly

- **First Monday.** KPI review with Marnin. Review last month's numbers, discuss blockers, set focus for the month.
- **Wiki lint.** Run a health check on secureworks-docs. Find stale pages, broken links, missing content.
- **Autonomy audit.** Check the JARVIS autonomy scale. What level are we at? What's blocking progress to the next level?

## The Big Picture

The mission is to take SecureWorks from $1.5M to $5M in revenue while Marnin steps out of daily operations. You are the person who makes that possible.

JARVIS handles the repetitive work. You handle the judgment calls, the relationships, the growth strategy, and the system that ties it all together. As the AI gets better, your role gets more strategic, not less important.

The end state: Marnin focuses on vision, deals, and scaling. You run everything operational, drive marketing and growth, and maintain the technology platform. The business runs whether Marnin is in the office or on holiday.

That's the goal. Everything in this document is designed to get us there.
