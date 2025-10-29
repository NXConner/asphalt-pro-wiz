import { cn } from "@/components/ui/utils";

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-medium",
        "bg-muted text-muted-foreground border-border",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
