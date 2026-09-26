import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import RankBadge from '../components/RankBadge';
import { useAuth } from '../auth/AuthContext';

const tbodyVariants = { hidden: {}, show: { transition: { staggerChildren: 0.03 } } };
const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function initials(name = '?') {
  return name.trim().split(/\s+|_/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?';
}

function TopAvatar({ name, rank }) {
  return (
    <div className="relative mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-brand-blue/30 bg-[#101510] shadow-[0_0_28px_rgba(34,197,94,0.12)] sm:h-24 sm:w-24">
      <div className="absolute inset-2 rounded-lg border border-dashed border-brand-blue/20" />
      <span className="font-display text-xl font-black tracking-widest text-brand-cyan sm:text-2xl">{initials(name)}</span>
      <span className="absolute bottom-1 right-1 rounded bg-[#030914]/80 px-1.5 py-0.5 text-[9px] font-bold text-brand-cyan">#{rank}</span>
    </div>
  );
}

function PodiumCard({ row, rank, featured = false }) {
  if (!row) return null;
  return (
    <div className={`relative flex min-w-0 flex-col items-center ${featured ? 'z-10 -mt-6 sm:-mt-10' : 'mt-2'}`}>
      <TopAvatar name={row.username} rank={rank} />
      <div className={`mt-2 w-full max-w-[230px] overflow-hidden border bg-[#080a0d] px-2.5 py-4 text-center sm:mt-3 sm:px-4 sm:py-5 ${featured ? 'border-brand-blue shadow-[0_0_30px_rgba(34,197,94,0.12)]' : 'border-[#12365A]'}`}>
        <p className="text-[10px] font-bold tracking-[0.14em] text-brand-cyan sm:text-xs sm:tracking-[0.18em]">[{rank}]</p>
        <p className="mt-2 truncate font-display text-xs font-semibold text-ink-primary sm:text-sm">{row.username}</p>
        <div className="mx-auto my-2 h-px w-12 bg-border sm:my-3 sm:w-20" />
        <p className="font-display text-lg font-bold tabular-nums text-ink-primary sm:text-xl">{Number(row.total_points ?? 0).toLocaleString()}</p>
        <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-ink-muted sm:text-[10px] sm:tracking-[0.2em]">POINTS</p>
      </div>
    </div>
  );
}

function MobileRankCard({ row, index, isAdmin, scoringId, scorePoints, scoreNote, setScoringId, setScorePoints, setScoreNote, applyScore }) {
  return (
    <motion.article
      variants={rowVariants}
      className="tt-card min-w-0 overflow-hidden rounded-2xl border border-[#12365A]/80 bg-[#030914] p-3 sm:p-4"
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="shrink-0"><RankBadge position={row.rank ?? index + 4} /></div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="break-words text-sm font-bold sm:text-base">{row.username}</p>
              <p className="mt-1 text-[10px] text-ink-muted sm:text-xs">Joined {formatDate(row.created_at)}</p>
            </div>
            <p className="shrink-0 text-right font-display text-base font-bold text-brand-cyan sm:text-lg">
              {Number(row.total_points ?? 0).toLocaleString()}
              <span className="ml-1 text-[8px] font-normal uppercase text-ink-muted sm:text-[9px]">pts</span>
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 min-[420px]:grid-cols-3">
            <div className="rounded-xl border border-border/70 bg-[#080b10] p-2">
              <p className="text-[8px] uppercase tracking-wide text-ink-muted">Status</p>
              <div className="mt-1"><StatusBadge status={row.status} /></div>
            </div>
            <div className="rounded-xl border border-border/70 bg-[#080b10] p-2">
              <p className="text-[8px] uppercase tracking-wide text-ink-muted">Referrals</p>
              <p className="mt-1 text-xs font-semibold">{row.referral_count ?? 0}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-[#080b10] p-2 min-[420px]:block">
              <p className="text-[8px] uppercase tracking-wide text-ink-muted">Contribution</p>
              <p className="mt-1 truncate text-xs font-semibold">{row.total_contribution ?? '—'}</p>
            </div>
          </div>

          <div className="mt-2 rounded-xl border border-border/70 bg-[#080b10] p-2">
            <p className="text-[8px] uppercase tracking-wide text-ink-muted">Telegram</p>
            <p className="mt-1 truncate text-xs text-ink-muted">{row.telegram_username ? `@${row.telegram_username}` : '—'}</p>
          </div>

          {isAdmin && (
            <div className="mt-3 rounded-xl border border-brand-blue/20 bg-brand-blue/5 p-2.5">
              <p className="mb-2 text-[9px] font-bold uppercase tracking-wide text-brand-cyan">Admin points</p>
              <div className="grid grid-cols-1 gap-2 min-[430px]:grid-cols-[90px_minmax(0,1fr)_auto]">
                <input
                  type="number"
                  placeholder="± points"
                  value={scoringId === row.id ? scorePoints : ''}
                  onChange={(e) => { setScoringId(row.id); setScorePoints(e.target.value); }}
                  className="w-full rounded-lg border border-[#12365A] bg-[#08090a] px-2 py-2 text-xs outline-none focus:border-brand-blue"
                />
                <input
                  placeholder="Reason"
                  value={scoringId === row.id ? scoreNote : ''}
                  onChange={(e) => { setScoringId(row.id); setScoreNote(e.target.value); }}
                  className="w-full min-w-0 rounded-lg border border-[#12365A] bg-[#08090a] px-2 py-2 text-xs outline-none focus:border-brand-blue"
                />
                <button
                  type="button"
                  disabled={scoringId !== row.id || !scorePoints || Number(scorePoints) === 0}
                  onClick={() => applyScore(row.id)}
                  className="w-full rounded-lg bg-gain px-3 py-2 text-xs font-semibold text-black disabled:opacity-50 min-[430px]:w-auto"
                >
                  Give
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default function Leaderboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scoringId, setScoringId] = useState(null);
  const [scorePoints, setScorePoints] = useState('');
  const [scoreNote, setScoreNote] = useState('');

  useEffect(() => {
    api.getLeaderboard(50)
      .then((data) => setRows(data.leaderboard || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const podium = useMemo(() => rows.slice(0, 3), [rows]);
  const tableRows = useMemo(() => rows.slice(3), [rows]);

  const applyScore = async (userId) => {
    const points = Number.parseInt(scorePoints, 10);
    if (!Number.isInteger(points) || points === 0) return;
    setScoringId(userId);
    try {
      await api.adminScoreUser(userId, points, scoreNote);
      const data = await api.getLeaderboard(50);
      setRows(data.leaderboard || []);
      setScorePoints('');
      setScoreNote('');
    } catch (err) {
      setError(err.message);
    } finally {
      setScoringId(null);
    }
  };

  return (
    <div className="min-h-screen min-w-0 bg-[#030914] font-body text-ink-primary">
      <header className="relative overflow-hidden rounded-b-3xl border-b border-brand-blue/30 bg-gradient-to-br from-[#07162b] via-[#030914] to-[#06152a] px-3 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5 lg:px-10">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(0,140,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.08)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="relative mx-auto w-full max-w-6xl text-center">
          <p className="font-display text-lg font-black tracking-wide sm:text-xl"><span className="text-brand-cyan">♛</span> TOP TIER</p>
          <p className="mt-2 font-display text-xl font-black tracking-wide text-ink-primary sm:mt-3 sm:text-3xl">Leaderboard</p>
          <p className="mx-auto mt-2 max-w-xl text-[10px] leading-4 text-ink-muted sm:mt-3 sm:text-sm sm:leading-5">
            Earn points, complete tasks, trade in the demo terminal, and rise through the ranks.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl min-w-0 px-3 pb-12 pt-4 sm:px-6 sm:pt-5 lg:px-8 xl:px-10">
        <section className="relative overflow-hidden rounded-3xl border border-brand-blue/30 bg-gradient-to-b from-[#06172c] to-[#030914] px-2 pb-5 pt-7 sm:px-6 sm:pb-7 sm:pt-8 lg:px-8">
          <div className="absolute left-1/2 top-0 h-48 w-[min(420px,90vw)] -translate-x-1/2 rounded-full bg-gain/5 blur-3xl" />
          {podium.length > 0 && (
            <div className="relative grid grid-cols-3 items-end gap-1.5 pt-5 min-[420px]:gap-2 sm:gap-4 sm:pt-8">
              <div className="order-2 min-w-0 md:order-1"><PodiumCard row={podium[1]} rank={2} /></div>
              <div className="order-1 min-w-0 md:order-2"><PodiumCard row={podium[0]} rank={1} featured /></div>
              <div className="order-3 min-w-0 md:order-3"><PodiumCard row={podium[2]} rank={3} /></div>
            </div>
          )}
        </section>

        {/* Detailed ranking rows: #4 through the last user remain in the original table layout. */}
        <section className="mt-4 overflow-x-auto rounded-2xl border border-brand-blue/30 bg-[#061326]">
          <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#12365A] bg-[#070809] text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                <th className="px-4 py-3 font-medium">Rank</th>
                <th className="px-4 py-3 font-medium">Player</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Contribution</th>
                <th className="px-4 py-3 font-medium">Referrals</th>
                <th className="px-4 py-3 font-medium">Points</th>
                <th className="px-4 py-3 font-medium">Telegram</th>
                {\${isAdmin} && <th className="px-4 py-3 font-medium">Admin points</th>}
              </tr>
            </thead>
            <motion.tbody variants={tbodyVariants} initial="hidden" animate="show">
              {\${tableRows}.map((row, index) => (
                <motion.tr key={row.id} variants={rowVariants} whileHover={{ backgroundColor: 'rgba(0,140,255,0.04)' }} className="border-b border-[#12365A]/70 bg-[#030914]">
                  <td className="px-4 py-3"><RankBadge position={row.rank ?? index + 4} /></td>
                  <td className="px-4 py-3 font-medium">{row.username}</td>
                  <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                  <td className="px-4 py-3 text-ink-muted">{formatDate(row.created_at)}</td>
                  <td className="px-4 py-3 tabular-nums text-ink-muted">{row.total_contribution ?? '—'}</td>
                  <td className="px-4 py-3 tabular-nums text-ink-muted">{row.referral_count ?? 0}</td>
                  <td className="px-4 py-3 tabular-nums font-semibold">{Number(row.total_points ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-ink-muted">{row.telegram_username ? \`@\${row.telegram_username}\` : '—'}</td>
                  {\${isAdmin} && (
                    <td className="px-4 py-3">
                      <div className="flex min-w-[230px] flex-wrap items-center gap-1.5">
                        <input type="number" placeholder="± points" value={scoringId === row.id ? scorePoints : ''} onChange={(e) => { setScoringId(row.id); setScorePoints(e.target.value); }} className="w-20 rounded-md border border-[#12365A] bg-[#08090a] px-2 py-1.5 text-xs outline-none focus:border-brand-blue" />
                        <input placeholder="Reason" value={scoringId === row.id ? scoreNote : ''} onChange={(e) => { setScoringId(row.id); setScoreNote(e.target.value); }} className="w-28 rounded-md border border-[#12365A] bg-[#08090a] px-2 py-1.5 text-xs outline-none focus:border-brand-blue" />
                        <button type="button" disabled={scoringId !== row.id || !scorePoints || Number(scorePoints) === 0} onClick={() => applyScore(row.id)} className="rounded-md bg-gain px-2.5 py-1.5 text-xs font-semibold text-black disabled:opacity-50">Give</button>
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </section>

        {loading && <p className="mt-6 text-center text-sm text-ink-muted">Loading leaderboard…</p>}
        {error && <p className="mt-6 text-center text-sm text-loss">Couldn't load the leaderboard: {error}</p>}
        {!loading && !error && rows.length === 0 && (
          <p className="mt-6 text-center text-sm text-ink-muted">No one's on the board yet — be the first to earn points.</p>
        )}
      </main>
    </div>
  );
}
