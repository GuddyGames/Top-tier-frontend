const TIER_STYLES = {
  1: 'bg-gold text-base',
  2: 'bg-ink-primary/80 text-base',
  3: 'bg-[#A86A3D] text-base',
};

export default function RankBadge({ position }) {
  const tierClass = TIER_STYLES[position];

  if (!tierClass) {
    return <span className="tabular-nums text-ink-muted">{position}</span>;
  }

  return (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${tierClass}`}
    >
      {position}
    </span>
  );
}
