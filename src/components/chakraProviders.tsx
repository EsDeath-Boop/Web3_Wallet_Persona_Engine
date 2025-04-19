'use client';
import { ChakraProvider } from '@chakra-ui/react';
import { extendTheme } from '@chakra-ui/theme-utils';

const theme = extendTheme({
  colors: {
    brand: {
      900: '#1a365d',
      800: '#2a4365',
      700: '#2c5282',
    },
  },
});

export function ChakraProviders({ children }: { children: React.ReactNode }) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}