'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/store/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, FileText, ShoppingBag, Settings, LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, checkAuth, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/client/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    toast.success('Déconnecté avec succès');
    router.push('/login');
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const navItems = [
    { name: 'Tableau de bord', href: '/client/dashboard', icon: LayoutDashboard },
    { name: 'Mes Devis', href: '/client/quotes', icon: FileText },
    { name: 'Mes Commandes', href: '/client/orders', icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 md:h-screen md:sticky top-0 p-4 flex flex-col">
        <div className="mb-8 hidden md:block">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Mon Compte</h2>
          <p className="text-sm text-slate-500">{user?.nom}</p>
        </div>
        
        <nav className="flex-1 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap md:whitespace-normal ${
                  isActive 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-semibold">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-auto hidden md:block border-t border-slate-200 dark:border-slate-800 pt-4">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-semibold">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
