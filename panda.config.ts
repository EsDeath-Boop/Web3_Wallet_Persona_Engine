import { defineConfig } from '@pandacss/dev';
import { tokens } from './src/utils/theme';

export default defineConfig({
  // Where to look for your css declarations
  include: [
    './src/**/*.{js,jsx,ts,tsx}',
    './src/app/**/*.{js,jsx,ts,tsx}',
  ],
  
  // Files to exclude
  exclude: [],
  
  // The output directory for your css system
  outdir: 'styled-system',

  // Import and use the tokens defined in your theme file
  theme: {
    extend: {
      tokens,
      semanticTokens: {
        colors: {
          'blue.500': { value: '#3182ce' },
          'blue.600': { value: '#2b6cb0' },
          'gray.300': { value: '#cbd5e0' },
        }
      }
    }
  },
  
  // Other options
  jsxFramework: 'react'
});