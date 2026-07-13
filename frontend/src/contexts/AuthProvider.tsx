import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '@/supabase/client';
import { getCurrentAdmin } from '@/services/admin.service';
import type { AdminSession } from '@/services/admin.service';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const refreshSession = async () => {
    setIsCheckingSession(true);
    try {
      const session = await getCurrentAdmin();
      setAdmin(session);
    } catch {
      setAdmin(null);
    } finally {
      setIsCheckingSession(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!mounted) return;
      await refreshSession();
    };
    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (!mounted) return;
      if (
        event === 'SIGNED_IN' ||
        event === 'SIGNED_OUT' ||
        event === 'USER_UPDATED' ||
        event === 'PASSWORD_RECOVERY'
      ) {
        void refreshSession();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ admin, isCheckingSession, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}
