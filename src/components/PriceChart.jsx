import { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

// A TradingView-style candlestick chart for one symbol. Feed it the
// { time, open, high, low, close } candles from /api/demo/prices/:symbol/candles.
export default function PriceChart({ candles }) {
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

  return <div ref={containerRef} className="w-full" />;
}
