import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';

const PRIVACY_VERSION = '1.0';

function Modal({ title, children, onClose }) {
  return <div className="fixed inset-0 z-[80] flex items-end justify-center overflow-y-auto bg-black/60 p-0 sm:items-center sm:p-4">
    <div className="my-auto w-full max-w-lg rounded-t-3xl border border-border bg-[#071426] p-4 text-white shadow-2xl sm:rounded-3xl">
      <div className="mb-3 flex items-center justify-between gap-3"><h2 className="min-w-0 break-words font-display text-base font-bold text-white">{title}</h2><button onClick={onClose} aria-label="Close" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border text-lg text-white">×</button></div>
      {children}
    </div>
  </div>;
}

export default function Profile() {
  const { logout } = useAuth();
  const [p,setP]=useState(null), [dash,setDash]=useState(null), [tg,setTg]=useState('');
  const [username,setUsername]=useState(''), [email,setEmail]=useState('');
  const [editing,setEditing]=useState(false), [saving,setSaving]=useState(false), [error,setError]=useState(null);
  const [notifications,setNotifications]=useState([]), [notificationsOpen,setNotificationsOpen]=useState(false);
  const [supportOpen,setSupportOpen]=useState(false), [support,setSupport]=useState(null), [supportText,setSupportText]=useState(''), [supportSending,setSupportSending]=useState(false);
  const [privacyOpen,setPrivacyOpen]=useState(false), [privacySaving,setPrivacySaving]=useState(false), [notificationEnabled,setNotificationEnabled]=useState(true), [notificationSaving,setNotificationSaving]=useState(false);

  const load=()=>Promise.all([api.getMyProfile(),api.getMyDashboard()]).then(([profile,dashboard])=>{setP(profile);setDash(dashboard);setTg(profile.telegram_username||'');setUsername(profile.username||'');setEmail(profile.email||'');setNotificationEnabled(profile.notification_enabled!==false);}).catch(e=>setError(e.message));
  useEffect(()=>{load()},[]);

  const toggleNotifications=async()=>{const next=!notificationEnabled;setNotificationEnabled(next);setNotificationSaving(true);try{const updated=await api.updateNotificationPreference(next);setP(x=>({...x,...updated}));}catch(e){setNotificationEnabled(!next);setError(e.message)}finally{setNotificationSaving(false)}};

  const save=async e=>{e.preventDefault();setSaving(true);setError(null);try{const updated=await api.updateMyProfile({username,email,telegramUsername:tg});setP(x=>({...x,...updated}));setEditing(false)}catch(e){setError(e.message)}finally{setSaving(false)}};
  const openNotifications=async()=>{setNotificationsOpen(true);try{const d=await api.getNotifications();setNotifications(d.notifications||[])}catch(e){setError(e.message)}};
  const openSupport=async()=>{setSupportOpen(true);try{setSupport(await api.getSupportChat())}catch(e){setError(e.message)}};
  const sendSupport=async e=>{e.preventDefault();if(!supportText.trim())return;setSupportSending(true);try{const d=await api.sendSupportMessage(supportText.trim());setSupport(x=>({...x,messages:[...(x?.messages||[]),d.message]}));setSupportText('')}catch(e){setError(e.message)}finally{setSupportSending(false)}};
  const acceptPrivacy=async()=>{setPrivacySaving(true);try{const d=await api.acceptPrivacy();setP(x=>({...x,privacy_accepted_at:d.privacy_accepted_at,privacy_policy_version:d.privacy_policy_version}));setPrivacyOpen(false)}catch(e){setError(e.message)}finally{setPrivacySaving(false)}};

  if(error&&!p)return <p className="p-6 text-sm text-loss">{error}</p>;
  if(!p)return <p className="p-6 text-sm text-ink-muted">Loading…</p>;

  const initials=(p.username||'?').slice(0,2).toUpperCase();
  const stats=dash?.stats||{};
  const referrals=stats.referral_count||0;
  const privacyAccepted=p.privacy_policy_version===PRIVACY_VERSION && p.privacy_accepted_at;

  return <div className="mx-auto w-full min-w-0 max-w-5xl px-3 pb-10 pt-4 sm:px-6 sm:pt-5 lg:px-8">
    <div className="tt-card overflow-hidden rounded-3xl">
      <div className="flex min-w-0 flex-col items-start gap-3 border-b border-border bg-gradient-to-r from-brand-blue/20 to-surface p-4 min-[420px]:flex-row min-[420px]:items-center sm:p-5">
        <div className="grid h-14 w-14 shrink-0 min-[420px]:h-16 min-[420px]:w-16 place-items-center rounded-full border-2 border-brand-cyan bg-brand-blue/20 font-display text-xl font-bold">{initials}</div>
        <div className="min-w-0 flex-1"><h1 className="font-display text-lg font-bold truncate">{p.username}</h1><p className="text-[10px] text-brand-cyan">@{p.telegram_username||'telegram-not-linked'}</p><p className="text-[10px] text-ink-muted">Level {Math.max(1,Math.floor((stats.total_points||0)/500)+1)} · {(stats.total_points||0).toLocaleString()} pts</p></div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-y divide-border bg-surface/80 sm:grid-cols-5 sm:divide-y-0">
        <div className="p-3 text-center"><b>{referrals}</b><p className="text-[9px] text-ink-muted">Referrals</p></div>
        <div className="p-3 text-center"><b>{stats.tasks_completed||0}</b><p className="text-[9px] text-ink-muted">Tasks Done</p></div>
        <div className="p-3 text-center"><b>{stats.referral_points||0}</b><p className="text-[9px] text-ink-muted">Referral Pts</p></div>
        <div className="p-3 text-center"><b>{stats.current_streak||0}</b><p className="text-[9px] text-ink-muted">Day Streak</p></div>
        <div className="p-3 text-center"><b>{stats.rank ? '#'+stats.rank : '—'}</b><p className="text-[9px] text-ink-muted">Rank</p></div>
      </div>

      <div className="space-y-2 p-3 sm:p-4">
        <div className="rounded-xl border border-border bg-base/50 p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-xs font-semibold">✎ Edit Profile</p><p className="mt-1 text-[9px] text-ink-muted">Update your account details</p></div>
            <button type="button" onClick={()=>setEditing(x=>!x)} className="w-full rounded-lg bg-brand-blue px-4 py-2 text-[10px] font-bold text-white sm:w-auto">{editing?'Close':'Edit details'}</button>
          </div>
          {editing&&<form onSubmit={save} className="mt-3 grid gap-3 rounded-xl border border-border bg-surface p-3">
            <label className="text-[10px] text-ink-muted">Username<input value={username} onChange={e=>setUsername(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-2 text-xs outline-none focus:border-brand-cyan"/></label>
            <label className="text-[10px] text-ink-muted">Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-2 text-xs outline-none focus:border-brand-cyan"/></label>
            <label className="text-[10px] text-ink-muted">Telegram Username<input value={tg} onChange={e=>setTg(e.target.value)} placeholder="yourhandle" className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-2 text-xs outline-none focus:border-brand-cyan"/></label>
            <button disabled={saving} className="w-full rounded-lg bg-brand-blue py-2.5 text-[10px] font-bold text-white disabled:opacity-60">{saving?'Saving…':'Save changes'}</button>
          </form>}
        </div>

        <div className="rounded-xl border border-border bg-base/50 px-3 py-3 sm:px-4">
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={openNotifications} className="flex min-w-0 flex-1 items-center gap-2 text-left text-xs text-white"><span>🔔</span><span className="min-w-0"><b className="text-white">Notifications</b><span className="block break-words text-[9px] text-ink-muted">View updates about tasks and your account</span></span></button>
            <button type="button" role="switch" aria-checked={notificationEnabled} aria-label="Toggle notifications" onClick={toggleNotifications} disabled={notificationSaving} className={`relative h-6 w-11 shrink-0 rounded-full p-0.5 transition ${notificationEnabled ? "bg-brand-cyan" : "bg-[#334155]"} ${notificationSaving ? "opacity-60" : ""}`}><span className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${notificationEnabled ? "translate-x-5" : "translate-x-0"}`}/></button>
          </div>
        </div>

        <button type="button" onClick={openSupport} className="flex w-full items-center justify-between rounded-xl border border-border bg-base/50 px-3 py-3 text-left text-xs text-white"><span className="min-w-0 break-words">💬 <span className="ml-2 font-semibold text-white">Support</span><span className="ml-2 text-[9px] text-ink-muted">Chat with an admin</span></span><span>›</span></button>

        <button type="button" onClick={()=>setPrivacyOpen(true)} className="flex w-full items-center justify-between rounded-xl border border-border bg-base/50 px-3 py-3 text-left text-xs text-white"><span className="min-w-0 break-words">🔒 <span className="ml-2 font-semibold text-white">Privacy & Policy</span><span className="ml-2 text-[9px] text-ink-muted">{privacyAccepted?'Accepted':'Review required'}</span></span><span>›</span></button>

        <button onClick={logout} className="w-full rounded-xl border border-loss/30 bg-loss/5 px-3 py-3 text-left text-xs text-loss">↪ <span className="ml-2">Log Out</span></button>
      </div>
    </div>
    {error&&<p className="mt-3 text-xs text-loss">{error}</p>}

    {notificationsOpen&&<Modal title="Notifications" onClose={()=>setNotificationsOpen(false)}><div className="max-h-[60vh] space-y-2 overflow-y-auto">{notifications.length?notifications.map(n=><button key={n.id} onClick={async()=>{await api.markNotificationRead(n.id);setNotifications(x=>x.map(i=>i.id===n.id?{...i,read_at:true}:i))}} className="w-full rounded-xl border border-border bg-base/60 p-3 text-left"><p className="text-xs font-semibold text-white">{n.title}</p><p className="mt-1 text-[10px] text-white/80">{n.message}</p><p className="mt-2 text-[9px] text-ink-muted">{new Date(n.created_at).toLocaleString()}</p></button>):<p className="py-8 text-center text-xs text-ink-muted">No notifications yet.</p>}</div></Modal>}

    {supportOpen&&<Modal title="Support chat" onClose={()=>setSupportOpen(false)}><div className="max-h-[50vh] space-y-2 overflow-x-hidden overflow-y-auto rounded-xl bg-base/50 p-3">{support?.messages?.length?support.messages.map(m=><div key={m.id} className={`max-w-[85%] rounded-xl p-2.5 text-[10px] ${Number(m.sender_user_id)===Number(p.id)?'ml-auto bg-brand-blue text-white':'bg-surface'}`}><p>{m.message}</p><p className="mt-1 text-[8px] opacity-60">{m.username} · {new Date(m.created_at).toLocaleString()}</p></div>):<p className="py-8 text-center text-xs text-ink-muted">Start a conversation with support.</p>}</div><form onSubmit={sendSupport} className="mt-3 flex flex-col gap-2 min-[420px]:flex-row"><input value={supportText} onChange={e=>setSupportText(e.target.value)} placeholder="Write your complaint or question…" className="min-w-0 w-full flex-1 rounded-xl border border-border bg-base px-3 py-2.5 text-xs"/><button disabled={supportSending} className="w-full rounded-xl bg-brand-blue px-4 py-2.5 text-xs font-bold text-white min-[420px]:w-auto">{supportSending?'…':'Send'}</button></form></Modal>}

    {privacyOpen&&<Modal title="Privacy & Policy" onClose={()=>setPrivacyOpen(false)}><div className="max-h-[55vh] overflow-y-auto space-y-3 text-[11px] leading-5 text-white"><p><b className="text-ink-primary">Top-Tier Privacy Policy — v{PRIVACY_VERSION}</b></p><p>We use account information such as your username, email and Telegram username to provide your account, tasks, referrals, notifications and support features.</p><p>Your task activity, referral relationships and support messages are stored to operate the service and help administrators respond to requests.</p><p>Keep your password private. Do not submit sensitive personal information in support chats.</p><p>You can review this policy from your Profile at any time.</p></div><button disabled={privacySaving} onClick={acceptPrivacy} className="mt-4 w-full rounded-xl bg-brand-blue py-3 text-xs font-bold text-white">{privacySaving?'Saving…':privacyAccepted?'Policy accepted':'I have read and accept the Privacy Policy'}</button></Modal>}
  </div>;
}