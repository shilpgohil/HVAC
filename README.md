# HVAC Digital Twin & Supervisory Control Platform

Industrial-grade, configuration-driven digital twin and supervisory control platform for mission-critical HVAC installations (Air Handling Units, Multi-Zone Outdoor Condenser Inverters, 8-Stage Modulating Electric Reheat Bank, and Facility Electrical Power Grid).

---

## Architecture Overview

```
+---------------------------------------------------------------------------------+
|                                 FRONTEND (Vercel)                               |
|   Next.js 15 App Router · React 19 · Tailwind CSS · MotionTabs (Fluid UI)        |
|   Interactive SVG Twin · Single-Line Diagram · Cleanroom Psychrometric Trends   |
+---------------------------------------+-----------------------------------------+
                                        |  REST / WebSocket (WSS)
                                        v
+---------------------------------------------------------------------------------+
|                                 BACKEND (Render)                                |
|   FastAPI · Uvicorn · SQLAlchemy Async · Thermodynamic Physics Simulator        |
|   1-Second Real-Time Telemetry Stream · ISA-18.2 Alarms · Modbus PLC Abstraction |
+---------------------------------------------------------------------------------+
```

---

## Deployment to Vercel (Frontend)

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project** and select repository `shilpgohil/HVAC`.
3. In **Project Configuration**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend` *(click Edit and select `frontend`)*
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. In **Environment Variables**, add:
   ```env
   NEXT_PUBLIC_API_URL=https://<your-render-app>.onrender.com/api/v1
   NEXT_PUBLIC_WS_URL=wss://<your-render-app>.onrender.com/ws/telemetry
   ```
5. Click **Deploy**.

---

## Deployment to Render (Backend)

1. Go to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your repository `shilpgohil/HVAC`.
4. Fill in the settings:
   - **Name**: `hvac-digital-twin-backend`
   - **Region**: Oregon (US West) or closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free
5. In **Advanced**:
   - **Health Check Path**: `/health`
   - **Auto-Deploy**: Yes
6. Click **Create Web Service**.

---

## 24/7 Keep-Alive Setup (Prevent Render Free Tier from Sleeping)

Render free instances spin down after 15 minutes of inactivity. This repository includes an automated keep-alive pipeline to ensure **zero downtime**:

### Option 1: GitHub Actions Keep-Alive (Built-in)
The workflow file [`.github/workflows/render_keep_alive.yml`](.github/workflows/render_keep_alive.yml) runs every 10 minutes on GitHub's infrastructure and pings your Render `/health` endpoint.
1. In your GitHub repo, go to **Settings** -> **Secrets and variables** -> **Actions**.
2. Add a repository secret:
   - **Name**: `RENDER_BACKEND_URL`
   - **Value**: `https://<your-render-app-name>.onrender.com`

### Option 2: Free External Uptime Monitor
Alternatively, add your health check URL to:
- [cron-job.org](https://cron-job.org): Free cron job set to execute `GET https://<your-render-app>.onrender.com/health` every 10 minutes.
- [UptimeRobot](https://uptimerobot.com): Free HTTP(s) monitor with a 5-minute interval targeting `/health`.

### Option 3: Local Daemon Script
Run the included python daemon anytime:
```bash
python scripts/keep_alive.py https://<your-render-app>.onrender.com
```

---

## Local Development

### 1. Backend
```bash
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend API will be running on `http://127.0.0.1:8000` (docs at `http://127.0.0.1:8000/docs`).

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.
