import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Referrals() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.getMyReferral().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="p-6 text-sm text-loss">{error}</p>;
  if (!data) return <p className="p-6 text-sm text-ink-muted">Loading…</p>;

  const referrals = data.referrals || [];
  const verifiedCount = referrals.filter((x) => x.status === 'active' || x.verified_at).length;
  const bonusEarned = data.referral_count * 10;
  const link = window.location.origin + '?ref=' + data.referral_code;

  const share = async () => {
    const shareData = {
      title: 'Join Top-Tier',
      text: 'Join Top-Tier using my referral link and start earning points.',
      url: link,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      if (e?.name !== 'AbortError') {
        try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
      }
    }
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(link); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl px-4 pb-28 pt-5 sm:px-6 md:pb-10 lg:px-8">
      <section className="relative overflow-hidden rounded-[28px] border border-brand-blue/20 bg-gradient-to-br from-brand-blue/10 via-surface to-brand-cyan/5 p-5 shadow-[0_18px_50px_rgba(0,0,0,.14)] sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-brand-blue/10 blur-3xl" />
        <div className="relative">
          <button type="button" onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign('/')} className="mb-5 inline-flex items-center gap-2 rounded-xl border border-border bg-surface/70 px-3 py-2 text-xs font-semibold text-ink-muted transition hover:border-brand-blue/40 hover:text-ink">
            <span className="text-lg leading-none">‹</span> Back
          </button>
          <p className="text-[10px] font-bold uppercase tracking-[.22em] text-brand-cyan">Invite friends • Earn more</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Referrals</h1>
              <p className="mt-1 max-w-xl text-xs leading-5 text-ink-muted sm:text-sm">Share your referral code and earn when friends join and complete tasks.</p>
            </div>
            <div className="hidden rounded-2xl border border-brand-cyan/20 bg-surface/70 px-4 py-3 text-right sm:block">
              <p className="text-[9px] uppercase tracking-wider text-ink-muted">Your network</p>
              <p className="mt-1 text-lg font-bold text-brand-cyan">{data.referral_count}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-border/80 bg-base/70 p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[9px] font-bold uppercase tracking-wider text-ink-muted">Your Referral Code</p>
              <span className="rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-2.5 py-1 text-[9px] font-bold text-brand-cyan">10 pts / referral</span>
            </div>
            <div className="mt-2 flex flex-col gap-2 min-[380px]:flex-row">
              <div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-border bg-surface px-3 py-3 font-mono text-sm font-bold tracking-wider text-brand-cyan">{data.referral_code}</div>
              <button type="button" onClick={copy} className="rounded-xl bg-brand-blue px-5 py-3 text-xs font-bold text-white shadow-lg shadow-brand-blue/20 transition hover:-translate-y-0.5 active:translate-y-0">
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-3 min-[420px]:grid-cols-3">
        {[
          ['Total Referrals', data.referral_count, 'people joined'],
          ['Verified', verifiedCount, 'active referrals'],
          ['Bonus Earned', bonusEarned.toLocaleString() + ' pts', 'referral rewards'],
        ].map(([label, value, note]) => (
          <div key={label} className="group rounded-2xl border border-border/80 bg-surface p-4 text-center shadow-[0_10px_28px_rgba(0,0,0,.10)] transition hover:-translate-y-0.5 hover:border-brand-blue/30">
            <p className="text-[9px] font-bold uppercase tracking-wider text-ink-muted">{label}</p>
            <p className="mt-2 text-2xl font-black tracking-tight">{value}</p>
            <p className="mt-1 text-[10px] text-ink-muted">{note}</p>
          </div>
        ))}
      </section>

      <section className="mt-4 rounded-2xl border border-border/80 bg-surface p-4 shadow-[0_10px_28px_rgba(0,0,0,.10)] sm:p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-blue/10 text-sm font-bold text-brand-blue">?</span>
          <div>
            <h2 className="font-display text-sm font-bold">How it works</h2>
            <p className="text-[10px] text-ink-muted">Three simple steps to grow your rewards.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {[
            ['01', 'Share your code', 'Send your referral code or link to a friend.'],
            ['02', 'Friend joins', 'Your friend signs up using your referral code.'],
            ['03', 'Earn rewards', 'Referral rewards are added when the conditions are met.'],
          ].map(([num, title, text]) => (
            <div key={num} className="rounded-2xl border border-border/70 bg-base/50 p-3.5">
              <span className="text-[10px] font-black text-brand-cyan">{num}</span>
              <p className="mt-2 text-xs font-bold">{title}</p>
              <p className="mt-1 text-[10px] leading-4 text-ink-muted">{text}</p>
            </div>
          ))}
        </div>
        <button type="button" onClick={share} className="mt-4 w-full rounded-xl bg-brand-blue py-3 text-xs font-bold text-white shadow-lg shadow-brand-blue/15 transition hover:-translate-y-0.5 active:translate-y-0">
          {copied ? '✓ Referral link copied' : 'Share Link'}
        </button>
      </section>

      <section className="mt-4 rounded-2xl border border-border/80 bg-surface p-4 shadow-[0_10px_28px_rgba(0,0,0,.10)] sm:p-5">
        <div className="flex flex-col gap-2 min-[420px]:flex-row min-[420px]:items-end min-[420px]:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-brand-cyan">Your network</p>
            <h2 className="mt-1 font-display text-base font-bold text-ink-muted">Referred users</h2>
          </div>
          <span className="w-fit rounded-full border border-border bg-base/60 px-3 py-1 text-[9px] font-bold text-ink-muted">{referrals.length} {referrals.length === 1 ? 'referral' : 'referrals'}</span>
        </div>

        <div className="mt-4 space-y-2">
          {referrals.length ? referrals.map((u, i) => (
            <div key={u.id || i} className="group flex min-w-0 items-center gap-3 rounded-2xl border border-border/80 bg-base/50 p-3 transition hover:-translate-y-0.5 hover:border-brand-blue/30 hover:bg-base/80">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand-blue/20 bg-brand-blue/10 text-xs font-black text-brand-blue">
                {(u.username || u.email || '?').slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-1.5">
                  <p className="truncate text-xs font-bold">{u.username || u.email}</p>
                </div>
                <p className="mt-0.5 truncate text-[10px] text-ink-muted">{u.telegram_username ? '@' + u.telegram_username : 'Telegram not linked'}</p>
              </div>
              <span className="shrink-0 rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-2.5 py-1 text-[9px] font-bold capitalize text-brand-cyan">{u.status || 'active'}</span>
            </div>
          )) : (
            <div className="rounded-2xl border border-dashed border-border p-7 text-center">
              <p className="text-sm font-semibold">No referrals yet</p>
              <p className="mt-1 text-xs text-ink-muted">Share your code to start building your network.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}