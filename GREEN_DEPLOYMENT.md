# Green Production Deployment

## Blue / Green model

- **Blue:** `main` and the existing production Vercel deployment.
- **Green:** `green` branch and a separate Vercel project.
- Green uses the same production backend by default.
- Green can use an optional backend failover list through `VITE_API_URLS`.

## Vercel settings

Create a separate Vercel project from this repository and set the production branch to `green`.

Build command:
`npm run build`

Output directory:
`dist`

Required environment variables:
`VITE_API_URL=https://top-tier-backend-sbd5.onrender.com`

Optional:
`VITE_API_URLS=https://top-tier-backend-sbd5.onrender.com,https://YOUR-BACKUP-BACKEND`

## Safety rule

Do not point Blue and Green at different databases. Both environments must use the same backend/data source during validation unless a deliberate staging database is created.

## Promotion

1. Deploy Green separately.
2. Test authentication, dashboard, tasks, Telegram verification, referrals, leaderboard, wallet, demo trading, admin functions and PWA installation.
3. Confirm API errors do not cause an unrecoverable app state.
4. Only after validation promote Green to the main production deployment.

## Rollback

Keep Blue running until Green is confirmed stable. If Green fails, route users back to Blue without changing backend data.
