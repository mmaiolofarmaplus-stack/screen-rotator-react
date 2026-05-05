import React from 'react';
import { motion } from 'framer-motion';

interface Props<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  minToScroll?: number;
  className?: string;
}

export function AutoScrollList<T extends { id: string }>({
  items,
  renderItem,
  itemHeight = 52,
  minToScroll = 4,
  className = '',
}: Props<T>) {
  if (!items.length) return null;

  if (items.length < minToScroll) {
    return (
      <div className={`flex flex-col overflow-hidden h-full ${className}`}>
        {items.map((item, i) => renderItem(item, i))}
      </div>
    );
  }

  const totalH = items.length * itemHeight;
  const duration = items.length * 4;

  return (
    <div className={`overflow-hidden h-full ${className}`}>
      <motion.div
        animate={{ y: [0, -totalH] }}
        transition={{ repeat: Infinity, duration, ease: 'linear', repeatType: 'loop' }}
      >
        {items.map((item, i) => (
          <div key={`a-${i}`} style={{ height: itemHeight }}>
            {renderItem(item, i)}
          </div>
        ))}
        {items.map((item, i) => (
          <div key={`b-${i}`} style={{ height: itemHeight }}>
            {renderItem(item, i)}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
