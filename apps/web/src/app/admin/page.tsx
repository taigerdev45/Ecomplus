'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function AdminDashboard() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['admin']}>
        <div className="p-8">
          <h1 className="text-3xl font-bold">Tableau de bord Administrateur</h1>
          <p className="mt-4">Bienvenue dans l&apos;espace de gestion Ecom Plus Gabon.</p>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
