import { useEffect, useState } from 'react';
import { api } from '../api/client';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning,';
  if (hour >= 12 && hour < 17) return 'Good afternoon,';
  if (hour >= 17 && hour < 21) return 'Good evening,';
  return 'Good night,';
}

const Action = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="tt-card flex items-center gap-3 rounded-2xl p-3 text-left hover:border-brand-blue/60">
    <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-blue/10 text-lg text-brand-cyan">{icon}</span>
    <span className="text-xs font-semibold">{label}</span><span className="ml-auto text-brand-cyan">›</span>
  </button>
);

export default function Home({ goToTerminal, goToLearn }) {
  const [data,setData]=useState(null); const [error,setError]=useState(null);
  useEffect(()=>{api.getMyDashboard().then(setData).catch(e=>setError(e.message));},[]);
  if(error) return <p className="p-6 text-sm text-loss">Couldn't load your dashboard: {error}</p>;
  if(!data) return <p className="p-6 text-sm text-ink-muted">Loading…</p>;
  const s=data.stats||{}; const name=data.user?.username||data.username||'User'; const tasks=(data.tasks||[]).slice(0,1);
  const nav=(key)=>window.dispatchEvent(new CustomEvent('top-tier:navigate',{detail:key}));
  return <div className="mx-auto max-w-5xl px-4 pb-8 pt-5 sm:px-8">
    <div className="flex items-center justify-between"><div><p className="font-display text-lg font-black tracking-wide">♛ TOP <span className="text-brand-cyan">TIER</span></p><p className="text-[9px] text-ink-muted">Earn • Complete • Withdraw</p></div><div className="flex gap-2"><button className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface">♧</button><button className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface">●</button></div></div>
    <div className="mt-5 flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-full border-2 border-brand-cyan/50 bg-brand-blue/20 text-xl">👤</div><div><p className="text-[10px] text-ink-muted">{getGreeting()}</p><h1 className="font-display text-base font-bold text-white">{name}</h1><p className="text-[10px] text-brand-cyan">★ Level {Math.max(1,Math.floor((s.total_points||0)/500)+1)} · {(s.total_points||0).toLocaleString()} pts</p></div></div>
    <section className="relative mt-4 overflow-hidden rounded-2xl border border-brand-blue/50 bg-gradient-to-r from-brand-blue/20 to-surface p-4"><div><p className="text-[9px] font-bold uppercase tracking-widest text-brand-cyan">▣ DAILY TASKS</p><h2 className="mt-1 font-display text-base font-bold text-white">Complete Tasks.<br/>Earn Points. Get Rewards.</h2><button onClick={()=>nav('tasks')} className="mt-3 rounded-lg bg-brand-blue px-4 py-2 text-[10px] font-bold text-white">View Tasks →</button></div><div className="absolute right-4 top-3 text-5xl">🎁</div></section>
    <div className="mt-3 grid grid-cols-3 gap-2"><div className="tt-card rounded-2xl p-3 text-center"><p className="text-[9px] text-ink-muted">Total Points</p><p className="mt-1 font-display text-lg font-bold">{(s.total_points||0).toLocaleString()}</p></div><div className="tt-card rounded-2xl p-3 text-center"><p className="text-[9px] text-ink-muted">Today</p><p className="mt-1 font-display text-lg font-bold">+{s.daily_points||0}</p></div><div className="tt-card rounded-2xl p-3 text-center"><p className="text-[9px] text-ink-muted">Rank</p><p className="mt-1 font-display text-lg font-bold">#{s.rank||'—'}</p></div></div>
    <h2 className="mt-5 font-display text-sm font-bold">Quick Actions</h2><div className="mt-2 grid grid-cols-2 gap-2"><Action icon="✓" label="View Tasks" onClick={()=>nav('tasks')}/><Action icon="♧" label="Referrals" onClick={()=>nav('referrals')}/><Action icon="🏆" label="Leaderboard" onClick={()=>nav('leaderboard')}/><Action icon="▣" label="Wallet" onClick={()=>nav('wallet')}/></div>
    {tasks.length>0&&<div className="mt-5 tt-card rounded-2xl p-4"><div className="flex items-center justify-between"><div><p className="text-[9px] uppercase text-brand-cyan">Published task</p><p className="mt-1 text-sm font-bold">{tasks[0].title}</p></div><span className="rounded-full bg-brand-blue/10 px-2 py-1 text-[9px] font-bold text-brand-cyan">+{tasks[0].points} pts</span></div><p className="mt-2 text-[10px] text-ink-muted">Every active task published today is available in Tasks.</p></div>}
    <div className="mt-5 flex gap-2"><button onClick={goToTerminal} className="flex-1 rounded-xl border border-border px-3 py-2 text-xs">Practice Terminal</button><button onClick={goToLearn} className="flex-1 rounded-xl border border-border px-3 py-2 text-xs">Learn</button></div>
  </div>;
}