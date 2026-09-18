export default function Callout({ title, children, tone = 'info' }) {
  const toneClass = tone === 'warn' ? 'border-gold/40 bg-gold/5' : 'border-border bg-surface';

  return (
    <div className={`rounded-lg border px-3.5 py-3 text-xs leading-relaxed text-ink-muted ${toneClass}`}>
      {title && <p className="mb-1 font-medium text-ink-primary">{title}</p>}
      {children}
    </div>
  );
}
