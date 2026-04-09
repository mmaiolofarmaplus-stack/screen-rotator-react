import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  format?: (val: number) => string;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, format, className }) => {
  const spring = useSpring(value, { mass: 1, stiffness: 75, damping: 15 });
  const [displayValue, setDisplayValue] = useState(format ? format(value) : value.toString());

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    return spring.on("change", (latest: any) => {
      const val = typeof latest === 'number' ? latest : parseFloat(latest);
      setDisplayValue(format ? format(val) : Math.round(val).toString());
    });
  }, [spring, format]);

  return <motion.span className={className}>{displayValue}</motion.span>;
};
