# Job Search AI (V0 Skeleton)

Monolith Next.js app with API routes, Prisma/Postgres, Redis/BullMQ workers (scraper, resume-parse, matcher, auto-apply), and S3-compatible storage (MinIO) for resumes/screenshots.

## Environment variables

Copy and adapt:

\`\`\`
DATABASE_URL=postgresql://postgres:password@localhost:5432/jobsearch
REDIS_URL=redis://localhost:6379
JWT_SECRET=supersecret123
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=dev-bucket
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
PLAYWRIGHT_HEADLESS=true
GOOGLE_SHEET_SERVICE_ACCOUNT_JSON= # optional for later
\`\`\`

## Run locally

1) Start infra
- docker compose up -d

2) Install deps
- npm i

3) Generate Prisma client and migrate
- npx prisma generate
- npx prisma migrate dev --name init

4) Seed (optional quick data)
- node --loader ts-node/esm scripts/dev-seed.ts

5) Run Next.js (dev)
- npm run dev

6) Start workers (separate terminals)
- ts-node worker/resume-parse/index.ts
- ts-node worker/matcher/index.ts
- ts-node worker/scraper/index.ts
- ts-node worker/autoapply/index.ts

## Quick test

- Register user: POST /api/auth/register
- Login to get Bearer token
- Enqueue dev scrape seed (open a Node REPL or add a one-off route) or run scraper worker to seed
- Upload resume (multipart) to /api/users/me/resume
- GET /api/jobs to see scores
\`\`\`
