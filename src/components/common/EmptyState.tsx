export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="text-center p-8 text-muted-foreground border rounded">
      <div className="text-sm font-medium">{title}</div>
      {description && <div className="text-xs mt-1">{description}</div>}
    </div>
  );
}
