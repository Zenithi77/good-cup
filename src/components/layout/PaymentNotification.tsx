'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, PartyPopper } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface PaidOrder {
  id: string;
  paymentRef: string;
  total: number;
}

export function PaymentNotification() {
  const { user } = useAuthStore();
  const [paidOrder, setPaidOrder] = useState<PaidOrder | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [processedOrderIds, setProcessedOrderIds] = useState<Set<string>>(new Set());

  const triggerConfetti = useCallback(() => {
    // Multiple confetti bursts
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, []);

  useEffect(() => {
    if (!user?.email) return;

    // Listen for paid orders in real-time
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('customerEmail', '==', user.email),
      where('paymentStatus', '==', 'Paid')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const orderData = change.doc.data();
          const orderId = change.doc.id;
          
          // Check if this order was just paid (not already processed)
          if (!processedOrderIds.has(orderId)) {
            // Check if paidAt is recent (within last 30 seconds)
            const paidAt = orderData.paidAt?.toDate?.();
            const now = new Date();
            const isRecent = paidAt && (now.getTime() - paidAt.getTime()) < 30000;
            
            // Or check if the order was just modified to Paid status
            const updatedAt = orderData.updatedAt?.toDate?.();
            const isRecentUpdate = updatedAt && (now.getTime() - updatedAt.getTime()) < 10000;
            
            if (isRecent || isRecentUpdate) {
              setPaidOrder({
                id: orderId,
                paymentRef: orderData.paymentRef,
                total: orderData.total,
              });
              setShowNotification(true);
              setProcessedOrderIds(prev => new Set([...prev, orderId]));
              triggerConfetti();

              // Auto hide after 6 seconds
              setTimeout(() => {
                setShowNotification(false);
              }, 6000);
            } else {
              // Mark as processed even if not recent (to avoid showing on page refresh)
              setProcessedOrderIds(prev => new Set([...prev, orderId]));
            }
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user, processedOrderIds, triggerConfetti]);

  const handleClose = () => {
    setShowNotification(false);
  };

  return (
    <AnimatePresence>
      {showNotification && paidOrder && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md"
        >
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-2xl overflow-hidden">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-5">
              <div className="flex items-start gap-4">
                {/* Success Icon with animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2, damping: 10 }}
                  className="shrink-0"
                >
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold text-lg">Төлбөр амжилттай!</h3>
                      <PartyPopper className="w-5 h-5 text-yellow-300" />
                    </div>
                    <p className="text-white/90 text-sm mb-2">
                      Захиалга #{paidOrder.paymentRef} баталгаажлаа
                    </p>
                    <p className="text-white font-semibold text-xl">
                      {formatPrice(paidOrder.total)}
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* Progress bar */}
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 6, ease: 'linear' }}
                className="mt-4 h-1 bg-white/30 rounded-full origin-left"
              />
            </div>

            {/* Animated stripes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: 'linear',
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
