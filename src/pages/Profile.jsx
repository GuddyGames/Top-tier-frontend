import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export default function Profile() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [telegram, setTelegram] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getMyProfile()
      .then((data) => {
        setProfile(data);
        setTelegram(data.telegram_username || '');
      })
      .catch((err) => setError(err.message));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.updateMyProfile({ telegramUsername: telegram });
      setProfile((p) => ({ ...p, telegram_username: telegram }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (error && !profile) return <p className="p-6 text-sm text-loss">Couldn't load your profile: {error}</p>;
  if (!profile) return <p className="p-6 text-sm text-ink-muted">Loading…</p>;

  return (
    <div className="mx-auto max-w-lg px-6 py-8 sm:px-10">
      <h1 className="font-display text-2xl font-semibold">Your profile</h1>

      <div className="mt-6 space-y-4 rounded-xl border border-border bg-surface p-5">
        <div>
          <p className="text-xs text-ink-muted">Username</p>
          <p className="mt-0.5 text-sm">{profile.username}</p>
        </div>
        <div>
          <p className="text-xs text-ink-muted">Email</p>
          <p className="mt-0.5 text-sm">{profile.email}</p>
        </div>
        <div>
          <p className="text-xs text-ink-muted">Referral code</p>
          <p className="mt-0.5 font-mono text-sm">{profile.referral_code}</p>
        </div>
        <div>
          <p className="text-xs text-ink-muted">Member since</p>
          <p className="mt-0.5 text-sm">
            {new Date(profile.created_at).toLocaleDateString('en-GB')}
          </p>
        </div>

        <form onSubmit={handleSave} className="pt-2">
          <label className="text-xs text-ink-muted">Telegram username</label>
          <div className="mt-1.5 flex gap-2">
            <input
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="yourhandle"
              className="w-full rounded-lg border border-border bg-base px-3 py-2 text-sm outline-none focus:border-gold"
            />
            <button
              type="submit"
              disabled={saving}
              className="shrink-0 rounded-lg bg-gold px-3.5 py-2 text-xs font-semibold text-base hover:bg-gold-soft disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
        {error && <p className="text-sm text-loss">{error}</p>}
      </div>

      <button
        onClick={logout}
        className="mt-6 text-sm text-ink-muted hover:text-loss"
      >
        Log out
      </button>
    </div>
  );
}
