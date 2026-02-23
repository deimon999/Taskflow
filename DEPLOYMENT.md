# TaskFlow — Production Deployment Guide

## Architecture Overview

```
Users → Vercel (Next.js frontend) → Render (Express API) → MongoDB Atlas
```

---

## 1. MongoDB Atlas Setup

1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a database user (username + password)
3. Whitelist `0.0.0.0/0` under **Network Access** (allows Render's dynamic IPs)
4. Copy the connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.mongodb.net/task-dashboard?retryWrites=true&w=majority
   ```

---

## 2. Deploy Backend on Render

### Steps
1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo and select the repo root
3. Configure the service:

| Setting | Value |
|---------|-------|
| **Root Directory** | `backend` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` (runs `node dist/server.js`) |
| **Environment** | `Node` |

### Required Environment Variables (add in Render dashboard)

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long, random secret string (min 32 chars) |
| `CLIENT_ORIGIN` | `https://your-app.vercel.app` ← add after Vercel deploy |
| `PORT` | (Render sets this automatically — do not override) |

### Verify deployment
```
GET https://your-backend.onrender.com/api/health
→ { "status": "ok" }
```

---

## 3. Deploy Frontend on Vercel

### Steps
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Configure the project:

| Setting | Value |
|---------|-------|
| **Root Directory** | `frontend` |
| **Framework Preset** | Next.js |
| **Build Command** | `npm run build` (auto-detected) |

### Required Environment Variable (add in Vercel dashboard)

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com/api` |

---

## 4. Final Step — Wire Frontend ↔ Backend

After both are deployed:

1. Copy your **Vercel URL** (e.g. `https://taskflow-xyz.vercel.app`)
2. Go back to **Render → your service → Environment**
3. Set `CLIENT_ORIGIN` = `https://taskflow-xyz.vercel.app`
4. Render will redeploy automatically

---

## 5. Cookie Configuration Notes

Cross-origin cookies between Render and Vercel require specific settings — already configured in this codebase:

```typescript
// backend/src/utils/generateToken.ts
res.cookie('jwt', token, {
    httpOnly: true,
    secure: true,          // Required for HTTPS
    sameSite: 'none',      // Required for cross-origin requests
    maxAge: 60 * 60 * 1000 // 1 hour
});
```

> ⚠️ **Both `secure: true` and `sameSite: 'none'` are required together** for cookies to work across different domains (Render → Vercel). This is already handled automatically by the `NODE_ENV=production` check.

---

## 6. Security Checklist

- [x] Passwords hashed with bcrypt (10 rounds)
- [x] JWT stored in HttpOnly cookie (not accessible via JS)
- [x] `secure: true` + `sameSite: none` for production cookies
- [x] CORS restricted to `CLIENT_ORIGIN` only
- [x] Helmet HTTP security headers enabled
- [x] Rate limiting: 100 req/15min globally, 50 req/hr on auth routes
- [x] Task ownership validated on every CRUD operation (403 if not owner)
- [x] No secrets committed to version control (`.env` is gitignored)

---

## 7. Environment Variables Summary

### Backend (Render)
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
CLIENT_ORIGIN=https://your-app.vercel.app
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
```

---

## Local Development

```bash
# Backend
cd backend
cp .env.example .env   # fill in your values
npm install
npm run dev            # starts on localhost:5000

# Frontend
cd frontend
cp .env.example .env.local   # fill in your values
npm install
npm run dev                  # starts on localhost:3000
```
