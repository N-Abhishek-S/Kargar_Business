import { Routes, Route } from 'react-router';
import { lazy, Suspense } from 'react';
import { KargarSinglePage } from '@/pages/KargarSinglePage';

/** Lazy-loaded admin routes for code splitting */
const AdminLoginPage = lazy(() => import('@/features/admin/pages/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('@/features/admin/pages/AdminDashboardPage'));
const AdminReviewsPage = lazy(() => import('@/features/admin/pages/AdminReviewsPage'));
const AdminContactsPage = lazy(() => import('@/features/admin/pages/AdminContactsPage'));
import { AdminLayout } from '@/features/admin/components/AdminLayout';

/**
 * Root application component.
 * - HomePage is eagerly loaded (main content)
 * - Admin routes are code-split and lazy-loaded
 */
export default function App() {
  return (
    <Suspense>
      <Routes>
        <Route path="/" element={<KargarSinglePage />} />
        <Route path="/services" element={<KargarSinglePage />} />
        <Route path="/sectors" element={<KargarSinglePage />} />
        <Route path="/company-profile" element={<KargarSinglePage />} />
        <Route path="/support" element={<KargarSinglePage />} />
        <Route path="/contact-us" element={<KargarSinglePage />} />
        <Route path="/contact" element={<KargarSinglePage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="contacts" element={<AdminContactsPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
