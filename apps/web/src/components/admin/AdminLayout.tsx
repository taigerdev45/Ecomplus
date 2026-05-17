'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  Shield,
  BarChart3,
  Settings,
  MessageSquare,
} from 'lucide-react';
import Sidebar, { NavSection } from '@/components/shared/Sidebar';
import Topbar from '@/components/shared/Topbar';
import { useAuth } from '@/store/useAuth';

const sections: NavSection[] = [
  {
    label: 'Principal',
    items: [
      { name: 'Tableau de bord', href: '/admin', icon: LayoutDashboard, exact: true },
      { name: 'Produits', href: '/admin/products', icon: Package },
      { name: 'Devis', href: '/admin/quotes', icon: FileText },
      { name: 'Commandes', href: '/agent/orders', icon: Package },
      { name: 'Reçus', href: '/admin/receipts', icon: FileText },
    ],
  },
  {
    label: 'Communication',
    items: [
      { name: 'Messages', href: '/admin/chat', icon: MessageSquare },
    ],
  },
  {
    label: 'Gestion',
    items: [
      { name: 'Clients', href: '/admin/clients', icon: Users },
      { name: 'Agents', href: '/admin/agents', icon: Shield },
      { name: 'Rapports', href: '/admin/reports', icon: BarChart3 },
      { name: 'Configuration', href: '/admin/config', icon: Settings },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { checkAuth } = useAuth();
  const pathname = usePathname();

  // Restore user session on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Auto-close sidebar on mobile when navigating
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Open by default on desktop
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sections={sections}
        portalLabel="Espace Admin"
      />

      {/* Right side: topbar + page content */}
      <div className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'lg:pl-72' : 'lg:pl-0'}`}>
        <Topbar
          onMenuClick={() => setSidebarOpen((v) => !v)}
          isSidebarOpen={sidebarOpen}
          showSearch
        />

        <main className="flex-1 overflow-y-auto">
          {/* Breadcrumb */}
          <div className="hidden items-center gap-2 border-b border-slate-100 bg-white/50 px-8 py-3 text-xs font-medium text-slate-500 dark:border-slate-800/60 dark:bg-slate-900/50 lg:flex">
            <a href="/admin" className="hover:text-primary">Admin</a>
            {pathname !== '/admin' && (
              <>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <span className="capitalize text-slate-800 dark:text-slate-200">
                  {pathname.split('/').pop()
                    ?.replace('quotes', 'Devis')
                    .replace('orders', 'Commandes')
                    .replace('agents', 'Agents')
                    .replace('receipts', 'Reçus')
                    .replace('clients', 'Clients')
                    .replace('products', 'Produits')
                    .replace('reports', 'Rapports')
                    .replace('config', 'Configuration')
                    .replace('chat', 'Messages')}
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
