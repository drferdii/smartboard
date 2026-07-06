'use client';

import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.992, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -10, scale: 0.996, filter: 'blur(4px)' }}
      transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
      className="w-full h-full transform-gpu will-change-[transform,opacity,filter]"
    >
      {children}
    </motion.div>
  );
}
