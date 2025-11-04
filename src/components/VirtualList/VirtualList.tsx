import { useRef, CSSProperties, memo } from 'react';
import { useVirtualScroll } from '@/hooks/useVirtualScroll';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

/**
 * Virtual list component for rendering large lists efficiently
 * Only renders visible items plus overscan buffer
 */
function VirtualListInner<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  className = '',
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { virtualItems, totalHeight } = useVirtualScroll(items.length, {
    itemHeight,
    containerHeight,
    overscan,
  });

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {virtualItems.map(({ index, start }) => {
          const item = items[index];
          const style: CSSProperties = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: itemHeight,
            transform: `translateY(${start}px)`,
          };

          return (
            <div key={index} style={style}>
              {renderItem(item, index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const VirtualList = memo(VirtualListInner) as typeof VirtualListInner;
