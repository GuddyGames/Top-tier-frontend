import { useEffect, useState } from 'react';
import { api } from '../api/client';

const filters = ['All', 'Manual', 'Telegram', 'Social'];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [proof, setProof] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState({});
  const [filter, setFilter] = useState('All');

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
      await api.submitTask(taskId, { proofFile: selected?.file });
      setProof((v) => ({ ...v, [taskId]: undefined }));
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy((v) => ({ ...v, [taskId]: false })); }
  };

  const startTelegramTask = async (taskId) => {
    setBusy((v) => ({ ...v, [taskId]: true }));
    try {
      const result = await api.startTelegramTask(taskId);
      if (result.telegram_url) window.open(result.telegram_url, '_blank', 'noopener,noreferrer');
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy((v) => ({ ...v, [taskId]: false })); }
  };

  const submissionByTask = Object.fromEntries(submissions.map((s) => [s.task_id, s]));
  const visible = tasks.filter((task) => {
    if (filter === 'All' || filter === 'Social') return true;
    if (filter === 'Telegram') return task.task_type === 'telegram';
    return task.task_type !== 'telegram';
  });

  return (
    <div className="mx-auto max-w-5xl px-4 pb-8 pt-5 sm:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-brand-blue/30 bg-gradient-to-br from-brand-blue/20 via-surface to-surface p-5 shadow-[0_20px_60px_rgba(0,0,0,.25)]">
        <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-brand-cyan/15 blur-3xl" />
        <p className="relative text-[10px] font-bold uppercase tracking-[.22em] text-brand-cyan">Earn points • unlock rewards</p>
        <div className="relative mt-1 flex items-end justify-between gap-3">
          <div><h1 className="font-display text-2xl font-bold">Tasks</h1><p className="mt-1 text-xs text-ink-muted">Complete daily tasks and grow your score.</p></div>
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-brand-blue/50 bg-brand-blue/15 text-xl text-brand-cyan">+</div>
        </div>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {filters.map((item) => (
          <button key={item} onClick={() => setFilter(item)} className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition ${filter === item ? 'bg-brand-blue text-white shadow-[0_0_22px_rgba(0,140,255,.28)]' : 'border border-border bg-surface text-ink-muted hover:text-white'}`}>{item}</button>
        ))}
      </div>

      {error && <div className="mt-4 rounded-2xl border border-loss/30 bg-loss/5 px-4 py-3 text-xs text-loss">{error}</div>}

      <div className="mt-5 space-y-3">
        {visible.map((task) => {
          const submission = submissionByTask[task.id];
          const selected = proof[task.id];
          const telegram = task.task_type === 'telegram';
          return (
            <article key={task.id} className="tt-card overflow-hidden rounded-2xl p-4 transition hover:border-brand-blue/50">
              <div className="flex gap-3">
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border text-xl ${telegram ? 'border-[#229ED9]/50 bg-[#229ED9]/10' : 'border-brand-blue/40 bg-brand-blue/10'}`}>{telegram ? '✈' : '▣'}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div><h2 className="font-display text-sm font-bold">{task.title}</h2><p className="mt-1 text-[11px] leading-5 text-ink-muted">{task.description || (telegram ? 'Complete this task through the Top-Tier Telegram bot.' : 'Complete the task and upload screenshot proof.')}</p></div>
                    <span className="shrink-0 rounded-full border border-brand-cyan/30 bg-brand-cyan/5 px-2 py-1 text-[10px] font-bold text-brand-cyan">+{task.points} pts</span>
                  </div>

                  {submission ? (
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-base/60 px-3 py-2 text-xs">
                      <span className="text-ink-muted">Submission status</span>
                      <span className={`font-bold capitalize ${submission.status === 'approved' ? 'text-gain' : submission.status === 'rejected' ? 'text-loss' : 'text-brand-cyan'}`}>{submission.status}</span>
                    </div>
                  ) : telegram ? (
                    <button onClick={() => startTelegramTask(task.id)} disabled={busy[task.id]} className="mt-3 w-full rounded-xl bg-brand-blue px-4 py-3 text-xs font-bold text-white shadow-[0_8px_25px_rgba(0,140,255,.18)] disabled:opacity-50">
                      {busy[task.id] ? 'Opening Telegram…' : 'Open Telegram Bot →'}
                    </button>
                  ) : (
                    <div className="mt-3">
                      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-brand-blue/50 bg-brand-blue/5 px-3 py-3">
                        <span><span className="block text-xs font-semibold">{selected?.file?.name || 'Upload screenshot'}</span><span className="mt-1 block text-[10px] text-ink-muted">PNG, JPG or WEBP · max 5 MB</span></span>
                        <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => setProof((v) => ({ ...v, [task.id]: { file: e.target.files?.[0] || null } }))} />
                        <span className="rounded-lg bg-brand-blue px-3 py-2 text-[10px] font-bold text-white">Choose</span>
                      </label>
                      <button onClick={() => submit(task.id)} disabled={busy[task.id] || !selected?.file} className="mt-2 w-full rounded-xl bg-brand-blue px-4 py-3 text-xs font-bold text-white disabled:opacity-50">{busy[task.id] ? 'Submitting…' : 'Submit Screenshot'}</button>
                    </div>
                  )}
                  {task.link && <a href={task.link} target="_blank" rel="noreferrer" className="mt-2 block text-center text-[10px] font-semibold text-brand-cyan">View task instructions ↗</a>}
                </div>
              </div>
            </article>
          );
        })}
        {!visible.length && <div className="tt-card rounded-2xl p-8 text-center text-sm text-ink-muted">No active tasks in this category.</div>}
      </div>
    </div>
  );
}