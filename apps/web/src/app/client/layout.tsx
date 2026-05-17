'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/store/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, FileText, ShoppingBag, Settings, LogOut, Loader2, User, ShoppingCart, Truck, Home, MessageSquare } from 'lucide-react';
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
    router.push('/');
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const clientItems = [
    { name: 'Tableau de bord', href: '/client/dashboard', icon: LayoutDashboard },
    { name: 'Mes Devis', href: '/client/quotes', icon: FileText },
    { name: 'Mes Commandes', href: '/client/orders', icon: ShoppingBag },
    { name: 'Support Client', href: '/client/chat', icon: MessageSquare },
    { name: 'Mon Profil', href: '/client/profil', icon: User },
  ];

  const publicItems = [
    { name: 'Catalogue Produits', href: '/catalogue', icon: ShoppingBag },
    { name: 'Mon Panier', href: '/panier', icon: ShoppingCart },
    { name: 'Suivre un Colis', href: '/suivi', icon: Truck },
    { name: 'Accueil', href: '/', icon: Home },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row theme-client">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-sm">C</div>
          <span className="text-[10px] font-black text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-1 rounded-md">Portail Client</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white leading-none">{user?.nom}</h2>
            <p className="text-[9px] text-slate-500 mt-0.5 leading-none max-w-[120px] truncate">{user?.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            title="Déconnexion"
            aria-label="Se déconnecter"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 md:h-screen md:sticky md:top-0 p-4 flex flex-col">
        <div className="mb-8 hidden md:block">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black">C</div>
            <span className="text-[10px] font-black text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-1 rounded-md">Portail Client</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">{user?.nom}</h2>
          <p className="text-xs text-slate-500">{user?.email}</p>
        </div>
        
        <nav className="flex-1 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-thin">
          <div className="hidden md:block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4 mb-1">
            Espace Client
          </div>
          {clientItems.map((item) => {
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

          <div className="hidden md:block border-t border-slate-100 dark:border-slate-800/60 my-3 pt-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4 mb-1">
            Boutique & Liens
          </div>
          {publicItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
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

          {/* Mobile direct logout helper */}
          <button
            onClick={handleLogout}
            className="flex md:hidden items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold"
          >
            <LogOut className="h-5 w-5" />
            <span>Déconnexion</span>
          </button>
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
