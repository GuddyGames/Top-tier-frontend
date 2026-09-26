import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

function getReferralCodeFromUrl() { return new URLSearchParams(window.location.search).get('ref') || ''; }

export default function Auth({ onDone, initialMode = 'login', referralCode = '' }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ username: '', email: '', password: '', telegramUsername: '', referralCode: referralCode || getReferralCodeFromUrl() });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showTelegramPopup, setShowTelegramPopup] = useState(false);
  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null); setSubmitting(true);
    try { if (mode === 'login') await login(form.email, form.password); else { await signup(form); setShowTelegramPopup(true); return; } onDone?.(); }
    catch (err) { setError(err.message); } finally { setSubmitting(false); }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030914] px-5 py-8 text-ink-primary">
      <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-brand-blue/15 blur-3xl" /><div className="absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-brand-cyan/10 blur-3xl" />
      {showTelegramPopup && <div className="fixed inset-0 z-[100] grid place-items-center bg-black/75 p-5"><div className="tt-card w-full max-w-sm rounded-3xl p-6 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-blue/15 text-3xl">✈</div><h2 className="mt-4 font-display text-xl font-bold">Join our Telegram channel</h2><p className="mt-2 text-sm leading-6 text-ink-muted">Join the official channel for updates and announcements.</p><a href="https://t.me/Toptiertradingchannel" target="_blank" rel="noopener noreferrer" className="mt-5 block rounded-xl bg-brand-blue px-4 py-3 text-sm font-bold text-white">Join Telegram channel</a><button type="button" onClick={() => { setShowTelegramPopup(false); onDone?.(); }} className="mt-3 w-full rounded-xl border border-border px-4 py-3 text-sm font-semibold text-ink-muted">Continue to Top-Tier</button></div></div>}
      <div className="relative w-full max-w-sm">
        <div className="mb-6 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-brand-blue/40 bg-brand-blue/10 text-2xl text-brand-cyan">♛</div><p className="mt-3 font-display text-2xl font-black tracking-wide">TOP <span className="text-brand-cyan">TIER</span></p><p className="mt-1 text-xs text-ink-muted">Earn • Complete • Withdraw</p></div>
        <div className="tt-card rounded-3xl p-5">
          <h1 className="font-display text-xl font-bold">{mode === 'login' ? 'Welcome back' : 'Join Top Tier'}</h1><p className="mt-1 text-xs text-ink-muted">{mode === 'login' ? 'Sign in and continue your journey.' : 'Create your account and start earning today.'}</p>
          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            {mode === 'signup' && <input placeholder="Username" value={form.username} onChange={update('username')} required className="w-full rounded-xl border border-border bg-base px-3 py-3 text-sm outline-none focus:border-brand-cyan" />}
            <input type="email" placeholder="Email address" value={form.email} onChange={update('email')} required className="w-full rounded-xl border border-border bg-base px-3 py-3 text-sm outline-none focus:border-brand-cyan" />
            <input type="password" placeholder="Password" value={form.password} onChange={update('password')} required minLength={6} className="w-full rounded-xl border border-border bg-base px-3 py-3 text-sm outline-none focus:border-brand-cyan" />
            {mode === 'signup' && <><input placeholder="Telegram username (optional)" value={form.telegramUsername} onChange={update('telegramUsername')} className="w-full rounded-xl border border-border bg-base px-3 py-3 text-sm outline-none focus:border-brand-cyan" /><input placeholder="Referral code (optional)" value={form.referralCode} onChange={update('referralCode')} className="w-full rounded-xl border border-border bg-base px-3 py-3 text-sm outline-none focus:border-brand-cyan" /></>}
            {error && <p className="text-xs text-loss">{error}</p>}
            <button type="submit" disabled={submitting} className="w-full rounded-xl bg-brand-blue px-4 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,140,255,.2)] disabled:opacity-60">{submitting ? 'Please wait…' : mode === 'login' ? 'Login' : 'Sign Up'}</button>
          </form>
          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="mt-4 w-full text-xs font-semibold text-ink-muted hover:text-brand-cyan">{mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Login'}</button>
        </div>
      </div>
    </div>
  );
}