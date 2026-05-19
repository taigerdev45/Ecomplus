'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import { useCart } from '@/store/useCart';
import api from '@/lib/axios';
import {
  ShoppingCart, LogOut, User, Menu, X,
  LayoutDashboard, Package, Truck, Home, Search,
  Bell, BellRing, MessageSquare, FileText, CreditCard
} from 'lucide-react';

const publicLinks = [
  { name: 'Catalogue', href: '/catalogue', icon: Package },
  { name: 'Suivre un colis', href: '/suivi', icon: Truck },
];

export function Navbar() {
  const pathname = usePathname();
  const isDashboardRoute = pathname.startsWith('/client') || pathname.startsWith('/admin');
  
  const { user, logout, isAuthenticated } = useAuth();
  const { getTotalItems } = useCart();
  const cartCount = getTotalItems();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  // Notifications states
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications');
      const data = res.data as any;
      if (data && data.success) {
        const list = data.data || [];
        setNotifications(list);
        setUnreadCount(list.filter((n: any) => !n.is_read).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchNotifications]);

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleNotifClick = async (notif: any) => {
    if (!notif.is_read) {
      try {
        await api.patch(`/notifications/${notif.id}/read`);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark notification as read', err);
      }
    }
    
    setNotifDropdownOpen(false);
    const isStaff = user?.role === 'admin' || user?.role === 'agent';
    
    if (notif.type === 'chat') {
      router.push(isStaff ? '/admin/chat' : '/client/chat');
    } else {
      router.push(isStaff ? '/admin' : '/client/dashboard');
    }
  };

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

  if (isDashboardRoute) return null;

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

            {/* Notifications Bell */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95 ${
                    notifDropdownOpen || unreadCount > 0
                      ? 'text-primary bg-primary/5 hover:bg-primary/10'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                  aria-label="Notifications"
                >
                  {unreadCount > 0 ? (
                    <BellRing className="h-5 w-5 animate-wiggle" />
                  ) : (
                    <Bell className="h-5 w-5" />
                  )}
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown panel */}
                {notifDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setNotifDropdownOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2.5 z-50 w-80 rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/95 overflow-hidden animate-scale-up">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-black text-slate-900 dark:text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors"
                          >
                            Tout lire
                          </button>
                        )}
                      </div>

                      <div className="mt-2 max-h-64 overflow-y-auto space-y-2.5">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-slate-400">
                            <Bell className="h-8 w-8 mx-auto text-slate-300 mb-1" />
                            <p className="text-[10px] font-semibold">Aucune notification pour le moment</p>
                          </div>
                        ) : (
                          notifications.map((notif) => {
                            let icon = <Bell className="h-3.5 w-3.5" />;
                            let iconBg = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
                            
                            if (notif.type === 'devis') {
                              icon = <FileText className="h-3.5 w-3.5" />;
                              iconBg = 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
                            } else if (notif.type === 'commande') {
                              icon = <Package className="h-3.5 w-3.5" />;
                              iconBg = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400';
                            } else if (notif.type === 'paiement') {
                              icon = <CreditCard className="h-3.5 w-3.5" />;
                              iconBg = 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400';
                            } else if (notif.type === 'chat') {
                              icon = <MessageSquare className="h-3.5 w-3.5" />;
                              iconBg = 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400';
                            }
                            
                            return (
                              <div
                                key={notif.id}
                                onClick={() => handleNotifClick(notif)}
                                className={`flex gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                                  notif.is_read
                                    ? 'bg-transparent border-transparent opacity-65 hover:opacity-100'
                                    : 'bg-primary/[0.03] border-primary/5 hover:bg-primary/[0.06]'
                                }`}
                              >
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                                  {icon}
                                </div>
                                <div className="flex-1 min-w-0 space-y-0.5">
                                  <div className="flex justify-between items-start">
                                    <p className={`text-[11px] font-bold truncate leading-tight ${
                                      notif.is_read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'
                                    }`}>{notif.title}</p>
                                    {!notif.is_read && (
                                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1" />
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-400 leading-snug break-words">{notif.content}</p>
                                  <span className="text-[8px] text-slate-400 font-medium">
                                    {new Date(notif.created_at).toLocaleDateString([], {day: '2-digit', month:'2-digit'})} à {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

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
