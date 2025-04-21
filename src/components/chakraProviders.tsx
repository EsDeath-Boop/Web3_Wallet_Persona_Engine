'use client';

import { ReactNode } from 'react';

interface PandaProvidersProps {
  children?: ReactNode;
}

export function PandaProviders({ children }: PandaProvidersProps) {
  // PandaCSS doesn't need a provider like Chakra UI
  // This is just a simple wrapper component
  return <>{children}</>;
}