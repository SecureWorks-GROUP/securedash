# Make-Safe Workflow -- SecureSuite Integration

## Problem

Shaun handles make-safe requests manually via email + WhatsApp from insurance/building companies (AJ Building, KBA Insurance, more expected). No tracking, no trade visibility, no structured invoicing.

## Solution

Full make-safe pipeline inside SecureSuite, from email intake to invoicing.

---

## Phase 1: Framework (DONE)

- Make Safes kanban tab on ops dashboard (Accepted / Scheduled / In Progress / Complete / Invoiced)
- Database: company profiles table (sender patterns, PDF rules, invoice email, safety requirements) with AJ + KBA seeded
- API endpoint to create make-safe jobs (SWMS-XXXXX numbering, company lookup, PDF storage, Telegram notification)
- Trade app: make-safe info panel showing requesting company, reference number, safety requirements, external links (e.g. Primeeco platform), and the company's work order PDF
- Jobs use existing statuses so the status model stays unified

## Phase 2: Email Auto-Intake

- Monitor inbox for emails matching company sender patterns (@ajs.build, @primeeco.tech)
- Auto-parse client name, address, reference number from subject/body using per-company rules
- Extract PDF attachments (AJ) or Primeeco links (KBA)
- Auto-create the make-safe job, notify Shaun via Telegram for review

## Phase 3: Trade Routing + Auto-SMS

- Auto-assign to preferred trade based on availability and location
- SMS the client: "SecureWorks has been assigned to make your property safe. [Trade name] will attend on [date]."
- SMS the trade with job details + address

## Phase 4: Completion Report

- Trade submits photos + description of work done via trade app
- Report stored against the job, visible in ops dashboard

## Phase 5: Invoicing

- Generate invoice to the requesting company (not the homeowner) using their invoice email and billing rules from the company profile
- Each company has different invoicing requirements (stored in company profile)
- Push to Xero, track payment

---

## Key Design Decisions

- Each requesting company has a profile with their specific parsing rules, PDF format, invoice requirements, and safety instructions
- Company profiles are extensible, so onboarding a new company = adding one database row
- Make-safe jobs flow through the same assignment/scheduling/trade system as fencing/patio jobs
- Trades see company-specific work orders, safety requirements, and external platform links in their app
