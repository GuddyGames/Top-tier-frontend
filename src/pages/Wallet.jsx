import { useEffect,useState } from 'react';
import { api } from '../api/client';

function formatActivity(x) {
  const labels = {
    signup_bonus: 'Signup bonus',
    referral_bonus: 'Referral bonus',
    login: 'Daily login bonus',
    telegram_verification_bonus: 'Telegram verification bonus',
    task_completed: 'Task completed',
    admin_adjustment: 'Admin points adjustment',
  };
  return labels[x.action_type||x.type] || x.action||x.type||'Points activity';
}

export default function Wallet() {
  const [data,setData]=useState(null); const [error,setError]=useState(null);
  useEffect(()=>{api.getMyDashboard().then(setData).catch(e=>setError(e.message));},[]);
  if(error)return <p className="p-6 text-sm text-loss">{error}</p>;
  if(!data)return <p className="p-6 text-sm text-ink-muted">Loading…</p>;
  const s=data.stats||{}, activities=data.recent_activities||[];
  return <div className="mx-auto max-w-5xl px-4 pb-8 pt-5 sm:px-8">
    <div className="tt-card relative overflow-hidden rounded-3xl p-5"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-brand-cyan">Your earnings and transactions</p><h1 className="mt-2 font-display text-2xl font-bold">Wallet</h1><div className="mt-4 flex items-end justify-between"><div><p className="text-[10px] text-ink-muted">Total Balance</p><p className="mt-1 font-display text-3xl font-bold">{(s.total_points||0).toLocaleString()} <span className="text-sm text-brand-cyan">pts</span></p></div><button className="rounded-xl bg-brand-blue px-4 py-3 text-xs font-bold text-white">Withdraw</button></div></div>
    <div className="mt-3 flex rounded-xl bg-surface p-1"><button className="flex-1 rounded-lg bg-brand-blue py-2 text-xs font-bold text-white">Transactions</button><button className="flex-1 py-2 text-xs text-ink-muted">Earnings</button></div>
    <div className="mt-3 space-y-2">{activities.length?activities.map((x,i)=><div key={x.id||i} className="tt-card flex items-center justify-between rounded-2xl p-3"><div><p className="text-xs font-semibold">{x.note||formatActivity(x)}</p><p className="text-[10px] text-ink-muted">{x.created_at?new Date(x.created_at).toLocaleString():'Recent'}</p></div><span className="text-xs font-bold text-gain">+{x.points||x.amount||0} pts</span></div>):<div className="tt-card rounded-2xl p-6 text-center text-xs text-ink-muted">No wallet transactions yet.</div>}</div>
  </div>;
}