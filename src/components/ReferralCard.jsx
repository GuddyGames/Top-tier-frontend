import { useState } from 'react';

export default function ReferralCard({ referralCode, referralCount = 0 }) {
  const [copied, setCopied] = useState(false);

  if (!referralCode) return null;

  const link = `${window.location.origin}/?ref=${encodeURIComponent(referralCode)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-sm font-semibold text-ink-primary">Your referral link</p>
          <p className="mt-1 text-xs text-ink-muted">
            {referralCount} {referralCount === 1 ? 'person has' : 'people have'} joined through it
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="shrink-0 rounded-lg bg-gold px-3.5 py-2 text-xs font-semibold text-base transition hover:bg-gold-soft"
        >
          {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>
      <p className="mt-3 truncate rounded-lg bg-base px-3 py-2 font-mono text-xs text-ink-muted">
        {link}
      </p>
    </div>
  );
}
