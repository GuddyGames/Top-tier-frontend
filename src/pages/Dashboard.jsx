import { useEffect, useState } from 'react';
import { api } from '../api/client';
import ReferralCard from '../components/ReferralCard';
import TelegramVerification from '../components/TelegramVerification';

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

  const { stats, recent_activities, referrals = [], tasks = [] } = data;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 sm:px-10">
      <h1 className="font-display text-2xl font-semibold">Your dashboard</h1>
      <p className="mt-1 text-sm text-ink-muted">A quick look at where you stand.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Total points" value={stats.total_points} />
        <StatCard label="Rank" value={stats.rank ?? '—'} />
        <StatCard label="Current streak" value={`${stats.current_streak}d`} />
      </div>

      <div className="mt-6 space-y-4">
        <ReferralCard referralCode={stats.referral_code} referralCount={stats.referral_count} />
        <TelegramVerification />
      </div>

      <div className="mt-8">
        <section>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-sm font-semibold">Your referrals</h2>
              <p className="mt-1 text-xs text-ink-muted">People who joined Top-Tier using your referral link.</p>
            </div>
            <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">{referrals.length} total</span>
          </div>
          <div className="mt-3 space-y-2">
            {referrals.length === 0 && <div className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink-muted">No referrals yet.</div>}
            {referrals.map((ref) => (
              <div key={ref.id} className="rounded-lg border border-border bg-surface px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{ref.username}</span>
                  <span className="text-xs text-ink-muted">{new Date(ref.created_at).toLocaleDateString()}</span>
                </div>
                <div className="mt-1 text-xs text-ink-muted">{ref.email}{ref.telegram_username ? ` · @${ref.telegram_username.replace(/^@/, '')}` : ' · Telegram not provided'}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-sm font-semibold">Published tasks</h2>
              <p className="mt-1 text-xs text-ink-muted">Every active task published today is shown here.</p>
            </div>
            <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">{tasks.length} active</span>
          </div>
          <div className="mt-3 space-y-2">
            {tasks.length === 0 && <div className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink-muted">No published tasks today.</div>}
            {tasks.map((task) => (
              <div key={task.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-sm font-semibold">{task.title}</h3>
                    {task.description && <p className="mt-1 text-sm text-ink-muted">{task.description}</p>}
                    <p className="mt-2 text-xs font-semibold text-gold">+{task.points} points</p>
                  </div>
                  {task.link && <a href={task.link} target="_blank" rel="noreferrer" className="rounded-lg border border-gold px-3 py-2 text-xs font-semibold text-gold">Open task</a>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
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
