# AI-CIOS

## Phase 4 - System Architecture and Technical Blueprint

**Product:** AI Crime Intelligence Operating System  
**Version:** v1.0 Hackathon MVP  
**Purpose of this phase:** define a scalable, hackathon-friendly architecture that can be built quickly, looks production-ready, and is easy to demo.

This architecture is intentionally simple where it should be simple, modular where it matters, and optimized for a high-confidence hackathon delivery.

## 1. Architecture Goals

The system must:

- Meet all hackathon requirements
- Use Zoho Catalyst appropriately
- Support fast development
- Look production-ready in the demo
- Keep AI integrated across the product
- Be easy to extend after the hackathon

## 2. High-Level Architecture

```text
                         AI-CIOS

                    React + TypeScript
                           │
                           ▼
                    Zoho Catalyst Hosting
                           │
                           ▼
                    Catalyst Authentication
                           │
                           ▼
                    Catalyst API Gateway
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
 AI Service          Search Service      Analytics Service
        │                  │                  │
        ├──────────────────┼──────────────────┤
                           ▼
                  Catalyst Data Store
                           │
                           ▼
                  Crime Database Tables
```

### Architectural Interpretation

- React + TypeScript hosts the full frontend experience.
- Zoho Catalyst handles hosting, authentication, serverless functions, file storage, and database access.
- API Gateway exposes backend capabilities in a clean, service-oriented way.
- Specialized services keep AI, search, analytics, and reports separate.
- Catalyst Data Store is the source of truth for structured records.

## 3. Architecture Principles

1. Keep the MVP modular, not overengineered.
2. Use Catalyst primitives wherever possible.
3. Separate concerns by service, not by giant monolith.
4. Keep the AI layer centrally available across modules.
5. Design APIs around user outcomes, not internal implementation.
6. Prefer evidence-backed responses and traceable data flows.
7. Make the demo path fast and reliable.

## 4. Complete Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form
- Zod

### Visualization
- Apache ECharts for charts
- React Flow for criminal network graphs
- Leaflet for maps
- Framer Motion for subtle animations

### Backend
- Zoho Catalyst Functions
- Node.js runtime
- Catalyst Data Store
- Catalyst Authentication
- Catalyst File Store

### AI Layer
- LLM for conversational intelligence
- Prompt engine for query processing
- Summary engine for case summaries
- Recommendation engine for similar cases
- Explainable AI for evidence and confidence

## 5. Frontend Architecture

### Frontend Responsibilities
- Render the full UI shell
- Handle navigation and page transitions
- Manage query and filter state
- Call backend APIs
- Display charts, graphs, maps, and reports
- Render AI output with evidence and confidence

### Frontend Folder Structure

```text
frontend/
├── src/
│   ├── assets/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── modules/
│   │   ├── dashboard/
│   │   ├── ai/
│   │   ├── cases/
│   │   ├── network/
│   │   ├── analytics/
│   │   ├── map/
│   │   └── reports/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   ├── types/
│   └── utils/
```

### Frontend Design Rules
- Keep pages feature-oriented, not infrastructure-oriented.
- Keep data fetching centralized in services or hooks.
- Use reusable page layouts and module boundaries.
- Keep chart, map, and graph integrations isolated from general UI components.

## 6. Backend Architecture

### Backend Responsibilities
- Authenticate users
- Expose API endpoints
- Query structured crime data
- Generate AI responses
- Generate analytics payloads
- Produce PDF-ready report content
- Build relationship graphs

### Backend Folder Structure

```text
backend/
├── auth/
├── ai/
├── analytics/
├── search/
├── reports/
├── network/
└── middleware/
```

### Backend Design Rules
- Keep each service narrow and focused.
- Avoid cross-service duplication.
- Use a shared middleware layer for validation, authorization, and logging.
- Keep the AI service separate from standard search and analytics logic.

## 7. Backend Services

### Authentication Service
Handles:
- Login
- Logout
- Role checks
- Session / JWT validation

### Crime Service
Handles:
- Search FIRs
- Search victims
- Search accused
- Search officers
- Fetch case details

### Analytics Service
Handles:
- Trends
- Statistics
- Heatmaps
- KPIs
- District comparison

### AI Service
Handles:
- Natural language processing
- Summaries
- Recommendations
- Explainable AI responses

### Report Service
Handles:
- Generate PDF
- Export AI conversation
- Export analytics views
- Package case summaries

### Network Service
Handles:
- Relationship graph generation
- Node generation
- Link analysis
- Entity expansion

## 8. Database Design

The Catalyst Data Store should align with the provided ER model.

### Core Tables
- CaseMaster
- Victim
- Accused
- Complainant
- PoliceStation
- District
- State
- Officer
- Court
- CrimeHead
- CrimeSubHead
- Act
- Section
- ChargeSheet
- Arrest

### Data Modeling Rules
- Use CaseMaster as the primary record anchor.
- Connect entities through foreign keys or lookup references where appropriate.
- Keep lookups normalized enough to avoid duplication, but not so normalized that hackathon delivery becomes slow.
- Preserve enough structure to support search, analytics, and network traversal.

