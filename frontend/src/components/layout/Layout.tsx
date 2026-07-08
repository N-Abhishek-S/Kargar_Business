import { type ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { SmoothScroll } from './SmoothScroll';
import { LoadingScreen } from './LoadingScreen';
import { SkipToContent } from './SkipToContent';
import { ScrollToTop } from './ScrollToTop';

export interface LayoutProps {
  children: ReactNode;
}

/**
 * Enterprise Application Layout Wrapper
 * - Orchestrates all global layout components
 * - Includes SmoothScroll context
 * - Injects Navbar, Footer, and accessibility utilities
 */
export function Layout({ children }: LayoutProps) {
  return (
    <SmoothScroll>
      <LoadingScreen />
      <SkipToContent />
      <div className="relative flex min-h-screen flex-col bg-white">
        <Navbar />
        {/* main-content id is required for SkipToContent to work */}
        <div className="flex-1">
          {children}
        </div>
        <Footer />
        <ScrollToTop />
      </div>
    </SmoothScroll>
  );
}
