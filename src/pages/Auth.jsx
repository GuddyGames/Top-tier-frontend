import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

function getReferralCodeFromUrl() {
  return new URLSearchParams(window.location.search).get('ref') || '';
}

export default function Auth({ onDone, initialMode = 'login', referralCode = '' }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    telegramUsername: '',
    referralCode: referralCode || getReferralCodeFromUrl(),
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showTelegramPopup, setShowTelegramPopup] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await signup(form);
        setShowTelegramPopup(true);
        return;
      }
      onDone?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const continueAfterTelegram = () => {
    setShowTelegramPopup(false);
    onDone?.();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-base px-6 font-body text-ink-primary">
      {showTelegramPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-5">
          <div role="dialog" aria-modal="true" aria-labelledby="telegram-popup-title" className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#229ED9]/15 text-2xl">✈️</div>
            <h2 id="telegram-popup-title" className="mt-4 text-center font-display text-xl font-bold">Join our Telegram channel</h2>
            <p className="mt-2 text-center text-sm leading-6 text-ink-muted">Join our Telegram channel for more updates and announcements.</p>
            <a
              href="https://t.me/Toptiertradingchannel"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 block w-full rounded-xl bg-gold px-4 py-3 text-center text-sm font-bold text-base transition hover:bg-gold-soft"
            >
              Join Telegram channel
            </a>
            <p className="mt-3 break-all text-center text-xs text-ink-muted">https://t.me/Toptiertradingchannel</p>
            <button type="button" onClick={continueAfterTelegram} className="mt-4 w-full rounded-xl border border-border px-4 py-3 text-sm font-semibold text-ink-muted hover:text-ink-primary">
              Continue to Top-Tier
            </button>
          </div>
        </div>
      )}
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6">
        <p className="font-display text-2xl font-bold">Top Tier</p>
        <p className="mt-1 text-sm text-ink-muted">
          {mode === 'login' ? 'Log in to your account' : 'Create your account'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          {mode === 'signup' && (
            <input
              placeholder="Username"
              value={form.username}
              onChange={update('username')}
              required
              className="w-full rounded-lg border border-border bg-base px-3 py-2 text-sm outline-none focus:border-gold"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={update('email')}
            required
            className="w-full rounded-lg border border-border bg-base px-3 py-2 text-sm outline-none focus:border-gold"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={update('password')}
            required
            minLength={6}
            className="w-full rounded-lg border border-border bg-base px-3 py-2 text-sm outline-none focus:border-gold"
          />
          {mode === 'signup' && (
            <>
              <input
                placeholder="Telegram username (optional)"
                value={form.telegramUsername}
                onChange={update('telegramUsername')}
                className="w-full rounded-lg border border-border bg-base px-3 py-2 text-sm outline-none focus:border-gold"
              />
              <input
                placeholder="Referral code (optional)"
                value={form.referralCode}
                onChange={update('referralCode')}
                className="w-full rounded-lg border border-border bg-base px-3 py-2 text-sm outline-none focus:border-gold"
              />
            </>
          )}

          {error && <p className="text-sm text-loss">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-gold px-3.5 py-2.5 text-sm font-semibold text-base transition hover:bg-gold-soft disabled:opacity-60"
          >
            {submitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="mt-4 text-xs text-ink-muted hover:text-ink-primary"
        >
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  );
}
