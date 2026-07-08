import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../ui/Button';

/**
 * Scroll to Top Floating Action Button
 * - Appears after scrolling down 500px
 * - Smooth scrolls back to top
 */
export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => { window.removeEventListener('scroll', handleScroll); };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div
      className={clsx(
        'fixed bottom-6 right-6 z-fixed transition-all duration-300',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none',
      )}
    >
      <Button
        variant="primary"
        size="icon"
        className="rounded-full shadow-lg"
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  );
}
