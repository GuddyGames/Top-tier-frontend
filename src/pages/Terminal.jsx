import { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '../api/client';
import PriceChart from '../components/PriceChart';
import Callout from '../components/Callout';

const SYMBOLS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'XAU/USD', 'XAG/USD', 'BTC/USD', 'ETH/USD', 'SOL/USD'];

const TIMEFRAMES = [
  { key: '1m', label: '1m', interval: 1, hours: 2 },
  { key: '5m', label: '5m', interval: 5, hours: 12 },
  { key: '15m', label: '15m', interval: 15, hours: 48 },
  { key: '1H', label: '1H', interval: 60, hours: 24 * 7 },
];

function decimalsFor(symbol) {
  if (symbol.includes('/JPY')) return 3;
  if (symbol.startsWith('BTC') || symbol.startsWith('ETH') || symbol.startsWith('SOL')) return 2;
  if (symbol.startsWith('XAU') || symbol.startsWith('XAG')) return 2;
  return 5;
}

// A simple, clearly-labeled moving-average read on recent candles — this
// is a teaching aid, not a signal to act on. Short MA above long MA is
// the textbook definition of a short-term uptrend, and vice versa.
function trendFromCandles(candles) {
  if (candles.length < 10) return null;
  const closes = candles.map((c) => parseFloat(c.close));
  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const shortMA = avg(closes.slice(-5));
  const longMA = avg(closes.slice(-20));
  const diffPct = ((shortMA - longMA) / longMA) * 100;

  if (Math.abs(diffPct) < 0.02) return { label: 'Flat', detail: 'Short and long averages are close together — no clear direction right now.' };
  if (diffPct > 0) return { label: 'Short-term uptrend', detail: 'The 5-period average is above the 20-period average — traders often call this bullish momentum.' };
  return { label: 'Short-term downtrend', detail: 'The 5-period average is below the 20-period average — traders often call this bearish momentum.' };
}

