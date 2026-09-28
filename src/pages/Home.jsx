import { useEffect, useState } from 'react';
import { api } from '../api/client';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning,';
  if (hour >= 12 && hour < 17) return 'Good afternoon,';
  if (hour >= 17 && hour < 21) return 'Good evening,';
  return 'Good night,';
}

const Action = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="tt-card group flex min-w-0 w-full items-center gap-3 rounded-2xl p-3.5 text-left transition hover:-translate-y-0.5 hover:border-brand-blue/60 hover:bg-surface/80 active:scale-[.99] sm:p-4"
  >
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-blue/10 text-lg text-brand-cyan shadow-[inset_0_0_18px_rgba(0,140,255,.08)] sm:h-11 sm:w-11">
      {icon}
    </span>
    <span className="min-w-0 truncate text-xs font-semibold sm:text-sm">{label}</span>
    <span className="ml-auto shrink-0 text-brand-cyan transition-transform group-hover:translate-x-0.5">›</span>
  </button>
);

const StatCard = ({ label, value }) => (
  <div className="tt-card min-w-0 rounded-2xl p-3 text-center transition hover:-translate-y-0.5 hover:border-brand-blue/40 sm:p-3.5">
    <p className="truncate text-[9px] text-ink-muted sm:text-[10px]">{label}</p>
    <p className="mt-1 truncate font-display text-lg font-bold sm:text-xl">{value}</p>
  </div>
);

