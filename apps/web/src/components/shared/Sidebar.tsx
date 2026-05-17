'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { X, LogOut, ChevronRight, LucideIcon } from 'lucide-react';
import { useAuth } from '@/store/useAuth';

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sections: NavSection[];
  portalLabel?: string;
}

export default function Sidebar({ isOpen, onClose, sections, portalLabel }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* ——— Backdrop (mobile only) ——— */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 lg:hidden ${
          isOpen
            ? 'pointer-events-auto bg-slate-900/40 backdrop-blur-sm'
            : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* ——— Sidebar Drawer ——— */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-slate-900 lg:shadow-none lg:border-r lg:border-slate-200/70 dark:lg:border-slate-800/70 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navigation principale"
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-4 dark:border-slate-800">
          <Link
            href="/"
            className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
            onClick={onClose}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/logo_ecomplus.jpeg"
              alt="Ecom Plus"
              className="h-8 w-8 rounded-lg object-cover"
            />
            <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">
              Ecom<span className="text-primary">Plus</span>
            </span>
          </Link>

          {/* Close button — visible only on mobile (lg:hidden) */}
          <button
            onClick={onClose}
            aria-label="Fermer le menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User badge */}
        {user && (
          <div className="mx-3 mt-4 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60">
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-white dark:border-slate-700 shadow">
              <Image
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.nom || 'U')}&background=random&size=80`}
                alt={`Avatar de ${user.nom}`}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-slate-900 dark:text-white">{user.nom}</p>
              {portalLabel && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">{portalLabel}</p>
              )}
            </div>
          </div>
        )}

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Menu">
          {sections.map((section, si) => (
            <div key={si} className={si > 0 ? 'mt-6' : ''}>
              {section.label && (
                <p className="mb-1.5 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {section.label}
                </p>
              )}
              <ul className="space-y-0.5" role="list">
                {section.items.map((item) => {
                  const active = isActive(item.href, item.exact);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? 'page' : undefined}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          active
                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                        }`}
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                        <span className="flex-1">{item.name}</span>
                        {active && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer — logout */}
        <div className="shrink-0 border-t border-slate-100 px-3 py-3 dark:border-slate-800">
          <button
            onClick={() => { logout(); onClose(); }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
}
