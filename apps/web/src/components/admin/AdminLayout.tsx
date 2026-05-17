'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  Menu, 
  X, 
  LogOut,
  Bell,
  Search,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/store/useAuth';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Produits', href: '/admin/products', icon: Package },
  { name: 'Devis', href: '/admin/quotes', icon: FileText },
  { name: 'Commandes', href: '/agent/orders', icon: Package },
  { name: 'Reçus', href: '/admin/receipts', icon: FileText },
  { name: 'Messages', href: '/admin/chat', icon: MessageSquare },
  { name: 'Agents', href: '/admin/agents', icon: Users },
  { name: 'Rapports', href: '/admin/reports', icon: BarChart3 },
  { name: 'Configuration', href: '/admin/config', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile Backdrop */}
      {!isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => setIsSidebarOpen(true)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 transform bg-white shadow-2xl transition-all duration-300 ease-in-out dark:bg-slate-900 ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'}`}>
        <div className={`flex h-full flex-col ${!isSidebarOpen && 'lg:items-center'}`}>
          <div className="flex h-20 items-center justify-between px-6">
            <Link href="/" className={`flex items-center gap-2 ${!isSidebarOpen && 'lg:hidden'}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/logo_ecomplus.jpeg" alt="Ecom Plus Gabon" className="h-8 w-auto object-contain mix-blend-multiply dark:mix-blend-normal rounded-sm" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">EcomPlus</span>
            </Link>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-inner bg-gradient-to-br from-primary/20 to-primary/5 ${isSidebarOpen ? 'hidden' : 'hidden lg:flex'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/logo_ecomplus.jpeg" alt="E" className="h-8 w-auto object-contain mix-blend-multiply dark:mix-blend-normal rounded-sm" />
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Fermer le menu de navigation"
              className="lg:hidden text-slate-500"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={!isSidebarOpen ? item.name : undefined}
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
          </nav>

          <div className="border-t border-slate-100 p-4 dark:border-slate-800">
            <button 
              onClick={logout}
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
      <main className={`flex min-h-screen flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 h-20 bg-white/80 backdrop-blur-md dark:bg-slate-900/80">
          <div className="flex h-full items-center justify-between px-4 lg:px-8">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle navigation"
              className="text-slate-500 hover:text-primary transition-colors"
            >
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <div className="hidden max-w-md flex-1 px-4 sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Recherche globale..." 
                  className="w-full rounded-xl border-none bg-slate-100 pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                aria-label="Notifications"
                className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                <span
                  className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"
                  aria-label="Nouvelles notifications"
                />
              </button>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
              <div className="flex items-center gap-3">
                <div className={`text-right hidden sm:block ${!isSidebarOpen && 'lg:hidden'}`}>
                  <p className="text-sm font-bold">{user?.nom}</p>
                  <p className="text-xs text-slate-500 uppercase">{user?.role}</p>
                </div>
                <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-200 border-2 border-white dark:border-slate-800">
                  <Image
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nom || 'Admin')}&background=random&size=100`}
                    alt={`Avatar de ${user?.nom || 'Admin'}`}
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
            <Link href="/admin" className="hover:text-primary">Admin</Link>
            {pathname !== '/admin' && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="capitalize text-slate-900 dark:text-white">
                  {pathname.split('/').pop()?.replace('quotes', 'Devis').replace('orders', 'Commandes').replace('agents', 'Agents').replace('reports', 'Rapports')}
                </span>
              </>
            )}
          </nav>
          {children}
        </div>
      </main>
    </div>
  );
}
