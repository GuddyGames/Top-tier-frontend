# Top-tier Frontend

React + Vite application for the Top-tier platform.

## Parallax Intelligence

The Top-tier app includes a Parallax Intelligence page in authenticated navigation. It uses the existing Top-tier login session and backend API; users do not need a separate Parallax account.

Set `VITE_API_URL` to the existing Top-tier backend URL. The Twelve Data API key belongs only in the backend's Render environment as `TWELVE_DATA_API_KEY` and must never be exposed as a Vite variable.

The Parallax page displays analysis candidates and the user's recent analysis history. Free users currently have M15 and H1 analysis; premium timeframes are feature-gated by the backend. Subscription billing is not yet connected. Live broker execution is disabled.


## Top-tier Evolution UI/UX — Developer Handoff

### Objective
Full mobile-first redesign while preserving React 18, Vite, Tailwind, Framer Motion, API contracts, Supabase authentication, and existing user data.

### Navigation
Authenticated primary navigation: Home, Markets (Parallax), Tasks, Ranks, Wallet. Terminal, Academy, Referrals, Profile, and Admin remain available through the menu/header. Parallax is promoted to a primary destination.

### Screen specifications
- **Home:** greeting, account identity, points/rank/streak, separate cash and points labels, primary actions, recent activity, task progress, referrals, and achievement progress. Never fabricate unavailable metrics.
- **Markets / Parallax:** market/timeframe selectors, entitlement state, BUY/SELL/WAIT explanations, indicator context, data freshness, analysis history, and limitations. Admin Premium must be based on server-side role; paid Premium requires backend-verified entitlement. Never imply guaranteed accuracy or enable live execution.
- **Trading terminal:** pair search, chart, timeframe, demo balance, order controls, SL/TP, positions, and history. Keep demo/live state unmistakable; live execution stays disabled.
- **Ranks:** podium, personal rank, search/filter, compact responsive player cards. Desktop may use a table; mobile must not require horizontal scrolling. Preserve admin score adjustments.
- **Wallet:** separate points from cash/account balance. Keep contributions, referral/task rewards, and transaction history distinct. Never label points as withdrawable cash.
- **Admin:** overview, users, task-proof review, contribution verification, point adjustments, premium entitlement visibility, notifications, and audit visibility. Backend authorization remains authoritative.

### Visual and interaction principles
Evolve the existing navy/cyan identity. Prioritize hierarchy, legibility, consistent spacing, restrained gradients, 44px touch targets where practical, visible focus, semantic labels, reduced-motion support, and honest loading/error/empty states.

### Responsive QA
Test 360px, 390px, 768px, 1024px, and 1440px, including long usernames, large balances, empty/error/loading states, keyboard focus, and reduced motion.

### Safety boundaries
No backend schema/API changes, payment integration, pricing promises, database migrations, production environment changes, deployment, or live broker execution in this UI pass. Never trust client-side role/plan state as an authorization boundary.

### Acceptance checklist
- [ ] Five primary destinations: Home, Markets, Tasks, Ranks, Wallet.
- [ ] Parallax reachable in one tap.
- [ ] Terminal, Academy, Referrals, Profile, and Admin remain reachable.
- [ ] Leaderboard usable without horizontal scrolling on mobile.
- [ ] Points and cash clearly distinguished.
- [ ] Admin controls protected server-side.
- [ ] Existing API calls and data models unchanged.
- [ ] Build and responsive/accessibility checks pass before merge.
