import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [proof, setProof] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState({});

  const load = async () => {
    try {
      const [taskData, submissionData] = await Promise.all([api.getTasks(), api.getMyTaskSubmissions()]);
      setTasks(taskData.tasks || []);
      setSubmissions(submissionData.submissions || []);
      setError(null);
    } catch (e) { setError(e.message); }
  };

  useEffect(() => { load(); }, []);

  const submit = async (taskId) => {
    setBusy((v) => ({ ...v, [taskId]: true }));
    try {
      const selected = proof[taskId];
      await api.submitTask(taskId, { proofFile: selected?.file, proofUrl: selected?.url });
      setProof((v) => ({ ...v, [taskId]: undefined }));
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy((v) => ({ ...v, [taskId]: false }));
    }
  };

  const submissionByTask = Object.fromEntries(submissions.map((s) => [s.task_id, s]));

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 sm:px-10">
      <h1 className="font-display text-2xl font-semibold">Tasks</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Complete tasks posted by Top-Tier and submit screenshot proof for admin review.
      </p>

      {error && <p className="mt-4 text-sm text-loss">{error}</p>}

      <div className="mt-6 space-y-3">
        {tasks.map((task) => {
          const submission = submissionByTask[task.id];
          const selected = proof[task.id];

          return (
            <div key={task.id} className="rounded-xl border border-border bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-sm font-semibold">{task.title}</h2>
                  {task.description && <p className="mt-1 text-sm text-ink-muted">{task.description}</p>}
                  <p className="mt-2 text-xs font-semibold text-gold">+{task.points} points</p>
                </div>
                {task.link && (
                  <a href={task.link} target="_blank" rel="noreferrer" className="rounded-lg border border-gold px-3 py-2 text-xs font-semibold text-gold">
                    Open task
                  </a>
                )}
              </div>

              {submission ? (
                <div className="mt-4 rounded-lg border border-border bg-base px-3 py-2">
                  <p className="text-xs text-ink-muted">
                    Submission status:{' '}
                    <span className="font-semibold capitalize text-ink-primary">{submission.status}</span>
                  </p>
                  {submission.status === 'approved' && (
                    <p className="mt-1 text-xs text-gain">Points have been added to your account.</p>
                  )}
                  {submission.status === 'rejected' && (
                    <p className="mt-1 text-xs text-loss">Your proof was rejected. Contact an admin if you need to resubmit.</p>
                  )}
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <label className="block">
                    <span className="text-xs font-medium">Screenshot proof</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => setProof((v) => ({
                        ...v,
                        [task.id]: { file: e.target.files?.[0] || null, url: v[task.id]?.url || '' },
                      }))}
                      className="mt-1 block w-full rounded-lg border border-border bg-base px-3 py-2 text-xs"
                    />
                    <span className="mt-1 block text-[11px] text-ink-muted">PNG, JPG or WEBP · max 5 MB</span>
                  </label>

                  <div className="flex flex-wrap gap-2">
                    <input
                      value={selected?.url || ''}
                      onChange={(e) => setProof((v) => ({
                        ...v,
                        [task.id]: { file: v[task.id]?.file || null, url: e.target.value },
                      }))}
                      placeholder="Or paste a proof URL (optional)"
                      className="min-w-[220px] flex-1 rounded-lg border border-border bg-base px-3 py-2 text-xs outline-none focus:border-gold"
                    />
                    <button
                      onClick={() => submit(task.id)}
                      disabled={busy[task.id] || (!selected?.file && !selected?.url)}
                      className="rounded-lg bg-gold px-4 py-2 text-xs font-semibold text-base disabled:opacity-50"
                    >
                      {busy[task.id] ? 'Submitting…' : 'Submit for review'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {tasks.length === 0 && <p className="text-sm text-ink-muted">No active tasks right now.</p>}
      </div>
    </div>
  );
}
