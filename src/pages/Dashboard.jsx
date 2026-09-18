import { useEffect, useState } from 'react';
import { api } from '../api/client';
import ReferralCard from '../components/ReferralCard';

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getMyDashboard()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="p-6 text-sm text-loss">Couldn't load your dashboard: {error}</p>;
  if (!data) return <p className="p-6 text-sm text-ink-muted">Loading…</p>;

  const { stats, recent_activities } = data;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 sm:px-10">
      <h1 className="font-display text-2xl font-semibold">Your dashboard</h1>
      <p className="mt-1 text-sm text-ink-muted">A quick look at where you stand.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Total points" value={stats.total_points} />
        <StatCard label="Rank" value={stats.rank ?? '—'} />
        <StatCard label="Current streak" value={`${stats.current_streak}d`} />
      </div>

      <div className="mt-6">
        <ReferralCard referralCode={stats.referral_code} referralCount={stats.referral_count} />
      </div>

      <div className="mt-8">
        <h2 className="font-display text-sm font-semibold text-ink-primary">Recent activity</h2>
        <ul className="mt-3 space-y-2">
          {recent_activities.length === 0 && (
            <li className="text-sm text-ink-muted">Nothing yet — go earn some points.</li>
          )}
          {recent_activities.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            >
              <span className="text-ink-muted">{a.action_type.replace(/_/g, ' ')}</span>
              <span className="tabular-nums font-medium text-gain">+{a.points}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
