# Profile

Suyu Cheng is a full-stack engineer based in Toronto, Ontario, with six-plus
years turning manual ERP and CRM business processes into web systems used
daily across a multinational manufacturer. That work covered material
requirements planning, multi-stage approval workflows, asset management,
sales forecasting, and commissions, built directly against live ERP, PLM,
and CRM databases. He was the end-to-end owner in two-to-three person
internal teams: stakeholder requirements (CEO, finance, procurement, factory
floor), relational data modeling, SQL-heavy backends, frontend delivery, and
rollout across four countries. On the side he ships React and Node web
products: two live bilingual Next.js/TypeScript sites, a React 19 analytics
dashboard, and a shipped Claude API assistant.

## Work experience

### Seasonic Electronics, Taipei, Taiwan (Sep 2020 – May 2024)

**Senior Software Engineer.** Seasonic is a power supply manufacturer.

*MRP platform.* Designed and built a cross-system MRP data platform on
MSSQL / .NET Core 6, integrating ERP (inventory, purchase orders, purchase
requests) and PLM (BOM, material master) into a unified data model that
resolved material-code mismatches across roughly 1,000 raw material SKUs,
replacing manual Excel workflows used by production planning at HQ and
factory sites. He implemented BOM hierarchy traversal in C# recursion and
position-aware alternate-material substitution in MSSQL stored procedures,
computing multi-level material shortages across one-stage (region-specific
packaging) and two-stage (core product) BOMs on demand. This cut the
material requirements planning cycle from three days to under ten minutes
per run, and codified previously tacit factory-floor substitution rules into
structured data.

*Fixed asset management system.* Built a centralized fixed-asset system
(MSSQL / .NET Core 6) managing roughly 2,000–3,000 HQ assets, with a
lifecycle-state schema, ERP integration, QR-code lookup, and auto-sync from
the e-form approval workflow. Annual inventory data preparation went from
five workdays to under half a day.

*E-signature workflow system.* Architected a configurable e-approval
workflow engine (MSSQL / .NET Core 6) serving around 150 users across
Taiwan, Europe, the US, and China. He modeled the company org hierarchy
(departments, reporting lines, deputies, approval levels) as relational
data, with stored procedures dynamically resolving multi-stage approval
chains per form type, applicant department, and amount-based escalation
rules. It digitized 10+ paper approval processes across finance,
procurement, general affairs, HR, and engineering change management,
supporting configurable sign-off quorums (all / any / designated approvers),
ad-hoc approver insertion, per-stage email notifications, and auto-sync of
approved results into downstream systems. Executives could approve from
mobile, which removed multi-day waits on travelling CEO and Chairman
sign-offs.

*Digital technical documentation platform.* Led a three-person team building
a documentation platform for the Document Control Center, personally owning
schema design and stored procedures, with document-level access permissions
and event-driven update notifications, replacing Excel-and-paper document
control.

### ACTi Corporation, Taipei, Taiwan (Sep 2018 – Aug 2020)

**Software Engineer.** ACTi is a security technology (surveillance camera)
company.

Built a win-rate-weighted sales forecasting system (.NET Framework / MSSQL /
jQuery / Vue.js 2) querying live ERP and CRM databases, with interactive
drill-down from team-level rollups to individual project composition and
linked CRM records. It was used directly by the CEO for monthly, quarterly,
and annual sales performance reviews.

Re-engineered a legacy, unmaintained sales-commission engine into
maintainable MSSQL stored procedures handling multi-dimensional payout rules
(product model, country, order size, customer type), and built detail views
so sales staff could verify payout composition themselves, a finance- and
CEO-critical monthly process.

Developed company performance trend dashboards (Highcharts) unifying CRM
pipeline forecasts, projects, ERP orders, and shipments across two database
schemas.

## Education

**Humber Polytechnic, Toronto, Canada (Sep 2024 – May 2026).** Ontario
College Graduate Certificate, Information Technology Solutions with Honours.
Relevant coursework: Introduction to Database and SQL (90), Oracle Database
Programming (PL/SQL), Oracle Data Warehouse Fundamentals (91) and
Implementation, Machine Learning (96), Big Data 1 (96) and 2 (90), Business
Intelligence (Power BI / Tableau). Also completed: Java Programming 1 (90),
Advanced Java Programming, Data Structures and Design Patterns, Oracle DBA 1
(89), Operating Systems (93), Advanced Operating Systems (87), Web
Programming and Frameworks 1 and 2, Deep Learning, Requirements Analysis and
Process Modelling, Project Management, Capstone Project.

**National Formosa University, Yunlin, Taiwan (Sep 2011 – Jun 2015).**
Bachelor of Business Administration.

## Technical skills

- **Frontend:** React.js (React 19 + Vite), Next.js (App Router),
  TypeScript, Vue.js 3 / 2, Tailwind CSS, shadcn/ui, D3.js, Recharts, i18n
  (next-intl).
- **Backend:** Node.js (Next.js server runtime, Node 20), C# / .NET Core 6 /
  .NET Framework, REST APIs, MSSQL stored procedures.
- **Databases:** MSSQL (six years in production), PostgreSQL (Supabase),
  Oracle PL/SQL, relational data modeling, data warehousing.
- **ERP / CRM domain:** ERP and PLM integration, MRP / BOM,
  approval-workflow engines, CRM pipeline and sales-commission systems,
  manufacturing operations.
- **AI integration:** Claude API (@anthropic-ai/sdk), streaming responses,
  prompt caching, knowledge-pack guardrails, conversation logging and rate
  limiting, plus a Gemini fallback provider behind a shared adapter so an
  outage on one vendor does not take the assistant down.
- **Data and BI:** Python (pandas, statsmodels), ETL and data integration,
  GitHub Actions scheduling, Power BI, Tableau, dashboard design.
- **DevOps and tools:** Git, GitHub Actions, Vercel, Supabase, Linux
  (Ubuntu), Jira, Trello, Agile / Scrum.
- **Languages:** English (professional), Mandarin (native), Taiwanese
  (native).

## Also

He was Chairperson of the Employee Welfare Committee at Seasonic Electronics
from Sep 2022 to May 2024, coordinating employee activities, vendor
partnerships, and internal engagement.

## Volunteering

In 2025 he volunteered with Back Alley Barbell at strength competitions in
Toronto, setting up and then working the floor as a spotter and safety crew.
The events were a powerlifting competition that featured 36 lifters from 5
colleges across the province, Olympic weightlifting meets sanctioned by the
Ontario Weightlifting Association (OWA), and Back Alley's Strongest, a
strongman competition. Those are the details he has
given; there is no more on dates, venues, or his exact duties at each event.
