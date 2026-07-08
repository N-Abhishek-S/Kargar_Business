import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router';
import App from './App';
import '@/styles/index.css';

/**
 * TanStack Query client with sensible defaults for an enterprise application.
 * - 5 minute stale time reduces unnecessary refetches
 * - 1 retry with exponential backoff for resilience
 * - refetchOnWindowFocus disabled for predictable UX
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1E293B',
                color: '#F8FAFC',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                fontFamily: 'Inter, system-ui, sans-serif',
              },
              success: {
                iconTheme: { primary: '#22C55E', secondary: '#F8FAFC' },
              },
              error: {
                iconTheme: { primary: '#EF4444', secondary: '#F8FAFC' },
              },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
);
