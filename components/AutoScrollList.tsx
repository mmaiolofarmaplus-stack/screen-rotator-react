import React from 'react';
import { motion } from 'framer-motion';

interface Props<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  minToScroll?: number;
  className?: string;
}

export function AutoScrollList<T>({
  items,
  renderItem,
  itemHeight = 52,
  minToScroll = 4,
  className = '',
}: Props<T>) {
  if (!items.length) return null;

  // If too few items, render statically
  if (items.length < minToScroll) {
    return (
      <div className={`flex flex-col gap-1 overflow-hidden h-full ${className}`}>
        {items.map((item, i) => renderItem(item, i))}
      </div>
    );
  }

  const n = items.length;
  const totalH = n * itemHeight;
  const duration = n * 2;

  return (
    <div className={`relative overflow-hidden h-full ${className}`}>
      {items.map((item, i) => (
        <motion.div
          key={i}
          className="absolute w-full"
          initial={{ y: totalH + i * itemHeight }}
          animate={{ y: -totalH }}
          transition={{
            repeat: Infinity,
            duration,
            ease: 'linear',
            delay: (i * itemHeight) / (totalH / duration),
          }}
        >
          {renderItem(item, i)}
        </motion.div>
      ))}
    </div>
  );
}
