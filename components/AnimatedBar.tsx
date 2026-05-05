import React, { useEffect, useState } from 'react';

interface Props {
  pct: number;
  color: string;
  className?: string;
  delay?: number; // ms
}

export const AnimatedBar: React.FC<Props> = ({ pct, color, className = '', delay = 0 }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      requestAnimationFrame(() => requestAnimationFrame(() => setWidth(Math.max(0, Math.min(pct, 100)))));
    }, delay);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div
      className={`h-full rounded-full ${className}`}
      style={{
        width: `${width}%`,
        backgroundColor: color,
        transition: 'width 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    />
  );
};
