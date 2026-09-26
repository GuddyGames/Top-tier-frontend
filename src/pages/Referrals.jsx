import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Referrals() {
  const [data,setData]=useState(null); const [error,setError]=useState(null); const [copied,setCopied]=useState(false);
  useEffect(()=>{api.getMyReferral().then(setData).catch(e=>setError(e.message));},[]);
  if(error)return <p className="p-6 text-sm text-loss">{error}</p>;
  if(!data)return <p className="p-6 text-sm text-ink-muted">Loading…</p>;
  const link=window.location.origin+'?ref='+data.referral_code;
  const copy=async()=>{try{await navigator.clipboard.writeText(link)}catch{} setCopied(true);setTimeout(()=>setCopied(false),1500)};
  return <div className="mx-auto max-w-5xl px-4 pb-8 pt-5 sm:px-8">
    <div className="tt-card relative overflow-hidden rounded-3xl p-5"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-brand-cyan">Invite friends • Earn more</p><h1 className="mt-2 font-display text-2xl font-bold">Referrals</h1><p className="mt-1 text-xs text-ink-muted">Share your referral code and earn when friends join and complete tasks.</p>
      <div className="mt-5 rounded-2xl border border-border bg-base/60 p-3"><p className="text-[9px] text-ink-muted">Your Referral Code</p><div className="mt-2 flex gap-2"><div className="flex-1 rounded-xl bg-surface px-3 py-3 font-mono text-sm text-brand-cyan">{data.referral_code}</div><button onClick={copy} className="rounded-xl bg-brand-blue px-4 text-xs font-bold text-white">{copied?'Copied':'Copy'}</button></div></div>
    </div>
    <div className="mt-3 grid grid-cols-3 gap-2"><div className="tt-card rounded-2xl p-3 text-center"><p className="text-[9px] text-ink-muted">Total Referrals</p><p className="mt-1 text-xl font-bold">{data.referral_count}</p></div><div className="tt-card rounded-2xl p-3 text-center"><p className="text-[9px] text-ink-muted">Verified</p><p className="mt-1 text-xl font-bold">{data.referrals?.filter(x=>x.status==='active'||x.verified_at).length||0}</p></div><div className="tt-card rounded-2xl p-3 text-center"><p className="text-[9px] text-ink-muted">Bonus Earned</p><p className="mt-1 text-xl font-bold">{(data.referral_count*10).toLocaleString()} pts</p></div></div>
    <div className="tt-card mt-3 rounded-2xl p-4"><h2 className="font-display text-sm font-bold">How it works?</h2><ol className="mt-3 space-y-2 text-xs text-ink-muted"><li>1. Share your referral code.</li><li>2. Your friend signs up and completes a task.</li><li>3. Referral rewards are added to your account.</li></ol><button onClick={copy} className="mt-4 w-full rounded-xl bg-brand-blue py-3 text-xs font-bold text-white">Share Link</button></div>
    <div className="mt-3 space-y-2">{(data.referrals||[]).map((u,i)=><div key={u.id||i} className="tt-card flex items-center justify-between rounded-2xl p-3"><div><p className="text-xs font-bold">{u.username||u.email}</p><p className="text-[10px] text-ink-muted">{u.telegram_username?('@'+u.telegram_username):'Telegram not linked'}</p></div><span className="text-[10px] text-brand-cyan">{u.status||'active'}</span></div>)}</div>
  </div>;
}