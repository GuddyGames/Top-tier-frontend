import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [proof, setProof] = useState({});
  const [error, setError] = useState(null);
  const load = async () => {
    try {
      const [taskData, submissionData] = await Promise.all([api.getTasks(), api.getMyTaskSubmissions()]);
      setTasks(taskData.tasks || []);
      setSubmissions(submissionData.submissions || []);
      setError(null);
    } catch (e) { setError(e.message); }
  };
  useEffect(() => { load(); }, []);
  const submit = async (id) => {
    try {
      await api.submitTask(id, proof[id] || '');
      await load();
    } catch (e) { setError(e.message); }
  };
  const submissionByTask = Object.fromEntries(submissions.map((s) => [s.task_id, s]));
  return (
    <div className="mx-auto max-w-5xl px-6 py-8 sm:px-10">
      <h1 className="font-display text-2xl font-semibold">Tasks</h1>
      <p className="mt-1 text-sm text-ink-muted">Complete tasks posted by Top-Tier and submit proof for admin review.</p>
      {error && <p className="mt-4 text-sm text-loss">{error}</p>}
      <div className="mt-6 space-y-3">
        {tasks.map((task) => {
          const submission = submissionByTask[task.id];
          return (
            <div key={task.id} className="rounded-xl border border-border bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-sm font-semibold">{task.title}</h2>
                  {task.description && <p className="mt-1 text-sm text-ink-muted">{task.description}</p>}
                  <p className="mt-2 text-xs font-semibold text-gold">+{task.points} points</p>
                </div>
                {task.link && <a href={task.link} target="_blank" rel="noreferrer" className="rounded-lg border border-gold px-3 py-2 text-xs font-semibold text-gold">Open task</a>}
              </div>
              {submission ? (
                <p className="mt-4 text-xs text-ink-muted">Status: <span className="font-semibold capitalize">{submission.status}</span></p>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  <input value={proof[task.id] || ''} onChange={(e) => setProof({ ...proof, [task.id]: e.target.value })} placeholder="Proof URL or short note (optional)" className="min-w-[220px] flex-1 rounded-lg border border-border bg-base px-3 py-2 text-xs outline-none focus:border-gold" />
                  <button onClick={() => submit(task.id)} className="rounded-lg bg-gold px-4 py-2 text-xs font-semibold text-base">Mark completed</button>
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
