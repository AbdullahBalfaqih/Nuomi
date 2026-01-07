'use client';

import { motion } from "framer-motion";

export function FadeUp({ children, customDelay = 0 }: { children: React.ReactNode, customDelay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: customDelay }}
    >
      {children}
    </motion.div>
  );
}
