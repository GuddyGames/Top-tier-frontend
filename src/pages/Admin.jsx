import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge';

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
};

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
      <motion.button
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={busy}
        className="rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-base hover:bg-gold-soft disabled:opacity-60"
      >
        Apply
      </motion.button>
    </form>
  );
}

// Click a name or Telegram handle to edit it in place — for typo fixes
// and moderation. Not every leaderboard column is editable: rank is
// recalculated nightly from points (editing it would just get
// overwritten), and joined date is a historical fact, not a setting.
function EditableField({ value, placeholder, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');

  if (!editing) {
    return (
      <button
        onClick={() => { setDraft(value || ''); setEditing(true); }}
        className="text-left hover:underline decoration-dotted underline-offset-2"
        title="Click to edit"
      >
        {value || <span className="text-ink-muted">{placeholder}</span>}
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave(draft); setEditing(false); }}
      className="flex items-center gap-1"
    >
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => setEditing(false)}
        className="w-32 rounded border border-gold bg-base px-1.5 py-0.5 text-xs outline-none"
      />
      <button type="submit" className="text-xs text-gain">✓</button>
    </form>
  );
}

function ContributionField({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? 0);
  const [busy, setBusy] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    const amount = Number(draft);
    if (!Number.isFinite(amount) || amount < 0) return;

    setBusy(true);
    try {
      await onSave(amount);
      setEditing(false);
    } finally {
      setBusy(false);
    }
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => { setDraft(value ?? 0); setEditing(true); }}
        className="text-gold hover:underline decoration-dotted underline-offset-2"
        title="Click to edit contribution"
      >
        {Number(value || 0).toLocaleString()} contribution
      </button>
    );
  }

  return (
    <form onSubmit={save} className="inline-flex items-center gap-1">
      <input
        autoFocus
        type="number"
        min="0"
        step="0.01"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="w-28 rounded border border-gold bg-base px-1.5 py-0.5 text-xs outline-none"
      />
      <button type="submit" disabled={busy} className="text-xs text-gain disabled:opacity-50">
        {busy ? '…' : '✓'}
      </button>
      <button type="button" onClick={() => setEditing(false)} className="text-xs text-loss">
        ×
      </button>
    </form>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const load = () => {
    api.adminListUsers(search).then((data) => setUsers(data.users)).catch((err) => setError(err.message));
  };
  useEffect(load, [search]);

  const toggleStatus = async (u) => {
    await api.adminSetStatus(u.id, u.status === 'active' ? 'inactive' : 'active');
    load();
  };

  const saveField = async (u, field, value) => {
    await api.adminUpdateProfile(u.id, { [field]: value });
    load();
  };

  const saveContribution = async (u, contribution) => {
    await api.adminUpdateContribution(u.id, contribution);
    load();
  };

  return (
    <>
      <input
        placeholder="Search username or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-gold"
      />
      {error && <p className="mt-4 text-sm text-loss">{error}</p>}

      <motion.div variants={listVariants} initial="hidden" animate="show" className="mt-6 space-y-3">
        {users.map((u) => (
          <motion.div key={u.id} variants={itemVariants} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">
                  <EditableField value={u.username} placeholder="username" onSave={(v) => saveField(u, 'username', v)} />
                  <span className="text-ink-muted"> · {u.email} · </span>
                  <EditableField
                    value={u.telegram_username}
                    placeholder="telegram handle"
                    onSave={(v) => saveField(u, 'telegramUsername', v)}
                  />
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  <ContributionField value={u.total_contribution} onSave={(value) => saveContribution(u, value)} />{' '}
                  · {u.total_points} pts · rank {u.rank ?? '—'} · {u.referral_count} referrals ·{' '}
                  {u.pending_tasks} pending task{u.pending_tasks === 1 ? '' : 's'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={u.status} />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleStatus(u)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink-primary"
                >
                  {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                </motion.button>
              </div>
            </div>
            <div className="mt-3 border-t border-border pt-3">
              <ScoreForm userId={u.id} onScored={load} />
            </div>
          </motion.div>
        ))}
        {users.length === 0 && <p className="text-sm text-ink-muted">No users match.</p>}
      </motion.div>
    </>
  );
}

function ActivityTab() {
  const [activities, setActivities] = useState([]);
  useEffect(() => { api.adminGetActivity().then((d) => setActivities(d.activities)).catch(() => {}); }, []);

  return (
    <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-2">
      {activities.map((a) => (
        <motion.div
          key={a.id}
          variants={itemVariants}
          className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-2.5 text-sm"
        >
          <span>
            <span className="font-medium">{a.username}</span>{' '}
            <span className="text-ink-muted">{a.action_type.replace(/_/g, ' ')}</span>
          </span>
          <span className={`tabular-nums font-medium ${a.points >= 0 ? 'text-gain' : 'text-loss'}`}>
            {a.points >= 0 ? '+' : ''}{a.points}
          </span>
        </motion.div>
      ))}
      {activities.length === 0 && <p className="text-sm text-ink-muted">No activity yet.</p>}
    </motion.div>
  );
}

function TradesTab() {
  const [trades, setTrades] = useState([]);
  const [status, setStatus] = useState(undefined);
  useEffect(() => { api.adminGetTrades(status).then((d) => setTrades(d.trades)).catch(() => {}); }, [status]);

  return (
    <>
      <div className="flex gap-1 rounded-lg bg-surface p-1 w-fit">
        {[{ key: undefined, label: 'All' }, { key: 'open', label: 'Open' }, { key: 'closed', label: 'Closed' }].map((f) => (
          <button
            key={f.label}
            onClick={() => setStatus(f.key)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              status === f.key ? 'bg-gold text-base' : 'text-ink-muted hover:text-ink-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <motion.div variants={listVariants} initial="hidden" animate="show" className="mt-4 space-y-2">
        {trades.map((t) => (
          <motion.div
            key={t.id}
            variants={itemVariants}
            className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-2.5 text-sm"
          >
            <span>
              <span className="font-medium">{t.username}</span>{' '}
              <span className="text-ink-muted">{t.symbol} · {t.side} · {t.status}</span>
            </span>
            <span className={`tabular-nums font-medium ${t.pnl == null ? 'text-ink-muted' : t.pnl >= 0 ? 'text-gain' : 'text-loss'}`}>
              {t.pnl == null ? '—' : `${t.pnl >= 0 ? '+' : ''}${parseFloat(t.pnl).toFixed(2)}`}
            </span>
          </motion.div>
        ))}
        {trades.length === 0 && <p className="text-sm text-ink-muted">No trades yet.</p>}
      </motion.div>
    </>
  );
}

function PendingTasksTab() {
  const [submissions, setSubmissions] = useState([]);
  const load = () => api.adminGetPendingSubmissions().then((d) => setSubmissions(d.submissions)).catch(() => {});
  useEffect(load, []);

  const review = async (id, status) => {
    await api.adminReviewSubmission(id, status);
    load();
  };

  return (
    <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-2">
      {submissions.map((s) => (
        <motion.div
          key={s.id}
          variants={itemVariants}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-sm"
        >
          <div>
            <p><span className="font-medium">{s.username}</span> <span className="text-ink-muted">· {s.task_title} · {s.points} pts</span></p>
            {s.proof_url && <p className="mt-0.5 text-xs text-ink-muted">{s.proof_url}</p>}
          </div>
          <div className="flex gap-2">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => review(s.id, 'approved')} className="rounded-lg bg-gain/15 px-3 py-1.5 text-xs font-semibold text-gain hover:bg-gain/25">
              Approve
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => review(s.id, 'rejected')} className="rounded-lg bg-loss/15 px-3 py-1.5 text-xs font-semibold text-loss hover:bg-loss/25">
              Reject
            </motion.button>
          </div>
        </motion.div>
      ))}
      {submissions.length === 0 && <p className="text-sm text-ink-muted">Nothing pending review.</p>}
    </motion.div>
  );
}

const TABS = [
  { key: 'users', label: 'Users', Component: UsersTab },
  { key: 'activity', label: 'Activity', Component: ActivityTab },
  { key: 'trades', label: 'Trades', Component: TradesTab },
  { key: 'pending', label: 'Pending tasks', Component: PendingTasksTab },
];

export default function Admin() {
  const [tab, setTab] = useState('users');
  const Active = TABS.find((t) => t.key === tab).Component;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10">
      <h1 className="font-display text-2xl font-semibold">Control room</h1>
      <p className="mt-1 text-sm text-ink-muted">Everyone's progress, in one place.</p>

      <div className="mt-4 flex flex-wrap gap-1 rounded-lg bg-surface p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              tab === t.key ? 'bg-gold text-base' : 'text-ink-muted hover:text-ink-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6"
        >
          <Active />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
