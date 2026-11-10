# Top-tier Frontend

React + Vite application for the Top-tier platform.

## Parallax Intelligence

The Top-tier app includes a Parallax Intelligence page in authenticated navigation. It uses the existing Top-tier login session and backend API; users do not need a separate Parallax account.

Set `VITE_API_URL` to the existing Top-tier backend URL. The Twelve Data API key belongs only in the backend's Render environment as `TWELVE_DATA_API_KEY` and must never be exposed as a Vite variable.

The Parallax page displays analysis candidates and the user's recent analysis history. Free users currently have M15 and H1 analysis; premium timeframes are feature-gated by the backend. Subscription billing is not yet connected. Live broker execution is disabled.


## Top-tier 2.0 — Clean Enterprise UI/UX

### Approved direction
- **Visual style:** Clean Enterprise — professional, restrained, data-first layouts, clear hierarchy, consistent spacing and minimal decoration.
- **Themes:** Dark and light, switchable by the user and persisted locally.
- **Consistency:** Parallax shares the same design language as Home, Terminal, Ranks, Wallet and Admin.

### Theme tokens
- Light: canvas #F4F7FB, surface #FFFFFF, raised #F8FAFC, text #142238, muted #627187, border #DCE4EE, accent #2563EB.
- Dark: canvas #0B1220, surface #111C2D, raised #172438, text #EDF3FB, muted #9AA9BD, border #26364B, accent #78A7FF.
- Semantic positive/negative states; restrained gold for Premium.
- Prefer 14px card radius, subtle shadows, 8px spacing increments, readable typography and clear focus states.

### Screen priorities
1. Home: concise account overview, key metrics, primary actions, activity and progress.
2. Markets / Parallax: shared cards and controls, market/timeframe selection, explainable analysis, data freshness, history and entitlement.
3. Terminal: chart and order workspace, unmistakable demo status, risk controls and history.
4. Ranks: responsive podium and player list; mobile cards instead of horizontally scrolling tables.
5. Wallet: distinguish points from cash, contributions and activity.
6. Admin: operational overview, user/task/contribution workflows and permission-aware controls.

### Responsive and accessibility
Test 360px, 390px, 768px, 1024px and 1440px. Support keyboard focus, semantic labels, reduced motion, readable contrast, long usernames, loading/error/empty states and safe-area insets.

### Safety boundaries
Preserve React/Vite/Tailwind/Framer Motion, Supabase session, backend API contracts and user data. No billing, schema changes, migrations, production configuration changes or broker execution in this UI pass. Live trading remains disabled. Build and responsive/accessibility QA must pass before merge.
