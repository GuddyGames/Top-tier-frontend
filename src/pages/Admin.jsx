import { useEffect, useState } from 'react';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge';

function ScoreForm({ userId, onScored }) {
  const [points, setPoints] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!points) return;
    setBusy(true);
    try {
      await api.adminScoreUser(userId, parseInt(points, 10), note);
      setPoints('');
      setNote('');
      onScored();
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      <input
        type="number"
        placeholder="± points"
        value={points}
        onChange={(e) => setPoints(e.target.value)}
        className="w-24 rounded-lg border border-border bg-base px-2 py-1.5 text-xs outline-none focus:border-gold"
      />
      <input
        placeholder="Reason (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="min-w-[10rem] flex-1 rounded-lg border border-border bg-base px-2 py-1.5 text-xs outline-none focus:border-gold"
      />
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-base hover:bg-gold-soft disabled:opacity-60"
      >
        Apply
      </button>
    </form>
  );
}

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const load = () => {
    api
      .adminListUsers(search)
      .then((data) => setUsers(data.users))
      .catch((err) => setError(err.message));
  };

  useEffect(load, [search]);

  const toggleStatus = async (u) => {
    const next = u.status === 'active' ? 'inactive' : 'active';
    await api.adminSetStatus(u.id, next);
    load();
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10">
      <h1 className="font-display text-2xl font-semibold">Control room</h1>
      <p className="mt-1 text-sm text-ink-muted">Everyone's progress, in one place.</p>

      <input
        placeholder="Search username or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-4 w-full max-w-sm rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-gold"
      />

      {error && <p className="mt-4 text-sm text-loss">{error}</p>}

      <div className="mt-6 space-y-3">
        {users.map((u) => (
          <div key={u.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">
                  {u.username} <span className="text-ink-muted">· {u.email}</span>
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {u.total_points} pts · rank {u.rank ?? '—'} · {u.referral_count} referrals ·{' '}
                  {u.pending_tasks} pending task{u.pending_tasks === 1 ? '' : 's'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={u.status} />
                <button
                  onClick={() => toggleStatus(u)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink-primary"
                >
                  {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                </button>
              </div>
            </div>
            <div className="mt-3 border-t border-border pt-3">
              <ScoreForm userId={u.id} onScored={load} />
            </div>
          </div>
        ))}
        {users.length === 0 && <p className="text-sm text-ink-muted">No users match.</p>}
      </div>
    </div>
  );
}
