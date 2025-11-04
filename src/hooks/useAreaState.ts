import { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { logEvent } from '@/lib/logging';

export type AreaShape = 'rectangle' | 'triangle' | 'circle' | 'drawn' | 'manual' | 'image';

export interface AreaItem {
  id: number;
  shape: AreaShape;
  area: number;
}

export function useAreaState() {
  const [areas, setAreas] = useState<AreaItem[]>([]);
  const [nextAreaId, setNextAreaId] = useState(1);
  const [shapeType, setShapeType] = useState<Exclude<AreaShape, 'drawn' | 'image'>>('rectangle');
  const [manualInput, setManualInput] = useState('');

  const totalArea = useMemo(() => areas.reduce((sum, item) => sum + item.area, 0), [areas]);

  const addEmpty = useCallback(() => {
    setAreas((prev) => [...prev, { id: nextAreaId, shape: shapeType, area: 0 }]);
    setNextAreaId((prev) => prev + 1);
  }, [nextAreaId, shapeType]);

  const addManual = useCallback(() => {
    const parsed = parseFloat(manualInput);
    if (!parsed || parsed <= 0) {
      toast.error('Enter a valid area in sq ft');
      return;
    }
    setAreas((prev) => [...prev, { id: nextAreaId, shape: 'manual', area: parsed }]);
    setNextAreaId((prev) => prev + 1);
    setManualInput('');
    try {
      logEvent('area.add_manual', { areaSqFt: parsed });
    } catch {}
    toast.success(`Added ${parsed.toFixed(1)} sq ft`);
  }, [manualInput, nextAreaId]);

  const update = useCallback((id: number, area: number) => {
    setAreas((prev) => prev.map((item) => (item.id === id ? { ...item, area } : item)));
  }, []);

  const remove = useCallback((id: number) => {
    setAreas((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleAreaDrawn = useCallback((area: number) => {
    setAreas((prev) => [...prev, { id: nextAreaId, shape: 'drawn', area }]);
    setNextAreaId((prev) => prev + 1);
    try {
      toast.success(`Added ${area.toFixed(1)} sq ft from map drawing`);
    } catch {}
  }, [nextAreaId]);

  const handleImageAreaDetected = useCallback((area: number) => {
    setAreas((prev) => [...prev, { id: nextAreaId, shape: 'image', area }]);
    setNextAreaId((prev) => prev + 1);
  }, [nextAreaId]);

  return {
    items: areas,
    total: totalArea,
    shapeType,
    setShapeType,
    manualInput,
    setManualInput,
    addEmpty,
    addManual,
    update,
    remove,
    handleAreaDrawn,
    handleImageAreaDetected,
  };
}
