# Scaling TaskFlow for Production

## Current Architecture (Development)

```
Browser → Next.js (localhost:3000) → Express API (localhost:5000) → MongoDB (local)
```

## Target Production Architecture

```
Users → CDN (Vercel Edge) → Next.js → Load Balancer → Express Cluster → MongoDB Atlas
                                                     ↘ Redis (cache/sessions)
```

---

## 1. Authentication at Scale

**Current**: Single JWT in HttpOnly cookie (1hr expiry)

**Production**:
- Short-lived **access tokens** (15 min) + long-lived **refresh tokens** (7 days)
- Refresh tokens stored in **Redis** (invalidatable on logout/compromise)
- Access token rotation on every refresh
- This allows instant token revocation without DB hits on every request

```
POST /api/auth/refresh → validates refresh token in Redis → issues new access token
```

---

## 2. Frontend Scaling (Vercel)

- **Next.js App Router** is natively optimized for Vercel deployment
- Static pages served from the **edge CDN** globally (< 50ms TTFB)
- Server Components for data-heavy pages (no client-side waterfall)
- **ISR (Incremental Static Regeneration)** for semi-static pages (profile, docs)
- Environment variables managed via Vercel dashboard (not committed)

---

## 3. Backend Scaling (Node.js Cluster / Docker)

- **Containerize** with Docker → deploy to Railway, Render, or AWS ECS
- Use **Node.js Cluster module** or **PM2** to utilize all CPU cores
- Behind an **Nginx** reverse proxy with upstream load balancing
- **Horizontal scaling**: multiple API instances behind the load balancer
- Stateless design (JWT-based) makes horizontal scaling trivial

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
CMD ["node", "dist/server.js"]
```

---

## 4. Database Scaling (MongoDB Atlas)

- **MongoDB Atlas** with M10+ cluster (auto-scaled replica set)
- **Connection pooling** via Mongoose (`maxPoolSize: 10`)
- **Indexes** already applied: `{ user, status }` compound + text index on tasks
- For read-heavy workloads: **read from secondary replicas**
- For very large datasets: implement **cursor-based pagination** instead of skip/limit

---

## 5. Caching (Redis)

- Cache user profile responses: `GET /api/users/me` → cache for 5 min with user ID key
- Cache task list per user with short TTL
- Store rate limit counters in Redis instead of in-memory (works across multiple instances)
- Use **ioredis** client with connection pooling

---

## 6. API Layer Improvements

- Add **API versioning** (`/api/v1/...`) from day one
- Add **request/response logging** with Winston + request ID correlation
- Add **Sentry** for error tracking and performance monitoring
- Add **OpenAPI/Swagger** spec generation for team collaboration
- Add **throttle + queue** for expensive operations (bulk task imports)

---

## 7. CI/CD Pipeline

```yaml
# GitHub Actions → on push to main
1. Run TypeScript type-check
2. Run lint (ESLint)
3. Run tests (Jest + Supertest for API)
4. Build Docker image
5. Push to container registry
6. Deploy to staging → smoke test
7. Deploy to production (blue-green or rolling)
```

---

## 8. Frontend-Backend Integration (Production)

| Concern | Development | Production |
|---|---|---|
| API Base URL | `localhost:5000` | `https://api.taskflow.app` |
| Cookies | `SameSite=Strict; Secure=false` | `SameSite=None; Secure=true` |
| CORS | `localhost:3000` | `https://taskflow.app` |
| JWT Secret | `.env` file | Secrets Manager (AWS/Vault) |
| DB URI | Local MongoDB | MongoDB Atlas URI |

The frontend only needs `NEXT_PUBLIC_API_URL` updated — all API logic remains unchanged.
