'use client';

import { Toaster } from 'react-hot-toast';
import { PaymentNotification } from '@/components/layout';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PaymentNotification />
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#3d322d',
            color: '#f5ebe6',
            border: '1px solid #5a3e2b',
          },
          success: {
            iconTheme: {
              primary: '#4CAF50',
              secondary: '#f5ebe6',
            },
          },
          error: {
            iconTheme: {
              primary: '#F44336',
              secondary: '#f5ebe6',
            },
          },
        }}
      />
    </>
  );
}
