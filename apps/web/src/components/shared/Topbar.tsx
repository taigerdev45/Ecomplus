'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Bell, Check, Trash2, MessageSquare, ShoppingBag, CreditCard, AlertTriangle, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/store/useAuth';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface TopbarProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
  rightSlot?: React.ReactNode;
  showSearch?: boolean;
}

interface NotificationItem {
  id: string;
  title: string;
  content: string;
  type: 'devis' | 'commande' | 'paiement' | 'chat' | 'systeme';
  is_read: boolean;
  created_at: string;
}

export default function Topbar({ onMenuClick, isSidebarOpen, rightSlot, showSearch }: TopbarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 25000); // Poll every 25s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Erreur lors du traitement');
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification supprimée');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'devis':
        return <Eye className="h-4 w-4 text-indigo-500" />;
      case 'commande':
        return <ShoppingBag className="h-4 w-4 text-emerald-500" />;
      case 'paiement':
        return <CreditCard className="h-4 w-4 text-amber-500" />;
      case 'chat':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-slate-500" />;
    }
  };

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

        {/* Dynamic Notifications Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" aria-hidden="true" />
            )}
          </button>

          {/* Premium Dropdown */}
          {isOpen && (
            <div className="absolute right-0 mt-2.5 w-80 rounded-3xl border border-slate-100 bg-white/95 shadow-xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/95 z-50 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllAsRead}
                    className="text-[10px] font-bold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" /> Tout lire
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100/60 dark:divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    <Bell className="mx-auto h-8 w-8 text-slate-200 dark:text-slate-800 mb-2" />
                    Aucune notification
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => handleMarkAsRead(n.id)}
                      className={`flex gap-3 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-all relative ${!n.is_read ? 'bg-indigo-500/5' : ''}`}
                    >
                      <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                        {getNotificationIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <p className={`text-xs text-slate-900 dark:text-white truncate ${!n.is_read ? 'font-black' : 'font-medium'}`}>
                          {n.title}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                          {n.content}
                        </p>
                        <span className="text-[9px] text-slate-400 font-semibold mt-1 block">
                          {new Date(n.created_at).toLocaleDateString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {/* Delete notification */}
                      <button
                        onClick={(e) => handleDeleteNotification(n.id, e)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 focus:opacity-100 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-red-500 transition-all"
                        aria-label="Supprimer notification"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
