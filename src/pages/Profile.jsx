import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';

const PRIVACY_VERSION = '1.0';

function Modal({ title, children, onClose }) {
  return <div className="fixed inset-0 z-[80] flex items-end justify-center overflow-y-auto bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
    <div className="my-auto w-full max-w-lg rounded-t-3xl border border-white/10 bg-[#071426] p-4 text-white shadow-2xl shadow-black/40 sm:rounded-3xl sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="min-w-0 break-words font-display text-base font-bold text-white">{title}</h2>
        <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-lg text-white transition hover:bg-white/10">×</button>
      </div>
      {children}
    </div>
  </div>;
}

function Stat({ value, label, accent = false }) {
  return <div className="group min-w-0 p-3 text-center transition hover:bg-white/[0.025] sm:p-3.5">
    <b className={`block truncate text-sm font-bold ${accent ? 'text-brand-cyan' : 'text-white'}`}>{value}</b>
    <p className="mt-0.5 truncate text-[9px] font-medium uppercase tracking-[.08em] text-ink-muted">{label}</p>
  </div>;
}

function SettingRow({ icon, title, description, action, danger = false }) {
  return <div className={`group flex min-w-0 items-center gap-3 rounded-2xl border p-3.5 transition duration-200 sm:p-4 ${danger ? 'border-loss/20 bg-loss/[0.035] hover:border-loss/35' : 'border-border/80 bg-base/45 hover:-translate-y-0.5 hover:border-brand-blue/35 hover:bg-base/70'}`}>
    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border text-base transition ${danger ? 'border-loss/20 bg-loss/5' : 'border-border/80 bg-surface/80 group-hover:border-brand-blue/30'}`}>{icon}</span>
    <div className="min-w-0 flex-1">
      <p className={`text-xs font-semibold ${danger ? 'text-loss' : 'text-white'}`}>{title}</p>
      <p className="mt-1 break-words text-[9px] leading-4 text-ink-muted">{description}</p>
    </div>
    {action}
  </div>;
}

export default function Profile() {
  const { logout } = useAuth();
  const [p,setP]=useState(null), [dash,setDash]=useState(null), [tg,setTg]=useState('');
  const [username,setUsername]=useState(''), [email,setEmail]=useState('');
  const [editing,setEditing]=useState(false), [saving,setSaving]=useState(false), [error,setError]=useState(null);
  const [notifications,setNotifications]=useState([]), [notificationsOpen,setNotificationsOpen]=useState(false);
  const [supportOpen,setSupportOpen]=useState(false), [support,setSupport]=useState(null), [supportText,setSupportText]=useState(''), [supportSending,setSupportSending]=useState(false);
  const [privacyOpen,setPrivacyOpen]=useState(false), [privacySaving,setPrivacySaving]=useState(false), [notificationEnabled,setNotificationEnabled]=useState(true), [notificationSaving,setNotificationSaving]=useState(false);\n  const [telegramStatus,setTelegramStatus]=useState(null), [telegramLoading,setTelegramLoading]=useState(true), [telegramStarting,setTelegramStarting]=useState(false), [telegramError,setTelegramError]=useState(null);

  const load=()=>Promise.all([api.getMyProfile(),api.getMyDashboard(),api.getTelegramVerificationStatus()]).then(([profile,dashboard,telegram])=>{setP(profile);setDash(dashboard);setTg(profile.telegram_username||'');setUsername(profile.username||'');setEmail(profile.email||'');setNotificationEnabled(profile.notification_enabled!==false);setTelegramStatus(telegram);}).catch(e=>setError(e.message)).finally(()=>setTelegramLoading(false));
  useEffect(()=>{load()},[]);

  const toggleNotifications=async()=>{const next=!notificationEnabled;setNotificationEnabled(next);setNotificationSaving(true);try{const updated=await api.updateNotificationPreference(next);setP(x=>({...x,...updated}));}catch(e){setNotificationEnabled(!next);setError(e.message)}finally{setNotificationSaving(false)}};
  const save=async e=>{e.preventDefault();setSaving(true);setError(null);try{const updated=await api.updateMyProfile({username,email,telegramUsername:tg});setP(x=>({...x,...updated}));setEditing(false)}catch(e){setError(e.message)}finally{setSaving(false)}};
  const openNotifications=async()=>{setNotificationsOpen(true);try{const d=await api.getNotifications();setNotifications(d.notifications||[])}catch(e){setError(e.message)}};
  const openSupport=async()=>{setSupportOpen(true);try{setSupport(await api.getSupportChat())}catch(e){setError(e.message)}};
  const sendSupport=async e=>{e.preventDefault();if(!supportText.trim())return;setSupportSending(true);try{const d=await api.sendSupportMessage(supportText.trim());setSupport(x=>({...x,messages:[...(x?.messages||[]),d.message]}));setSupportText('')}catch(e){setError(e.message)}finally{setSupportSending(false)}};
  const startTelegramVerification=async()=>{setTelegramStarting(true);setTelegramError(null);try{const d=await api.startTelegramVerification();setTelegramStatus(x=>({...x,...d}));if(d.telegram_url) window.open(d.telegram_url,'_blank','noopener,noreferrer')}catch(e){setTelegramError(e.message)}finally{setTelegramStarting(false)}};\n  const refreshTelegramVerification=async()=>{setTelegramLoading(true);setTelegramError(null);try{const d=await api.getTelegramVerificationStatus();setTelegramStatus(d);if(d.verified){setP(x=>({...x,telegram_username:d.telegram_username}))}}catch(e){setTelegramError(e.message)}finally{setTelegramLoading(false)}};\n  const acceptPrivacy=async()=>{setPrivacySaving(true);try{const d=await api.acceptPrivacy();setP(x=>({...x,privacy_accepted_at:d.privacy_accepted_at,privacy_policy_version:d.privacy_policy_version}));setPrivacyOpen(false)}catch(e){setError(e.message)}finally{setPrivacySaving(false)}};

  if(error&&!p)return <p className="p-6 text-sm text-loss">{error}</p>;
  if(!p)return <p className="p-6 text-sm text-ink-muted">Loading…</p>;

  const initials=(p.username||'?').slice(0,2).toUpperCase();
  const stats=dash?.stats||{};
  const referrals=stats.referral_count||0;
  const level=Math.max(1,Math.floor((stats.total_points||0)/500)+1);
  const privacyAccepted=p.privacy_policy_version===PRIVACY_VERSION && p.privacy_accepted_at;

  if (editing) return <div className="mx-auto w-full min-w-0 max-w-3xl px-3 pb-10 pt-4 sm:px-6 sm:pt-5 lg:px-8">
    <section className="relative overflow-hidden rounded-3xl border border-brand-blue/30 bg-gradient-to-br from-brand-blue/20 via-[#071426] to-surface shadow-[0_18px_55px_rgba(0,0,0,.22)]">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-cyan/10 blur-3xl" />
      <div className="relative p-4 sm:p-6">
        <button type="button" onClick={() => { setEditing(false); setError(null); }} className="mb-5 flex items-center gap-2 rounded-xl border border-border bg-white/5 px-3 py-2 text-[10px] font-bold text-white transition hover:border-brand-cyan/40 hover:bg-white/10">
          <span className="text-base">‹</span> Back to Profile
        </button>
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-brand-cyan/25 bg-brand-blue/10 text-lg">✎</span>
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[.2em] text-brand-cyan">Account settings</p>
            <h1 className="mt-1 font-display text-xl font-black text-white sm:text-2xl">Edit Profile</h1>
            <p className="mt-1 text-[10px] text-ink-muted">Update your account details and save when you're done.</p>
          </div>
        </div>
      </div>
      <form onSubmit={save} className="relative grid gap-4 border-t border-white/10 p-4 sm:grid-cols-2 sm:p-6">
        <label className="text-[10px] font-medium text-ink-muted">Username<input value={username} onChange={e=>setUsername(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-3 text-xs text-white outline-none transition focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10"/></label>
        <label className="text-[10px] font-medium text-ink-muted">Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-3 text-xs text-white outline-none transition focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10"/></label>
        <label className="text-[10px] font-medium text-ink-muted sm:col-span-2">Telegram Username<input value={tg} onChange={e=>setTg(e.target.value)} placeholder="yourhandle" className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-3 text-xs text-white outline-none transition focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/10"/></label>
        <div className="sm:col-span-2 rounded-2xl border border-border/70 bg-base/40 p-3 text-[9px] leading-4 text-ink-muted">
          Changes are only applied when you tap <span className="font-bold text-white">Save changes</span>. If you opened this by mistake, use <span className="font-bold text-white">Back to Profile</span> to leave without saving.
        </div>
        <div className="flex flex-col-reverse gap-2 min-[420px]:flex-row sm:col-span-2 sm:justify-end">
          <button type="button" onClick={() => { setEditing(false); setError(null); }} className="w-full rounded-xl border border-border bg-white/5 px-5 py-3 text-[10px] font-bold text-white transition hover:bg-white/10 min-[420px]:w-auto">Back</button>
          <button disabled={saving} className="w-full rounded-xl bg-brand-blue px-5 py-3 text-[10px] font-bold text-white shadow-lg shadow-brand-blue/10 transition hover:-translate-y-0.5 hover:bg-brand-blue/90 disabled:opacity-60 min-[420px]:w-auto">{saving?'Saving…':'Save changes'}</button>
        </div>
      </form>
    </section>
    {error&&<p className="mt-3 rounded-xl border border-loss/20 bg-loss/5 px-3 py-2 text-xs text-loss">{error}</p>}
  </div>;

  return <div className="mx-auto w-full min-w-0 max-w-5xl px-3 pb-10 pt-4 sm:px-6 sm:pt-5 lg:px-8">
    <section className="relative overflow-hidden rounded-3xl border border-brand-blue/30 bg-gradient-to-br from-brand-blue/20 via-[#071426] to-surface shadow-[0_18px_55px_rgba(0,0,0,.22)]">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-cyan/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-brand-blue/10 blur-3xl" />
      <div className="relative flex min-w-0 flex-col gap-4 p-4 min-[420px]:flex-row min-[420px]:items-center sm:p-5 md:p-6">
        <div className="relative shrink-0">
          <div className="absolute inset-0 scale-110 rounded-full bg-brand-cyan/10 blur-md" />
          <div className="relative grid h-16 w-16 place-items-center rounded-full border-2 border-brand-cyan/80 bg-brand-blue/25 font-display text-xl font-bold text-white shadow-lg shadow-brand-blue/10 sm:h-[72px] sm:w-[72px]">{initials}</div>
          <span className={`absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border-2 border-[#071426] text-[10px] font-black transition ${telegramStatus?.verified ? "bg-gain text-[#04110a] shadow-[0_0_14px_rgba(34,197,94,.3)]" : "bg-transparent text-ink-muted"}`}>✓</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-[.2em] text-brand-cyan">Top-Tier account</p>
          <h1 className="mt-1 truncate font-display text-xl font-bold text-white sm:text-2xl">{p.username}</h1>
          <p className="mt-1 truncate text-[10px] text-white/55">@{p.telegram_username||'telegram-not-linked'}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-2.5 py-1 text-[9px] font-bold text-brand-cyan">Level {level}</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-semibold text-white/70">{(stats.total_points||0).toLocaleString()} pts</span>
          </div>
        </div>
        <div className="w-full shrink-0 min-[420px]:w-auto">
          <button type="button" onClick={()=>{setError(null);setEditing(true)}} className="w-full rounded-xl border border-brand-blue/30 bg-brand-blue/15 px-4 py-2.5 text-[10px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-brand-blue/25 min-[420px]:w-auto">Edit profile</button>
        </div>
      </div>

      <div className="grid grid-cols-2 border-t border-white/10 bg-black/10 sm:grid-cols-5">
        <Stat value={referrals} label="Referrals" />
        <Stat value={stats.tasks_completed||0} label="Tasks Done" />
        <Stat value={stats.referral_points||0} label="Referral Pts" accent />
        <Stat value={stats.current_streak||0} label="Day Streak" />
        <Stat value={stats.rank ? '#'+stats.rank : '—'} label="Rank" accent />
      </div>
    </section>

    <div className="mt-4">
      <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-surface/45 p-4 shadow-[0_12px_35px_rgba(0,0,0,.12)] sm:p-5">
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-brand-cyan/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[.2em] text-brand-cyan">Telegram verification</p>
              <h2 className="mt-1 text-sm font-bold text-white">Confirm your Telegram account</h2>
              <p className="mt-1 max-w-xl text-[10px] leading-4 text-ink-muted">Join the official Top-Tier Telegram channel, then verify your membership to activate your confirmation tick and receive your verification bonus.</p>
            </div>
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 text-lg font-black transition ${telegramStatus?.verified ? 'border-gain bg-gain/10 text-gain shadow-[0_0_18px_rgba(34,197,94,.25)]' : 'border-white/15 bg-transparent text-ink-muted'}`} aria-label={telegramStatus?.verified ? 'Telegram verified' : 'Telegram not verified'}>✓</span>
          </div>
          <div className="mt-4 flex flex-col gap-2 min-[480px]:flex-row">
            <a href={telegramStatus?.channel_url || 'https://t.me/Toptiertradingchannel'} target="_blank" rel="noreferrer" className="flex-1 rounded-xl border border-brand-blue/30 bg-brand-blue/10 px-4 py-3 text-center text-[10px] font-bold text-brand-cyan transition hover:-translate-y-0.5 hover:bg-brand-blue/15">Join Telegram Channel</a>
            <button type="button" onClick={startTelegramVerification} disabled={telegramStarting || telegramStatus?.verified} className="flex-1 rounded-xl bg-brand-blue px-4 py-3 text-[10px] font-bold text-white shadow-lg shadow-brand-blue/15 transition hover:-translate-y-0.5 hover:bg-brand-blue/90 disabled:cursor-not-allowed disabled:opacity-60">{telegramStarting ? 'Opening Telegram…' : telegramStatus?.verified ? 'Telegram verified ✓' : 'Verify Telegram'}</button>
          </div>
          <button type="button" onClick={refreshTelegramVerification} disabled={telegramLoading} className="mt-2 w-full rounded-xl border border-border bg-white/[0.03] px-4 py-2.5 text-[9px] font-bold text-ink-muted transition hover:border-brand-cyan/30 hover:text-white disabled:opacity-60">{telegramLoading ? 'Checking verification…' : 'I joined — check verification'}</button>
          {telegramStatus?.verified && <p className="mt-3 rounded-xl border border-gain/20 bg-gain/5 px-3 py-2 text-[9px] font-semibold text-gain">Telegram membership confirmed{telegramStatus.telegram_username ? ` as @${telegramStatus.telegram_username}` : ''}. Your green tick is now active.</p>}
          {!telegramStatus?.verified && <p className="mt-3 text-[9px] leading-4 text-ink-muted">After joining, tap <b className="text-white">Verify Telegram</b> to open the secure verification flow, then return here and tap <b className="text-white">I joined — check verification</b>.</p>}
          {telegramError && <p className="mt-2 rounded-xl border border-loss/20 bg-loss/5 px-3 py-2 text-[9px] text-loss">{telegramError}</p>}
        </div>
      </section>
    </div>

    <div className="mt-4">
      <section className="space-y-2 rounded-3xl border border-border/80 bg-surface/45 p-3 shadow-[0_12px_35px_rgba(0,0,0,.12)] sm:p-4">
        <div className="mb-1 flex items-center justify-between px-1">
          <div><h2 className="text-sm font-bold text-white">Account controls</h2><p className="text-[9px] text-ink-muted">Preferences and support</p></div>
          <span className="text-[9px] text-brand-cyan">● Online</span>
        </div>

        <SettingRow icon="🔔" title="Notifications" description="View updates about tasks and your account" action={
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={openNotifications} className="hidden rounded-lg border border-border px-2.5 py-1.5 text-[9px] font-bold text-white transition hover:bg-white/5 min-[420px]:block">View</button>
            <button type="button" role="switch" aria-checked={notificationEnabled} aria-label="Toggle notifications" onClick={toggleNotifications} disabled={notificationSaving} className={`relative h-6 w-11 shrink-0 rounded-full p-0.5 transition ${notificationEnabled ? 'bg-brand-cyan' : 'bg-[#334155]'} ${notificationSaving ? 'opacity-60' : ''}`}><span className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${notificationEnabled ? 'translate-x-5' : 'translate-x-0'}`}/></button>
          </div>
        } />
        <button type="button" onClick={openNotifications} className="rounded-2xl border border-border/80 bg-base/45 p-3 text-left text-[9px] text-ink-muted min-[420px]:hidden">Tap to view notifications and account updates →</button>

        <button type="button" onClick={openSupport} className="w-full text-left">
          <SettingRow icon="💬" title="Support" description="Chat with an admin" action={<span className="text-lg text-white/50 transition group-hover:text-brand-cyan">›</span>} />
        </button>

        <button type="button" onClick={()=>setPrivacyOpen(true)} className="w-full text-left">
          <SettingRow icon="🔒" title="Privacy & Policy" description={privacyAccepted?'Policy accepted':'Review required'} action={<span className={`rounded-full border px-2 py-1 text-[8px] font-bold ${privacyAccepted?'border-gain/20 bg-gain/5 text-gain':'border-amber-400/20 bg-amber-400/5 text-amber-300'}`}>{privacyAccepted?'Accepted':'Review'}</span>} />
        </button>

        <button type="button" onClick={logout} className="w-full text-left">
          <SettingRow icon="↪" title="Log Out" description="Sign out of your Top-Tier account" danger action={<span className="text-lg text-loss/60">›</span>} />
        </button>
      </section>
    </div>

    {error&&<p className="mt-3 rounded-xl border border-loss/20 bg-loss/5 px-3 py-2 text-xs text-loss">{error}</p>}

    {notificationsOpen&&<Modal title="Notifications" onClose={()=>setNotificationsOpen(false)}><div className="max-h-[60vh] space-y-2 overflow-y-auto">{notifications.length?notifications.map(n=><button key={n.id} onClick={async()=>{await api.markNotificationRead(n.id);setNotifications(x=>x.map(i=>i.id===n.id?{...i,read_at:true}:i))}} className={`w-full rounded-2xl border p-3.5 text-left transition hover:border-brand-blue/35 ${n.read_at?'border-border bg-base/40':'border-brand-blue/25 bg-brand-blue/5'}`}><div className="flex items-start gap-3"><span className="mt-0.5 text-sm">🔔</span><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-white">{n.title}</p><p className="mt-1 break-words text-[10px] leading-4 text-white/80">{n.message}</p><p className="mt-2 text-[9px] text-ink-muted">{new Date(n.created_at).toLocaleString()}</p></div></div></button>):<p className="py-8 text-center text-xs text-ink-muted">No notifications yet.</p>}</div></Modal>}

    {supportOpen&&<Modal title="Support chat" onClose={()=>setSupportOpen(false)}><div className="max-h-[50vh] space-y-2 overflow-x-hidden overflow-y-auto rounded-2xl border border-border/70 bg-base/50 p-3">{support?.messages?.length?support.messages.map(m=><div key={m.id} className={`max-w-[88%] rounded-2xl p-2.5 text-[10px] ${Number(m.sender_user_id)===Number(p.id)?'ml-auto bg-brand-blue text-white':'bg-surface text-white'}`}><p className="break-words">{m.message}</p><p className="mt-1 break-words text-[8px] opacity-60">{m.username} · {new Date(m.created_at).toLocaleString()}</p></div>):<p className="py-8 text-center text-xs text-ink-muted">Start a conversation with support.</p>}</div><form onSubmit={sendSupport} className="mt-3 flex flex-col gap-2 min-[420px]:flex-row"><input value={supportText} onChange={e=>setSupportText(e.target.value)} placeholder="Write your complaint or question…" className="min-w-0 w-full flex-1 rounded-xl border border-border bg-base px-3 py-2.5 text-xs text-white outline-none focus:border-brand-cyan"/><button disabled={supportSending} className="w-full rounded-xl bg-brand-blue px-4 py-2.5 text-xs font-bold text-white min-[420px]:w-auto">{supportSending?'…':'Send'}</button></form></Modal>}

    {privacyOpen&&<Modal title="Privacy & Policy" onClose={()=>setPrivacyOpen(false)}><div className="max-h-[55vh] overflow-y-auto space-y-3 text-[11px] leading-5 text-white"><p><b className="text-ink-primary">Top-Tier Privacy Policy — v{PRIVACY_VERSION}</b></p><p>We use account information such as your username, email and Telegram username to provide your account, tasks, referrals, notifications and support features.</p><p>Your task activity, referral relationships and support messages are stored to operate the service and help administrators respond to requests.</p><p>Keep your password private. Do not submit sensitive personal information in support chats.</p><p>You can review this policy from your Profile at any time.</p></div><button disabled={privacySaving} onClick={acceptPrivacy} className="mt-4 w-full rounded-xl bg-brand-blue py-3 text-xs font-bold text-white transition hover:bg-brand-blue/90 disabled:opacity-60">{privacySaving?'Saving…':privacyAccepted?'Policy accepted':'I have read and accept the Privacy Policy'}</button></Modal>}
  </div>;
}