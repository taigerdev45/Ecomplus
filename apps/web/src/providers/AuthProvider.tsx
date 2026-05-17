'use client';

import { useEffect } from 'react';
import { useAuth } from '@/store/useAuth';
import { usePathname } from 'next/navigation';
import api from '@/lib/axios';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const recordPageVisit = async () => {
      try {
        await api.post('/config/visit', { page: pathname });
      } catch (err) {
        // Silently catch visit log errors in background
      }
    };
    recordPageVisit();
  }, [pathname]);

  return <>{children}</>;
}
