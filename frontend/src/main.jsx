import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';
import App from './App';
import theme from './theme';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <Suspense fallback={<LoadingScreen />}>
          <App />
        </Suspense>
      </ChakraProvider>
    </ErrorBoundary>
  </React.StrictMode>
);