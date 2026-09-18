function Section({ title, children }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <h2 className="font-display text-base font-semibold text-ink-primary">{title}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-ink-muted">{children}</div>
    </section>
  );
}

export default function Learn() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8 sm:px-10">
      <h1 className="font-display text-2xl font-semibold">Learn</h1>
      <p className="mt-1 text-sm text-ink-muted">
        The basics, explained plainly. This is general education, not advice for any specific trade —
        markets are unpredictable, and even good process loses money sometimes.
      </p>

      <div className="mt-6 space-y-4">
        <Section title="Buying vs. selling">
          <p>Buying (going "long") means you profit if the price rises. Selling (going "short") means you profit if it falls.</p>
          <p>Every position needs a reason tied to something you can point to — a trend, a level, an event — not a hunch.</p>
        </Section>

        <Section title="Reading a candlestick">
          <p>Each candle shows four prices for a period: open, high, low, close. A green (up) candle closed higher than it opened; a red (down) candle closed lower.</p>
          <p>The thin lines above and below the body ("wicks") show the high and low reached during that period, even if price came back.</p>
        </Section>

        <Section title="Stop-loss and take-profit">
          <p><strong className="text-ink-primary">Stop-loss:</strong> the price at which you automatically exit if the trade goes against you. It's your "I was wrong, get me out" line, decided before you enter — not adjusted mid-trade out of hope.</p>
          <p><strong className="text-ink-primary">Take-profit:</strong> the price at which you automatically lock in a gain. Set it at a level you'd be genuinely happy with, based on the chart, not a round number picked at random.</p>
          <p>A common starting point beginners use: aim for a take-profit at least as far from entry as the stop-loss, so a single win covers at least one loss.</p>
        </Section>

        <Section title="Sizing a trade">
          <p>Risking your whole balance on one trade means one bad trade wipes you out. A common rule of thumb is risking only a small slice — often cited as 1–2% — of your account on any single trade, sized so that if your stop-loss is hit, the loss stays small relative to your balance.</p>
        </Section>

        <Section title="A few strategy concepts">
          <p><strong className="text-ink-primary">Trend following:</strong> trade in the direction price is already moving, on the idea that a trend in motion tends to continue until it clearly doesn't.</p>
          <p><strong className="text-ink-primary">Support & resistance:</strong> price often reacts at levels it has bounced off before — "support" below, "resistance" above — because many traders are watching the same levels.</p>
          <p><strong className="text-ink-primary">Moving-average crossover:</strong> comparing a short-term average price to a longer-term one; when the short-term average moves above the long-term one, it's often read as strengthening momentum, and vice versa. The Terminal's trend note under the chart uses this idea.</p>
          <p>None of these predict the future — they're lenses traders use to structure a decision, not guarantees.</p>
        </Section>

        <Section title="Using the Terminal, step by step">
          <p>1. Pick an instrument and look at the chart and trend note.</p>
          <p>2. Decide buy or sell, and why, in one sentence you could say out loud.</p>
          <p>3. Set a stop-loss first, then a take-profit.</p>
          <p>4. Choose a size you're comfortable losing if the stop-loss hits.</p>
          <p>5. Open the trade, then leave it — checking every few minutes and second-guessing is how beginners override their own stop-loss.</p>
          <p>6. After it closes, look at the result on your Home page and ask what you'd do the same or differently — that's the actual practice.</p>
        </Section>
      </div>
    </div>
  );
}
