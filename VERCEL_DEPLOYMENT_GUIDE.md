# MediMitra — Vercel Deployment Guide

This repository is optimized for fullstack deployment on [Vercel](https://vercel.com). Both the **Vite + React frontend** and the **FastAPI Python backend** run seamlessly.

---

## Architecture Overview

- **Frontend**: Vite + React 19 + TailwindCSS v4 SPA, built into `frontend/dist`.
- **Backend**: FastAPI Python Serverless Function (`api/index.py`) handling all `/api/*` endpoints.
- **Unified Monorepo**: Frontend and Backend deploy together under the same domain.
  - Zero CORS configuration needed in production.
  - Client-side navigation (`/patient`, `/doctor`, `/auth`, etc.) falls back to `index.html` cleanly.
  - Python serverless functions bundle backend models, routers, and pre-seeded database files.

---

## Method 1: 1-Click Deployment via Vercel Dashboard (Recommended)

### Step 1: Push Code to GitHub
Ensure all your latest changes are pushed to your GitHub repository:
```bash
git add .
git commit -m "Optimize repository for Vercel deployment"
git push origin main
```

### Step 2: Import into Vercel
1. Log in to [vercel.com](https://vercel.com).
2. Click **"Add New..."** → **"Project"**.
3. Select your GitHub repository (`MediMitraprototype`).
4. **Project Configuration**:
   - **Root Directory**: Leave as `./` (Root directory).
   - **Framework Preset**: Vite (Auto-detected).
   - **Build Command**: `npm --prefix frontend install && npm --prefix frontend run build` (Pre-configured in `vercel.json`).
   - **Output Directory**: `frontend/dist` (Pre-configured in `vercel.json`).

### Step 3: Configure Environment Variables
Under **Environment Variables**, add:

| Key | Recommended Value | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | `your_google_gemini_api_key` | Google Gemini API key for clinical triage & neural chat |
| `JWT_SECRET` | *A secure random string* | Secret key for JWT authentication tokens |
| `DATABASE_URL` *(Optional)* | `postgresql://...` | Connection string for Neon, Supabase, or Vercel Postgres |

> **Note on Database**:
> If `DATABASE_URL` is not provided, MediMitra automatically uses `/tmp/medimitra.db` (ephemeral SQLite) initialized with the pre-seeded demo doctor. For long-term production persistence across serverless cold starts, create a free database on [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com) and paste the connection string into `DATABASE_URL`.

### Step 4: Deploy!
Click **"Deploy"**. Vercel will:
1. Install frontend dependencies and build the Vite client.
2. Package `api/index.py` and the `backend` modules into AWS Lambda serverless functions.
3. Assign you a live production URL: `https://your-project.vercel.app`.

---

## Method 2: Deploy via Vercel CLI

If you have the [Vercel CLI](https://vercel.com/docs/cli) installed:

```bash
# Login to Vercel
vercel login

# Preview Deployment
vercel

# Production Deployment
vercel --prod
```

When prompted:
- **Link to existing project?**: No (or select your project if created)
- **What's your project's name?**: `medimitra`
- **In which directory is your code located?**: `./`

---

## Method 3: Dual-Project Deployment (Frontend & Backend Separately)

If you prefer two completely isolated Vercel projects (e.g., `medimitra-web.vercel.app` and `medimitra-api.vercel.app`):

### Project A: Backend API
1. Import repository into Vercel.
2. Set **Root Directory** to `backend`.
3. Add environment variables (`GEMINI_API_KEY`, `JWT_SECRET`, optional `DATABASE_URL`).
4. Deploy. Note your backend URL (e.g. `https://medimitra-api.vercel.app`).

### Project B: Frontend Web App
1. Import the same repository into a new Vercel project.
2. Set **Root Directory** to `frontend`.
3. Under **Environment Variables**, set:
   ```
   VITE_API_BASE_URL = https://medimitra-api.vercel.app
   VITE_GEMINI_API_KEY = your_google_gemini_api_key
   ```
4. Deploy.

---

## Pre-Seeded Demo Credentials

The platform initializes with a demonstration clinician account for testing:

- **Doctor Email**: `dr.sharma@medimitra.health`
- **Password**: `Doctor@123`
- **Role**: Clinician / Doctor Dashboard Access

New patients can register directly on the Auth page or start intake sessions immediately.

---

## Local Development (Unchanged)

Local development remains simple and requires zero changes:

```bash
# Terminal 1: Backend
python -m uvicorn backend.app.main:app --reload --port 8000

# Terminal 2: Frontend
npm --prefix frontend run dev
```

The Vite dev server proxies `/api` requests directly to `http://127.0.0.1:8000`.
