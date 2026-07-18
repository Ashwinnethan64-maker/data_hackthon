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

### 2. Zoho Catalyst Console Setup (Database, Auth & CORS)

To configure the entire database schema, security rules, allowed CORS domains, and user roles automatically inside a fresh project:

1. Go to your [Zoho Catalyst Console](https://console.catalyst.zoho.com/) (project selection screen).
2. Click on the **Settings** icon (located on the right side of the top bar).
3. Select **Infrastructure as Code** (under the **General Settings** section).
4. Click on **Import New Project**.
5. Enter a name for your new project, and upload the **`project-template.zip`** file located in the root of this repository.
6. Click the **Import** button. Catalyst will automatically spin up a fresh project pre-configured with all necessary datastore tables, columns, constraints, and CORS authorized domains.

---

### 3. Setting Up the QuickML Connection

The application uses Zoho QuickML for advanced AI model execution. You must set up and authorize this integration connection manually in the Catalyst console:

1. In the Catalyst Console sidebar under **Cloud Scale**, navigate to **Security & Identity** > **Connections**.
2. Click **Create Connection** and configure:
   - **Service Name:** Select **`Catalyst by Zoho`**.
   - **Connection Name:** Enter **`quickml_connection`**.
   - **Scopes:** Select or add `QuickML.deployment.READ` (or whatever scope is required for QuickML access).
3. Click **Create and Connect**.
4. You will be redirected to an authorization screen. Click **Connect**, and on the next redirect, tick the checkbox (allow access to account) and click the **Accept** button to authorize the connection under your Zoho account.

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
catalyst project:use
# (or catalyst init if starting from a fresh space)
```

### Step 2: Configure Environment Variables

Copy the environment variable templates for both the frontend and backend:

```bash
cp frontend/.env.example frontend/.env
cp functions/ai-cios/.env.example functions/ai-cios/.env
```

#### Extracting your Catalyst IDs

Open your new project's dashboard in the Zoho Catalyst Console. The URL in the browser address bar will look like this:

```
https://console.catalyst.zoho.in/baas/<Organization ID>/project/<Project ID>/Development#/...
```

Extract the following IDs from the URL:

- **Organization ID (ZAID):** The number directly after `/baas/`.
- **Project ID:** The number directly after `/project/`.

#### Update variables:

1. Open **`frontend/.env`** and configure:
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth 2.0 Client ID.
   - `VITE_CATALYST_CLIENT_ID`: Your **Organization ID (ZAID)**.
2. Open **`functions/ai-cios/.env`** and configure:
   - `CATALYST_ORG_ID`: Your **Organization ID (ZAID)**.
   - `CATALYST_PROJECT_ID`: Your **Project ID**.

### Step 3: Install Dependencies

Install dependencies from the project root directory:

```bash
# Frontend
cd frontend
npm install
npm run build

# Backend
cd ../functions/ai-cios
npm install

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

### Step 5: Seed Mock Reference Data

To populate your database tables with the official Karnataka Police Department 10-case mock reference set, trigger the seed endpoint:

```bash
curl -X POST http://localhost:3000/server/ai-cios/system/seed-demo-data
```

> [!NOTE]
> * **Auto-Seeded Officers**: Officer/Employee profiles are automatically created when you log in or access the login page.
> * **Seeding Skip Logic**: Seeding will skip if data already exists in the database. To force a clean reseed, restart the emulator server (resets the local in-memory fallback store) or manually empty the `firs` table in the Catalyst Data Store Console.

For active UI development with Hot Module Replacement (HMR):

```bash
cd frontend
npm run dev
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
cd frontend
npm run build
cd ..
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
