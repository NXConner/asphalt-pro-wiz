import { ChevronDown } from 'lucide-react';
import { ReactNode, useState } from 'react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface CollapsibleHudSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: ReactNode;
  className?: string;
}

export function CollapsibleHudSection({
  title,
  children,
  defaultOpen = true,
  icon,
  className,
}: CollapsibleHudSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn('rounded-lg border border-border/40 bg-card/30 backdrop-blur-sm', className)}
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between p-3 text-left hover:bg-accent/20 transition-colors touch-manipulation">
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            {title}
          </h3>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="animate-accordion-down data-[state=closed]:animate-accordion-up">
        <div className="p-3 pt-0">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
