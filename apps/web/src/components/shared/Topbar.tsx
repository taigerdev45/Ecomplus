'use client';

import React, { useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Bell } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/store/useAuth';

interface TopbarProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
  rightSlot?: React.ReactNode;
  showSearch?: boolean;
}

export default function Topbar({ onMenuClick, isSidebarOpen, rightSlot, showSearch }: TopbarProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  const pageTitle = pathname
    .split('/')
    .filter(Boolean)
    .pop()
    ?.replace('quotes', 'Devis')
    .replace('orders', 'Commandes')
    .replace('agents', 'Agents')
    .replace('receipts', 'Reçus')
    .replace('clients', 'Clients')
    .replace('products', 'Produits')
    .replace('reports', 'Rapports')
    .replace('config', 'Configuration')
    .replace('chat', 'Messages')
    .replace('dashboard', 'Tableau de bord')
    .replace('profil', 'Mon Profil')
    ?.replace(/^\w/, (c) => c.toUpperCase()) || 'EcomPlus';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center border-b border-slate-200/70 bg-white/90 backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-900/90">
      <div className="flex w-full items-center gap-3 px-4">
        {/* Hamburger — always visible top-left */}
        <button
          onClick={onMenuClick}
          aria-label={isSidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={isSidebarOpen ? 'true' : 'false'}
          aria-controls="main-sidebar"
          title={isSidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Page title (hidden on desktop where sidebar shows) */}
        <span className="flex-1 truncate text-[15px] font-semibold text-slate-800 dark:text-slate-100 lg:hidden">
          {pageTitle}
        </span>

        {/* Search bar — desktop only */}
        {showSearch && (
          <div className="hidden flex-1 max-w-sm lg:block">
            <div className="relative">
              <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="search"
                placeholder="Recherche..."
                aria-label="Recherche globale"
                className="h-9 w-full rounded-xl border-none bg-slate-100 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800"
              />
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1 lg:flex-none" />

        {/* Right slot (contextual actions) */}
        {rightSlot}

        {/* Notifications */}
        <button
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
        </button>

        {/* Avatar */}
        <Link
          href={pathname.startsWith('/client') ? '/client/profil' : '#'}
          className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-white shadow dark:border-slate-700 hover:ring-2 hover:ring-primary/40 transition-all"
          aria-label="Mon profil"
        >
          <Image
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nom || 'U')}&background=random&size=80`}
            alt={`Avatar de ${user?.nom || 'Utilisateur'}`}
            fill
            unoptimized
            className="object-cover"
          />
        </Link>
      </div>
    </header>
  );
}
