import { Layout, Check } from 'lucide-react';
import { memo, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  applyTemplateToViewport,
  getTemplatesByCategory,
  HUD_LAYOUT_TEMPLATES,
  type HudLayoutTemplate,
} from '@/lib/hudLayoutTemplates';
import type { HudLayoutPreset } from '@/lib/theme';
import { cn } from '@/lib/utils';

interface HudLayoutTemplatesProps {
  currentPreset?: HudLayoutPreset;
  onTemplateSelect: (template: HudLayoutTemplate) => void;
  className?: string;
}

/**
 * HUD Layout Templates Component
 * 
 * Provides a dropdown menu to select and apply predefined HUD layout templates.
 */
export const HudLayoutTemplates = memo(function HudLayoutTemplates({
  currentPreset,
  onTemplateSelect,
  className,
}: HudLayoutTemplatesProps) {
  const handleTemplateSelect = useCallback(
    (template: HudLayoutTemplate) => {
      if (typeof window !== 'undefined') {
        const { position, size } = applyTemplateToViewport(
          template,
          window.innerWidth,
          window.innerHeight,
        );
        
        // Apply template with calculated position
        onTemplateSelect({
          ...template,
          position,
          size,
        });
      } else {
        onTemplateSelect(template);
      }
    },
    [onTemplateSelect],
  );

  const tacticalTemplates = getTemplatesByCategory('tactical');
  const minimalTemplates = getTemplatesByCategory('minimal');
  const immersiveTemplates = getTemplatesByCategory('immersive');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('h-8 w-8 p-0', className)}
          aria-label="Select HUD layout template"
        >
          <Layout className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Layout Templates</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Tactical
          </DropdownMenuLabel>
          {tacticalTemplates.map((template) => (
            <DropdownMenuItem
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className="flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="text-sm">{template.name}</span>
                <span className="text-xs text-muted-foreground">
                  {template.description}
                </span>
              </div>
              {currentPreset === template.preset && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Minimal
          </DropdownMenuLabel>
          {minimalTemplates.map((template) => (
            <DropdownMenuItem
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className="flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="text-sm">{template.name}</span>
                <span className="text-xs text-muted-foreground">
                  {template.description}
                </span>
              </div>
              {currentPreset === template.preset && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Immersive
          </DropdownMenuLabel>
          {immersiveTemplates.map((template) => (
            <DropdownMenuItem
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className="flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="text-sm">{template.name}</span>
                <span className="text-xs text-muted-foreground">
                  {template.description}
                </span>
              </div>
              {currentPreset === template.preset && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

