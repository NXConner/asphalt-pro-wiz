import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { analyzeImage } from '@/lib/gemini';
import { logEvent, logError } from '@/lib/logging';

interface ImageAreaAnalyzerProps {
  onAreaDetected: (areaSqFt: number) => void;
}

type Point = { x: number; y: number };

function shoelaceArea(points: Point[]): number {
  if (points.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    sum += points[i].x * points[j].y - points[j].x * points[i].y;
  }
  return Math.abs(sum) / 2;
}

export default function ImageAreaAnalyzer({ onAreaDetected }: ImageAreaAnalyzerProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [pixelsPerFoot, setPixelsPerFoot] = useState<number | null>(null);
  const [calibrationPx, setCalibrationPx] = useState<number | null>(null);
  const [calibrationFeet, setCalibrationFeet] = useState<number>(10);
  const [points, setPoints] = useState<Point[]>([]);
  const [areaSqFt, setAreaSqFt] = useState<number>(0);
  const [aiNotes, setAiNotes] = useState<string>('');

  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isCalibratingRef = useRef<boolean>(false);
  const calibrationPointsRef = useRef<Point[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (points.length) {
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(34,197,94,0.15)';
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#16a34a';
      for (const p of points) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const cps = calibrationPointsRef.current;
    if (cps.length === 2) {
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cps[0].x, cps[0].y);
      ctx.lineTo(cps[1].x, cps[1].y);
      ctx.stroke();
    }
  }, [points, imageUrl, calibrationPx]);

  useEffect(() => {
    if (!pixelsPerFoot || points.length < 3) {
      setAreaSqFt(0);
      return;
    }
    const pxArea = shoelaceArea(points);
    const ftPerPixel = 1 / pixelsPerFoot;
    const areaFt2 = pxArea * ftPerPixel * ftPerPixel;
    setAreaSqFt(areaFt2);
  }, [points, pixelsPerFoot]);

  const onContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) return;
    const rect = container.getBoundingClientRect();
    const scaleX = img.naturalWidth / img.clientWidth;
    const scaleY = img.naturalHeight / img.clientHeight;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (isCalibratingRef.current) {
      calibrationPointsRef.current.push({ x, y });
      if (calibrationPointsRef.current.length === 2) {
        const [a, b] = calibrationPointsRef.current;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distPx = Math.sqrt(dx * dx + dy * dy);
        setCalibrationPx(distPx);
        const ppf = calibrationFeet > 0 ? distPx / calibrationFeet : null;
        if (ppf) setPixelsPerFoot(ppf);
        isCalibratingRef.current = false;
        logEvent('image_area.calibrated', { distPx, calibrationFeet });
      }
    } else {
      setPoints((prev) => [...prev, { x, y }]);
    }
  };

  const startCalibration = () => {
    calibrationPointsRef.current = [];
    isCalibratingRef.current = true;
    setCalibrationPx(null);
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setPoints([]);
    setAiNotes('');
  };

  const undoPoint = () => setPoints((prev) => prev.slice(0, -1));
  const clearAll = () => {
    setPoints([]);
    calibrationPointsRef.current = [];
    setCalibrationPx(null);
    setAreaSqFt(0);
  };

  const acceptArea = () => {
    if (areaSqFt > 0) {
      onAreaDetected(areaSqFt);
      clearAll();
    }
  };

  const askAI = async () => {
    if (!imageUrl) return;
    setBusy(true);
    try {
      const base64 = await fetch(imageUrl)
        .then((r) => r.blob())
        .then(
          (b) =>
            new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve((reader.result as string).split(',')[1] || '');
              reader.readAsDataURL(b);
            }),
        );
      const prompt =
        'Estimate paved surface area (sq ft). If polygon provided, prefer that. Return a concise numeric answer like: Area: 1234 sq ft.';
      const res = await analyzeImage(base64, 'image/png', prompt);
      setAiNotes(res);
      const match = res.match(/([0-9]+(?:\.[0-9]+)?)\s*(sq\s*ft|ft\^2|square\s*feet)/i);
      if (match) {
        const value = parseFloat(match[1]);
        if (!Number.isNaN(value)) {
          setAreaSqFt((prev) => (prev > 0 ? prev : value));
        }
      }
      logEvent('image_area.ai_analysis_done');
    } catch (e) {
      logError(e, { areaSqFt });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Image Area Analyzer</CardTitle>
        <CardDescription>
          Upload a site photo, calibrate with a known distance, then click to draw over the paved
          area.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label>Upload Image</Label>
            <Input type="file" accept="image/*" onChange={onUpload} />
          </div>
          <div>
            <Label>Calibration Distance (feet)</Label>
            <Input
              type="number"
              min="1"
              value={calibrationFeet}
              onChange={(e) => setCalibrationFeet(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={startCalibration} disabled={!imageUrl}>
              Calibrate
            </Button>
            <Button type="button" variant="outline" onClick={undoPoint} disabled={!points.length}>
              Undo Point
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={clearAll}
              disabled={!points.length && !calibrationPx}
            >
              Reset
            </Button>
          </div>
          <div className="ml-auto flex gap-2">
            <Button type="button" onClick={acceptArea} disabled={areaSqFt <= 0}>
              Add {areaSqFt > 0 ? `${areaSqFt.toFixed(1)} sq ft` : 'Area'}
            </Button>
            <Button type="button" variant="secondary" onClick={askAI} disabled={!imageUrl || busy}>
              {busy ? 'Analyzing...' : 'Analyze with AI'}
            </Button>
          </div>
        </div>

        {imageUrl && (
          <div className="relative w-full overflow-auto border rounded-lg">
            <button
              type="button"
              ref={containerRef as unknown as React.RefObject<HTMLButtonElement>}
              onClick={onContainerClick as unknown as React.MouseEventHandler<HTMLButtonElement>}
              className="block w-full text-left p-0 m-0 bg-transparent"
              aria-label="Image area annotator"
            >
              <img ref={imgRef} src={imageUrl} alt="Site" className="max-w-full h-auto block" />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 pointer-events-none"
                style={{ width: '100%', height: '100%' }}
              />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 rounded-md bg-muted">
            <div className="font-medium">Calibration</div>
            <div>Pixels per foot: {pixelsPerFoot ? pixelsPerFoot.toFixed(2) : '—'}</div>
            <div>Calibration (px): {calibrationPx ? calibrationPx.toFixed(1) : '—'}</div>
          </div>
          <div className="p-3 rounded-md bg-muted">
            <div className="font-medium">Polygon</div>
            <div>Vertices: {points.length}</div>
            <div>Area: {areaSqFt > 0 ? <strong>{areaSqFt.toFixed(1)} sq ft</strong> : '—'}</div>
          </div>
          <div className="p-3 rounded-md bg-muted">
            <div className="font-medium">AI Notes</div>
            <div className="whitespace-pre-wrap min-h-[2.5rem]">{aiNotes || '—'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
