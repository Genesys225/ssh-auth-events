import {  ThemeProvider } from '@mui/material';
import React from 'react';
import {  Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles';
import { createTheme } from './theme/create-theme';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

interface MuiProviderProps {
  children: React.ReactNode;
}


export function MuiProvider({ children }: MuiProviderProps) {
  const cache = createCache({ key: 'css', prepend: true });
  const theme = createTheme({
    primaryColor: 'neonBlue',
    colorScheme: 'dark',
    direction: 'ltr',
  });
  return (
    <CacheProvider value={cache}>
      <CssVarsProvider defaultColorScheme="dark" defaultMode="dark" theme={theme}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </CssVarsProvider>
    </CacheProvider>
  );
}