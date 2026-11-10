import { useEffect, useState } from 'react';
import { api } from '../api/client';

const SYMBOLS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'XAU/USD', 'BTC/USD', 'ETH/USD'];
const TIMEFRAMES = ['M15', 'H1', 'M5', 'M30', 'H4', 'D1'];

function Metric({ label, value }) {
  return <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3"><p className="text-[11px] uppercase tracking-wide text-ink-muted">{label}</p><p className="mt-1 break-all text-sm font-semibold tabular-nums text-ink-primary">{value ?? '—'}</p></div>;
}

export default function Parallax() {
  const [symbol, setSymbol] = useState('EUR/USD');
  const [timeframe, setTimeframe] = useState('M15');
  const [plan, setPlan] = useState('free');
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadHistory() {
    try { const result = await api.getParallaxHistory(); setHistory(result.history || []); } catch (_) {}
  }

  useEffect(() => {
    api.getParallaxAccess().then((result) => setPlan(result.plan || 'free')).catch((err) => setError(err.message));
    loadHistory();
  }, []);

  async function runAnalysis() {
    setLoading(true); setError(''); setAnalysis(null);
    try {
      const result = await api.getParallaxAnalysis(symbol, timeframe);
      setAnalysis(result.data);
      setPlan(result.plan || plan);
      await loadHistory();
    } catch (err) {
      setError(err.message || 'Unable to analyze this market.');
    } finally {
      setLoading(false);
    }
  }

  const premiumTimeframe = !['M15', 'H1'].includes(timeframe);
  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-5 sm:px-8">
      <section className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-[#09233b] via-[#071426] to-[#030914] p-5 sm:p-7">
        <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
        <p className="relative text-[10px] font-bold uppercase tracking-[.24em] text-cyan-300">TOP TIER • PARALLAX INTELLIGENCE</p>
        <div className="relative mt-2 flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="font-display text-3xl font-bold">Market analyst</h1><p className="mt-1 max-w-xl text-sm text-ink-muted">Forex and crypto market analysis, technical indicators and explainable signal candidates.</p></div>
          <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">{plan === 'premium' ? 'Premium' : 'Free plan'}</span>
        </div>
        <div className="relative mt-6 grid gap-3 sm:grid-cols-[1fr_140px_auto]">
          <label className="text-xs text-ink-muted">Market<select value={symbol} onChange={(e) => setSymbol(e.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#061426] px-3 py-3 text-sm text-white">{SYMBOLS.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="text-xs text-ink-muted">Timeframe<select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#061426] px-3 py-3 text-sm text-white">{TIMEFRAMES.map((item) => <option key={item} value={item}>{item}{!['M15','H1'].includes(item) ? ' • Premium' : ''}</option>)}</select></label>
          <button disabled={loading} onClick={runAnalysis} className="self-end rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-[#03101d] transition hover:bg-cyan-300 disabled:opacity-50">{loading ? 'Analyzing…' : 'Analyze market'}</button>
        </div>
        {premiumTimeframe && plan !== 'premium' && <p className="relative mt-3 text-xs text-amber-200">This timeframe requires Premium access.</p>}
      </section>

      <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-4 text-xs leading-5 text-amber-100/90">
        Analysis only — not a guaranteed signal or financial advice. Data comes from Twelve Data's composite feed and may differ from your Exness execution price. Live order execution is disabled.
      </div>
      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/5 p-3 text-sm text-rose-200">{error}</p>}

      {analysis && <section className="mt-5 space-y-4">
        <div className="tt-card rounded-2xl p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs text-ink-muted">{analysis.symbol} · {analysis.timeframe}</p><h2 className="mt-1 text-xl font-bold">Analysis result</h2></div><span className={`rounded-xl px-4 py-2 text-lg font-black ${analysis.direction === 'BUY' ? 'bg-emerald-400/10 text-emerald-300' : analysis.direction === 'SELL' ? 'bg-rose-400/10 text-rose-300' : 'bg-amber-300/10 text-amber-200'}`}>{analysis.direction}</span></div>
          <p className="mt-3 text-sm text-ink-muted">Market regime: <span className="font-semibold text-white">{analysis.regime}</span> · Data: <span className="font-semibold text-white">{analysis.dataFreshness}</span></p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"><Metric label="Reference price" value={analysis.referencePrice} /><Metric label="EMA 20" value={analysis.indicators?.ema20} /><Metric label="EMA 50" value={analysis.indicators?.ema50} /><Metric label="RSI 14" value={analysis.indicators?.rsi14} /></div>
          <div className="mt-4"><p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Why this result?</p><ul className="mt-2 space-y-2">{analysis.reasons?.map((reason, index) => <li key={index} className="flex gap-2 text-sm text-ink-muted"><span className="text-cyan-300">•</span>{reason}</li>)}</ul></div>
          <p className="mt-4 text-[11px] text-ink-muted">Source: {analysis.source} · Last candle: {new Date(analysis.latestCandleAt).toLocaleString()}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">{analysis.limitations?.map((item, index) => <div key={index} className="rounded-xl border border-white/10 p-3 text-xs leading-5 text-ink-muted">{item}</div>)}</div>
      </section>}

      <section className="tt-card mt-5 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between"><div><h2 className="font-display text-lg font-bold">Your analysis history</h2><p className="text-xs text-ink-muted">Recent Parallax checks for your account</p></div><button onClick={loadHistory} className="text-xs font-semibold text-cyan-300">Refresh</button></div>
        {history.length ? <div className="mt-3 divide-y divide-white/5">{history.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><div><p className="font-semibold">{item.symbol} <span className="text-xs text-ink-muted">· {item.timeframe}</span></p><p className="text-xs text-ink-muted">{new Date(item.analyzed_at).toLocaleString()}</p></div><span className="rounded-lg bg-white/5 px-3 py-1 text-xs font-bold">{item.direction}</span></div>)}</div> : <p className="mt-4 text-sm text-ink-muted">No analyses saved yet. Run your first market analysis above.</p>}
      </section>
    </div>
  );
}
