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
        className="w-24 rounded-xl border border-border bg-base px-2 py-1.5 text-xs outline-none focus:border-brand-cyan"
      />
      <input
        placeholder="Reason (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="min-w-[10rem] flex-1 rounded-xl border border-border bg-base px-2 py-1.5 text-xs outline-none focus:border-brand-cyan"
      />
      <motion.button
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={busy}
        className="rounded-lg bg-brand-blue px-3 py-1.5 text-xs font-semibold text-base hover:bg-brand-blue/80 disabled:opacity-60"
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
        className="w-32 rounded border border-brand-cyan bg-base px-1.5 py-0.5 text-xs outline-none"
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
        className="text-brand-cyan hover:underline decoration-dotted underline-offset-2"
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
        className="w-28 rounded border border-brand-cyan bg-base px-1.5 py-0.5 text-xs outline-none"
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

  const deleteUser = async (u) => {
    const confirmed = window.confirm(
      `Permanently delete ${u.username || u.email}? This removes the account and its user-owned data and cannot be undone.`
    );
    if (!confirmed) return;

    setError(null);
    try {
      await api.adminDeleteUser(u.id);
      setUsers((current) => current.filter((item) => item.id !== u.id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <input
        placeholder="Search username or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm tt-card rounded-2xl px-3 py-2 text-sm outline-none focus:border-brand-cyan"
      />
      {error && <p className="mt-4 text-sm text-loss">{error}</p>}

      <motion.div variants={listVariants} initial="hidden" animate="show" className="mt-6 space-y-3">
        {users.map((u) => (
          <motion.div key={u.id} variants={itemVariants} className="tt-card rounded-2xl p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
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
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <StatusBadge status={u.status} />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleStatus(u)}
                  className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink-primary"
                >
                  {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => deleteUser(u)}
                  className="rounded-lg border border-loss/40 px-3 py-1.5 text-xs font-medium text-loss hover:bg-loss/10"
                >
                  Delete account
                </motion.button>
              </div>
            </div>
            <div className="mt-3 border-t border-[#12365A] pt-3">
              <ScoreForm userId={u.id} onScored={load} />
            </div>
          </motion.div>
        ))}
        {users.length === 0 && <p className="text-sm text-ink-muted">No users match.</p>}
      </motion.div>
    </>
  );
}

function ReferralsTab() {
  const [referrals, setReferrals] = useState([]);
  const [error, setError] = useState(null);
  useEffect(() => { api.adminGetReferrals().then((d) => setReferrals(d.referrals || [])).catch((e) => setError(e.message)); }, []);
  return (
    <div>
      <p className="text-sm text-ink-muted">Every referral relationship, including the referrer and the new user's Gmail, username and Telegram username.</p>
      {error && <p className="mt-3 text-sm text-loss">{error}</p>}
      <div className="mt-4 space-y-2">
        {referrals.map((r) => (
          <div key={r.referral_id} className="tt-card rounded-2xl p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-ink-muted">Referrer</p>
                <p className="font-medium">{r.referrer_username}</p>
                <p className="text-xs text-ink-muted">{r.referrer_email}</p>
                <p className="text-xs text-ink-muted">{r.referrer_telegram_username ? '@' + r.referrer_telegram_username.replace(/^@/, '') : 'Telegram not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted">Referred user</p>
                <p className="font-medium">{r.referred_username}</p>
                <p className="text-xs text-ink-muted">{r.referred_email}</p>
                <p className="text-xs text-ink-muted">{r.referred_telegram_username ? '@' + r.referred_telegram_username.replace(/^@/, '') : 'Telegram not provided'}</p>
              </div>
            </div>
          </div>
        ))}
        {referrals.length === 0 && <p className="text-sm text-ink-muted">No referrals yet.</p>}
      </div>
    </div>
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
          className="flex flex-col gap-2 tt-card rounded-2xl px-4 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between"
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
      <div className="grid w-full grid-cols-3 gap-1 rounded-lg bg-surface/80 p-1 sm:flex sm:w-fit">
        {[{ key: undefined, label: 'All' }, { key: 'open', label: 'Open' }, { key: 'closed', label: 'Closed' }].map((f) => (
          <button
            key={f.label}
            onClick={() => setStatus(f.key)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              status === f.key ? 'bg-brand-blue text-white' : 'text-ink-muted hover:text-ink-primary'
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
            className="flex flex-col gap-2 tt-card rounded-2xl px-4 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between"
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

function OverviewTab() {
  const [stats, setStats] = useState({ users: 0, pending: 0, referrals: 0, outstanding: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [users, pending, referrals, outstanding] = await Promise.all([
        api.adminListUsers(),
        api.adminGetSubmissions({ status: 'pending', limit: 1, offset: 0 }),
        api.adminGetReferrals(),
        api.adminGetOutstandingTasks(),
      ]);
      setStats({
        users: users.users?.length || 0,
        pending: pending.total ?? pending.submissions?.length ?? 0,
        referrals: referrals.referrals?.length || 0,
        outstanding: outstanding.outstanding?.length || 0,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const cards = [
    ['Users', stats.users, 'Registered accounts'],
    ['Pending submissions', stats.pending, 'Waiting for review'],
    ['Referrals', stats.referrals, 'Referral records'],
    ['Outstanding tasks', stats.outstanding, 'Users still to complete tasks'],
  ];

  return (
    <div className="space-y-4">
      {error && <div className="rounded-xl border border-loss/40 bg-loss/10 p-3 text-xs text-loss">{error}</div>}
      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value, hint]) => (
          <div key={label} className="tt-card rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-ink-muted">{label}</p>
            <p className="mt-2 font-display text-2xl font-bold">{loading ? '…' : value.toLocaleString()}</p>
            <p className="mt-1 text-[10px] text-ink-muted">{hint}</p>
          </div>
        ))}
      </div>
      <div className="tt-card rounded-2xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold text-white">Control Room Overview</h2>
            <p className="mt-1 text-xs text-ink-muted">Use the sections below to manage users, referrals, tasks and submission reviews.</p>
          </div>
          <button onClick={load} disabled={loading} className="rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:border-brand-cyan disabled:opacity-50">
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PendingTasksTab() {
  const [submissions, setSubmissions] = useState([]);
  const [status, setStatus] = useState('pending');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [total, setTotal] = useState(0);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    setError(null);
    try {
      const data = await api.adminGetSubmissions({ status, search: query, limit: 50, offset: 0 });
      setSubmissions(data.submissions || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => { load(); }, [status, query]);

  const review = async (id, nextStatus) => {
    setBusyId(id);
    setError(null);
    try {
      await api.adminReviewSubmission(id, nextStatus);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const submitSearch = (e) => {
    e.preventDefault();
    setQuery(search.trim());
  };

  return (
    <div className="space-y-4">
      <div className="tt-card rounded-2xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold">Submission Management</h2>
            <p className="mt-1 text-xs text-ink-muted">Review screenshot and task submissions from every user in one queue.</p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <span className="rounded-full bg-brand-blue/15 px-3 py-1 text-xs font-bold text-brand-cyan">{total} found</span>
            <button onClick={load} className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold hover:border-brand-cyan">Refresh</button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { key: 'pending', label: 'Pending' },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' },
            { key: 'all', label: 'All' },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setStatus(filter.key)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                status === filter.key ? 'bg-brand-blue text-white' : 'border border-border text-ink-muted hover:text-ink-primary'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <form onSubmit={submitSearch} className="mt-3 flex flex-col gap-2 min-[420px]:flex-row">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user, Gmail or task..."
            className="min-w-0 flex-1 rounded-xl border border-border bg-base px-3 py-2 text-xs outline-none focus:border-brand-cyan"
          />
          <button className="rounded-xl bg-brand-blue px-4 py-2 text-xs font-semibold text-white min-[420px]:w-auto">Search</button>
        </form>
      </div>

      {error && <div className="rounded-xl border border-loss/40 bg-loss/10 p-3 text-xs text-loss">{error}</div>}

      <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-3">
        {submissions.map((s) => (
          <motion.article key={s.id} variants={itemVariants} className="tt-card overflow-hidden rounded-2xl">
            <div className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{s.username}</span>
                    <span className="rounded-full border border-border px-2 py-0.5 text-[9px] uppercase text-ink-muted">{s.status}</span>
                    <span className="text-xs text-brand-cyan">+{s.points} pts</span>
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">{s.email}{s.telegram_username ? ` · @${s.telegram_username.replace(/^@/, '')}` : ''}</p>
                  <p className="mt-2 text-sm font-medium">{s.task_title}</p>
                  <p className="mt-1 text-[10px] text-ink-muted">Submitted {new Date(s.submitted_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  {s.status === 'pending' && (
                    <>
                      <button
                        disabled={busyId === s.id}
                        onClick={() => review(s.id, 'approved')}
                        className="rounded-xl bg-gain/15 px-3 py-2 text-xs font-semibold text-gain disabled:opacity-50"
                      >
                        {busyId === s.id ? 'Saving…' : 'Approve'}
                      </button>
                      <button
                        disabled={busyId === s.id}
                        onClick={() => review(s.id, 'rejected')}
                        className="rounded-xl bg-loss/15 px-3 py-2 text-xs font-semibold text-loss disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>

              {s.proof_url ? (
                <a href={s.proof_url} target="_blank" rel="noreferrer" className="mt-4 block">
                  <img src={s.proof_url} alt={`Proof for ${s.task_title}`} className="max-h-[420px] w-full rounded-xl border border-border bg-base object-contain" />
                </a>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-border p-5 text-center text-xs text-ink-muted">No proof image attached.</div>
              )}
            </div>
          </motion.article>
        ))}
        {submissions.length === 0 && (
          <div className="tt-card rounded-2xl p-10 text-center text-sm text-ink-muted">
            {status === 'pending' ? 'No submissions are waiting for review.' : 'No submissions match this filter.'}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function TasksAdminTab() {
  const [tasks, setTasks] = useState([]);
  const [outstanding, setOutstanding] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', link: '', points: 100, taskType: 'manual' });
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const [taskData, outstandingData] = await Promise.all([api.getTasks(), api.adminGetOutstandingTasks()]);
      setTasks(taskData.tasks || []);
      setOutstanding(outstandingData.outstanding || []);
    } catch (e) { setError(e.message); }
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.adminCreateTask({ ...form, points: Number(form.points) });
      setForm({ title: '', description: '', link: '', points: 100, taskType: 'manual' });
      load();
    } catch (e) { setError(e.message); }
  };

  const deactivate = async (id) => {
    await api.adminDeactivateTask(id);
    load();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="tt-card rounded-2xl p-5">
        <h2 className="font-display text-sm font-semibold">Create task for all users</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input required placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl border border-border bg-base px-3 py-2 text-sm outline-none focus:border-brand-cyan" />
          <input required type="number" min="1" placeholder="Points" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} className="rounded-xl border border-border bg-base px-3 py-2 text-sm outline-none focus:border-brand-cyan" />
          <input placeholder="Task link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="rounded-xl border border-border bg-base px-3 py-2 text-sm outline-none focus:border-brand-cyan" />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl border border-border bg-base px-3 py-2 text-sm outline-none focus:border-brand-cyan" />
          <select value={form.taskType} onChange={(e) => setForm({ ...form, taskType: e.target.value })} className="rounded-xl border border-border bg-base px-3 py-2 text-sm outline-none focus:border-brand-cyan"><option value="manual">Manual screenshot proof</option><option value="telegram">Telegram bot task</option></select>
        </div>
        <button className="mt-3 rounded-lg bg-brand-blue px-4 py-2 text-xs font-semibold text-base">Publish task</button>
        {error && <p className="mt-2 text-xs text-loss">{error}</p>}
      </form>

      <section>
        <h2 className="font-display text-sm font-semibold">Active tasks</h2>
        <div className="mt-3 space-y-2">
          {tasks.map((t) => (
            <div key={t.id} className="flex flex-col gap-3 tt-card rounded-2xl p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div><p className="text-sm font-medium">{t.title}</p><p className="text-xs text-ink-muted">+{t.points} points</p></div>
              <button onClick={() => deactivate(t.id)} className="rounded-lg border border-loss/40 px-3 py-1.5 text-xs text-loss">Close task</button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-sm font-semibold">Users who have not completed active tasks</h2>
        <p className="mt-1 text-xs text-ink-muted">These users have not submitted a completion for the listed task.</p>
        <div className="mt-3 space-y-2">
          {outstanding.map((s) => (
            <div key={`${s.task_id}-${s.user_id}`} className="flex flex-col gap-2 tt-card rounded-2xl px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span><span className="font-medium">{s.username}</span><span className="text-ink-muted"> · {s.task_title}</span></span>
              <span className="text-brand-cyan">+{s.points} pending</span>
            </div>
          ))}
          {outstanding.length === 0 && <p className="text-sm text-ink-muted">Everyone has submitted the active tasks.</p>}
        </div>
      </section>
    </div>
  );
}

function SupportTab() {
  const [conversations,setConversations]=useState([]),[selected,setSelected]=useState(null),[chat,setChat]=useState(null),[text,setText]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(null);
  const load=async()=>{try{const d=await api.adminGetSupport();setConversations(d.conversations||[])}catch(e){setError(e.message)}};
  useEffect(()=>{load()},[]);
  const open=async id=>{try{const d=await api.adminGetSupportChat(id);setSelected(id);setChat(d)}catch(e){setError(e.message)}};
  const send=async e=>{e.preventDefault();if(!text.trim()||!selected)return;setBusy(true);try{const d=await api.adminSendSupportMessage(selected,text.trim());setChat(x=>({...x,messages:[...(x?.messages||[]),d.message]}));setText('');await load()}catch(e){setError(e.message)}finally{setBusy(false)}};
  return <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
    <div className="space-y-2"><h2 className="font-display text-sm font-semibold">Support chats</h2>{conversations.map(c=><button key={c.id} onClick={()=>open(c.id)} className={`w-full rounded-2xl border p-3 text-left ${selected===c.id?'border-brand-cyan bg-brand-blue/10':'border-border bg-base/40'}`}><p className="text-xs font-semibold">{c.username}</p><p className="truncate text-[10px] text-ink-muted">{c.last_message||'No messages yet'}</p></button>)}{!conversations.length&&<p className="text-xs text-ink-muted">No support chats yet.</p>}</div>
    <div className="tt-card min-h-[420px] rounded-2xl p-4">{chat?<><div className="mb-3 border-b border-border pb-3"><p className="font-semibold">{chat.conversation?.id?'Support conversation':''}</p></div><div className="max-h-[45vh] space-y-2 overflow-y-auto">{(chat.messages||[]).map(m=><div key={m.id} className={`max-w-[85%] rounded-xl p-2.5 text-[10px] ${Number(m.sender_user_id)===Number(chat.conversation?.user_id)?'bg-surface':'ml-auto bg-brand-blue text-white'}`}><p>{m.message}</p><p className="mt-1 text-[8px] opacity-60">{m.username} · {new Date(m.created_at).toLocaleString()}</p></div>)}</div><form onSubmit={send} className="mt-3 flex gap-2"><input value={text} onChange={e=>setText(e.target.value)} placeholder="Reply to user…" className="min-w-0 flex-1 rounded-xl border border-border bg-base px-3 py-2.5 text-xs"/><button disabled={busy} className="rounded-xl bg-brand-blue px-4 text-xs font-bold text-white">{busy?'…':'Send'}</button></form></>:<p className="py-20 text-center text-xs text-ink-muted">Select a support conversation.</p>}{error&&<p className="mt-2 text-xs text-loss">{error}</p>}</div>
  </div>;
}

function NotificationsAdminTab() {
  const [title,setTitle]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[result,setResult]=useState(null),[error,setError]=useState(null);
  const send=async e=>{e.preventDefault();setBusy(true);setResult(null);setError(null);try{const d=await api.adminSendNotification(title,message);setResult(`Sent to ${d.sent_to} active users.`);setTitle('');setMessage('')}catch(e){setError(e.message)}finally{setBusy(false)}};
  return <div className="max-w-2xl"><div className="tt-card rounded-2xl p-5"><h2 className="font-display text-base font-semibold text-white">Send notification</h2><p className="mt-1 text-xs text-ink-muted">Send an update to every active user. Users can read it from Profile → Notifications.</p><form onSubmit={send} className="mt-4 space-y-3"><input required maxLength={150} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Notification title" className="w-full rounded-xl border border-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-cyan"/><textarea required maxLength={2000} rows={5} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Write the update..." className="w-full resize-y rounded-xl border border-border bg-base px-3 py-2.5 text-sm outline-none focus:border-brand-cyan"/><button disabled={busy} className="w-full rounded-xl bg-brand-blue py-3 text-xs font-bold text-white disabled:opacity-60">{busy?'Sending…':'Send to all active users'}</button></form>{result&&<p className="mt-3 text-xs text-gain">{result}</p>}{error&&<p className="mt-3 text-xs text-loss">{error}</p>}</div></div>;
}

const TABS = [
  { key: 'overview', label: 'Overview', Component: OverviewTab },
  { key: 'users', label: 'Users', Component: UsersTab },
  { key: 'referrals', label: 'Referrals', Component: ReferralsTab },
  { key: 'submissions', label: 'Submissions', Component: PendingTasksTab },
  { key: 'activity', label: 'Activity', Component: ActivityTab },
  { key: 'trades', label: 'Trades', Component: TradesTab },
  { key: 'tasks', label: 'Tasks', Component: TasksAdminTab },
  { key: 'support', label: 'Support', Component: SupportTab },
  { key: 'notifications', label: 'Notifications', Component: NotificationsAdminTab },
];

export default function Admin() {
  const [tab, setTab] = useState('overview');
  const Active = TABS.find((t) => t.key === tab).Component;
  const activeTab = TABS.find((t) => t.key === tab);

  const sectionDescriptions = {
    overview: 'A quick snapshot of users, referrals, submissions and outstanding tasks.',
    users: 'Search, manage, suspend and adjust individual user accounts.',
    referrals: 'Review referral relationships and the account details behind them.',
    submissions: 'Review task proofs and approve or reject submissions.',
    activity: 'Monitor points activity and account events across Top-Tier.',
    trades: 'Monitor demo-terminal trades and their current status.',
    tasks: 'Publish tasks for all users and track outstanding completions.',
    support: 'Reply to users and manage open support conversations.',
    notifications: 'Send important updates directly to active users.',
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl px-4 pb-28 pt-4 sm:px-6 md:pb-10 lg:px-8">
      <header className="relative overflow-hidden rounded-[28px] border border-brand-blue/30 bg-gradient-to-br from-[#071b35] via-[#061326] to-surface p-5 shadow-[0_24px_70px_rgba(0,0,0,.25)] sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-brand-blue/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-40 w-40 rounded-full bg-brand-cyan/10 blur-3xl" />
        <div className="relative">
          <div className="flex flex-col gap-4 min-[520px]:flex-row min-[520px]:items-end min-[520px]:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[.24em] text-brand-cyan">TOP TIER • ADMIN</p>
              <h1 className="mt-2 font-display text-2xl font-black tracking-tight sm:text-3xl">Control Room</h1>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-ink-muted sm:text-sm">Manage users, referrals, tasks, submissions and activity.</p>
            </div>
            <div className="w-fit rounded-2xl border border-border/80 bg-surface/70 px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-wider text-ink-muted">Current section</p>
              <p className="mt-1 text-sm font-bold text-brand-cyan">{activeTab.label}</p>
            </div>
          </div>
        </div>
      </header>

      <nav className="mt-4 overflow-x-auto rounded-2xl border border-brand-blue/20 bg-[#061326] p-1.5 shadow-[0_12px_35px_rgba(0,0,0,.16)]" aria-label="Admin sections">
        <div className="flex min-w-max gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={tab === t.key ? "relative rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200 sm:text-sm bg-brand-blue text-white shadow-lg shadow-brand-blue/20" : "relative rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200 sm:text-sm text-ink-muted hover:bg-surface/80 hover:text-ink"}
            >
              {t.label}
              {tab === t.key && <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand-cyan" />}
            </button>
          ))}
        </div>
      </nav>

      <div className="mt-5 rounded-2xl border border-border/70 bg-surface/40 px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,.08)] sm:px-5">
        <div className="flex flex-col gap-1 min-[520px]:flex-row min-[520px]:items-center min-[520px]:justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[.18em] text-brand-cyan">Control Room / {activeTab.label}</p>
            <h2 className="mt-1 font-display text-base font-bold sm:text-lg">{activeTab.label}</h2>
          </div>
          <p className="max-w-xl text-[10px] leading-4 text-ink-muted min-[520px]:text-right sm:text-xs">{sectionDescriptions[tab]}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 min-w-0"
        >
          <Active />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
