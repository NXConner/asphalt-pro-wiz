import { CheckSquare, Square, Trash2, Download, Archive } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BatchOperationsProps<T extends { id: string }> {
  items: T[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onDelete?: (ids: string[]) => Promise<void>;
  onExport?: (ids: string[]) => void;
  onArchive?: (ids: string[]) => Promise<void>;
  customActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    action: (ids: string[]) => void | Promise<void>;
  }>;
}

/**
 * Batch operations component for bulk actions on multiple items
 */
export function BatchOperations<T extends { id: string }>({
  items,
  selectedIds,
  onSelectionChange,
  onDelete,
  onExport,
  onArchive,
  customActions = [],
}: BatchOperationsProps<T>) {
  const [isProcessing, setIsProcessing] = useState(false);

  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < items.length;

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(items.map((item) => item.id));
    }
  };

  const handleAction = async (action: () => void | Promise<void>, actionName: string) => {
    if (selectedIds.length === 0) {
      toast.error('No items selected');
      return;
    }

    setIsProcessing(true);
    try {
      await action();
      toast.success(`${actionName} completed for ${selectedIds.length} item(s)`);
      onSelectionChange([]);
    } catch (error) {
      toast.error(`Failed to ${actionName.toLowerCase()}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/50">
      <Checkbox
        checked={allSelected}
        onCheckedChange={toggleAll}
        aria-label="Select all items"
        className={someSelected ? 'data-[state=checked]:bg-primary/50' : ''}
      />

      <span className="text-sm text-muted-foreground">
        {selectedIds.length > 0 ? `${selectedIds.length} selected` : 'Select all'}
      </span>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-1 ml-auto">
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(() => onDelete(selectedIds), 'Delete')}
              disabled={isProcessing}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}

          {onExport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(() => onExport(selectedIds), 'Export')}
              disabled={isProcessing}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          )}

          {onArchive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(() => onArchive(selectedIds), 'Archive')}
              disabled={isProcessing}
            >
              <Archive className="h-4 w-4 mr-1" />
              Archive
            </Button>
          )}

          {customActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  More Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {customActions.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => handleAction(() => action.action(selectedIds), action.label)}
                    disabled={isProcessing}
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </div>
  );
}
