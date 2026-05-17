'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/store/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  FileText, 
  ShoppingBag, 
  LogOut, 
  Loader2, 
  User, 
  ShoppingCart, 
  Truck, 
  Home, 
  MessageSquare,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, checkAuth, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Mobile Glassmorphic Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-xs lg:hidden transition-all duration-300" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Floating Hamburger Pro Button (Visible when sidebar is closed on mobile) */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Ouvrir le menu"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-indigo-600 text-white shadow-xl shadow-primary/30 transition-all duration-300 hover:scale-110 active:scale-95 lg:hidden hover:shadow-2xl hover:shadow-primary/40 focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>
      )}

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 transform bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl transition-all duration-300 ease-in-out border-r border-slate-200/50 dark:border-slate-800/50 rounded-r-3xl lg:rounded-r-none ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'}`}>
          <div className={`flex h-full flex-col ${!isSidebarOpen && 'lg:items-center'}`}>
            <div className="flex h-20 items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800/60">
              <Link href="/" className={`flex items-center gap-2 ${!isSidebarOpen && 'lg:hidden'}`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/logo_ecomplus.jpeg" alt="Ecom Plus Gabon" className="h-8 w-auto object-contain mix-blend-multiply dark:mix-blend-normal rounded-sm" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">EcomPlus</span>
              </Link>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-inner bg-gradient-to-br from-primary/20 to-primary/5 ${isSidebarOpen ? 'hidden' : 'hidden lg:flex'}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/logo_ecomplus.jpeg" alt="E" className="h-8 w-auto object-contain mix-blend-multiply dark:mix-blend-normal rounded-sm" />
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Fermer le menu"
                className="lg:hidden text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl transition-all"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 space-y-6 px-4 py-6 overflow-y-auto scrollbar-thin">
              <div>
                <div className={`text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4 mb-2 ${!isSidebarOpen && 'lg:hidden'}`}>
                  Espace Client
                </div>
                <div className="space-y-1">
                  {clientItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        title={!isSidebarOpen ? item.name : undefined}
                        onClick={() => {
                          if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                          isActive 
                            ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                        } ${!isSidebarOpen && 'lg:justify-center lg:px-0'}`}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className={`${!isSidebarOpen && 'lg:hidden'}`}>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className={`text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4 mb-2 ${!isSidebarOpen && 'lg:hidden'}`}>
                  Boutique & Liens
                </div>
                <div className="space-y-1">
                  {publicItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        title={!isSidebarOpen ? item.name : undefined}
                        onClick={() => {
                          if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                          isActive 
                            ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                        } ${!isSidebarOpen && 'lg:justify-center lg:px-0'}`}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className={`${!isSidebarOpen && 'lg:hidden'}`}>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </nav>

            <div className="border-t border-slate-100 p-4 dark:border-slate-800">
              <button 
                onClick={handleLogout}
                title={!isSidebarOpen ? 'Déconnexion' : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 ${!isSidebarOpen && 'lg:justify-center lg:px-0'}`}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span className={`${!isSidebarOpen && 'lg:hidden'}`}>Déconnexion</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'lg:pl-72' : 'lg:pl-20'}`}>
          {/* Header */}
          <header className="sticky top-0 z-30 h-20 bg-white/80 backdrop-blur-md dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
            <div className="flex h-full items-center justify-between px-4 lg:px-8">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                aria-label="Toggle navigation"
                className="text-slate-500 hover:text-primary transition-colors p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-1 rounded-md hidden sm:inline-block">Portail Client</span>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
                <div className="flex items-center gap-3">
                  <div className={`text-right hidden sm:block ${!isSidebarOpen && 'lg:hidden'}`}>
                    <p className="text-sm font-bold">{user?.nom}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-200 border-2 border-white dark:border-slate-800">
                    <Image
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nom || 'Client')}&background=random&size=100`}
                      alt={`Avatar de ${user?.nom || 'Client'}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-4 lg:p-8">
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-500">
              <Link href="/client/dashboard" className="hover:text-primary">Espace Client</Link>
              {pathname !== '/client/dashboard' && (
                <>
                  <ChevronRight className="h-3 w-3" />
                  <span className="capitalize text-slate-900 dark:text-white">
                    {pathname.split('/').pop()?.replace('quotes', 'Devis').replace('orders', 'Commandes').replace('chat', 'Messagerie').replace('profil', 'Profil')}
                  </span>
                </>
              )}
            </nav>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
