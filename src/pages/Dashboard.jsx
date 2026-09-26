import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import ReferralCard from '../components/ReferralCard';
import TelegramVerification from '../components/TelegramVerification';

function StatCard({ label, value }) {
  return (
    <div className="tt-card rounded-2xl p-4">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function TaskCard({ task, submission, onSubmitted }) {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  const isTelegram = task.task_type === 'telegram';
  const submitted = Boolean(submission);
  const pending = submission?.status === 'pending';
  const approved = submission?.status === 'approved';
  const rejected = submission?.status === 'rejected';

  const openTelegramBot = async () => {
    setBusy(true);
    setError(null);
    setMessage('');
    try {
      const data = await api.startTelegramTask(task.id);
      if (data.telegram_url) {
        window.open(data.telegram_url, '_blank', 'noopener,noreferrer');
        setMessage('Telegram bot opened. Follow the bot instructions to complete this task.');
      } else {
        setMessage('Open Telegram and complete the bot verification.');
      }
      onSubmitted();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const uploadScreenshot = async () => {
    if (!file) {
      fileRef.current?.click();
      return;
    }

    setBusy(true);
    setError(null);
    setMessage('');
    try {
      await api.submitTask(task.id, { proofFile: file });
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      setMessage('Screenshot submitted. It is now waiting for admin review.');
      onSubmitted();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-lg border border-[#12365A] bg-[#071426] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-sm font-semibold">{task.title}</h3>
          {task.description && <p className="mt-1 text-sm text-ink-muted">{task.description}</p>}
          <p className="mt-2 text-xs font-semibold text-brand-cyan">+{task.points} points</p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {task.link && (
            <a
              href={task.link}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-[#12365A] px-3 py-2 text-xs font-semibold text-ink-muted hover:text-ink-primary"
            >
              Open task
            </a>
          )}

          {isTelegram ? (
            <button
              type="button"
              onClick={openTelegramBot}
              disabled={busy || approved}
              className="rounded-lg bg-brand-blue px-3 py-2 text-xs font-semibold text-base disabled:opacity-60"
            >
              {approved ? 'Completed ✓' : busy ? 'Opening bot…' : 'Complete with Telegram bot'}
            </button>
          ) : (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => {
                  setFile(event.target.files?.[0] || null);
                  setMessage('');
                  setError(null);
                }}
              />
              <button
                type="button"
                onClick={uploadScreenshot}
                disabled={busy || pending || approved}
                className="rounded-lg bg-brand-blue px-3 py-2 text-xs font-semibold text-base disabled:opacity-60"
              >
                {approved ? 'Approved ✓' : pending ? 'Under review…' : busy ? 'Uploading…' : file ? 'Submit screenshot' : 'Share a screenshot'}
              </button>
            </>
          )}
        </div>
      </div>

      {file && !submitted && (
        <p className="mt-3 rounded-lg bg-[#030914] px-3 py-2 text-xs text-ink-muted">
          Selected: <span className="font-medium text-ink-primary">{file.name}</span>
        </p>
      )}

      {submission && (
        <p className="mt-3 text-xs text-ink-muted">
          Status:{' '}
          <span className={approved ? 'font-semibold text-gain' : rejected ? 'font-semibold text-loss' : 'font-semibold text-brand-cyan'}>
            {submission.status}
          </span>
        </p>
      )}

      {message && <p className="mt-3 text-xs text-gain">{message}</p>}
      {error && <p className="mt-3 text-xs text-loss">{error}</p>}

      {isTelegram && !approved && (
        <p className="mt-3 text-xs leading-5 text-ink-muted">
          Telegram tasks are completed through the Top-Tier bot. Join the channel, then follow the bot prompt.
        </p>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState(null);

  const loadTasks = async () => {
    try {
      const result = await api.getMyTaskSubmissions();
      setSubmissions(result.submissions || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const load = async () => {
    try {
      const [dashboard, taskData] = await Promise.all([api.getMyDashboard(), api.getMyTaskSubmissions()]);
      setData(dashboard);
      setSubmissions(taskData.submissions || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (error && !data) return <p className="p-6 text-sm text-loss">Couldn't load your dashboard: {error}</p>;
  if (!data) return <p className="p-6 text-sm text-ink-muted">Loading…</p>;

  const { stats, recent_activities = [], referrals = [], tasks = [] } = data;
  const submissionByTaskId = new Map(submissions.map((item) => [item.task_id, item]));

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

      <div className="mt-8 space-y-8">
        <section>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-sm font-semibold">Your referrals</h2>
              <p className="mt-1 text-xs text-ink-muted">People who joined Top-Tier using your referral link.</p>
            </div>
            <span className="rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-cyan">{referrals.length} total</span>
          </div>

          <div className="mt-3 space-y-2">
            {referrals.length === 0 && (
              <div className="rounded-lg border border-[#12365A] bg-[#071426] px-4 py-3 text-sm text-ink-muted">No referrals yet.</div>
            )}
            {referrals.map((ref) => (
              <div key={ref.id} className="rounded-lg border border-[#12365A] bg-[#071426] px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{ref.username}</span>
                  <span className="text-xs text-ink-muted">{new Date(ref.created_at).toLocaleDateString()}</span>
                </div>
                <div className="mt-1 text-xs text-ink-muted">
                  {ref.email}
                  {ref.telegram_username ? ` · @${ref.telegram_username.replace(/^@/, '')}` : ' · Telegram not provided'}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-sm font-semibold">Published tasks</h2>
              <p className="mt-1 text-xs text-ink-muted">Every active task published today is shown here.</p>
            </div>
            <span className="rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-cyan">{tasks.length} active</span>
          </div>

          <div className="mt-3 space-y-3">
            {tasks.length === 0 && (
              <div className="rounded-lg border border-[#12365A] bg-[#071426] px-4 py-3 text-sm text-ink-muted">No published tasks today.</div>
            )}
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                submission={submissionByTaskId.get(task.id)}
                onSubmitted={loadTasks}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-sm font-semibold text-ink-primary">Recent activity</h2>
          <ul className="mt-3 space-y-2">
            {recent_activities.length === 0 && (
              <li className="text-sm text-ink-muted">Nothing yet — go earn some points.</li>
            )}
            {recent_activities.map((a) => (
              <li key={a.id} className="flex items-center justify-between rounded-lg border border-[#12365A] bg-[#071426] px-3 py-2 text-sm">
                <span className="text-ink-muted">{a.action_type.replace(/_/g, ' ')}</span>
                <span className="tabular-nums font-medium text-gain">+{a.points}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
