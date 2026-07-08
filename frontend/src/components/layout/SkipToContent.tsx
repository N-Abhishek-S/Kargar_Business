/**
 * Skip to Content Link (Accessibility requirement)
 * - Hidden by default, becomes visible when focused via keyboard
 * - Allows screen reader and keyboard users to skip the navigation
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-fixed focus:rounded-md focus:bg-orange-500 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
}
