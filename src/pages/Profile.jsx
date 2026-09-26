import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export default function Profile() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [telegram, setTelegram] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { api.getMyProfile().then((data) => { setProfile(data); setTelegram(data.telegram_username || ''); }).catch((err) => setError(err.message)); }, []);
  const handleSave = async (e) => { e.preventDefault(); setSaving(true); setError(null); try { await api.updateMyProfile({ telegramUsername: telegram }); setProfile((p) => ({ ...p, telegram_username: telegram })); } catch (err) { setError(err.message); } finally { setSaving(false); } };

  if (error && !profile) return <p className="p-6 text-sm text-loss">Couldn't load your profile: {error}</p>;
  if (!profile) return <p className="p-6 text-sm text-ink-muted">Loading…</p>;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-8 pt-5 sm:px-8">
      <div className="tt-card overflow-hidden rounded-3xl">
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-blue/25 via-surface to-surface p-5">
          <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-brand-cyan/10 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-brand-cyan/50 bg-brand-blue/20 text-xl font-bold text-brand-cyan">{profile.username?.slice(0,2).toUpperCase()}</div>
            <div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-brand-cyan">Your profile</p><h1 className="font-display text-xl font-bold">{profile.username}</h1><p className="text-xs text-ink-muted">@{profile.telegram_username || 'telegram-not-linked'}</p></div>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-border border-y border-border bg-surface/70">
          <div className="p-4 text-center"><p className="font-display text-xl font-bold">{profile.referral_count ?? 0}</p><p className="text-[10px] text-ink-muted">Referrals</p></div>
          <div className="p-4 text-center"><p className="font-display text-xl font-bold">{profile.tasks_completed ?? 0}</p><p className="text-[10px] text-ink-muted">Tasks Done</p></div>
          <div className="p-4 text-center"><p className="font-display text-xl font-bold">{profile.current_streak ?? 0}</p><p className="text-[10px] text-ink-muted">Day Streak</p></div>
        </div>
        <div className="space-y-3 p-4">
          <div className="rounded-2xl border border-border bg-base/50 p-3"><p className="text-[10px] uppercase tracking-wider text-ink-muted">Email</p><p className="mt-1 text-sm">{profile.email}</p></div>
          <div className="rounded-2xl border border-border bg-base/50 p-3"><p className="text-[10px] uppercase tracking-wider text-ink-muted">Referral code</p><p className="mt-1 font-mono text-sm text-brand-cyan">{profile.referral_code}</p></div>
          <form onSubmit={handleSave} className="rounded-2xl border border-border bg-base/50 p-3">
            <label className="text-[10px] uppercase tracking-wider text-ink-muted">Telegram username</label>
            <div className="mt-2 flex gap-2"><input value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="yourhandle" className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-xs outline-none focus:border-brand-cyan" /><button disabled={saving} className="rounded-xl bg-brand-blue px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button></div>
          </form>
        </div>
      </div>
      {error && <p className="mt-3 text-xs text-loss">{error}</p>}
      <button onClick={logout} className="mt-5 w-full rounded-2xl border border-loss/30 bg-loss/5 px-4 py-3 text-sm font-semibold text-loss">Log Out</button>
    </div>
  );
}