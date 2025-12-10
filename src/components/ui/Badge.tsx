'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}

const variants = {
  default: 'bg-coffee-700 text-coffee-200',
  success: 'bg-green-500/20 text-green-400 border border-green-500/30',
  warning: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  error: 'bg-red-500/20 text-red-400 border border-red-500/30',
  info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
};

export function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

interface ProductBadgeProps {
  badge: 'bestseller' | 'new' | 'sale' | '';
}

export function ProductBadge({ badge }: ProductBadgeProps) {
  if (!badge) return null;

  const badgeConfig = {
    bestseller: { text: 'Бестселлер', color: 'bg-orange-500' },
    new: { text: 'Шинэ', color: 'bg-green-500' },
    sale: { text: 'Хямдрал', color: 'bg-red-500' },
  };

  const config = badgeConfig[badge];
  if (!config) return null;

  return (
    <AnimatePresence>
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`absolute top-3 left-3 ${config.color} text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg`}
      >
        {config.text}
      </motion.span>
    </AnimatePresence>
  );
}
