import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function TelegramVerification() {
  const [status, setStatus] = useState(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);

  const loadStatus = async () => {
    try {
      setStatus(await api.getTelegramVerificationStatus());
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    let timer;
    loadStatus();
    return () => clearInterval(timer);
  }, []);

  const start = async () => {
    setStarting(true);
    setError(null);
    try {
      const data = await api.startTelegramVerification();
      setStatus(data);
      if (data.telegram_url) window.open(data.telegram_url, '_blank', 'noopener,noreferrer');

      const deadline = Date.now() + (data.expires_in_seconds || 600) * 1000;
      const poll = async () => {
        const next = await api.getTelegramVerificationStatus();
        setStatus(next);
        if (!next.verified && Date.now() < deadline) timer = setTimeout(poll, 3000);
      };
      timer = setTimeout(poll, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  };

  if (status?.verified) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="font-display text-sm font-semibold">Telegram verified ✓</p>
        <p className="mt-1 text-xs text-ink-muted">
          Your Telegram account is verified as a member of {status.channel_username}.
        </p>
        {status.telegram_username && (
          <p className="mt-2 text-xs text-ink-muted">@{status.telegram_username.replace(/^@/, '')}</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="font-display text-sm font-semibold">Verify Telegram</p>
      <p className="mt-1 text-xs leading-5 text-ink-muted">
        Join {status?.channel_username || '@Toptiertradingchannel'}, then use the verification button.
        Top-Tier will verify your Telegram account directly with Telegram.
      </p>
      <button
        type="button"
        onClick={start}
        disabled={starting}
        className="mt-4 rounded-lg bg-gold px-3.5 py-2 text-xs font-semibold text-base hover:bg-gold-soft disabled:opacity-60"
      >
        {starting ? 'Creating verification link…' : 'Verify Telegram'}
      </button>
      {status?.telegram_url && (
        <a
          href={status.telegram_url}
          target="_blank"
          rel="noreferrer"
          className="ml-2 text-xs font-medium text-gold hover:underline"
        >
          Open Telegram
        </a>
      )}
      {error && <p className="mt-3 text-xs text-loss">{error}</p>}
    </div>
  );
}
