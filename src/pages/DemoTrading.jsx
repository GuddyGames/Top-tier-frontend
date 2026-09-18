import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';

function PriceRow({ price, onTrade }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
      <div>
        <p className="text-sm font-medium">{price.symbol}</p>
        <p className="tabular-nums text-xs text-ink-muted">{parseFloat(price.price).toFixed(price.symbol.includes('/JPY') ? 3 : 5)}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onTrade(price.symbol, 'buy')}
          className="rounded-lg bg-gain/15 px-3 py-1.5 text-xs font-semibold text-gain hover:bg-gain/25"
        >
          Buy
        </button>
        <button
          onClick={() => onTrade(price.symbol, 'sell')}
          className="rounded-lg bg-loss/15 px-3 py-1.5 text-xs font-semibold text-loss hover:bg-loss/25"
        >
          Sell
        </button>
      </div>
    </div>
  );
}

export default function DemoTrading() {
  const [prices, setPrices] = useState([]);
  const [account, setAccount] = useState(null);
  const [trades, setTrades] = useState([]);
  const [pendingSymbol, setPendingSymbol] = useState(null); // { symbol, side }
  const [size, setSize] = useState('100');
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    const [priceData, accountData, tradeData] = await Promise.all([
      api.getDemoPrices(),
      api.getDemoAccount(),
      api.getDemoTrades(),
    ]);
    setPrices(priceData.prices);
    setAccount(accountData.account);
    setTrades(tradeData.trades);
  }, []);

  useEffect(() => {
    refresh().catch((err) => setError(err.message));
    const interval = setInterval(() => {
      api.getDemoPrices().then((d) => setPrices(d.prices)).catch(() => {});
    }, 15000); // prices only move once a minute server-side; no need to poll faster
    return () => clearInterval(interval);
  }, [refresh]);

  const handleOpen = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.openDemoTrade({ symbol: pendingSymbol.symbol, side: pendingSymbol.side, size: parseFloat(size) });
      setPendingSymbol(null);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClose = async (id) => {
    setError(null);
    try {
      await api.closeDemoTrade(id);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const openTrades = trades.filter((t) => t.status === 'open');
  const closedTrades = trades.filter((t) => t.status === 'closed');

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 sm:px-10">
      <h1 className="font-display text-2xl font-semibold">Practice trading</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Simulated prices, no real money — a place to get comfortable before it counts.
      </p>

      {account && (
        <div className="mt-6 rounded-xl border border-gold/40 bg-surface p-4">
          <p className="text-xs text-ink-muted">Demo balance</p>
          <p className="font-display text-2xl font-semibold tabular-nums">
            ${parseFloat(account.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-loss">{error}</p>}

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <section>
          <h2 className="font-display text-sm font-semibold text-ink-primary">Markets</h2>
          <div className="mt-3 space-y-2">
            {prices.map((p) => (
              <PriceRow key={p.symbol} price={p} onTrade={(symbol, side) => setPendingSymbol({ symbol, side })} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-sm font-semibold text-ink-primary">Open positions</h2>
          <div className="mt-3 space-y-2">
            {openTrades.length === 0 && <p className="text-sm text-ink-muted">No open positions.</p>}
            {openTrades.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {t.symbol} <span className="text-ink-muted">· {t.side}</span>
                  </p>
                  <p className="text-xs text-ink-muted">
                    size {t.size} @ {parseFloat(t.entry_price).toFixed(5)}
                  </p>
                </div>
                <button
                  onClick={() => handleClose(t.id)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink-primary"
                >
                  Close
                </button>
              </div>
            ))}
          </div>

          <h2 className="mt-6 font-display text-sm font-semibold text-ink-primary">History</h2>
          <div className="mt-3 space-y-2">
            {closedTrades.length === 0 && <p className="text-sm text-ink-muted">No closed trades yet.</p>}
            {closedTrades.slice(0, 10).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-sm"
              >
                <span>
                  {t.symbol} · {t.side}
                </span>
                <span className={`tabular-nums font-medium ${t.pnl >= 0 ? 'text-gain' : 'text-loss'}`}>
                  {t.pnl >= 0 ? '+' : ''}
                  {parseFloat(t.pnl).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {pendingSymbol && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 px-6">
          <form
            onSubmit={handleOpen}
            className="w-full max-w-sm rounded-xl border border-border bg-surface p-5"
          >
            <p className="font-display text-lg font-semibold">
              {pendingSymbol.side === 'buy' ? 'Buy' : 'Sell'} {pendingSymbol.symbol}
            </p>
            <label className="mt-4 block text-xs text-ink-muted">Size (virtual $)</label>
            <input
              type="number"
              min="1"
              step="1"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-base px-3 py-2 text-sm outline-none focus:border-gold"
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setPendingSymbol(null)}
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-ink-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-gold px-3 py-2 text-sm font-semibold text-base hover:bg-gold-soft"
              >
                Confirm
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
