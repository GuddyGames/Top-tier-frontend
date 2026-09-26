import { useEffect, useState } from 'react';
import { api } from '../api/client';

function Stat({ label, value, tone }) {
  const toneClass = tone === 'gain' ? 'text-gain' : tone === 'loss' ? 'text-loss' : 'text-ink-primary';
  return <div className="tt-card rounded-2xl p-4"><p className="text-[10px] uppercase tracking-wider text-ink-muted">{label}</p><p className={`mt-1 font-display text-2xl font-bold tabular-nums ${toneClass}`}>{value}</p></div>;
}

export default function Home({ goToTerminal, goToLearn }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => { api.getDemoPerformance().then(setData).catch((err) => setError(err.message)); }, []);
  if (error) return <p className="p-6 text-sm text-loss">Couldn't load your performance: {error}</p>;
  if (!data) return <p className="p-6 text-sm text-ink-muted">Loading…</p>;
  const pnlTone = data.total_pnl > 0 ? 'gain' : data.total_pnl < 0 ? 'loss' : undefined;
  const hasTrades = data.total_trades > 0;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-8 pt-5 sm:px-8">
      <section className="relative overflow-hidden rounded-3xl border border-brand-blue/35 bg-gradient-to-br from-brand-blue/20 via-surface to-surface p-5 shadow-[0_20px_60px_rgba(0,0,0,.24)]">
        <div className="absolute -right-10 -top-20 h-56 w-56 rounded-full bg-brand-cyan/10 blur-3xl" />
        <p className="relative text-[10px] font-bold uppercase tracking-[.22em] text-brand-cyan">TOP TIER • DASHBOARD</p>
        <h1 className="relative mt-2 font-display text-2xl font-bold">Your progress</h1>
        <p className="relative mt-1 text-xs text-ink-muted">Track your practice trading and keep building your score.</p>
      </section>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Demo balance" value={`$${parseFloat(data.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
        <Stat label="Return" value={`${data.return_pct > 0 ? '+' : ''}${data.return_pct}%`} tone={data.return_pct >= 0 ? 'gain' : 'loss'} />
        <Stat label="Win rate" value={data.win_rate !== null ? `${data.win_rate}%` : '—'} />
        <Stat label="Total P&L" value={`${data.total_pnl >= 0 ? '+' : ''}${data.total_pnl.toFixed(2)}`} tone={pnlTone} />
      </div>
      {!hasTrades ? (
        <div className="tt-card mt-5 rounded-2xl border-dashed p-6 text-center"><p className="text-sm font-semibold">You haven't placed a practice trade yet.</p><p className="mt-1 text-sm text-ink-muted">Open the Terminal to practice, or visit Learn for the basics.</p><div className="mt-4 flex justify-center gap-2"><button onClick={goToTerminal} className="rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-bold text-white">Open Terminal</button><button onClick={goToLearn} className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink-muted">Go to Learn</button></div></div>
      ) : (
        <div className="mt-5"><div className="flex items-center justify-between text-xs text-ink-muted"><span>{data.total_trades} trades · {data.open_trades} open · {data.closed_trades} closed</span><span className="text-brand-cyan">Practice mode</span></div><h2 className="mt-4 font-display text-sm font-bold">Recent trades</h2><div className="mt-3 space-y-2">{data.recent_trades.map((t) => <div key={t.id} className="tt-card flex items-center justify-between rounded-2xl px-4 py-3 text-sm"><span>{t.symbol} · {t.side}{t.status === 'open' && <span className="ml-1.5 text-ink-muted">(open)</span>}</span><span className={`font-medium tabular-nums ${t.pnl == null ? 'text-ink-muted' : t.pnl >= 0 ? 'text-gain' : 'text-loss'}`}>{t.pnl == null ? '—' : `${t.pnl >= 0 ? '+' : ''}${parseFloat(t.pnl).toFixed(2)}`}</span></div>)}</div></div>
      )}
    </div>
  );
}