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

  useEffect(() => { load(); }, []);

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
  const visible = tasks.filter((t) =>
    filter === 'All' ||
    filter === 'Social' ||
    (filter === 'Telegram' ? t.task_type === 'telegram' : t.task_type !== 'telegram')
  );

  return (
    <main className="mx-auto w-full max-w-6xl min-w-0 px-3 pb-10 pt-4 sm:px-6 sm:pt-5 lg:px-8 xl:px-10">
      <header className="relative overflow-hidden rounded-3xl border border-brand-blue/25 bg-gradient-to-br from-brand-blue/12 via-surface/80 to-surface p-4 shadow-[0_14px_40px_rgba(0,0,0,.14)] sm:p-5">
        <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-brand-cyan/10 blur-3xl" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-brand-cyan/25 bg-brand-blue/10 text-sm text-brand-cyan">✓</span>
              <h1 className="truncate font-display text-xl font-black sm:text-2xl">Tasks</h1>
            </div>
            <p className="mt-1 pl-10 text-[10px] text-ink-muted sm:text-xs">Complete tasks to earn points</p>
          </div>
          <button
            aria-label="Create task"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-brand-blue/30 bg-brand-blue/10 text-xl font-light text-brand-cyan shadow-[0_8px_22px_rgba(0,140,255,.12)] transition hover:-translate-y-0.5 hover:border-brand-cyan/60 hover:bg-brand-blue/15 active:scale-95 sm:h-11 sm:w-11"
          >
            +
          </button>
        </div>
      </header>

      <nav aria-label="Task categories" className="mt-4 grid grid-cols-2 gap-1.5 rounded-2xl border border-border bg-surface/65 p-1.5 shadow-[0_8px_24px_rgba(0,0,0,.10)] min-[420px]:grid-cols-4 sm:mt-5">
        {filters.map((x) => (
          <button
            key={x}
            onClick={() => setFilter(x)}
            className={`relative min-w-0 overflow-hidden rounded-xl px-2 py-2.5 text-[10px] font-bold transition sm:py-2.5 sm:text-xs ${
              filter === x
                ? 'bg-brand-blue text-white shadow-[0_0_20px_rgba(0,140,255,.22)]'
                : 'text-ink-muted hover:bg-white/5 hover:text-ink-primary'
            }`}
          >
            {filter === x && <span className="absolute inset-x-3 bottom-0 h-px bg-brand-cyan" />}
            {x}
          </button>
        ))}
      </nav>

      {error && (
        <div className="mt-3 rounded-2xl border border-loss/30 bg-loss/5 p-3 text-xs leading-relaxed text-loss">{error}</div>
      )}

      <section className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
        {visible.map((task) => {
          const s = byTask[task.id];
          const file = proof[task.id]?.file;
          const isTelegram = task.task_type === 'telegram';

          return (
            <article key={task.id} className="group relative min-w-0 overflow-hidden rounded-3xl border border-border/80 bg-surface/70 p-3.5 shadow-[0_12px_32px_rgba(0,0,0,.12)] transition duration-200 hover:-translate-y-0.5 hover:border-brand-blue/45 hover:bg-surface sm:p-5">
              <span className={`absolute inset-y-0 left-0 w-1 ${
                isTelegram ? 'bg-[#229ED9]' : 'bg-brand-blue'
              } opacity-70`} />
              <div className="flex min-w-0 flex-col gap-3 min-[520px]:flex-row min-[520px]:gap-4">
                <div className={`grid h-12 w-12 shrink-0 place-items-center self-start rounded-2xl border text-lg shadow-[inset_0_0_18px_rgba(0,140,255,.06)] sm:h-13 sm:w-13 sm:text-xl ${
                  isTelegram
                    ? 'border-[#229ED9]/50 bg-[#229ED9]/10'
                    : 'border-brand-blue/40 bg-brand-blue/10'
                }`}>
                  {isTelegram ? '✈' : '▣'}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-col gap-2.5 min-[430px]:flex-row min-[430px]:items-start min-[430px]:justify-between">
                    <div className="min-w-0">
                      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full border border-border bg-base/40 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-ink-muted">{isTelegram ? 'Telegram' : 'Manual'}</span>
                        {!s && <span className="rounded-full border border-gain/20 bg-gain/5 px-2 py-0.5 text-[8px] font-semibold text-gain">Available</span>}
                      </div>
                      <h2 className="break-words text-sm font-bold sm:text-base">{task.title}</h2>
                      <p className="mt-1 break-words text-[10px] leading-4 text-ink-muted sm:text-xs sm:leading-5">{task.description || 'Complete this task and earn points.'}</p>
                    </div>
                    <span className="w-fit shrink-0 rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-2.5 py-1 text-[9px] font-black text-brand-cyan sm:text-[10px]">+{task.points} pts</span>
                  </div>

                  {!s ? (
                    isTelegram ? (
                      <button disabled={busy[task.id]} onClick={() => telegram(task.id)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue py-2.5 text-[10px] font-bold text-white shadow-[0_8px_22px_rgba(0,140,255,.18)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-50 sm:py-3 sm:text-xs">
                        <span>{busy[task.id] ? 'Opening Telegram…' : 'Open Telegram Bot'}</span><span>↗</span>
                      </button>
                    ) : (
                      <div className="mt-4">
                        <label className="flex min-w-0 flex-col gap-3 rounded-2xl border border-dashed border-brand-blue/45 bg-brand-blue/5 p-3.5 transition hover:border-brand-blue/70 hover:bg-brand-blue/10 min-[430px]:flex-row min-[430px]:items-center min-[430px]:justify-between sm:p-4">
                          <span className="min-w-0">
                            <b className="block break-words text-[10px] sm:text-xs">{file?.name || 'Share a screenshot'}</b>
                            <small className="mt-0.5 block text-[9px] text-ink-muted sm:text-[10px]">PNG, JPG or WEBP</small>
                          </span>
                          <span className="w-fit shrink-0 rounded-xl bg-brand-blue px-3 py-2 text-[9px] font-bold text-white shadow-[0_6px_16px_rgba(0,140,255,.16)]">Upload Screenshot</span>
                          <input hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setProof((v) => ({ ...v, [task.id]: { file: e.target.files?.[0] || null } }))} />
                        </label>
                        <button disabled={!file || busy[task.id]} onClick={() => submit(task.id)} className="mt-2.5 w-full rounded-xl border border-brand-blue/30 bg-brand-blue py-2.5 text-[10px] font-bold text-white shadow-[0_8px_22px_rgba(0,140,255,.16)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-40 sm:py-3 sm:text-xs">
                          {busy[task.id] ? 'Submitting…' : 'Submit proof'}
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-border bg-base/40 p-3 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-ink-muted">Submission status</span>
                        <span className="mt-0.5 block text-[10px] text-ink-muted sm:text-xs">Your proof has been received.</span>
                      </div>
                      <b className={`w-fit rounded-full px-2.5 py-1 text-[9px] capitalize sm:text-[10px] ${
                        s.status === 'approved' ? 'bg-gain/10 text-gain' : s.status === 'rejected' ? 'bg-loss/10 text-loss' : 'bg-brand-blue/10 text-brand-cyan'
                      }`}>{s.status}</b>
                    </div>
                  )}

                  {task.link && (
                    <a href={task.link} target="_blank" rel="noreferrer" className="mt-2 flex items-center justify-center gap-1 rounded-xl py-2 text-[9px] font-semibold text-brand-cyan transition hover:bg-brand-blue/5 sm:text-[10px]">
                      View instructions <span>↗</span>
                    </a>
                  )}
                </div>
              </div>
            </article>
          );
        })}

        {!visible.length && (
          <div className="rounded-3xl border border-dashed border-border bg-surface/50 p-8 text-center shadow-[0_8px_24px_rgba(0,0,0,.08)] sm:p-10">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-blue/10 text-xl text-brand-cyan">✓</div>
            <p className="mt-3 text-sm font-semibold">No active tasks</p>
            <p className="mt-1 text-[10px] text-ink-muted sm:text-xs">There are no tasks in this category right now.</p>
          </div>
        )}
      </section>
    </main>
  );
}
