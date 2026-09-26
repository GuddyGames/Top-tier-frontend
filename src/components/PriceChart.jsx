import { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

// A TradingView-style candlestick chart for one symbol. Feed it the
// { time, open, high, low, close } candles from /api/demo/prices/:symbol/candles.
export default function PriceChart({ candles, livePrice, intervalMinutes = 1 }) {
  const containerRef = useRef(null);
  const seriesRef = useRef(null);

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
      timeScale: { timeVisible: true, secondsVisible: false },
      crosshair: { mode: 0 },
    });

    const series = chart.addCandlestickSeries({
      upColor: '#2FAE60',
      downColor: '#E2574C',
      borderVisible: false,
      wickUpColor: '#2FAE60',
      wickDownColor: '#E2574C',
    });
    seriesRef.current = series;

    const handleResize = () => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
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

  return <div ref={containerRef} className="w-full" />;
}
