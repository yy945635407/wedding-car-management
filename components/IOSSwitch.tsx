import React from 'react';
import { motion } from 'framer-motion';

interface IOSSwitchProps {
  children: React.ReactNode;
  className?: string;
}

const variants = {
  initial: { opacity: 0, x: 20, scale: 0.98 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -20, scale: 0.98 },
};

export const IOSSwitch: React.FC<IOSSwitchProps> = ({ children, className }) => {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`w-full h-full absolute top-0 left-0 ${className || ''}`}
    >
      {children}
    </motion.div>
  );
};
