"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface StaggerListProps {
  children: ReactNode;
  className?: string;
  itemDelay?: number;
}

const container = (stagger: number) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: stagger,
      delayChildren: 0.05,
    },
  },
});

const item = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function StaggerList({
  children,
  className,
  itemDelay = 0.04,
}: StaggerListProps) {
  return (
    <motion.div
      variants={container(itemDelay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  );
}
