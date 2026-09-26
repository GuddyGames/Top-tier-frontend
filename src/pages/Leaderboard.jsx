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
    <div className="relative mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-brand-blue/30 bg-[#101510] shadow-[0_0_28px_rgba(34,197,94,0.12)]">
      <div className="absolute inset-2 rounded-lg border border-dashed border-brand-blue/20" />
      <span className="font-display text-2xl font-black tracking-widest text-brand-cyan">{initials(name)}</span>
      <span className="absolute bottom-1 right-1 rounded bg-[#030914]/80 px-1.5 py-0.5 text-[9px] font-bold text-brand-cyan">#{rank}</span>
    </div>
  );
}

function PodiumCard({ row, rank, featured = false }) {
  if (!row) return null;
  return (
    <div className={`relative flex flex-col items-center ${featured ? 'z-10 -mt-10' : 'mt-2'}`}>
      <TopAvatar name={row.username} rank={rank} />
      <div className={`mt-3 w-full max-w-[230px] border bg-[#080a0d] px-4 py-5 text-center ${featured ? 'border-brand-blue shadow-[0_0_30px_rgba(34,197,94,0.12)]' : 'border-[#12365A]'}`}>
        <p className="text-xs font-bold tracking-[0.18em] text-brand-cyan">[{rank}]</p>
        <p className="mt-2 truncate font-display text-sm font-semibold text-ink-primary">{row.username}</p>
        <div className="mx-auto my-3 h-px w-20 bg-border" />
        <p className="font-display text-xl font-bold tabular-nums text-ink-primary">{Number(row.total_points ?? 0).toLocaleString()}</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-ink-muted">POINTS</p>
      </div>
    </div>
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
    <div className="min-h-screen bg-[#030914] font-body text-ink-primary">
      <header className="relative overflow-hidden border-b border-brand-blue/10 bg-[#030914] px-6 pb-8 pt-10 sm:px-10">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(34,197,94,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.08)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="relative mx-auto max-w-6xl text-center">
          <p className="font-display text-3xl font-black tracking-wide text-brand-cyan sm:text-4xl">LEADERBOARD</p>
          <p className="mx-auto mt-3 max-w-xl text-xs leading-5 text-ink-muted sm:text-sm">
            Earn points, complete tasks, trade in the demo terminal, and rise through the ranks.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-8">
        <section className="relative overflow-hidden border border-brand-blue/10 bg-[#030914] px-3 pb-8 pt-12 sm:px-8">
          <div className="absolute left-1/2 top-0 h-48 w-[420px] -translate-x-1/2 rounded-full bg-gain/5 blur-3xl" />
          {podium.length > 0 && (
            <div className="relative grid grid-cols-1 items-end gap-6 pt-8 md:grid-cols-3 md:gap-3">
              <div className="order-2 md:order-1"><PodiumCard row={podium[1]} rank={2} /></div>
              <div className="order-1 md:order-2"><PodiumCard row={podium[0]} rank={1} featured /></div>
              <div className="order-3 md:order-3"><PodiumCard row={podium[2]} rank={3} /></div>
            </div>
          )}
        </section>

        <section className="mt-5 overflow-x-auto border border-[#12365A] bg-[#030914]">
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
                {isAdmin && <th className="px-4 py-3 font-medium">Admin points</th>}
              </tr>
            </thead>
            <motion.tbody variants={tbodyVariants} initial="hidden" animate="show">
              {tableRows.map((row, index) => (
                <motion.tr
                  key={row.id}
                  variants={rowVariants}
                  whileHover={{ backgroundColor: 'rgba(34,197,94,0.04)' }}
                  className="border-b border-[#12365A]/70 bg-[#030914]"
                >
                  <td className="px-4 py-3"><RankBadge position={row.rank ?? index + 4} /></td>
                  <td className="px-4 py-3 font-medium">{row.username}</td>
                  <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                  <td className="px-4 py-3 text-ink-muted">{formatDate(row.created_at)}</td>
                  <td className="px-4 py-3 tabular-nums text-ink-muted">{row.total_contribution ?? '—'}</td>
                  <td className="px-4 py-3 tabular-nums text-ink-muted">{row.referral_count ?? 0}</td>
                  <td className="px-4 py-3 tabular-nums font-semibold">{Number(row.total_points ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-ink-muted">{row.telegram_username ? `@${row.telegram_username}` : '—'}</td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex min-w-[230px] flex-wrap items-center gap-1.5">
                        <input type="number" placeholder="± points" value={scoringId === row.id ? scorePoints : ''} onChange={(e) => { setScoringId(row.id); setScorePoints(e.target.value); }} className="w-20 rounded-md border border-[#12365A] bg-[#08090a] px-2 py-1.5 text-xs outline-none focus:border-brand-blue" />
                        <input placeholder="Reason" value={scoringId === row.id ? scoreNote : ''} onChange={(e) => { setScoringId(row.id); setScoreNote(e.target.value); }} className="w-28 rounded-md border border-[#12365A] bg-[#08090a] px-2 py-1.5 text-xs outline-none focus:border-brand-blue" />
                        <button type="button" disabled={scoringId !== row.id || !scorePoints || Number(scorePoints) === 0} onClick={() => applyScore(row.id)} className="rounded-md bg-gain px-2.5 py-1.5 text-xs font-semibold text-black disabled:opacity-50">
                          Give
                        </button>
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
