import { ChevronDown } from 'lucide-react';
import { memo, useState, type ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type Priority = 'critical' | 'high' | 'medium' | 'low';

interface PriorityCardProps {
  title: string;
  priority: Priority;
  children: ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

const priorityStyles: Record<Priority, string> = {
  critical: 'border-destructive/50 bg-destructive/5',
  high: 'border-primary/50 bg-primary/5',
  medium: 'border-border bg-card',
  low: 'border-muted bg-muted/30',
};

const priorityTitleStyles: Record<Priority, string> = {
  critical: 'text-destructive',
  high: 'text-primary',
  medium: 'text-foreground',
  low: 'text-muted-foreground',
};

export const PriorityCard = memo(function PriorityCard({
  title,
  priority,
  children,
  collapsible = false,
  defaultExpanded = true,
  className,
  icon,
  actions,
}: PriorityCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Card className={cn('transition-all duration-200', priorityStyles[priority], className)}>
      <CardHeader
        className={cn(
          'flex flex-row items-center justify-between space-y-0 pb-3',
          collapsible && 'cursor-pointer select-none',
        )}
        onClick={handleToggle}
      >
        <div className="flex items-center gap-2">
          {icon && <span className={priorityTitleStyles[priority]}>{icon}</span>}
          <CardTitle className={cn('text-base sm:text-lg', priorityTitleStyles[priority])}>
            {title}
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {collapsible && (
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                isExpanded && 'rotate-180',
                priorityTitleStyles[priority],
              )}
            />
          )}
        </div>
      </CardHeader>
      {isExpanded && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
});
