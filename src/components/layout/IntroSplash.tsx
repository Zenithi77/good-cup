'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Цаасан аяга SVG
function PaperCup({ color, lidColor }: { color: string; lidColor: string }) {
  return (
    <svg viewBox="0 0 120 160" className="w-full h-full drop-shadow-2xl">
      {/* Таг */}
      <ellipse cx="60" cy="22" rx="46" ry="10" fill={lidColor} />
      <rect x="14" y="14" width="92" height="10" rx="5" fill={lidColor} />
      <ellipse cx="60" cy="14" rx="46" ry="9" fill={lidColor} opacity="0.85" />
      <ellipse cx="60" cy="13" rx="14" ry="3.5" fill="#3d2310" opacity="0.5" />
      {/* Аяганы их бие */}
      <path d="M18 30 L34 152 Q34 158 42 158 L78 158 Q86 158 86 152 L102 30 Z" fill={color} />
      {/* Гэрэл туссан хэсэг */}
      <path d="M28 34 L40 150 L48 150 L38 34 Z" fill="#ffffff" opacity="0.25" />
      {/* Бүс/лого хэсэг */}
      <path d="M24 72 L96 72 L93 100 L27 100 Z" fill="#ffffff" opacity="0.9" />
      <text x="60" y="90" textAnchor="middle" fontSize="13" fontWeight="bold" fill={color} fontFamily="sans-serif">
        GOOD CUP
      </text>
    </svg>
  );
}

const cups = [
  { color: '#c5803a', lid: '#8a5422' },
  { color: '#8a5422', lid: '#4c2c13' },
  { color: '#e7caa1', lid: '#a96a2c' },
];

export function IntroSplash() {
  const [show, setShow] = useState(false);
  const [cupIndex, setCupIndex] = useState(0);

  useEffect(() => {
    // Нэг session-д нэг л удаа харуулна
    if (sessionStorage.getItem('introShown')) return;
    sessionStorage.setItem('introShown', '1');
    setShow(true);

    // Аяга солигдох
    const swap = setInterval(() => {
      setCupIndex((i) => (i + 1) % cups.length);
    }, 900);

    // 3 секундын дараа хаагдана
    const close = setTimeout(() => {
      setShow(false);
      clearInterval(swap);
    }, 3000);

    return () => {
      clearInterval(swap);
      clearTimeout(close);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-coffee-950 via-coffee-900 to-coffee-800 overflow-hidden"
        >
          {/* Дэвсгэр гэрэлтэлт */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-coffee-500/40 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-coffee-400/30 rounded-full blur-3xl" />
          </div>

          {/* Аяга - хоёр талаас орж ирж солигдоно */}
          <div className="relative w-40 h-56 md:w-48 md:h-64 mb-8">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={cupIndex}
                initial={{ x: cupIndex % 2 === 0 ? 300 : -300, opacity: 0, rotate: cupIndex % 2 === 0 ? 20 : -20 }}
                animate={{ x: 0, opacity: 1, rotate: 0 }}
                exit={{ x: cupIndex % 2 === 0 ? -300 : 300, opacity: 0, rotate: cupIndex % 2 === 0 ? -20 : 20 }}
                transition={{ type: 'spring', damping: 18, stiffness: 200 }}
                className="absolute inset-0"
              >
                <PaperCup color={cups[cupIndex].color} lidColor={cups[cupIndex].lid} />
              </motion.div>
            </AnimatePresence>

            {/* Уур */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 0.6, 0], y: -40 }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                className="absolute -top-8 w-1.5 h-8 bg-white/50 rounded-full blur-sm"
                style={{ left: `${38 + i * 12}%` }}
              />
            ))}
          </div>

          {/* Лого текст */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-white tracking-wide"
          >
            Good <span className="text-coffee-400">Cup</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-coffee-300 text-sm mt-2 tracking-[0.25em] uppercase"
          >
            Цаасан аяга · Таг · Соруул
          </motion.p>

          {/* Ачаалах зураас */}
          <motion.div className="absolute bottom-12 w-40 h-1 bg-coffee-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-coffee-500 to-coffee-300 rounded-full"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
