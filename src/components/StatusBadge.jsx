export default function StatusBadge({ status }) {
  const isActive = status?.toLowerCase() === 'active';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        isActive ? 'bg-gain/10 text-gain' : 'bg-ink-muted/10 text-ink-muted'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-gain' : 'bg-ink-muted'}`} />
      {status || 'Unknown'}
    </span>
  );
}
