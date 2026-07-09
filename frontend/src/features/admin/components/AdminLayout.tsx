import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Star, 
  LogOut, 
  Menu,
  X
} from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/Button';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Spinner } from '@/components/ui/Spinner';
import { getCurrentAdmin, logoutAdmin, type AdminSession } from '@/services/admin.service';

const ADMIN_NAV = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Contacts', href: '/admin/contacts', icon: MessageSquare },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
];

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    void getCurrentAdmin()
      .then((session) => {
        if (!active) return;
        if (!session) {
          void navigate('/admin/login', { replace: true });
          return;
        }
        setAdmin(session);
      })
      .catch(() => {
        if (!active) return;
        void navigate('/admin/login', { replace: true });
      })
      .finally(() => {
        if (active) setIsCheckingSession(false);
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  const handleLogout = async () => {
    await logoutAdmin();
    void navigate('/admin/login');
  };

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-navy-950/50 lg:hidden"
          onClick={() => { setIsSidebarOpen(false); }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 px-6">
          <div className="flex min-w-0 flex-col">
            <BrandLogo className="w-32" />
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-navy-600">
              Admin Portal
            </span>
          </div>
          <button 
            className="lg:hidden text-gray-500"
            onClick={() => { setIsSidebarOpen(false); }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <ul className="flex flex-col gap-2">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <NavLink
                    to={item.href}
                    end={item.href === '/admin'}
                    onClick={() => { setIsSidebarOpen(false); }}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-ring',
                        isActive
                          ? 'bg-orange-50 text-orange-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-navy-900'
                      )
                    }
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-gray-100 p-4">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
            leftIcon={<LogOut className="h-5 w-5" />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex w-full flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
          <button
            className="lg:hidden text-gray-500 hover:text-navy-900 p-2 focus-ring rounded-md -ml-2"
            onClick={() => { setIsSidebarOpen(true); }}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden sm:block text-sm text-gray-500 font-medium">
              Welcome, {admin.email}
            </div>
            <div className="h-8 w-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center font-bold text-orange-700 uppercase">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
