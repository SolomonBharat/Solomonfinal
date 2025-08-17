import React from 'react';
import { Toaster } from 'sonner';

export const Toast = () => {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: 'white',
          border: '1px solid #e5e7eb',
          color: '#374151',
        },
      }}
    />
  );
};