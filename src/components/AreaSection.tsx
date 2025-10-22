import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface AreaSectionProps {
  shape: 'rectangle' | 'triangle' | 'circle' | 'drawn' | 'manual' | 'image';
  initialArea?: number;
  onRemove: () => void;
  onChange: (area: number) => void;
}

const AreaSection = ({ shape, initialArea = 0, onRemove, onChange }: AreaSectionProps) => {
  const [values, setValues] = useState({
    length: 0,
    width: 0,
    base: 0,
    height: 0,
    radius: 0
  });
  const [area, setArea] = useState(initialArea);

  useEffect(() => {
    if (shape === 'manual') {
      // Manual entries are controlled by the dedicated input below
      return;
    }
    let calculatedArea = 0;

    switch (shape) {
      case 'rectangle':
        calculatedArea = values.length * values.width;
        break;
      case 'triangle':
        calculatedArea = 0.5 * values.base * values.height;
        break;
      case 'circle':
        calculatedArea = Math.PI * (values.radius ** 2);
        break;
      case 'drawn':
        calculatedArea = initialArea;
        break;
      case 'image':
        calculatedArea = initialArea;
        break;
    }

    setArea(calculatedArea);
    onChange(calculatedArea);
  }, [values, shape, initialArea]);

  const handleInputChange = (field: string, value: string) => {
    setValues(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  return (
    <div className="flex items-center gap-2">
      {shape === 'manual' && (
        <>
          <Input
            type="number"
            placeholder="Area (sq ft)"
            className="w-2/3"
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              setArea(val);
              onChange(val);
            }}
          />
        </>
      )}
      {shape === 'rectangle' && (
        <>
          <Input
            type="number"
            placeholder="Length (ft)"
            className="w-1/3"
            onChange={(e) => handleInputChange('length', e.target.value)}
          />
          <Input
            type="number"
            placeholder="Width (ft)"
            className="w-1/3"
            onChange={(e) => handleInputChange('width', e.target.value)}
          />
        </>
      )}
      {shape === 'triangle' && (
        <>
          <Input
            type="number"
            placeholder="Base (ft)"
            className="w-1/3"
            onChange={(e) => handleInputChange('base', e.target.value)}
          />
          <Input
            type="number"
            placeholder="Height (ft)"
            className="w-1/3"
            onChange={(e) => handleInputChange('height', e.target.value)}
          />
        </>
      )}
      {shape === 'circle' && (
        <Input
          type="number"
          placeholder="Radius (ft)"
          className="w-2/3"
          onChange={(e) => handleInputChange('radius', e.target.value)}
        />
      )}
      {shape === 'drawn' && (
        <span className="text-sm text-muted-foreground px-2">Drawn on map:</span>
      )}
      {shape === 'image' && (
        <span className="text-sm text-muted-foreground px-2">From image analysis:</span>
      )}
      <div className="flex-grow px-3 py-2 bg-muted rounded-md text-center font-medium">
        {area.toFixed(1)} sq ft
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="text-destructive hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default AreaSection;
