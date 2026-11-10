# Top-tier UI/UX Evolution — Developer Handoff

## 1. Objective

Deliver a full, mobile-first product redesign while retaining Top-tier's existing React 18 + Vite application, authentication, API contracts, Supabase-backed data, and existing product capabilities.

**Product promise:** Trade smarter. Earn rewards. Rise higher.

This is an evolutionary redesign: preserve the recognizable dark navy/cyan identity, improve hierarchy and navigation, reduce visual noise, and make important destinations easier to reach. Do not copy another product's logo or proprietary interface.

## 2. Work started in this branch

Branch: `redesign/evolution-mobile-first`

Implemented in this first pass:
- Promoted Markets and Parallax to the authenticated primary navigation.
- Added a desktop sticky navigation shell with active-page state.
- Kept a compact mobile bottom navigation and a secondary drawer for Wallet, Profile, Academy, Referrals and Admin.
- Added a skip-to-content link and visible keyboard focus treatment.
- Added reduced-motion support.
- Introduced Evolution design tokens and refined card/surface styling.
- Added Parallax and Markets shortcuts to the Home dashboard.

This first pass is intentionally limited to the app shell and Home entry points. It is not yet the complete screen-by-screen redesign.

## 3. Design system

| Token | Value | Use |
|---|---|---|
| Background | `#050B18` | App canvas |
| Surface | `#0D192B` | Main cards and panels |
| Raised surface | `#14243A` | Nested panels, hover surfaces |
| Primary text | `#F3F7FF` | Headings and important values |
| Muted text | `#9AABC4` | Supporting copy |
| Cyan | `#36D7EF` | Primary accent, active states |
| Blue | `#397BFF` | Primary action |
| Positive | `#22C987` | Gains and successful states |
| Negative | `#F06464` | Losses and destructive states |
| Premium | `#F3C969` | Premium entitlement indicator |

Typography: retain Inter for body/UI and Space Grotesk for display headings. Use tabular numerals for balances, points, prices and ranks.

Layout:
- 8px spacing rhythm.
- Cards: 14–20px radius, subtle 1px borders, restrained shadows.
- Mobile page gutters: 16px minimum; use safe-area insets.
- Touch targets: aim for 44×44px minimum.
- Avoid horizontal scrolling for primary page content.

## 4. Navigation and information architecture

### Authenticated mobile primary navigation
1. Home
2. Markets
3. Parallax
4. Tasks
5. Ranks

Wallet, Profile, Academy, Referrals and Admin remain in the menu. Admin destination is visible only to users whose server-backed role is admin.

### Desktop
Use a sticky top navigation with the same five primary destinations. Wallet and Profile are available as compact utility actions; Admin gets a distinct but restrained control-room entry for admins only.

### Screen inventory and requirements

- **Home / Dashboard:** greeting, account summary, points, daily points, rank, useful task preview, quick actions, recent activity and next achievement. Clearly distinguish cash balance from points.
- **Markets / Terminal:** searchable instrument, timeframe, chart, demo balance, order controls, stop-loss/take-profit, open positions and trade history. Keep demo/live mode explicit; do not enable live broker execution as part of this redesign.
- **Parallax:** pair/asset selector, timeframe, chart context, BUY/SELL/WAIT candidate, trend/momentum/volatility, concise rationale, data freshness, confidence caveats and signal history. Clearly disclose that analysis is not a guaranteed prediction.
- **Tasks:** task type, reward, instructions, verification method, submission state and status timeline. Telegram tasks should show the bot-verification flow; screenshot tasks should expose a real upload control.
- **Ranks / Leaderboard:** top-three podium, personal rank summary, search, weekly/all-time filters and responsive player cards. Avoid a fixed 1080px table on mobile.
- **Wallet:** separate cash/account balance and points; show contributions, referral/task earnings and a filterable transaction history.
- **Profile:** identity, account settings, security and verification status.
- **Academy:** learning paths, lesson progress and saved learning.
- **Referrals:** invite link, referral status and reward history.
- **Admin Control Room:** overview, user management, contribution verification, point adjustments, subscription entitlements, Parallax access, system status and audit history.

## 5. Premium entitlement rules

The UI must reflect server-authoritative entitlement data only:
- Admin role receives Premium without payment.
- Other users receive Premium only after the backend confirms an active paid subscription.
- Never infer admin status from local storage, editable profile fields or a client-supplied role.
- Never unlock Premium solely because a client says a payment succeeded.
- Show clear upgrade/renewal states for non-admin users when billing is implemented.
- Do not invent subscription prices or payment-provider flows until product/payment requirements are approved.

## 6. Responsive behaviour

- 360–389px: one-column cards, compact labels, no clipped controls.
- 390–767px: mobile bottom navigation; content remains one column except small stat groups where readable.
- 768–1023px: desktop header; use two-column dashboard layouts where content permits.
- 1024px+: wider content container, charts and admin data tables may use available space.
- Tables must transform to stacked cards or a deliberate scroll region with visible affordance; never shrink text until unreadable.

## 7. Interaction and motion

- Use existing Framer Motion conventions; keep transitions subtle (150–240ms).
- Active navigation must have text/shape cues, not colour alone.
- Buttons need loading, disabled, success and error states.
- Preserve keyboard operation, logical focus order and visible focus rings.
- Respect `prefers-reduced-motion`.
- Confirm destructive admin actions; show a clear result and audit context.

## 8. Engineering constraints

- Preserve existing routes/page keys and API response contracts unless a separate backend change is explicitly reviewed.
- Reuse existing API client and auth context; do not duplicate data fetching.
- Keep sensitive entitlement checks on the backend.
- Do not change Supabase schema, Render settings, Vercel environment variables, payment credentials or live trading permissions in this UI-only work.
- Do not introduce fake chart values, fake performance claims, fabricated user balances or sample activity into production screens.
- Loading, empty, error, stale-data and offline states are part of the design.

## 9. Implementation sequence

1. App shell, navigation, design tokens and dashboard entry points.
2. Parallax and Terminal workspace layouts.
3. Responsive Leaderboard, Wallet and Tasks.
4. Admin Control Room and profile/academy/referral consistency.
5. Accessibility, visual QA, responsive QA and performance polish.

## 10. QA acceptance checklist

- [ ] Build succeeds with the repository's existing scripts.
- [ ] Authenticated and logged-out navigation still works.
- [ ] Admin-only route remains protected.
- [ ] Parallax and Markets are reachable from mobile primary navigation.
- [ ] Wallet, Profile, Academy and Referrals remain reachable.
- [ ] No horizontal overflow at 360px, 390px, 768px, 1024px and 1440px.
- [ ] Focus indicators and keyboard navigation are usable.
- [ ] Reduced-motion preference is respected.
- [ ] Loading, empty, error and stale-data states are present.
- [ ] No API contract, payment, database or live-trading changes are bundled into the UI PR.
- [ ] Verify on real Android browser sizes and desktop before merging.

## 11. Validation status

The first pass has been committed to the feature branch. A local install/build/test run has not been executed in this environment, so CI and preview deployment must be treated as the validation gate. Review the PR diff before merging; do not merge automatically.
