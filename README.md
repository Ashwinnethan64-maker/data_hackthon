# AI-CIOS — Project Rainfall

## AI Crime Intelligence Operating System

A production-grade police intelligence platform built with React + TypeScript + Vite, backed by Zoho Catalyst serverless functions.

---

## Architecture

```
./
├── frontend/            React + TypeScript + Vite application
├── functions/
│   └── ai-cios/         Zoho Catalyst Advanced I/O Function (Node.js 24)
│       ├── index.js         Express application entry point
│       ├── auth/            POST /auth/login, POST /auth/logout, GET /auth/me
│       ├── cases/           GET /cases, GET /cases/:firNumber
│       ├── analytics/       GET /analytics/dashboard
│       ├── ai/              POST /ai/chat
│       ├── map/             POST /map/analyze
│       ├── network/         GET /network/explanation
│       ├── reports/         POST /reports/pdf
│       └── mock/            Karnataka crime mock dataset (60 cases)
│   ├── catalyst.json        Catalyst hosting + function targets
│   ├── .catalystrc          Catalyst project binding (Project-Rainfall)
│   └── .env.example         Environment variable template
```

---

## Cloud Configuration Setup

Before running the application, you must configure the authentication services on Google Cloud and Zoho Catalyst.

### 1. Google Cloud Console Setup (SSO Credentials)

You need to generate a Google Client ID to enable the Google login popup flow:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., `AI-CIOS Platform`).
3. Navigate to **APIs & Services** > **OAuth consent screen**:
   - Select **External** (or Internal if you are within a workspace organization) and click **Create**.
   - Fill in the mandatory app information (App Name, User Support Email, Developer Contact).
   - Click **Save and Continue** through the scopes and test users sections.
4. Navigate to **APIs & Services** > **Credentials**:
   - Click **+ Create Credentials** at the top and select **OAuth client ID**.
   - Set **Application type** to **Web application**.
   - Under **Authorized JavaScript origins**, add:
     - `http://localhost:3000` (Origin of local Catalyst serve emulator)
     - `http://localhost:5173` (Origin of local Vite dev server)
     - _(Once your app is deployed, add your production Catalyst domain here, e.g. `https://project-rainfall-60078581117.development.catalystserverless.in`)_
   - Under **Authorized redirect URIs**, add:
     - `http://localhost:3000/app/login`
     - `http://localhost:5173/app/login`
     - _(Once deployed, add your production login URI here, e.g. `https://project-rainfall-60078581117.development.catalystserverless.in/app/login`)_
5. Click **Create** and copy the generated **Client ID** (you will paste this in the `frontend/.env` file, and in Catalyst Console).

---

### 2. Zoho Catalyst Console Setup (Database & Auth)

Configure the following items in your [Zoho Catalyst Console](https://console.catalyst.zoho.com/):

#### A. Database Schema

1. Go to **Cloud Scale** > **Data Store** in your project sidebar.
2. Click **Create Table** and name it **`officers`**.
3. Create the following custom columns (all columns of type **`VarChar` / Text** with default lengths):
   - `username` (holds email ID, e.g. investigator.ash@police.in)
   - `password` (holds encrypted passwords)
   - `name` (officer's full name)
   - `role` (investigator, analyst, supervisor, or administrator)
   - `policeStation` (assigned station)
   - `district` (assigned district)

_Note: On your first login attempt locally, the server will automatically seed the standard sandbox developer accounts (`admin`, `officer`, `analyst`, `supervisor`) with dummy credentials so you can start testing immediately._

#### B. Enable Third-Party Authentication

1. Navigate to **Security & Identity** > **Authentication**.
2. Go to the **Third-party Authentication** tab.
3. Toggle the **Enable** switch to **On**. _(If disabled, Zoho's endpoint will return a 500 error during handshakes)_.
4. Go to **Native Catalyst Authentication** and ensure **Public Signup** is enabled.

#### C. Authorize Local Development Origins (CORS)

1. In the **Authentication** tab, click on the **Authorized Domains** sub-tab.
2. Click **Add Domain** and add:
   - `http://localhost:3000` — Tick the **CORS** checkmark and click **Save**.
   - `http://localhost:5173` — Tick the **CORS** checkmark and click **Save**.
     _(Note: Without these entries, the browser will block session cookies/handshakes locally due to Same-Origin Policy)._

---

## Local Development

### Prerequisites

- Node.js 24
- Zoho Catalyst CLI: `npm install -g zcatalyst-cli`

### Step 1: Setup Local Project Mapping

Authenticate the Catalyst CLI and link this repository to your Zoho Catalyst project:

```bash
# Login to Zoho Catalyst
catalyst login

# Link the project (creates .catalystrc mapped to your sandbox)
catalyst use
# (or catalyst init if starting from a fresh space)
```

### Step 2: Configure Environment Variables

Copy the frontend environment variable template:

```bash
cp frontend/.env.example frontend/.env
```

Open `frontend/.env` and update your keys:

- `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth 2.0 Client ID.
- `VITE_CATALYST_CLIENT_ID`: Your Zoho Catalyst Org ID (Environment ZAID).

_Note: For production, Vite compiles environment variables at build-time. When compiling the application for production (`npm run build`), ensure that your `frontend/.env` is configured with your production Google Client ID. No runtime configuration is needed on the server, as the Catalyst API base path dynamically resolves to `/server/ai-cios/` automatically._

### Step 3: Install Dependencies

Install dependencies from the project root directory:

```bash
# Frontend
cd frontend && npm install

# Backend
cd ../functions/ai-cios && npm install

# Return to root
cd ../..
```

### Step 4: Start the Catalyst Emulator & App

From the project root directory, start the Catalyst CLI local serve server:

```bash
catalyst serve
```

This runs the local server on `http://localhost:3000/`.

- The client web app is served at `http://localhost:3000/app/` (recommended for testing login/sessions).
- The API endpoints are served at `http://localhost:3000/server/ai-cios/`.

For active UI development with Hot Module Replacement (HMR):

```bash
cd frontend && npm run dev
```

(Accessed at `http://localhost:5173/app/`, utilizing the configured Vite proxies).

---

## API Endpoints

All endpoints are served under `/server/ai-cios/` in production and proxied via `/server` in development.

| Method | Endpoint               | Description                              |
| ------ | ---------------------- | ---------------------------------------- |
| POST   | `/auth/login`          | Authenticate user (standard login)       |
| POST   | `/auth/logout`         | Logout user                              |
| GET    | `/auth/me`             | Get current authenticated session        |
| POST   | `/auth/google-login`   | Authenticate Google SSO & get custom JWT |
| GET    | `/cases`               | Get all FIR cases                        |
| GET    | `/cases/:firNumber`    | Get single FIR by number                 |
| GET    | `/analytics/dashboard` | Get KPI dashboard data                   |
| POST   | `/ai/chat`             | Query the AI investigation assistant     |
| POST   | `/map/analyze`         | Area analysis for map incidents          |
| GET    | `/network/explanation` | Criminal network AI explanation          |
| POST   | `/reports/pdf`         | Generate PDF report                      |

---

## Catalyst Deployment

### Step 1: Build the frontend

```bash
cd frontend && npm run build && cd ..
```

This produces the compiled client assets in `frontend/dist/` (which `catalyst.json` maps as the client hosting source).

### Step 2: Deploy everything

From the project root:

```bash
catalyst deploy
```

This deploys:

- **Catalyst Function**: `ai-cios` (Advanced I/O, Node.js 24)
- **Catalyst Web Client Hosting**: serves `frontend/dist/`
