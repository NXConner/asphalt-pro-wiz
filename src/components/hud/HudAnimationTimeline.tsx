import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export interface AnimationKeyframe {
  time: number; // 0-100
  label: string;
  value: number;
}

interface HudAnimationTimelineProps {
  duration?: number; // Total duration in ms
  keyframes?: AnimationKeyframe[];
  isPlaying?: boolean;
  currentTime?: number;
  onPlay?: () => void;
  onPause?: () => void;
  onSeek?: (time: number) => void;
  onReset?: () => void;
  className?: string;
}

/**
 * HUD Animation Timeline Component
 * 
 * Provides visual timeline control for HUD animations with play/pause,
 * seek, and keyframe visualization.
 */
export const HudAnimationTimeline = memo(function HudAnimationTimeline({
  duration = 5000,
  keyframes = [],
  isPlaying = false,
  currentTime = 0,
  onPlay,
  onPause,
  onSeek,
  onReset,
  className,
}: HudAnimationTimelineProps) {
  const [localTime, setLocalTime] = useState(currentTime);
  const [isLocalPlaying, setIsLocalPlaying] = useState(isPlaying);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Sync with external state
  useEffect(() => {
    setLocalTime(currentTime);
  }, [currentTime]);

  useEffect(() => {
    setIsLocalPlaying(isPlaying);
  }, [isPlaying]);

  // Animation loop
  useEffect(() => {
    if (isLocalPlaying) {
      startTimeRef.current = Date.now() - localTime;
      const animate = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const newTime = Math.min(elapsed, duration);
        setLocalTime(newTime);
        
        if (newTime < duration) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsLocalPlaying(false);
          onPause?.();
        }
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isLocalPlaying, duration, localTime, onPause]);

  const handlePlayPause = useCallback(() => {
    if (isLocalPlaying) {
      setIsLocalPlaying(false);
      onPause?.();
    } else {
      setIsLocalPlaying(true);
      onPlay?.();
    }
  }, [isLocalPlaying, onPlay, onPause]);

  const handleSeek = useCallback((value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    setLocalTime(newTime);
    startTimeRef.current = Date.now() - newTime;
    onSeek?.(newTime);
  }, [duration, onSeek]);

  const handleSkipBack = useCallback(() => {
    const newTime = Math.max(0, localTime - 1000);
    setLocalTime(newTime);
    startTimeRef.current = Date.now() - newTime;
    onSeek?.(newTime);
  }, [localTime, onSeek]);

  const handleSkipForward = useCallback(() => {
    const newTime = Math.min(duration, localTime + 1000);
    setLocalTime(newTime);
    startTimeRef.current = Date.now() - newTime;
    onSeek?.(newTime);
  }, [localTime, duration, onSeek]);

  const handleReset = useCallback(() => {
    setLocalTime(0);
    setIsLocalPlaying(false);
    startTimeRef.current = Date.now();
    onReset?.();
    onPause?.();
  }, [onReset, onPause]);

  const progress = (localTime / duration) * 100;
  const formattedTime = `${(localTime / 1000).toFixed(1)}s / ${(duration / 1000).toFixed(1)}s`;

  return (
    <div className={cn('flex flex-col gap-3 p-4 bg-background/80 backdrop-blur-sm border border-border/30 rounded-lg', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handlePlayPause}
            className="h-8 w-8 p-0"
            aria-label={isLocalPlaying ? 'Pause animation' : 'Play animation'}
          >
            {isLocalPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSkipBack}
            className="h-8 w-8 p-0"
            aria-label="Skip back 1 second"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSkipForward}
            className="h-8 w-8 p-0"
            aria-label="Skip forward 1 second"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            className="h-8 w-8 p-0"
            aria-label="Reset animation"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <span className="text-xs text-muted-foreground font-mono">{formattedTime}</span>
      </div>

      <div className="relative">
        <Slider
          value={[progress]}
          onValueChange={handleSeek}
          max={100}
          step={0.1}
          className="w-full"
          aria-label="Animation timeline"
        />
        
        {/* Keyframe markers */}
        {keyframes.length > 0 && (
          <div className="absolute top-0 left-0 right-0 h-2 pointer-events-none">
            {keyframes.map((keyframe, index) => (
              <div
                key={index}
                className="absolute top-0 w-1 h-2 bg-primary"
                style={{ left: `${keyframe.time}%` }}
                title={keyframe.label}
              />
            ))}
          </div>
        )}
      </div>

      {/* Keyframe labels */}
      {keyframes.length > 0 && (
        <div className="flex justify-between text-xs text-muted-foreground">
          {keyframes.map((keyframe, index) => (
            <span
              key={index}
              className={cn(
                'truncate max-w-[80px]',
                progress >= keyframe.time ? 'text-primary' : ''
              )}
              title={keyframe.label}
            >
              {keyframe.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
});

