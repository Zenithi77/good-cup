'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { MINIMUM_ORDER_AMOUNT } from '@/lib/constants';
import { Button } from '@/components/ui';

export function FloatingCart() {
  const {
    items,
    isOpen,
    openCart,
    closeCart,
    removeItem,
    updateQuantity,
    getTotal,
    getItemCount,
    clearCart,
  } = useCartStore();

  const total = getTotal();
  const itemCount = getItemCount();
  const progress = Math.min((total / MINIMUM_ORDER_AMOUNT) * 100, 100);
  const canCheckout = total >= MINIMUM_ORDER_AMOUNT;

  return (
    <>
      {/* Mobile Floating Cart Button */}
      <motion.button
        onClick={openCart}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="md:hidden fixed bottom-6 right-6 z-40 w-16 h-16 bg-coffee-500 text-white rounded-full shadow-lg shadow-coffee-500/30 flex items-center justify-center"
      >
        <ShoppingBag className="w-6 h-6" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Cart Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-coffee-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-coffee-800">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-coffee-400" />
                <h2 className="text-lg font-semibold text-coffee-100">
                  Сагс ({items.length})
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-lg text-coffee-400 hover:text-coffee-100 hover:bg-coffee-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-coffee-400">
                  <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg mb-2">Сагс хоосон байна</p>
                  <p className="text-sm text-coffee-500">
                    Бүтээгдэхүүн нэмэхийн тулд дэлгүүрээр зочлоорой
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex gap-3 bg-coffee-800/50 rounded-xl p-3"
                  >
                    {/* Image */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-coffee-700 shrink-0">
                      <Image
                        src={item.imageUrl || '/placeholder.png'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-coffee-100 font-medium text-sm line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-coffee-400 text-xs mt-1">
                        {item.size} • {item.packageQty}ш/багц
                      </p>
                      <p className="text-coffee-300 font-semibold text-sm mt-1">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    {/* Quantity & Remove */}
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-coffee-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center bg-coffee-700 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-coffee-300 hover:text-coffee-100 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-2 text-coffee-100 text-sm font-medium min-w-[28px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 text-coffee-300 hover:text-coffee-100 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-coffee-800 p-4 space-y-4">
                {/* Clear cart */}
                <button
                  onClick={clearCart}
                  className="text-sm text-coffee-500 hover:text-red-400 transition-colors"
                >
                  Сагс хоослох
                </button>

                {/* Subtotals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-coffee-300">
                    <span>Нийт дүн</span>
                    <span className="font-semibold text-coffee-100">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {/* Checkout button with progress */}
                <div className="relative">
                  <Link
                    href={canCheckout ? '/checkout' : '#'}
                    onClick={(e) => {
                      if (canCheckout) {
                        closeCart();
                      } else {
                        e.preventDefault();
                      }
                    }}
                  >
                    <motion.button
                      whileHover={canCheckout ? { scale: 1.02 } : {}}
                      whileTap={canCheckout ? { scale: 0.98 } : {}}
                      className={`w-full relative overflow-hidden rounded-xl py-3 font-medium transition-all ${
                        canCheckout
                          ? 'bg-coffee-600 text-white hover:bg-coffee-500'
                          : 'bg-coffee-800 text-coffee-400 cursor-not-allowed'
                      }`}
                    >
                      {/* Progress fill */}
                      {!canCheckout && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className="absolute inset-y-0 left-0 bg-coffee-600/50"
                        />
                      )}
                      <span className="relative z-10">
                        {canCheckout
                          ? `Захиалга өгөх (${formatPrice(total)})`
                          : `Хамгийн багадаа ${formatPrice(MINIMUM_ORDER_AMOUNT)}`}
                      </span>
                    </motion.button>
                  </Link>
                  
                  {!canCheckout && (
                    <p className="text-xs text-coffee-500 text-center mt-2">
                      Дутуу: {formatPrice(MINIMUM_ORDER_AMOUNT - total)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}
