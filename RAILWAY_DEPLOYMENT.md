# Railway Deployment Guide

## Overview

Deploy from your laptop using the Railway CLI. It builds Docker images locally and pushes them to Railway. Migrations run automatically when the backend starts.

## One-Time Setup

### 1. Install Railway CLI

```bash
npm i -g @railway/cli
```

### 2. Login and Link

```bash
railway login
railway link
```

### 3. Create Services in Railway Dashboard

1. Go to https://railway.app/dashboard
2. Create a new project
3. Add **PostgreSQL** database: **"+ New"** → **"Database"** → **"PostgreSQL"**
4. Add **Backend** service: **"+ New"** → **"Empty Service"** → Name it `backend`
5. Add **Frontend** service: **"+ New"** → **"Empty Service"** → Name it `frontend`

### 4. Configure Backend Variables

Click on the backend service → **Variables**:

```
DATABASE_URL=<select the right database url>
AUTH_ISSUER=https://auth.gbandit.com
AUTH_AUDIENCE=game-backend
AUTH_JWKS_URL=https://auth.gbandit.com/.well-known/jwks.json
```

### 5. Configure Frontend

No environment variables needed.

## Deploying

```bash
# Deploy backend
railway up -s <your-game>-backend --path-as-root game/backend

# Deploy frontend
railway up -s <your-game>frontend --path-as-root game/frontend
```

The backend runs migrations automatically on startup.
