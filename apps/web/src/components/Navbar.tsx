'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/store/useAuth';
import { useCart } from '@/store/useCart';
import { ShoppingCart, LogOut, User, LayoutDashboard, Menu } from 'lucide-react';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { getTotalItems } = useCart();
  const cartCount = getTotalItems();
  const [logoUrl, setLogoUrl] = React.useState<string>('');

  React.useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/config`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.logo_url) {
          setLogoUrl(data.data.logo_url);
        }
      })
      .catch(err => console.error('Failed to load Navbar logo', err));
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-black tracking-tighter text-primary">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
            ) : (
              <>ECOM<span className="text-slate-900 dark:text-white">PLUS</span></>
            )}
          </Link>
          
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/catalogue" className="text-sm font-medium hover:text-primary">Catalogue</Link>
            <Link href="/panier" className="text-sm font-medium hover:text-primary">Panier</Link>
            {isAuthenticated && (user?.role === 'admin' || user?.role === 'agent') && (
              <Link href="/admin/products" className="text-sm font-medium hover:text-primary">Admin</Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="/panier" 
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800"
            aria-label="Voir le panier"
            title="Mon panier"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm shadow-primary/40">
                {cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="hidden flex-col items-end sm:flex">
                <span className="text-xs font-bold leading-none">{user?.nom}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">{user?.role}</span>
              </div>
              <button 
                onClick={() => logout()}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 hover:bg-slate-50 dark:border-slate-800"
                aria-label="Se déconnecter"
                title="Se déconnecter"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="flex h-10 items-center gap-2 rounded-full bg-slate-900 px-6 text-sm font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100">
              <User className="h-4 w-4" /> Connexion
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
