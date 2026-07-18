# AI‑CIOS Sprint Progress Tracker

> **Reference:** See the detailed project design roadmap in [AI-CIOS-Phase-5-Development-Roadmap.md](AI-CIOS-Phase-5-Development-Roadmap.md).

*Note: Sprints 1 through 3 (Foundations, Design System, and Core Architecture) are completed and archived.*

---

## ⚡ Current Sprint Detail: Sprint 5 (Case Explorer & Map Integration)

**Goal:** Enable comprehensive case exploration, advanced metadata filtering, GIS mapping with Leaflet, and interactive AI spatial analyses.

### 🔎 Case Explorer & API Integration Tasks

- [x] **Case Listing Layout & Data Table**: Construct responsive grid (`CaseTable.tsx`) with dynamic sorting of cases.
- [x] **Server-side Pagination**: Wire up pagination controls in `CaseTable.tsx` to handle page changes and row counts.
- [x] **Advanced Filtering Toolbar**: Refine `CaseFilters.tsx` UI & hooks to filter cases by acts, categories, districts, repeat offenders, and age/gender criteria.
- [x] **Case Detailed Profile Drawer**: Fully integrate `CaseDrawer.tsx` to show case timeline, victim, accused, and evidence profiles.
- [x] **Quick Action Operations**: Wired up "Ask AI" search routing, PDF exports, map focus redirection, and suspect network graphs links.
- [x] **Catalyst casesRouter Endpoint Integration**: Integrate case service queries to map records dynamically to MongoDB-like JSON profiles in Express endpoints.

### 🗺️ GIS & Crime Intelligence Map Integration Tasks

- [x] **Leaflet Base Map Setup**: Initialize Leaflet maps in `CrimeMap.tsx` targeting regional Karnataka crime zones.
- [x] **Clustered Incident Markers**: Render grouped pins with interactive icons representing severity levels using standard clustering.
- [x] **Heatmap Layer Rendering**: Integrate custom `HeatmapLayer.tsx` to visualize crime density hotspots using coordinates.
- [x] **Interactive Incident Popups**: Build popups detailing FIR categories, dates, assigned officers, and instant case details access.
- [x] **Map Toolbar & Filter Syncing**: Hook up UI filters from `MapToolbar.tsx` to refresh mapping markers reactively.
- [x] **AI Spatial Analyst Integration**: Wire up `AreaAnalysisPanel.tsx` with backend `/analyze` endpoint to generate AI-assisted patrol recommendations using GLM.

---

## Active & Upcoming Sprint Roadmap

| Sprint | Focus | Status |
| :--- | :--- | :--- |
| **Sprint 4** | AI & Authentication Integration | ✅ Done |
| **Sprint 5 (Current)** | Case Explorer & Map Integration | ✅ Done |
| **Sprint 6** | Criminal Network & Live Analytics | ⏳ Planned |
| **Sprint 7** | Reports & Settings Backend | ⏳ Planned |
| **Sprint 8** | Testing, Polish & Deployment | ⏳ Planned |

---

## Future Sprint Backlogs

### Sprint 5: Case Explorer & Map Integration
**Goal:** Enable drill-down case investigation and populate geographic data dynamically.

| Area | Task | Owner | Status |
| :--- | :--- | :--- | :--- |
| **Case Explorer** | List view with pagination | @dev‑case | ✅ Done |
| **Case Explorer** | Detailed case view with map & network integration | @dev‑case | ✅ Done |
| **Map** | Display interactive map (Leaflet) with markers | @dev‑map | ✅ Done |
| **Map** | Populate markers from backend service | @dev‑map | ✅ Done |

---

### Sprint 6: Criminal Network & Live Analytics
**Goal:** Deliver graph visualization relationships and live analytics metrics.

| Area | Task | Owner | Status |
| :--- | :--- | :--- | :--- |
| **Network Graph** | Implement D3 force‑graph component (mock data) | @dev‑graph | ✅ Done |
| **Network Graph** | Hook up real relationship data API | @dev‑graph | ⏳ To Do |
| **Dashboard** | Build Alerts widget (mock data → real API) | @dev‑ui | ✅ Done |
| **Dashboard** | Integrate KPI cards with live metrics | @dev‑ui | 🟡 In Progress |
| **Dashboard** | Add chart components (Chart.js) with real data source | @dev‑charts | ⏳ To Do |
| **Analytics** | Build analytics dashboard (filters, charts) | @dev‑analytics | 🟡 In Progress |

---

### Sprint 7: Reports & Settings Backend
**Goal:** Finalize user preferences persistence and support PDF reports generation.

| Area | Task | Owner | Status |
| :--- | :--- | :--- | :--- |
| **Settings** | UI for user preferences, theme toggle | @dev‑settings | ✅ Done |
| **Settings** | Persist settings via API | @dev‑settings | 🟡 In Progress |
| **Reports** | Generate PDF report template | @dev‑reports | ⏳ To Do |

---

### Sprint 8: Testing, Polish & Deployment
**Goal:** Finalize quality assurance, UI polishing, and Zoho Catalyst production deployment.

| Area | Task | Owner | Status |
| :--- | :--- | :--- | :--- |
| **Testing** | Write unit tests for core components | @dev‑qa | 🟡 In Progress |
| **Testing** | Set up Cypress end‑to‑end tests | @dev‑qa | ⏳ To Do |
| **Polish** | Handle loading states, skeleton screens, and empty states | @dev‑ui | ⏳ To Do |
| **Deployment** | Deploy frontend & functions to Zoho Catalyst and run final validation | @dev‑ops | ⏳ To Do |
| **Documentation** | Keep README up‑to‑date, add contribution guide | @dev‑docs | ✅ Done |
| **Documentation** | Link this Progress Tracker in repository root README | @dev‑docs | ✅ Done |

---

## Completed Milestones (Archived)
- **Sprint 1 (Phase 2): Foundations** - Core product design, shell layouts, routing setup.
- **Sprint 2 (Phase 3): Design System** - Setup themes, variables, and common buttons/UI components.
- **Sprint 3 (Phase 4): Architecture** - Define API endpoints, axios configuration, and Redux store state context.
- **Sprint 4 (Phase 5): AI & Authentication Integration** - Google SSO backend/frontend integration, JWT session protection, real LLM AI chat, and evidence citation backend logic.
