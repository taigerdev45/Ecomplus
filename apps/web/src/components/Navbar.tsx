'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import { useCart } from '@/store/useCart';
import {
  ShoppingCart, LogOut, User, Menu, X,
  LayoutDashboard, Package, Truck, Home, Search
} from 'lucide-react';

const publicLinks = [
  { name: 'Accueil', href: '/', icon: Home },
  { name: 'Catalogue', href: '/catalogue', icon: Package },
  { name: 'Suivre un colis', href: '/suivi', icon: Truck },
];

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { getTotalItems } = useCart();
  const cartCount = getTotalItems();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const userDashboard =
    user?.role === 'admin' || user?.role === 'agent' ? '/admin' : '/client/dashboard';

  return (
    <>
      {/* ——— Backdrop ——— */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 md:hidden ${
          drawerOpen
            ? 'pointer-events-auto bg-slate-900/40 backdrop-blur-sm'
            : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
        onClick={() => setDrawerOpen(false)}
      />

      {/* ——— Mobile Drawer ——— */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-slate-900 md:hidden ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setDrawerOpen(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/logo_ecomplus.jpeg" alt="Ecom Plus" className="h-8 w-8 rounded-lg object-cover" />
            <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">
              Ecom<span className="text-primary">Plus</span>
            </span>
          </Link>
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Fermer le menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User badge in drawer */}
        {isAuthenticated && user && (
          <div className="mx-3 mt-4">
            <Link
              href={userDashboard}
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-3 rounded-xl bg-primary/5 px-3 py-3 hover:bg-primary/10 transition-colors"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                {user.nom?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-900 dark:text-white">{user.nom}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
                  {user.role === 'admin' || user.role === 'agent' ? 'Administration' : 'Mon Espace'}
                </p>
              </div>
            </Link>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Navigation</p>
          <ul className="space-y-0.5">
            {publicLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Cart link in drawer */}
          <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
            <Link
              href="/panier"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all"
            >
              <ShoppingCart className="h-4.5 w-4.5 shrink-0" />
              <span className="flex-1">Mon Panier</span>
              {cartCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-100 px-3 py-3 dark:border-slate-800">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="h-4.5 w-4.5 shrink-0" />
              Déconnexion
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setDrawerOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
            >
              <User className="h-4 w-4" />
              Se connecter
            </Link>
          )}
        </div>
      </aside>

      {/* ——— Top Navbar ——— */}
      <nav
        className={`sticky top-0 z-30 w-full transition-all duration-300 ${
          scrolled
            ? 'border-b border-slate-200/70 bg-white/90 backdrop-blur-md shadow-sm dark:border-slate-800/70 dark:bg-slate-900/90'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 lg:px-8">
          {/* Hamburger — always top-left */}
          <button
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label={drawerOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={drawerOpen ? 'true' : 'false'}
            title={drawerOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mr-4 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/logo_ecomplus.jpeg" alt="Ecom Plus" className="h-8 w-8 rounded-lg object-cover" />
            <span className="hidden text-[15px] font-bold tracking-tight text-slate-900 dark:text-white sm:block">
              Ecom<span className="text-primary">Plus</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 md:flex">
            {publicLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link
              href="/panier"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              aria-label={`Panier (${cartCount} articles)`}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <>
                <Link
                  href={userDashboard}
                  className="hidden items-center gap-2 rounded-xl bg-primary/8 px-3 py-1.5 text-sm font-semibold text-primary hover:bg-primary/15 transition-colors md:flex dark:bg-primary/10"
                  aria-label="Mon tableau de bord"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden lg:block">
                    {user?.role === 'admin' || user?.role === 'agent' ? 'Admin' : 'Mon espace'}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors md:flex"
                  aria-label="Déconnexion"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:block">Connexion</span>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
