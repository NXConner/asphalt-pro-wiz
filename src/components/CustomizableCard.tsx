import { ReactNode, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Settings2, Pin, PinOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CardStyle {
  backgroundColor?: string;
  blur?: number;
  opacity?: number;
  borderColor?: string;
  borderWidth?: number;
}

interface CustomizableCardProps {
  children: ReactNode;
  title?: string;
  cardId: string;
  isPinned?: boolean;
  onPin?: (pinned: boolean) => void;
  style?: CardStyle;
  onStyleChange?: (style: CardStyle) => void;
  className?: string;
}

export function CustomizableCard({
  children,
  title,
  cardId,
  isPinned = false,
  onPin,
  style = {},
  onStyleChange,
  className,
}: CustomizableCardProps) {
  const [isCustomizing, setIsCustomizing] = useState(false);

  const handleStyleChange = (key: keyof CardStyle, value: any) => {
    onStyleChange?.({ ...style, [key]: value });
  };

  const cardStyle = {
    backgroundColor: style.backgroundColor || 'hsl(var(--card))',
    backdropFilter: style.blur ? `blur(${style.blur}px)` : undefined,
    opacity: style.opacity ?? 1,
    borderColor: style.borderColor,
    borderWidth: style.borderWidth ? `${style.borderWidth}px` : undefined,
  };

  return (
    <Card
      className={cn('relative transition-all duration-200', className)}
      style={cardStyle}
    >
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        {onPin && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onPin(!isPinned)}
          >
            {isPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
          </Button>
        )}
        <Popover open={isCustomizing} onOpenChange={setIsCustomizing}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Settings2 className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Customize {title || 'Card'}</h4>
              
              <div className="space-y-2">
                <Label className="text-xs">Background Color</Label>
                <div className="grid grid-cols-4 gap-2">
                  {['hsl(var(--card))', 'hsl(var(--primary) / 0.1)', 'hsl(var(--secondary) / 0.3)', 'hsl(var(--accent) / 0.2)'].map((color) => (
                    <button
                      key={color}
                      className="h-8 rounded border-2"
                      style={{ backgroundColor: color, borderColor: style.backgroundColor === color ? 'hsl(var(--primary))' : 'transparent' }}
                      onClick={() => handleStyleChange('backgroundColor', color)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Blur Effect: {style.blur || 0}px</Label>
                <Slider
                  value={[style.blur || 0]}
                  onValueChange={([v]) => handleStyleChange('blur', v)}
                  max={20}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Opacity: {Math.round((style.opacity ?? 1) * 100)}%</Label>
                <Slider
                  value={[(style.opacity ?? 1) * 100]}
                  onValueChange={([v]) => handleStyleChange('opacity', v / 100)}
                  max={100}
                  step={5}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Border Width: {style.borderWidth || 0}px</Label>
                <Slider
                  value={[style.borderWidth || 0]}
                  onValueChange={([v]) => handleStyleChange('borderWidth', v)}
                  max={8}
                  step={1}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {children}
    </Card>
  );
}