export default function Home({ goToTerminal, goToLearn }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getMyDashboard().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-6 lg:px-8">
        <p className="rounded-2xl border border-loss/30 bg-loss/5 p-4 text-sm text-loss">
          Couldn't load your dashboard: {error}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-6 lg:px-8">
        <p className="text-sm text-ink-muted">Loading…</p>
      </div>
    );
  }

  const s = data.stats || {};
  const name = data.user?.username || data.username || 'User';
  const tasks = (data.tasks || []).slice(0, 1);
  const level = Math.max(1, Math.floor((s.total_points || 0) / 500) + 1);
  const totalPoints = (s.total_points || 0).toLocaleString();

  const nav = (key) =>
    window.dispatchEvent(new CustomEvent('top-tier:navigate', { detail: key }));

  return (
    <main className="mx-auto w-full max-w-6xl min-w-0 px-3 pb-10 pt-4 sm:px-6 sm:pt-5 lg:px-8 xl:px-10">
      {/* Brand header */}
      <header className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-black tracking-wide sm:text-xl">
            ♛ TOP <span className="text-brand-cyan">TIER</span>
          </p>
          <p className="text-[9px] text-ink-muted sm:text-[10px]">Earn • Complete • Withdraw</p>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            aria-label="Quick menu"
            className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-surface text-sm shadow-[0_8px_24px_rgba(0,0,0,.16)] transition hover:border-brand-cyan/40 active:scale-95 sm:h-11 sm:w-11"
          >
            ♧
          </button>
          <button
            aria-label="Notifications"
            className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-surface text-sm sm:h-10 sm:w-10"
          >
            ●
          </button>
        </div>
      </header>

      {/* User summary */}
      <section className="relative mt-5 flex min-w-0 items-center gap-3 overflow-hidden rounded-3xl border border-brand-blue/25 bg-gradient-to-r from-brand-blue/10 via-surface/70 to-transparent p-3 sm:mt-6 sm:gap-4 sm:p-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-brand-cyan/50 bg-brand-blue/15 text-xl shadow-[0_0_24px_rgba(0,140,255,.14)] sm:h-14 sm:w-14 sm:text-2xl">
          👤
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-ink-muted sm:text-xs">{getGreeting()}</p>
          <h1 className="truncate font-display text-base font-bold text-white sm:text-lg">{name}</h1>
          <p className="truncate text-[10px] text-brand-cyan sm:text-xs">
            ★ Level {level} · {totalPoints} pts
          </p>
        </div>
      </section>

      {/* Main dashboard content */}
      <div className="mt-4 grid gap-4 sm:mt-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,.85fr)] lg:items-start lg:gap-5 xl:gap-6">
        <div className="min-w-0">
          {/* Daily tasks banner */}
          <section className="relative min-h-[180px] overflow-hidden rounded-3xl border border-brand-blue/45 bg-gradient-to-br from-brand-blue/25 via-[#071426] to-surface p-4 shadow-[0_16px_40px_rgba(0,0,0,.18)] sm:min-h-[200px] sm:p-6">
            <div className="relative z-10 max-w-[80%] sm:max-w-[75%]">
              <p className="text-[9px] font-bold uppercase tracking-widest text-brand-cyan sm:text-[10px]">
                ▣ DAILY TASKS
              </p>
              <h2 className="mt-1 font-display text-base font-bold leading-snug text-white sm:text-lg md:text-xl">
                Complete Tasks.<br />
                Earn Points. Get Rewards.
              </h2>
              <button
                onClick={() => nav('tasks')}
                className="mt-4 rounded-xl bg-brand-blue px-4 py-2.5 text-[10px] font-bold text-white shadow-[0_8px_22px_rgba(0,140,255,.22)] transition hover:brightness-110 active:scale-[.98] sm:px-5 sm:text-xs"
              >
                View Tasks →
              </button>
            </div>
            <div className="pointer-events-none absolute -right-4 bottom-0 text-6xl opacity-80 sm:right-3 sm:top-3 sm:text-7xl md:text-8xl">
              🎁
            </div>
          </section>

          {/* Stats */}
          <section className="mt-3 grid grid-cols-1 gap-2 min-[360px]:grid-cols-3 sm:mt-4 sm:gap-3" aria-label="Dashboard statistics">
            <StatCard label="Total Points" value={totalPoints} />
            <StatCard label="Today" value={`+${s.daily_points || 0}`} />
            <StatCard label="Rank" value={`#${s.rank || '—'}`} />
          </section>

          {/* Quick actions */}
          <section className="mt-5 sm:mt-6">
            <div className="flex items-end justify-between"><div><h2 className="font-display text-sm font-bold sm:text-base">Quick Actions</h2><p className="mt-0.5 text-[9px] text-ink-muted sm:text-[10px]">Jump into your Top-Tier activity</p></div></div>
            <div className="mt-2 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:gap-3">
              <Action icon="✓" label="View Tasks" onClick={() => nav('tasks')} />
              <Action icon="♧" label="Referrals" onClick={() => nav('referrals')} />
              <Action icon="🏆" label="Leaderboard" onClick={() => nav('leaderboard')} />
              <Action icon="▣" label="Wallet" onClick={() => nav('wallet')} />
            </div>
          </section>
        </div>

        {/* Secondary dashboard column */}
        <aside className="min-w-0">
          {tasks.length > 0 && (
            <section className="tt-card relative overflow-hidden rounded-3xl p-4 sm:p-5 lg:h-full">
              <div className="flex flex-col gap-2 min-[420px]:flex-row min-[420px]:items-start min-[420px]:justify-between lg:flex-col lg:items-start">
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[.16em] text-brand-cyan sm:text-[10px]">
                    Published task
                  </p>
                  <p className="mt-1 break-words text-sm font-bold sm:text-base">{tasks[0].title}</p>
                </div>
                <span className="w-fit shrink-0 rounded-full bg-brand-blue/10 px-2 py-1 text-[9px] font-bold text-brand-cyan sm:text-[10px]">
                  +{tasks[0].points} pts
                </span>
              </div>
              <p className="mt-3 text-[10px] leading-relaxed text-ink-muted sm:text-xs">
                Every active task published today is available in Tasks.
              </p>
              <button
                onClick={() => nav('tasks')}
                className="mt-4 w-full rounded-xl border border-brand-blue/30 bg-brand-blue/5 px-3 py-2.5 text-[10px] font-semibold transition hover:border-brand-blue/60 hover:bg-brand-blue/10 sm:text-xs"
              >
                View all tasks →
              </button>
            </section>
          )}

          {/* Learning / terminal actions */}
          <section className="mt-3 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 sm:mt-4 sm:gap-3">
            <button
              onClick={goToTerminal}
              className="w-full rounded-xl border border-border px-3 py-2.5 text-xs font-semibold transition hover:border-brand-blue/60 sm:py-3"
            >
              Practice Terminal
            </button>
            <button
              onClick={goToLearn}
              className="w-full rounded-xl border border-border px-3 py-2.5 text-xs font-semibold transition hover:border-brand-blue/60 sm:py-3"
            >
              Learn
            </button>
          </section>
        </aside>
      </div>
    </main>
  );
}