function TradeModal({ symbol, side, price, onCancel, onSubmit, error }) {
  const [size, setSize] = useState('100');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const dec = decimalsFor(symbol);

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      symbol,
      side,
      size: parseFloat(size),
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/60 px-6">
      <form onSubmit={submit} className="w-full max-w-sm tt-card rounded-2xl p-5">
        <p className="font-display text-lg font-semibold">
          {side === 'buy' ? 'Buy' : 'Sell'} {symbol}
        </p>
        <p className="mt-0.5 text-xs text-ink-muted">Entry ≈ {price.toFixed(dec)}</p>

        <label className="mt-4 block text-xs text-ink-muted">Size (virtual $)</label>
        <input
          type="number" min="1" step="1" value={size} onChange={(e) => setSize(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-border bg-base px-3 py-2 text-sm outline-none focus:border-brand-cyan"
        />

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-ink-muted">Stop-loss (optional)</label>
            <input
              type="number" step="any" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)}
              placeholder={side === 'buy' ? `< ${price.toFixed(dec)}` : `> ${price.toFixed(dec)}`}
              className="mt-1.5 w-full rounded-xl border border-border bg-base px-3 py-2 text-sm outline-none focus:border-brand-cyan"
            />
          </div>
          <div>
            <label className="block text-xs text-ink-muted">Take-profit (optional)</label>
            <input
              type="number" step="any" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)}
              placeholder={side === 'buy' ? `> ${price.toFixed(dec)}` : `< ${price.toFixed(dec)}`}
              className="mt-1.5 w-full rounded-xl border border-border bg-base px-3 py-2 text-sm outline-none focus:border-brand-cyan"
            />
          </div>
        </div>

        <Callout title="Why set these?" >
          A stop-loss closes the trade automatically if it moves against you, capping the loss.
          A take-profit locks in gains once price hits your target. Neither is required, but
          trading without a stop-loss is how small losses become big ones.
        </Callout>

        {error && <p className="mt-3 text-sm text-loss">{error}</p>}

        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-border px-3 py-2 text-sm text-ink-muted">
            Cancel
          </button>
          <button type="submit" className="flex-1 rounded-lg bg-brand-blue px-3 py-2 text-sm font-semibold text-base hover:bg-brand-blue/80">
            Confirm
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Terminal() {
  const [symbol, setSymbol] = useState(SYMBOLS[0]);
  const [timeframe, setTimeframe] = useState(TIMEFRAMES[0]);
  const [prices, setPrices] = useState({});
  const [candles, setCandles] = useState([]);
  const [account, setAccount] = useState(null);
  const [trades, setTrades] = useState([]);
  const [pending, setPending] = useState(null); // { side }
  const [error, setError] = useState(null);
  const [tradeError, setTradeError] = useState(null);

  const refreshCore = useCallback(async () => {
    const [priceData, accountData, tradeData] = await Promise.all([
      api.getDemoPrices(),
      api.getDemoAccount(),
      api.getDemoTrades(),
    ]);
    setPrices(Object.fromEntries(priceData.prices.map((p) => [p.symbol, parseFloat(p.price)])));
    setAccount(accountData.account);
    setTrades(tradeData.trades);
  }, []);

  const refreshCandles = useCallback((sym, tf) => {
    api.getDemoCandles(sym, tf.hours, tf.interval).then((d) => setCandles(d.candles)).catch(() => {});
  }, []);

  useEffect(() => {
    refreshCore().catch((err) => setError(err.message));
    const interval = setInterval(() => {
      api.getDemoPrices().then((d) =>
        setPrices(Object.fromEntries(d.prices.map((p) => [p.symbol, parseFloat(p.price)])))
      ).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshCore]);

  useEffect(() => {
    refreshCandles(symbol, timeframe);
    const interval = setInterval(() => refreshCandles(symbol, timeframe), 10000);
    return () => clearInterval(interval);
  }, [symbol, timeframe, refreshCandles]);

  const trend = useMemo(() => trendFromCandles(candles), [candles]);

  const handleOpen = async (payload) => {
    setTradeError(null);
    try {
      await api.openDemoTrade(payload);
      setPending(null);
      await refreshCore();
    } catch (err) {
      setTradeError(err.message);
    }
  };

  const handleClose = async (id) => {
    setError(null);
    try {
      await api.closeDemoTrade(id);
      await refreshCore();
    } catch (err) {
      setError(err.message);
    }
  };

  const openTrades = trades.filter((t) => t.status === 'open');
  const closedTrades = trades.filter((t) => t.status === 'closed');
  const price = prices[symbol];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-5 sm:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-brand-blue/30 bg-gradient-to-br from-brand-blue/20 via-surface to-surface p-5 shadow-[0_20px_60px_rgba(0,0,0,.22)]"><p className="text-[10px] font-bold uppercase tracking-[.22em] text-brand-cyan">TOP TIER • PRACTICE TERMINAL</p><h1 className="mt-2 font-display text-2xl font-bold">Trading Terminal</h1>
      <p className="mt-1 text-sm text-ink-muted">Simulated prices, no real money — practice until it's second nature.</p>

      {account && (
        <div className="mt-4 inline-block rounded-xl border border-brand-cyan/30 bg-surface/80 px-4 py-3">
          <p className="text-xs text-ink-muted">Demo balance</p>
          <p className="font-display text-xl font-semibold tabular-nums">
            ${parseFloat(account.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-loss">{error}</p>}

      <div className="mt-6 flex flex-wrap gap-1.5">
        {SYMBOLS.map((s) => (
          <button
            key={s}
            onClick={() => setSymbol(s)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              symbol === s ? 'bg-brand-blue text-white' : 'bg-surface/80 text-ink-muted hover:text-ink-primary'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex gap-1 rounded-lg bg-surface/80 p-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.key}
              onClick={() => setTimeframe(tf)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                timeframe.key === tf.key ? 'bg-brand-blue text-white' : 'text-ink-muted hover:text-ink-primary'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 tt-card rounded-2xl p-3">
        {candles.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-ink-muted">
            Collecting price data — check back in a minute.
          </div>
        ) : (
          <PriceChart candles={candles} />
        )}
      </div>

      {trend && (
        <div className="mt-3">
          <Callout title={trend.label}>{trend.detail} This describes recent price action — it isn't a prediction.</Callout>
        </div>
      )}

      {price && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setPending({ side: 'buy' })}
            className="flex-1 rounded-lg bg-gain/15 px-4 py-2.5 text-sm font-semibold text-gain hover:bg-gain/25"
          >
            Buy · {price.toFixed(decimalsFor(symbol))}
          </button>
          <button
            onClick={() => setPending({ side: 'sell' })}
            className="flex-1 rounded-lg bg-loss/15 px-4 py-2.5 text-sm font-semibold text-loss hover:bg-loss/25"
          >
            Sell · {price.toFixed(decimalsFor(symbol))}
          </button>
        </div>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <section>
          <h2 className="font-display text-sm font-semibold text-ink-primary">Open positions</h2>
          <div className="mt-3 space-y-2">
            {openTrades.length === 0 && <p className="text-sm text-ink-muted">No open positions.</p>}
            {openTrades.map((t) => (
              <div key={t.id} className="tt-card rounded-2xl px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {t.symbol} <span className="text-ink-muted">· {t.side}</span>
                  </p>
                  <button
                    onClick={() => handleClose(t.id)}
                    className="rounded-xl border border-border px-2.5 py-1 text-xs font-medium text-ink-muted hover:text-ink-primary"
                  >
                    Close
                  </button>
                </div>
                <p className="mt-1 text-xs text-ink-muted">
                  size {t.size} @ {parseFloat(t.entry_price).toFixed(decimalsFor(t.symbol))}
                  {t.stop_loss && ` · SL ${parseFloat(t.stop_loss).toFixed(decimalsFor(t.symbol))}`}
                  {t.take_profit && ` · TP ${parseFloat(t.take_profit).toFixed(decimalsFor(t.symbol))}`}
                </p>
              </div>
            ))}
          </div>

          <h2 className="mt-6 font-display text-sm font-semibold text-ink-primary">History</h2>
          <div className="mt-3 space-y-2">
            {closedTrades.length === 0 && <p className="text-sm text-ink-muted">No closed trades yet.</p>}
            {closedTrades.slice(0, 10).map((t) => (
              <div key={t.id} className="flex items-center justify-between tt-card rounded-2xl px-4 py-3 text-sm">
                <span>
                  {t.symbol} · {t.side}
                  {t.close_reason && t.close_reason !== 'manual' && (
                    <span className="ml-1.5 text-ink-muted">({t.close_reason.replace('_', ' ')})</span>
                  )}
                </span>
                <span className={`tabular-nums font-medium ${t.pnl >= 0 ? 'text-gain' : 'text-loss'}`}>
                  {t.pnl >= 0 ? '+' : ''}{parseFloat(t.pnl).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-sm font-semibold text-ink-primary">New to this?</h2>
          <div className="mt-3 space-y-2">
            <Callout title="Buy vs. sell">
              Buy if you think the price will rise — you profit as it goes up. Sell if you think it'll
              fall — you profit as it goes down. Every trade needs a reason; "it might go up" isn't one.
            </Callout>
            <Callout title="Before you open a trade">
              Check the chart above and the trend note. Decide your stop-loss first — where you're wrong
              and want out — then your take-profit. Set both when you open the trade, not after.
            </Callout>
          </div>
        </section>
      </div>

      {pending && price && (
        <TradeModal
          symbol={symbol}
          side={pending.side}
          price={price}
          onCancel={() => { setPending(null); setTradeError(null); }}
          onSubmit={handleOpen}
          error={tradeError}
        />
      )}
    </div>
  );
}
