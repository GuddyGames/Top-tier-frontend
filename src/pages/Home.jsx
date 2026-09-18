import { useEffect, useState } from 'react';
import { api } from '../api/client';

function Stat({ label, value, tone }) {
  const toneClass = tone === 'gain' ? 'text-gain' : tone === 'loss' ? 'text-loss' : 'text-ink-primary';
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className={`mt-1 font-display text-2xl font-semibold tabular-nums ${toneClass}`}>{value}</p>
    </div>
  );
}

export default function Home({ goToTerminal, goToLearn }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getDemoPerformance().then(setData).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="p-6 text-sm text-loss">Couldn't load your performance: {error}</p>;
  if (!data) return <p className="p-6 text-sm text-ink-muted">Loading…</p>;

  const pnlTone = data.total_pnl > 0 ? 'gain' : data.total_pnl < 0 ? 'loss' : undefined;
  const hasTrades = data.total_trades > 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 sm:px-10">
      <h1 className="font-display text-2xl font-semibold">Your progress</h1>
      <p className="mt-1 text-sm text-ink-muted">How your practice trading is going so far.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Demo balance" value={`$${parseFloat(data.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
        <Stat label="Return" value={`${data.return_pct > 0 ? '+' : ''}${data.return_pct}%`} tone={data.return_pct >= 0 ? 'gain' : 'loss'} />
        <Stat label="Win rate" value={data.win_rate !== null ? `${data.win_rate}%` : '—'} />
        <Stat label="Total P&L" value={`${data.total_pnl >= 0 ? '+' : ''}${data.total_pnl.toFixed(2)}`} tone={pnlTone} />
      </div>

      {!hasTrades ? (
        <div className="mt-8 rounded-xl border border-dashed border-border p-6 text-center">
          <p className="text-sm text-ink-primary">You haven't placed a practice trade yet.</p>
          <p className="mt-1 text-sm text-ink-muted">
            Head to the Terminal to open your first position, or check Learn first if you want the basics.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button onClick={goToTerminal} className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-base hover:bg-gold-soft">
              Open Terminal
            </button>
            <button onClick={goToLearn} className="rounded-lg border border-border px-4 py-2 text-sm text-ink-muted hover:text-ink-primary">
              Go to Learn
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <div className="flex items-center justify-between text-sm text-ink-muted">
            <span>{data.total_trades} trades · {data.open_trades} open · {data.closed_trades} closed</span>
          </div>
          <h2 className="mt-4 font-display text-sm font-semibold text-ink-primary">Recent trades</h2>
          <div className="mt-3 space-y-2">
            {data.recent_trades.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-sm">
                <span>
                  {t.symbol} · {t.side}
                  {t.status === 'open' && <span className="ml-1.5 text-ink-muted">(open)</span>}
                </span>
                <span
                  className={`tabular-nums font-medium ${
                    t.pnl == null ? 'text-ink-muted' : t.pnl >= 0 ? 'text-gain' : 'text-loss'
                  }`}
                >
                  {t.pnl == null ? '—' : `${t.pnl >= 0 ? '+' : ''}${parseFloat(t.pnl).toFixed(2)}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
