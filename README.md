# AssetFlow — Enterprise Asset & Resource Management System

Odoo Hackathon 2026 submission by **Team LogicLoom**.

AssetFlow is a centralized ERP platform that helps organizations track, allocate, and maintain physical assets and shared resources — replacing manual spreadsheets and paper logs with structured lifecycles, conflict-safe allocation, and real-time visibility.

## Team — LogicLoom

- **Anushka Bansal** (Team Leader) — GitHub: [@Anush715](https://github.com/Anush715) — Frontend (UI, pages, integration)
- **Harshita Gupta** — GitHub: [@Harshitagupta2005](https://github.com/Harshitagupta2005) — Backend (APIs, database schema, business logic)

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Database/ORM:** Prisma + SQLite
- **Auth:** NextAuth v5 (credentials-based)
- **Styling:** Tailwind CSS

## Features Implemented

- **Auth & Roles:** Signup creates Employee-only accounts; Admin promotes users to Department Head / Asset Manager from the Employee Directory (no self-elevation)
- **Org Setup:** Departments (with hierarchy), Asset Categories, Employee Directory
- **Asset Registry:** Auto-tagged assets (AF-0001, AF-0002...) with full lifecycle status (Available, Allocated, Reserved, Under Maintenance, Lost, Retired, Disposed)
- **Allocation & Transfer:** Conflict-safe allocation — blocks double-allocation and offers a Transfer Request instead; return flow with condition notes
- **Resource Booking:** Time-slot booking for shared resources with overlap validation
- **Maintenance Workflow:** Raise → Approve/Reject → Technician Assigned → In Progress → Resolved, with automatic asset status sync
- **Audit Cycles:** Create scoped audit cycles, assign auditors, mark assets Verified/Missing/Damaged, auto-generate discrepancy reports, and close cycles (confirmed-missing assets auto-flip to Lost)
- **Dashboard & Reports:** Real-time KPIs (available/allocated/under maintenance assets, active bookings, overdue returns)

## Getting Started

```bash
npm install
npx prisma generate
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Login

| Role | Email | Password |
|---|---|---|
| Admin | admin@assetflow.com | password123 |
| Asset Manager | manager@assetflow.com | password123 |
| Employee | priya@assetflow.com | password123 |
| Employee | raj@assetflow.com | password123 |

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes (org, allocations, bookings, maintenance, audits, assets, categories, auth)
│   ├── dashboard/         # Protected app pages (org, allocations, bookings, maintenance, audits, assets, reports)
│   ├── login/ signup/     # Auth pages
├── lib/                  # Prisma client, auth config
prisma/
├── schema.prisma          # Data models
├── seed.ts                 # Demo data
```

## Key Design Decisions

- **SQLite compatibility:** Prisma enums aren't supported on SQLite, so all status/role fields use `String` with values validated in the API layer.
- **Conflict handling:** Allocation and booking conflicts are checked at the database level before writes, returning clear error messages (e.g. "currently held by X") so the UI can offer next steps like Transfer Request.