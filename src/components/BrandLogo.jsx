export default function BrandLogo({ className = '', markClassName = 'h-9 w-9', textClassName = 'text-lg', showTagline = false }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src="/icons/top-tier-mark.svg" alt="" aria-hidden="true" className={`shrink-0 ${markClassName}`} />
      <div className="min-w-0">
        <div className={`font-display font-bold tracking-tight ${textClassName}`}>
          <span className="text-white">Top-</span><span className="text-brand-cyan">Tier</span>
        </div>
        {showTagline && (
          <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-white/45">
            Trade · Grow · Succeed
          </div>
        )}
      </div>
    </div>
  );
}
