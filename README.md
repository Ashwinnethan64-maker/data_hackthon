# AI-CIOS — Project Rainfall
## AI Crime Intelligence Operating System

A production-grade police intelligence platform built with React + TypeScript + Vite, backed by Zoho Catalyst serverless functions.

---

## Architecture

```
z:/data_hackthon/
├── frontend/            React + TypeScript + Vite application
├── functions/
│   └── ai-cios-api/     Zoho Catalyst Advanced I/O Function (Node.js 20)
│       ├── index.js         Express application entry point
│       ├── auth/            POST /auth/login, POST /auth/logout, GET /auth/me
│       ├── cases/           GET /cases, GET /cases/:firNumber
│       ├── analytics/       GET /analytics/dashboard
│       ├── ai/              POST /ai/chat
│       ├── map/             POST /map/analyze
│       ├── network/         GET /network/explanation
│       ├── reports/         POST /reports/pdf
│       └── mock/            Karnataka crime mock dataset (60 cases)
├── catalyst.json        Catalyst hosting + function targets
├── .catalystrc          Catalyst project binding (Project-Rainfall)
└── .env.example         Environment variable template
```

---

## Local Development

### Prerequisites
- Node.js 20+
- Zoho Catalyst CLI: `npm install -g zcatalyst-cli`

### Step 1: Install function dependencies
```powershell
cd functions/ai-cios-api
npm install
```

### Step 2: Start the Catalyst local emulator
From the project root:
```powershell
catalyst run --project 49890000000013025
```
This starts the function server on `http://localhost:3000`.

### Step 3: Start the frontend dev server
In a separate terminal:
```powershell
cd frontend
npm install
npm run dev
```
Vite proxies `/server` → `http://localhost:3000`, so all API calls work locally at `http://localhost:5173`.

---

## API Endpoints

All endpoints are served under `/server/ai-cios-api/` in production and proxied via `/server` in development.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Authenticate user |
| POST | `/auth/logout` | Logout user |
| GET | `/auth/me` | Get current session |
| GET | `/cases` | Get all FIR cases |
| GET | `/cases/:firNumber` | Get single FIR by number |
| GET | `/analytics/dashboard` | Get KPI dashboard data |
| POST | `/ai/chat` | Query the AI investigation assistant |
| POST | `/map/analyze` | Area analysis for map incidents |
| GET | `/network/explanation` | Criminal network AI explanation |
| POST | `/reports/pdf` | Generate PDF report |

---

## Catalyst Deployment

### Step 1: Authenticate CLI
```powershell
catalyst login
```

### Step 2: Build the frontend
```powershell
cd frontend
npm run build
```
This produces `frontend/dist/` which `catalyst.json` maps as the client hosting source.

### Step 3: Deploy everything
```powershell
cd ..
catalyst deploy
```
This deploys:
- **Catalyst Function**: `ai-cios-api` (Advanced I/O, Node.js 20)
- **Catalyst Web Client Hosting**: serves `frontend/dist/`

### Step 4: Verify
Visit your Catalyst project domain:
```
https://project-rainfall-60073452908.development.catalystapps.com
```

---

## Frontend Environment Variables

No `.env` file is needed for production. The `vite.config.ts` proxy is only used in local development.

For production builds, the `API_BASE_URL` in `frontend/src/utils/api.ts` automatically resolves to `/server/ai-cios-api` — which Catalyst's hosting layer routes to the function.

---

## Frontend Integration Rules

Only the following files were modified during Catalyst integration:
- `frontend/src/utils/api.ts` — NEW: shared fetch utility
- `frontend/vite.config.ts` — proxy added for local dev
- `frontend/src/store/AuthContext.tsx` — auth endpoints wired
- `frontend/src/modules/cases/services/caseService.ts` — real API call
- `frontend/src/modules/map/services/mapService.ts` — real API call  
- `frontend/src/modules/analytics/services/analyticsService.ts` — server KPI fetch added
- `frontend/src/modules/analytics/hooks/useAnalytics.ts` — useQuery for KPIs
- `frontend/src/modules/ai/services/mockAiService.ts` — API call to /ai/chat
- `frontend/src/modules/ai/hooks/useAiInvestigator.ts` — async handling
- `frontend/src/modules/network/services/networkService.ts` — real API call

**No UI components, pages, layouts, CSS, or Tailwind classes were changed.**
