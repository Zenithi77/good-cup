'use client';

import { Fragment, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw]',
};

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal Container - Scrollable */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="min-h-full flex items-center justify-center p-4">
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  'w-full my-4',
                  sizeClasses[size]
                )}
              >
                <div className="bg-coffee-900 rounded-2xl shadow-2xl border border-coffee-700 overflow-hidden max-h-[90vh] flex flex-col">
                  {/* Header */}
                  {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-coffee-700 shrink-0">
                      <h2 className="text-lg font-semibold text-coffee-100">{title}</h2>
                      <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-coffee-400 hover:text-coffee-100 hover:bg-coffee-800 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                  
                  {/* Content - Scrollable */}
                  <div className="p-6 overflow-y-auto flex-1">
                    {children}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}
