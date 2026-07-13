import { createContext } from 'react';
import type { AdminSession } from '@/services/admin.service';

export interface AuthContextType {
  admin: AdminSession | null;
  isCheckingSession: boolean;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
