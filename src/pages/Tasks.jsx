import { useEffect, useState } from 'react';
import { api } from '../api/client';

const filters = ['All', 'Manual', 'Telegram', 'Social'];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [proof, setProof] = useState({});
  const [busy, setBusy] = useState({});
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const [a, b] = await Promise.all([api.getTasks(), api.getMyTaskSubmissions()]);
      setTasks(a.tasks || []);
      setSubmissions(b.submissions || []);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (id) => {
    setBusy((v) => ({ ...v, [id]: true }));
    try {
      await api.submitTask(id, { proofFile: proof[id]?.file });
      setProof((v) => ({ ...v, [id]: undefined }));
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy((v) => ({ ...v, [id]: false }));
    }
  };

  const telegram = async (id) => {
    setBusy((v) => ({ ...v, [id]: true }));
    try {
      const r = await api.startTelegramTask(id);
      if (r.telegram_url) window.open(r.telegram_url, '_blank', 'noopener,noreferrer');
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy((v) => ({ ...v, [id]: false }));
    }
  };

  const byTask = Object.fromEntries(submissions.map((s) => [s.task_id, s]));
  const visible = tasks.filter(
    (t) =>
      filter === 'All' ||
      filter === 'Social' ||
      (filter === 'Telegram' ? t.task_type === 'telegram' : t.task_type !== 'telegram')
  );

  return (
    <main className="mx-auto w-full max-w-6xl min-w-0 px-3 pb-10 pt-4 sm:px-6 sm:pt-5 lg:px-8 xl:px-10">
      <header className="flex min-w-0 items-start justify-between gap-3 sm:items-center">
        <div className="min-w-0">
          <h1 className="truncate font-display text-xl font-bold sm:text-2xl">Tasks</h1>
          <p className="text-[11px] text-ink-muted sm:text-xs">Complete tasks to earn points</p>
        </div>
        <button
          aria-label="Create task"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-surface text-lg text-ink-primary transition hover:border-brand-blue/60 sm:h-10 sm:w-10 sm:text-xl"
        >
          +
        </button>
      </header>

      <nav
        aria-label="Task categories"
        className="mt-4 grid grid-cols-2 gap-1 rounded-2xl bg-surface p-1 min-[420px]:grid-cols-4 sm:mt-5"
      >
        {filters.map((x) => (
          <button
            key={x}
            onClick={() => setFilter(x)}
            className={`min-w-0 rounded-xl px-2 py-2.5 text-[10px] font-bold transition sm:py-2.5 sm:text-xs ${
              filter === x
                ? 'bg-brand-blue text-white shadow-[0_0_18px_rgba(0,140,255,.25)]'
                : 'text-ink-muted hover:text-ink-primary'
            }`}
          >
            {x}
          </button>
        ))}
      </nav>

      {error && (
        <div className="mt-3 rounded-xl border border-loss/30 bg-loss/5 p-3 text-xs leading-relaxed text-loss">
          {error}
        </div>
      )}

      <section className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
        {visible.map((task) => {
          const s = byTask[task.id];
          const file = proof[task.id]?.file;
          const isTelegram = task.task_type === 'telegram';

          return (
            <article key={task.id} className="tt-card min-w-0 overflow-hidden rounded-2xl p-3 sm:p-4">
              <div className="flex min-w-0 flex-col gap-3 min-[520px]:flex-row min-[520px]:gap-4">
                <div
                  className={`grid h-11 w-11 shrink-0 place-items-center self-start rounded-xl border text-lg sm:h-12 sm:w-12 sm:text-xl ${
                    isTelegram
                      ? 'border-[#229ED9]/50 bg-[#229ED9]/10'
                      : 'border-brand-blue/40 bg-brand-blue/10'
                  }`}
                >
                  {isTelegram ? '✈' : '▣'}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-col gap-2 min-[430px]:flex-row min-[430px]:items-start min-[430px]:justify-between">
                    <div className="min-w-0">
                      <h2 className="break-words text-sm font-bold sm:text-base">{task.title}</h2>
                      <p className="mt-1 break-words text-[10px] leading-4 text-ink-muted sm:text-xs sm:leading-5">
                        {task.description || 'Complete this task and earn points.'}
                      </p>
                    </div>

                    <span className="w-fit shrink-0 rounded-full bg-brand-blue/15 px-2 py-1 text-[9px] font-bold text-brand-cyan sm:text-[10px]">
                      +{task.points} pts
                    </span>
                  </div>

                  {!s ? (
                    isTelegram ? (
                      <button
                        disabled={busy[task.id]}
                        onClick={() => telegram(task.id)}
                        className="mt-3 w-full rounded-xl bg-brand-blue py-2.5 text-[10px] font-bold text-white transition hover:opacity-90 disabled:opacity-50 sm:py-3 sm:text-xs"
                      >
                        {busy[task.id] ? 'Opening Telegram…' : 'Open Telegram Bot'}
                      </button>
                    ) : (
                      <div className="mt-3">
                        <label className="flex min-w-0 flex-col gap-3 rounded-xl border border-dashed border-brand-blue/60 bg-brand-blue/5 p-3 min-[430px]:flex-row min-[430px]:items-center min-[430px]:justify-between sm:p-3.5">
                          <span className="min-w-0">
                            <b className="block break-words text-[10px] sm:text-xs">
                              {file?.name || 'Share a screenshot'}
                            </b>
                            <small className="text-[9px] text-ink-muted sm:text-[10px]">PNG, JPG or WEBP</small>
                          </span>
                          <span className="w-fit shrink-0 rounded-lg bg-brand-blue px-3 py-2 text-[9px] font-bold text-white">
                            Upload Screenshot
                          </span>
                          <input
                            hidden
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={(e) =>
                              setProof((v) => ({
                                ...v,
                                [task.id]: { file: e.target.files?.[0] || null },
                              }))
                            }
                          />
                        </label>

                        <button
                          disabled={!file || busy[task.id]}
                          onClick={() => submit(task.id)}
                          className="mt-2 w-full rounded-xl bg-brand-blue py-2.5 text-[10px] font-bold text-white transition hover:opacity-90 disabled:opacity-40 sm:py-3 sm:text-xs"
                        >
                          {busy[task.id] ? 'Submitting…' : 'Submit'}
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="mt-3 flex flex-col gap-1.5 rounded-xl border border-border bg-base/50 p-3 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
                      <span className="text-[10px] text-ink-muted sm:text-xs">Submission status</span>
                      <b className="w-fit rounded-full bg-brand-blue/10 px-2 py-1 text-[9px] capitalize text-brand-cyan sm:text-[10px]">
                        {s.status}
                      </b>
                    </div>
                  )}

                  {task.link && (
                    <a
                      href={task.link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block rounded-lg py-1 text-center text-[9px] text-brand-cyan transition hover:bg-brand-blue/5 sm:text-[10px]"
                    >
                      View instructions ↗
                    </a>
                  )}
                </div>
              </div>
            </article>
          );
        })}

        {!visible.length && (
          <div className="tt-card rounded-2xl p-8 text-center text-xs text-ink-muted sm:p-10 sm:text-sm">
            No active tasks in this category.
          </div>
        )}
      </section>
    </main>
  );
}
