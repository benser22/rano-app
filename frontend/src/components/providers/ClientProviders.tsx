"use client";

import { ReactNode } from 'react';
import { StoreConfigProvider } from '@/lib/useStoreConfig';

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <StoreConfigProvider>
      {children}
    </StoreConfigProvider>
  );
}
