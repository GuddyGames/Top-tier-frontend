import { useEffect, useState } from 'react';
import { api } from '../api/client';

function formatActivity(x) {
  const labels = {
    signup_bonus: 'Signup bonus',
    referral_bonus: 'Referral bonus',
    login: 'Daily login bonus',
    telegram_verification_bonus: 'Telegram verification bonus',
    task_completed: 'Task completed',
    admin_adjustment: 'Admin points adjustment',
  };
  return labels[x.action_type || x.type] || x.action || x.type || 'Points activity';
}

function ActivityRow({ item }) {
  const points = Number(item.points ?? item.amount ?? 0);
  const positive = points >= 0;
  return (
    <div className="group flex min-w-0 items-center gap-3 rounded-2xl border border-border/80 bg-surface/70 p-3.5 shadow-[0_8px_24px_rgba(0,0,0,.10)] transition hover:-translate-y-0.5 hover:border-brand-blue/40 hover:bg-surface sm:p-4">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border text-sm font-bold ${
        positive ? 'border-gain/20 bg-gain/5 text-gain' : 'border-loss/20 bg-loss/5 text-loss'
      }`}>
        {positive ? '+' : '−'}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold sm:text-sm">{item.note || formatActivity(item)}</p>
        <p className="mt-0.5 truncate text-[9px] text-ink-muted sm:text-[10px]">
          {item.created_at ? new Date(item.created_at).toLocaleString() : 'Recent'}
        </p>
      </div>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black sm:text-[10px] ${
        positive ? 'bg-gain/10 text-gain' : 'bg-loss/10 text-loss'
      }`}>
        {positive ? '+' : ''}{points.toLocaleString()} pts
      </span>
    </div>
  );
}

export default function Wallet() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('transactions');

  useEffect(() => {
    api.getMyDashboard().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return (
    <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-6 lg:px-8">
      <p className="rounded-2xl border border-loss/30 bg-loss/5 p-4 text-sm text-loss">{error}</p>
    </div>
  );
  if (!data) return (
    <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-border bg-surface/60 p-4 text-sm text-ink-muted">Loading your wallet…</div>
    </div>
  );

  const stats = data.stats || {};
  const activities = data.recent_activities || [];
  const earnings = activities.filter((item) => Number(item.points ?? item.amount ?? 0) > 0);
  const transactions = activities.filter((item) => Number(item.points ?? item.amount ?? 0) <= 0);
  const visibleItems = tab === 'earnings' ? earnings : transactions;
  const balance = Number(stats.total_points || 0).toLocaleString();

  return (
    <main className="mx-auto w-full min-w-0 max-w-5xl px-3 pb-10 pt-4 sm:px-6 sm:pt-5 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl border border-brand-blue/25 bg-gradient-to-br from-brand-blue/15 via-surface/85 to-surface p-4 shadow-[0_16px_42px_rgba(0,0,0,.16)] sm:p-6">
        <div className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full bg-brand-cyan/10 blur-3xl" />
        <div className="relative">
          <p className="text-[9px] font-bold uppercase tracking-[.2em] text-brand-cyan sm:text-[10px]">Your earnings and transactions</p>
          <div className="mt-2 flex flex-col gap-4 min-[430px]:flex-row min-[430px]:items-end min-[430px]:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-brand-cyan/20 bg-brand-blue/10 text-sm text-brand-cyan">▣</span>
                <h1 className="font-display text-2xl font-black sm:text-3xl">Wallet</h1>
              </div>
              <p className="mt-4 text-[9px] font-medium uppercase tracking-wider text-ink-muted">Total Balance</p>
              <p className="mt-1 font-display text-3xl font-black sm:text-4xl">
                {balance} <span className="text-sm font-bold text-brand-cyan sm:text-base">pts</span>
              </p>
            </div>
            <button className="group w-full rounded-xl bg-brand-blue px-5 py-3 text-xs font-bold text-white shadow-[0_8px_24px_rgba(0,140,255,.22)] transition hover:-translate-y-0.5 hover:brightness-110 active:scale-[.98] min-[430px]:w-auto">
              Withdraw <span className="ml-1 transition group-hover:translate-x-0.5">→</span>
            </button>
          </div>
          <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/5">
            <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-brand-blue to-brand-cyan" />
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-border/80 bg-surface/65 p-1.5 shadow-[0_8px_24px_rgba(0,0,0,.10)]">
        <div className="grid grid-cols-2 gap-1">
          <button onClick={() => setTab('transactions')} className={`relative rounded-xl py-2.5 text-[10px] font-bold transition sm:text-xs ${
            tab === 'transactions' ? 'bg-brand-blue text-white shadow-[0_0_18px_rgba(0,140,255,.18)]' : 'text-ink-muted hover:bg-white/5 hover:text-ink-primary'
          }`}>
            Transactions
            {tab === 'transactions' && <span className="absolute inset-x-8 bottom-0 h-px bg-brand-cyan" />}
          </button>
          <button onClick={() => setTab('earnings')} className={`relative rounded-xl py-2.5 text-[10px] font-bold transition sm:text-xs ${
            tab === 'earnings' ? 'bg-brand-blue text-white shadow-[0_0_18px_rgba(0,140,255,.18)]' : 'text-ink-muted hover:bg-white/5 hover:text-ink-primary'
          }`}>
            Earnings
            {tab === 'earnings' && <span className="absolute inset-x-8 bottom-0 h-px bg-brand-cyan" />}
          </button>
        </div>
      </section>

      <div className="mb-2 mt-5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold">{tab === 'earnings' ? 'Earnings history' : 'Transaction history'}</h2>
          <p className="mt-0.5 text-[9px] text-ink-muted sm:text-[10px]">
            {tab === 'earnings' ? 'Points you have earned' : 'Points deducted or adjusted'}
          </p>
        </div>
        <span className="rounded-full border border-border bg-surface px-2 py-1 text-[8px] uppercase tracking-wider text-ink-muted">{visibleItems.length} records</span>
      </div>

      <div className="space-y-2.5">
        {visibleItems.length > 0 ? visibleItems.map((item, index) => (
          <ActivityRow key={item.id || index} item={item} />
        )) : (
          <div className="rounded-3xl border border-dashed border-border bg-surface/50 p-9 text-center shadow-[0_8px_24px_rgba(0,0,0,.08)]">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-blue/10 text-xl text-brand-cyan">▣</div>
            <p className="mt-3 text-sm font-semibold">No {tab === 'earnings' ? 'earnings' : 'transactions'} yet</p>
            <p className="mt-1 text-[10px] text-ink-muted sm:text-xs">Your activity will appear here when available.</p>
          </div>
        )}
      </div>
    </main>
  );
}
