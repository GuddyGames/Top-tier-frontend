# Top-tier Evolution UI/UX Redesign — Developer Handoff

## Product direction
**Trade smarter. Earn more. Rise higher.**

Evolution keeps Top-tier's dark, high-energy identity while making it calmer, more legible, consistent, and mobile-native. This is a full product redesign direction, not a backend or trading-strategy rewrite.

## Design principles
1. Mobile-first layouts from 360px upward; desktop expands the same information architecture rather than becoming a separate product.
2. One clear primary action per screen; secondary actions are visually quieter.
3. Use progressive disclosure for advanced trading and admin controls.
4. Distinguish money, points, contributions, and referral rewards everywhere. Never combine them into one balance.
5. Make data freshness, pending verification, and analysis limitations explicit.
6. Preserve existing API contracts, Supabase auth, current database, and user workflows.
7. Motion should clarify state; respect `prefers-reduced-motion`.

## Visual system
| Token | Value | Use |
|---|---|---|
| Background | `#050B18` | App canvas |
| Surface | `#0D192B` | Main panels |
| Raised surface | `#14243A` | Nested cards and controls |
| Cyan | `#19D9FF` | Primary accent / data focus |
| Blue | `#397BFF` | Primary actions |
| Positive | `#22C987` | Gains / approved |
| Negative | `#F06464` | Losses / rejected |
| Premium | `#F3C969` | Premium entitlement |
| Text | `#F4F7FC` | Primary text |
| Muted | `#91A1B8` | Supporting text |

- Typography: Space Grotesk for display headings; Inter for UI and body.
- Spacing: 4px base, 8px rhythm.
- Cards: 18px radius, subtle 1px border, restrained shadow.
- Inputs and buttons: minimum 44px touch height.
- Avoid excessive glow, tiny uppercase labels, and gradients behind every card.

## Navigation model
### Mobile bottom navigation
- Home
- Tasks
- Ranks
- Wallet
- Markets (opens Parallax)

Profile/settings, Learn, Terminal, Referrals, and Admin remain in the menu. Admin navigation is visible only to the server-authorized admin role. The frontend role check is for presentation only; backend authorization remains authoritative.

### Desktop
Use a persistent left navigation rail with grouped destinations:
- Overview: Home
- Markets: Parallax, Terminal
- Earn: Tasks, Referrals, Wallet
- Community: Leaderboard, Learn
- Administration: Control room (admins only)

## Screen specifications

### Home / dashboard
- Greeting and verified-account state.
- Compact KPI strip: points, rank, streak; do not label points as cash.
- Weekly activity / points trend with date range and empty state.
- Quick actions: Analyze market, Demo trade, Complete tasks, View wallet.
- Pending tasks and contribution review status.
- Recent activity with human-readable timestamps.
- Next rank / achievement progress.
- Loading skeletons and retryable error state.

### Markets / Parallax
- Pair search and category chips (Forex, Metals, Crypto).
- Timeframe selector with entitlement labels.
- Chart area with visible data timestamp and source.
- Analysis result: BUY / SELL / WAIT, regime, freshness, indicator summary, and reasons.
- Clearly separate reference price from broker execution price.
- Analysis history with filters.
- Premium lock state explains the feature, price/checkout entry point only when billing is implemented.
- Admin entitlement is free only when verified by backend role; paid users unlock after verified payment.
- Never promise 99.9% accuracy or guaranteed returns. Keep live execution disabled until separately reviewed and explicitly authorized.

### Terminal
- Pair search, chart, timeframe and demo balance visible without scrolling on common phone sizes.
- Buy/sell controls grouped with quantity, stop-loss, take-profit and validation.
- Open positions and order history in tabs or segmented sections.
- Clear DEMO label; never imply a demo order is a real broker order.

### Leaderboard
- Top-three podium.
- Searchable ranking list.
- Mobile player cards; desktop data table.
- Rank, username, points, contribution, referral count, status and Telegram identity.
- Admin point adjustment is contextual, reason-required, and usable on mobile.
- Add weekly/all-time filters only when backed by API data.

### Wallet
- Separate cards for cash balance, points, and contribution total.
- Earnings breakdown: verified contributions, tasks, referrals.
- Transaction history with status, source, amount and date.
- Pending / approved / rejected states; do not show pending contributions as spendable balance.

### Tasks and referrals
- Task type-specific action (Telegram bot verification vs screenshot upload).
- Submission status and next step always visible.
- Referral link copy action, referral count, and verified reward explanation.
- Empty, loading, and error states consistent with dashboard.

### Admin control room
- Operational overview and queue counts.
- User lookup and account status.
- Contribution verification with evidence and audit trail.
- Point adjustments with mandatory reason.
- Premium entitlement/subscription view.
- Parallax access and usage overview.
- System/API health and recent admin actions.
- Every privileged action must be checked by the backend and logged.

## Accessibility and responsive requirements
- WCAG 2.2 AA contrast for text and interactive controls.
- Visible keyboard focus, semantic headings, labelled inputs, and accessible status messages.
- Minimum 44x44px touch targets.
- No horizontal page overflow at 360px, 390px, 768px, 1024px and 1440px.
- Tables become stacked cards on mobile.
- Respect reduced motion and browser zoom.
- Never communicate status using color alone.

## Implementation plan
### Phase 1 — foundation and navigation
- Add Evolution tokens and shared UI primitives.
- Promote Parallax to primary Markets navigation.
- Establish responsive app shell and mobile menu.
- Standardize loading, empty, error and status patterns.

### Phase 2 — core product screens
- Rebuild Home dashboard hierarchy.
- Improve Parallax analysis workspace and entitlement states.
- Improve Terminal information hierarchy and demo affordances.

### Phase 3 — earning and community
- Responsive leaderboard and filters.
- Wallet balance separation and transaction timeline.
- Tasks/referrals progress and verification states.

### Phase 4 — admin and quality
- Admin command centre.
- Accessibility and responsive audit.
- Motion polish, performance pass, visual regression and end-to-end tests.

## Current branch changes
Branch: `feat/evolution-ui-ux-redesign`

Initial implementation on this branch:
- Added Evolution CSS variables and reusable card/control/button primitives in `src/index.css`.
- Promoted Parallax to the mobile bottom-nav Markets destination; moved Profile & settings into the drawer.
- Added searchable leaderboard rows and mobile player cards while retaining the desktop table.
- Added mobile admin points-adjustment controls.

## Acceptance criteria
- Existing routes and API calls continue to work.
- Mobile users can reach Parallax in one tap.
- Leaderboard is readable without horizontal scrolling on mobile.
- Admin point adjustments remain available on mobile and desktop.
- No payment, database migration, broker execution, or production environment changes are included in this UI PR.
- Build and lint pass; smoke tests cover signed-out, regular-user, and admin navigation.

## Explicitly out of scope
- Changing payment provider or subscription billing.
- Changing Supabase schema or production data.
- Enabling live broker execution.
- Changing market-data credentials or provider.
- Promising trading accuracy or guaranteed returns.
