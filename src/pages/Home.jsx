import { useEffect, useState } from 'react';
import { api } from '../api/client';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning,';
  if (hour >= 12 && hour < 17) return 'Good afternoon,';
  if (hour >= 17 && hour < 21) return 'Good evening,';
  return 'Good night,';
}

const Action = ({ icon, label, hint, onClick }) => (
  <button
    onClick={onClick}
    className="group relative flex min-w-0 w-full items-center gap-3 overflow-hidden rounded-2xl border border-border/80 bg-surface/75 p-3.5 text-left shadow-[0_10px_30px_rgba(0,0,0,.12)] transition duration-200 hover:-translate-y-1 hover:border-brand-blue/60 hover:bg-surface active:scale-[.99] sm:p-4"
  >
    <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-brand-cyan to-brand-blue opacity-0 transition group-hover:opacity-100" />
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-brand-blue/20 bg-gradient-to-br from-brand-blue/15 to-brand-cyan/5 text-lg text-brand-cyan shadow-[inset_0_0_20px_rgba(0,140,255,.08)] sm:h-12 sm:w-12">
      {icon}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-xs font-bold sm:text-sm">{label}</span>
      <span className="mt-0.5 block truncate text-[9px] text-ink-muted sm:text-[10px]">{hint}</span>
    </span>
    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-blue/5 text-brand-cyan transition group-hover:translate-x-0.5 group-hover:bg-brand-blue/15">›</span>
  </button>
);

