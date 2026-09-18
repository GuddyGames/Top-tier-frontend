import { useEffect, useState } from 'react';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import RankBadge from '../components/RankBadge';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getLeaderboard(50)
      .then((data) => setRows(data.leaderboard || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-base font-body text-ink-primary">
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-border bg-gradient-to-br from-[#141A26] to-base px-6 py-14 sm:px-10">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gain/15">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-gain"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <p className="font-display text-3xl font-bold tracking-tight text-ink-primary sm:text-4xl">
              Top Tier
            </p>
            <p className="mt-1 text-sm text-ink-muted">Trade. Refer. Rise the ranks.</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
        <h1 className="font-display text-2xl font-semibold text-ink-primary">Leaderboard</h1>
        <p className="mt-1 text-sm text-ink-muted">Ranked by total points — updated daily.</p>

        <div className="mt-6 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-xs text-ink-muted">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Telegram</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Contribution</th>
                <th className="px-4 py-3 font-medium">Referrals</th>
                <th className="px-4 py-3 font-medium">Points</th>
                <th className="px-4 py-3 font-medium">Rank</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id} className={i % 2 === 0 ? 'bg-surface' : 'bg-surfaceAlt'}>
                  <td className="px-4 py-3 font-medium">{row.username}</td>
                  <td className="px-4 py-3 text-ink-muted">
                    {row.telegram_username ? `@${row.telegram_username}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{formatDate(row.created_at)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3 tabular-nums text-ink-muted">
                    {row.total_contribution ?? '—'}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-ink-muted">{row.referral_count ?? 0}</td>
                  <td className="px-4 py-3 tabular-nums font-semibold">{row.total_points}</td>
                  <td className="px-4 py-3">
                    <RankBadge position={row.rank ?? i + 1} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && <p className="mt-6 text-sm text-ink-muted">Loading leaderboard…</p>}
        {error && (
          <p className="mt-6 text-sm text-loss">Couldn't load the leaderboard: {error}</p>
        )}
        {!loading && !error && rows.length === 0 && (
          <p className="mt-6 text-sm text-ink-muted">
            No one's on the board yet — be the first to earn points.
          </p>
        )}
      </main>
    </div>
  );
}
