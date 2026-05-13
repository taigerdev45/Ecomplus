'use client';

import { useAuth } from '@/store/useAuth';
import { UserRole } from '@ecom/types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-destructive">Accès Refusé</h1>
        <p className="text-muted-foreground">Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
