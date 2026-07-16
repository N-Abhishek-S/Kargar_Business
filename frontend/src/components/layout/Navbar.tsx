import { useState, useEffect } from 'react';
import { Menu, X, PhoneCall } from 'lucide-react';
import { clsx } from 'clsx';
import { useLocation, useNavigate } from 'react-router';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { BrandLogo } from '../ui/BrandLogo';
import { useScrollSpy } from '@/hooks/useScrollSpy';

const NAV_LINKS = [
  { label: 'Home', sectionId: 'hero' },
  { label: 'About', sectionId: 'about' },
  { label: 'Services', sectionId: 'services' },
  { label: 'Sectors', sectionId: 'sectors' },
  { label: 'Process', sectionId: 'process' },
  { label: 'Contact', sectionId: 'contact' },
];

/**
 * Enterprise Navbar Component
 * - Sticky header with glassmorphism on scroll
 * - Scroll-spy for active link highlighting
 * - Mobile drawer with focus management
 * - Responsive layout
 */
export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { pathname } = useLocation();
  const navigate = useNavigate();
  
  // Track active section on homepage
  const activeSection = useScrollSpy(NAV_LINKS.map((link) => link.sectionId));

  // Handle scroll events for glass effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => { window.removeEventListener('scroll', handleScroll); };
  }, []);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => { window.removeEventListener('keydown', handleKeyDown); };
  }, [isMobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    
    if (pathname !== '/') {
      // Navigate to homepage first, then scroll
      void navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      // Already on homepage, just scroll
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={clsx(
        'fixed left-0 right-0 top-0 z-sticky w-full border-b border-gray-100 bg-white/95 backdrop-blur-xl transition-all duration-300',
        isScrolled ? 'py-2 shadow-sm' : 'py-3 shadow-xs',
      )}
    >
      <Container>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => { handleNavClick('hero'); }}
            className="group flex w-36 items-center focus-ring rounded-sm sm:w-44"
            aria-label="Kargar FM Home"
          >
            <BrandLogo imageClassName="transition-transform duration-300 group-hover:scale-[1.02]" />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:block" aria-label="Main Navigation">
            <ul className="flex items-center gap-1 lg:gap-2">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.sectionId;
                return (
                  <li key={link.label}>
                    <button
                      onClick={() => { handleNavClick(link.sectionId); }}
                      className={clsx(
                        'rounded-full px-4 py-2 text-sm font-medium transition-all focus-ring',
                        isActive
                          ? 'bg-orange-50 text-orange-600'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-navy-900',
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {link.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <Button
              className="hidden lg:flex"
              variant="primary"
              leftIcon={<PhoneCall className="h-4 w-4" />}
              onClick={() => { handleNavClick('contact'); }}
            >
              Get a Quote
            </Button>

            <button
              className="rounded-md p-2 text-navy-900 focus-ring md:hidden"
              onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); }}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
               <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-navy-950/60 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => { setIsMobileMenuOpen(false); }}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Content */}
      <div
        className={clsx(
          'fixed inset-y-0 right-0 z-[70] w-4/5 max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden flex flex-col',
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        aria-hidden={!isMobileMenuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <BrandLogo imageClassName="w-28" />
          <button
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-navy-900 focus-ring"
            onClick={() => { setIsMobileMenuOpen(false); }}
            aria-label="Close navigation menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex h-full flex-col overflow-y-auto px-6 py-8">
          <nav aria-label="Mobile Navigation Links">
            <ul className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.sectionId;
                return (
                  <li key={link.label}>
                    <button
                      onClick={() => { handleNavClick(link.sectionId); }}
                      className={clsx(
                        'flex w-full items-center justify-between rounded-lg px-4 py-4 text-lg font-medium transition-colors focus-ring',
                        isActive
                          ? 'bg-orange-50 text-orange-600'
                          : 'text-navy-900 hover:bg-gray-50',
                      )}
                    >
                      {link.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          <div className="mt-auto pt-8 border-t border-gray-100">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 mb-2">Need help immediately?</p>
              <a href="tel:+919876543210" className="flex items-center gap-2 text-xl font-bold text-navy-900">
                <PhoneCall className="h-5 w-5 text-orange-500" />
                +91-9876543210
              </a>
            </div>
            <Button
              fullWidth
              size="lg"
              onClick={() => { handleNavClick('contact'); }}
            >
              Request a Callback
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
