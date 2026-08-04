# Profile

Suyu Cheng is a software engineer based in Toronto, Ontario, focused on data
engineering, analytics engineering, and business intelligence. He has 6+
years building data-intensive systems for a multinational manufacturer:
ERP/PLM data integration, SQL-heavy backends, and analytics platforms used
daily by executives, planners, and finance, as part of a two-to-three
person internal development team. He recently completed postgraduate IT
studies in Toronto and built three end-to-end Python + PostgreSQL analytics
platforms with automated ETL, statistical modeling, and deployed web
frontends.

## Work experience

### Seasonic Electronics, Taipei, Taiwan (Sep 2020 – Jun 2024)

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

**Software Engineer.**

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

**Humber Polytechnic, Toronto, Canada (Sep 2024 – Jun 2026).** Postgraduate
Degree, Information Technology Solutions. Honours in three of four terms.
Relevant coursework: Big Data 1 (96) and 2 (90), Machine Learning (96), Deep
Learning, Business Intelligence, Fundamentals of Data Analytics, Oracle Data
Warehouse Fundamentals (91) and Implementation, Oracle DBA 1, Oracle
Database Programming (PL/SQL), Introduction to Database and SQL (90).

**National Formosa University, Yunlin, Taiwan (Sep 2011 – Jun 2015).**
Bachelor of Business Administration.

## Technical skills

- **Data engineering:** SQL (MSSQL, six years in production; PostgreSQL;
  Oracle PL/SQL), Python (pandas, statsmodels), ETL and data integration,
  data modeling, data warehousing, stored procedures, GitHub Actions
  scheduling.
- **Business intelligence:** Power BI, Tableau, Excel, dashboard design, KPI
  tracking.
- **Programming:** C#, .NET Core 6, Vue.js 3. (The portfolio projects also
  use Next.js, TypeScript, and D3.)
- **Tools and platforms:** Git, Linux (Ubuntu), Jira, Trello, Agile / Scrum.
- **Languages:** English (professional), Mandarin (native), Taiwanese
  (native).

## Also

He was Chairperson of the Employee Welfare Committee at Seasonic Electronics
from Sep 2022 to Jun 2024, coordinating employee activities, vendor
partnerships, and internal engagement.
