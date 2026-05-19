'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  ShoppingBag,
  User,
  ShoppingCart,
  Truck,
  Home,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import Sidebar, { NavSection } from '@/components/shared/Sidebar';
import Topbar from '@/components/shared/Topbar';
import { useAuth } from '@/store/useAuth';

const sections: NavSection[] = [
  {
    label: 'Mon espace',
    items: [
      { name: 'Tableau de bord', href: '/client/dashboard', icon: LayoutDashboard, exact: true },
      { name: 'Mes Devis', href: '/client/quotes', icon: FileText },
      { name: 'Mes Commandes', href: '/client/orders', icon: ShoppingBag },
      { name: 'Support Client', href: '/client/chat', icon: MessageSquare },
      { name: 'Mon Profil', href: '/client/profil', icon: User },
    ],
  },
  {
    label: 'Boutique',
    items: [
      { name: 'Catalogue', href: '/catalogue', icon: ShoppingBag },
      { name: 'Mon Panier', href: '/panier', icon: ShoppingCart },
      { name: 'Suivre un colis', href: '/suivi', icon: Truck },
    ],
  },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, checkAuth, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Restore session
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/client/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  // Auto-close sidebar on mobile when navigating
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Open on desktop by default
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sections={sections}
        portalLabel="Portail Client"
      />

      {/* Right side */}
      <div className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'lg:pl-72' : 'lg:pl-0'}`}>
        <Topbar
          onMenuClick={() => setSidebarOpen((v) => !v)}
          isSidebarOpen={sidebarOpen}
        />

        <main className="flex-1 overflow-y-auto">
          {/* Breadcrumb */}
          <div className="hidden items-center gap-2 border-b border-slate-100 bg-white/50 px-8 py-3 text-xs font-medium text-slate-500 dark:border-slate-800/60 dark:bg-slate-900/50 lg:flex">
            <a href="/client/dashboard" className="hover:text-primary">Espace Client</a>
            {pathname !== '/client/dashboard' && (
              <>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <span className="capitalize text-slate-800 dark:text-slate-200">
                  {pathname.split('/').pop()
                    ?.replace('quotes', 'Devis')
                    .replace('orders', 'Commandes')
                    .replace('chat', 'Messagerie')
                    .replace('profil', 'Profil')}
                </span>
              </>
            )}
          </div>

          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
