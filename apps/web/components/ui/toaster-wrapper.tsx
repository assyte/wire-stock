'use client';

import { Toaster } from './sonner';

export function ToasterWrapper() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      theme="light"
    />
  );
}