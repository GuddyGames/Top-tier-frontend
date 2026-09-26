import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

// TradingView-style candlestick chart with built-in zoom controls.
// Zoom is intentionally handled by the chart's time scale so the price
// axis and candle rendering remain intact.
export default function PriceChart({ candles, livePrice, intervalMinutes = 1 }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#8890A0',
      },
      grid: {
        vertLines: { color: '#1B2030' },
        horzLines: { color: '#1B2030' },
      },
      width: containerRef.current.clientWidth,
      height: 280,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        barSpacing: 6,
        minBarSpacing: 2,
        maxBarSpacing: 24,
      },
      crosshair: { mode: 0 },
    });

    const series = chart.addCandlestickSeries({
      upColor: '#2FAE60',
      downColor: '#E2574C',
      borderVisible: false,
      wickUpColor: '#2FAE60',
      wickDownColor: '#E2574C',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || !candles?.length) return;
    seriesRef.current.setData(
      candles.map((c) => ({
        time: Math.floor(new Date(c.time).getTime() / 1000),
        open: parseFloat(c.open),
        high: parseFloat(c.high),
        low: parseFloat(c.low),
        close: parseFloat(c.close),
      }))
    );
  }, [candles]);

  useEffect(() => {
    if (!seriesRef.current || !Number.isFinite(Number(livePrice)) || Number(livePrice) <= 0) return;

    const price = Number(livePrice);
    const seconds = Math.max(60, Number(intervalMinutes) * 60);
    const now = Math.floor(Date.now() / 1000);
    const bucket = Math.floor(now / seconds) * seconds;
    const current = candles?.length ? candles[candles.length - 1] : null;
    const currentTime = current ? Math.floor(new Date(current.time).getTime() / 1000) : bucket;

    if (current && currentTime === bucket) {
      seriesRef.current.update({
        time: bucket,
        open: Number(current.open),
        high: Math.max(Number(current.high), price),
        low: Math.min(Number(current.low), price),
        close: price,
      });
      return;
    }

    seriesRef.current.update({
      time: bucket,
      open: price,
      high: price,
      low: price,
      close: price,
    });
  }, [livePrice, candles, intervalMinutes]);

  const changeZoom = (direction) => {
    const chart = chartRef.current;
    if (!chart) return;

    const next = Math.min(6, Math.max(0.5, Number((zoom * direction).toFixed(2))));
    setZoom(next);
    chart.timeScale().applyOptions({
      barSpacing: Math.min(24, Math.max(2, 6 * next)),
    });
  };

  const resetZoom = () => {
    const chart = chartRef.current;
    if (!chart) return;
    setZoom(1);
    chart.timeScale().applyOptions({ barSpacing: 6 });
    chart.timeScale().fitContent();
  };

  return (
    <div className="relative w-full">
      <div className="absolute right-2 top-2 z-10 flex overflow-hidden rounded-lg border border-border bg-surface/90 shadow-lg backdrop-blur">
        <button
          type="button"
          onClick={() => changeZoom(1.25)}
          className="grid h-9 w-9 place-items-center border-r border-border text-base font-semibold text-ink-primary transition hover:bg-brand-blue/15 active:scale-95"
          aria-label="Zoom in"
          title="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => changeZoom(0.8)}
          className="grid h-9 w-9 place-items-center border-r border-border text-base font-semibold text-ink-primary transition hover:bg-brand-blue/15 active:scale-95"
          aria-label="Zoom out"
          title="Zoom out"
        >
          −
        </button>
        <button
          type="button"
          onClick={resetZoom}
          className="grid h-9 min-w-9 place-items-center px-2 text-[10px] font-semibold text-ink-muted transition hover:bg-brand-blue/15 hover:text-ink-primary active:scale-95"
          aria-label="Reset chart zoom"
          title="Reset zoom"
        >
          Reset
        </button>
      </div>
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