const StatCard = ({ label, value, accent }) => (
  <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-border/80 bg-surface/70 p-3.5 text-center shadow-[0_8px_24px_rgba(0,0,0,.10)] transition hover:-translate-y-0.5 hover:border-brand-blue/40 sm:p-4">
    <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${accent || 'via-brand-blue'} to-transparent opacity-70`} />
    <p className="truncate text-[9px] font-medium uppercase tracking-wider text-ink-muted sm:text-[10px]">{label}</p>
    <p className="mt-1 font-display text-lg font-black sm:text-xl">{value}</p>
  </div>
);

export default function Home({ goToTerminal, goToLearn, isAdmin = false, goToAdmin }) {
  const [data, setData] = useState(null);
  const [telegramStatus, setTelegramStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.getMyDashboard(), api.getTelegramVerificationStatus()])
      .then(([dashboard, telegram]) => { setData(dashboard); setTelegramStatus(telegram); })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return (
    <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-6 lg:px-8">
      <p className="rounded-2xl border border-loss/30 bg-loss/5 p-4 text-sm text-loss">Couldn't load your dashboard: {error}</p>
    </div>
  );

  if (!data) return (
    <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-border bg-surface/60 p-4 text-sm text-ink-muted">Loading your dashboard…</div>
    </div>
  );

  const s = data.stats || {};
  const name = data.user?.username || data.username || 'User';
  const tasks = (data.tasks || []).slice(0, 1);
  const level = Math.max(1, Math.floor((s.total_points || 0) / 500) + 1);
  const totalPoints = (s.total_points || 0).toLocaleString();

  const nav = (key) => window.dispatchEvent(new CustomEvent('top-tier:navigate', { detail: key }));

  return (
    <main className="mx-auto w-full max-w-6xl min-w-0 px-3 pb-10 pt-4 sm:px-6 sm:pt-5 lg:px-8 xl:px-10">
      <header className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl border border-brand-cyan/25 bg-brand-blue/10 text-sm text-brand-cyan">♛</span>
            {isAdmin ? (
              <button type="button" onClick={goToAdmin} aria-label="Open Control Room" className="group min-w-0 text-left transition active:scale-[.98]">
                <p className="truncate font-display text-lg font-black tracking-wide transition group-hover:text-brand-cyan sm:text-xl">TOP <span className="text-brand-cyan">TIER</span></p>
                <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[.16em] text-ink-muted transition group-hover:text-brand-cyan/80">Control Room</p>
              </button>
            ) : (
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-black tracking-wide sm:text-xl">TOP <span className="text-brand-cyan">TIER</span></p>
              </div>
            )}
          </div>
          <p className="mt-0.5 pl-10 text-[9px] text-ink-muted sm:text-[10px]">Earn • Complete • Withdraw</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button aria-label="Quick menu" className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-surface shadow-[0_8px_24px_rgba(0,0,0,.16)] transition hover:border-brand-cyan/40 hover:bg-surface/90 active:scale-95 sm:h-11 sm:w-11">♧</button>
          <button aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-2xl border border-border bg-surface text-sm transition hover:border-brand-cyan/40 active:scale-95 sm:h-11 sm:w-11">
            <span className="h-2 w-2 rounded-full bg-brand-cyan shadow-[0_0_10px_rgba(0,200,255,.7)]" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-cyan" />
          </button>
        </div>
      </header>

      <section className="relative mt-5 overflow-hidden rounded-3xl border border-brand-blue/25 bg-gradient-to-br from-brand-blue/15 via-surface/80 to-surface p-4 shadow-[0_14px_40px_rgba(0,0,0,.14)] sm:mt-6 sm:p-5">
        <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-brand-blue/10 blur-3xl" />
        <div className="relative flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="grid h-13 w-13 shrink-0 place-items-center rounded-2xl border border-brand-cyan/40 bg-gradient-to-br from-brand-blue/20 to-brand-cyan/5 text-xl shadow-[0_0_28px_rgba(0,140,255,.12)] sm:h-14 sm:w-14 sm:text-2xl">👤</div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium text-ink-muted sm:text-xs">{getGreeting()}</p>
            <div className="relative flex min-w-0 items-center gap-1.5"><h1 className="truncate font-display text-base font-bold text-white sm:text-lg">{name}</h1><span aria-label={telegramStatus?.verified ? "Telegram verified" : "Telegram not verified"} className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border text-[8px] font-black transition ${telegramStatus?.verified ? "border-gain/50 bg-gain text-[#04110a] shadow-[0_0_10px_rgba(34,197,94,.25)]" : "border-white/15 bg-transparent text-ink-muted"}`}>✓</span></div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] sm:text-xs">
              <span className="rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-2 py-0.5 text-brand-cyan">★ Level {level}</span>
              <span className="text-ink-muted">•</span>
              <span className="font-semibold text-white">{totalPoints} pts</span>
            </div>
          </div>
          <div className="hidden shrink-0 rounded-2xl border border-border/70 bg-background/30 px-3 py-2 text-right min-[420px]:block">
            <p className="text-[8px] uppercase tracking-widest text-ink-muted">Status</p>
            <p className="mt-0.5 text-[10px] font-bold text-gain">Active</p>
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 sm:mt-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,.85fr)] lg:items-start lg:gap-5 xl:gap-6">
        <div className="min-w-0">
          <section className="group relative min-h-[190px] overflow-hidden rounded-3xl border border-brand-blue/40 bg-gradient-to-br from-brand-blue/25 via-[#071426] to-surface p-5 shadow-[0_18px_45px_rgba(0,0,0,.22)] sm:min-h-[210px] sm:p-6">
            <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-brand-cyan/10 blur-3xl transition duration-500 group-hover:scale-125" />
            <div className="pointer-events-none absolute -bottom-12 right-8 h-28 w-28 rounded-full bg-brand-blue/15 blur-3xl" />
            <div className="relative z-10 max-w-[82%] sm:max-w-[75%]">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan shadow-[0_0_10px_rgba(0,200,255,.8)]" />
                <p className="text-[9px] font-bold uppercase tracking-[.18em] text-brand-cyan sm:text-[10px]">Daily tasks</p>
              </div>
              <h2 className="mt-2 font-display text-lg font-black leading-snug text-white sm:text-xl md:text-2xl">Complete Tasks.<br />Earn Points. Get Rewards.</h2>
              <p className="mt-2 max-w-md text-[10px] leading-relaxed text-ink-muted sm:text-xs">Build your points, climb the leaderboard, and unlock more rewards.</p>
              <button onClick={() => nav('tasks')} className="mt-4 rounded-xl bg-brand-blue px-4 py-2.5 text-[10px] font-bold text-white shadow-[0_8px_24px_rgba(0,140,255,.25)] transition hover:-translate-y-0.5 hover:brightness-110 active:scale-[.98] sm:px-5 sm:text-xs">View Tasks <span className="ml-1">→</span></button>
            </div>
            <div className="pointer-events-none absolute -bottom-1 right-1 text-6xl opacity-90 transition duration-500 group-hover:scale-105 sm:right-4 sm:top-3 sm:text-7xl md:text-8xl">🎁</div>
            <div className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[8px] text-white/50">EARN • GROW • REPEAT</div>
          </section>

          <section className="mt-3 grid grid-cols-1 gap-2 min-[360px]:grid-cols-3 sm:mt-4 sm:gap-3" aria-label="Dashboard statistics">
            <StatCard label="Total Points" value={totalPoints} accent="via-brand-cyan" />
            <StatCard label="Today" value={`+${s.daily_points || 0}`} accent="via-gain" />
            <StatCard label="Rank" value={`#${s.rank || '—'}`} accent="via-brand-blue" />
          </section>

          <section className="mt-5 sm:mt-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-sm font-bold sm:text-base">Quick Actions</h2>
                <p className="mt-0.5 text-[9px] text-ink-muted sm:text-[10px]">Everything you need, one tap away</p>
              </div>
              <span className="hidden rounded-full border border-border bg-surface/60 px-2 py-1 text-[8px] uppercase tracking-wider text-ink-muted min-[420px]:block">Quick access</span>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:gap-3">
              <Action icon="✓" label="View Tasks" hint="Earn more points" onClick={() => nav('tasks')} />
              <Action icon="♧" label="Referrals" hint="Invite & earn" onClick={() => nav('referrals')} />
              <Action icon="🏆" label="Leaderboard" hint="See your position" onClick={() => nav('leaderboard')} />
              <Action icon="▣" label="Wallet" hint="Track your balance" onClick={() => nav('wallet')} />
            </div>
          </section>
        </div>

        <aside className="min-w-0">
          {tasks.length > 0 && (
            <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-surface/75 p-4 shadow-[0_12px_32px_rgba(0,0,0,.14)] sm:p-5 lg:h-full">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-brand-blue/10 blur-2xl" />
              <div className="relative">
                <div className="flex flex-col gap-2 min-[420px]:flex-row min-[420px]:items-start min-[420px]:justify-between lg:flex-col lg:items-start">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gain" />
                      <p className="text-[9px] font-bold uppercase tracking-[.16em] text-brand-cyan sm:text-[10px]">Published task</p>
                    </div>
                    <p className="mt-2 break-words text-sm font-bold sm:text-base">{tasks[0].title}</p>
                  </div>
                  <span className="w-fit shrink-0 rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-2.5 py-1 text-[9px] font-bold text-brand-cyan sm:text-[10px]">+{tasks[0].points} pts</span>
                </div>
                <p className="mt-3 text-[10px] leading-relaxed text-ink-muted sm:text-xs">Every active task published today is available in Tasks.</p>
                <button onClick={() => nav('tasks')} className="mt-4 flex w-full items-center justify-between rounded-xl border border-brand-blue/25 bg-brand-blue/5 px-3 py-2.5 text-[10px] font-semibold transition hover:border-brand-blue/60 hover:bg-brand-blue/10 sm:text-xs">
                  <span>View all tasks</span><span className="text-brand-cyan">→</span>
                </button>
              </div>
            </section>
          )}

          <section className="mt-3 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 sm:mt-4 sm:gap-3">
            <button onClick={goToTerminal} className="group w-full rounded-2xl border border-border bg-surface/60 px-3 py-3 text-left transition hover:-translate-y-0.5 hover:border-brand-blue/50 hover:bg-surface sm:py-3.5">
              <span className="block text-xs font-bold">Practice Terminal</span><span className="mt-1 block text-[9px] text-ink-muted">Trade & practice</span>
            </button>
            <button onClick={goToLearn} className="group w-full rounded-2xl border border-border bg-surface/60 px-3 py-3 text-left transition hover:-translate-y-0.5 hover:border-brand-blue/50 hover:bg-surface sm:py-3.5">
              <span className="block text-xs font-bold">Learn</span><span className="mt-1 block text-[9px] text-ink-muted">Improve your skills</span>
            </button>
          </section>
        </aside>
      </div>
    </main>
  );
}