### Data Strategy
- Use the ER-aligned tables as the main source of truth.
- Create derived views or helper queries for dashboard, analytics, and AI use cases.
- Keep mock data compatible with the same schema so development can continue before real data lands.

## 9. API Blueprint

The API should be outcome-oriented and easy for the frontend to consume.

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Cases
- `GET /api/cases`
- `GET /api/cases/:id`
- `GET /api/cases/search`

### AI
- `POST /api/ai/chat`
- `POST /api/ai/summarize`
- `POST /api/ai/recommend`

### Analytics
- `GET /api/analytics/dashboard`
- `GET /api/analytics/trends`
- `GET /api/analytics/hotspots`

### Reports
- `POST /api/report/pdf`

### Network
- `GET /api/network/:caseId`

### API Design Rules
- Endpoints should map to user tasks.
- Responses should be structured for direct UI rendering.
- AI endpoints should return summary, evidence, confidence, and related records.
- Analytics endpoints should return chart-ready data.

## 10. AI Workflow

### Example Query
"Show burglary cases in Bengaluru."

### Flow

```text
User
   │
   ▼
Prompt Processor
   │
   ▼
Intent Detection
   │
   ▼
Database Query
   │
   ▼
Result Formatter
   │
   ▼
LLM Response
   │
   ▼
Evidence References
   │
   ▼
Response to User
```

### AI Response Requirements
Every answer should include:
- Summary
- Supporting records
- Confidence where applicable

### AI Design Rule
AI is not a separate feature page. It is the central intelligence layer across the product.

## 11. AI Integration Model

Every major module should expose an Ask AI action.

### AI Entry Points
- Dashboard → Explain today’s hotspots
- Case Details → Summarize this FIR
- Network Graph → Explain this suspect’s connections
- Analytics → Why did cybercrime increase?
- Crime Map → Which district needs attention?

### Integration Principle
AI should feel embedded, not isolated.

This is important for two reasons:
- It makes the product more useful.
- It makes the demo more memorable because intelligence is available everywhere.

## 12. Dashboard Data Flow

```text
Database
      │
      ▼
Analytics Service
      │
      ▼
Dashboard API
      │
      ▼
React Query
      │
      ▼
Charts + KPI Cards
```

### Dashboard Design Rule
The dashboard should be fed from an analytics-ready API, not from raw database queries in the UI.

## 13. Authentication Flow

```text
Login

↓

Catalyst Authentication

↓

JWT / Session

↓

Role Verification

↓

Dashboard
```

### Roles
- Investigator
- Analyst
- Supervisor
- Administrator

### Auth Rules
- Use role checks to gate sensitive views.
- Keep the login flow simple for the demo.
- Make the user context visible in the app shell.

## 14. Frontend Pages

```text
/
├── Login
├── Dashboard
├── AI Investigator
├── Case Explorer
├── Case Details
├── Criminal Network
├── Crime Map
├── Analytics
├── Reports
└── Settings
```

## 15. Development Timeline

### Sprint 1
- Project setup
- Authentication
- Layout
- Navigation

### Sprint 2
- Dashboard
- Case Explorer
- Search

### Sprint 3
- AI Investigator
- Reports

### Sprint 4
- Criminal Network
- Crime Map
- Analytics

### Sprint 5
- Integration
- Testing
- Deployment

### Timeline Rules
- Build the demo-critical path first.
- Keep sprint goals visible and narrow.
- Avoid spreading effort across too many unfinished modules.

## 16. Risk Management

### Risks and Mitigations
- Dataset arrives late: develop with mock data
- AI integration issues: build a modular AI service
- Catalyst learning curve: keep services small and focused
- Time pressure: freeze MVP scope early

### Risk Rule
If a feature does not improve the demo path, it should not be prioritized ahead of the MVP flow.

## 17. Definition of MVP

The MVP is successful if an investigator can:

1. Log in.
2. Search for a case.
3. Ask the AI a question.
4. View a case summary.
5. Explore the relationship graph.
6. See crime analytics.
7. Export a report.

If those seven actions work smoothly, the product is demo-ready.

## 18. Technical Decisions Summary

### What We Are Using
- React + TypeScript frontend
- Zoho Catalyst backend and hosting
- Catalyst Authentication for login
- Catalyst Data Store for crime data
- Catalyst File Store for reports and exports
- AI service as a central layer
- Modular APIs for search, analytics, network, and reports

### Why This Works
- Fast to build
- Easy to demo
- Production-looking architecture
- Clear separation of responsibilities
- Scales beyond the hackathon if needed

## 19. Phase 4 Complete

We now have:

- System architecture
- Technology stack
- Folder structure
- Backend services
- API blueprint
- Database alignment
- AI workflow
- Authentication design
- Development plan
- Risk management strategy

The key architectural improvement is now explicit: AI-CIOS is not just a chatbot page. It is an intelligence platform where AI is available across all major workflows.
