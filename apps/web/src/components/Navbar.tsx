'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import { useCart } from '@/store/useCart';
import { ShoppingCart, LogOut, User, LayoutDashboard, Menu } from 'lucide-react';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { getTotalItems } = useCart();
  const cartCount = getTotalItems();
  const [logoUrl, setLogoUrl] = React.useState<string>('');
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  React.useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/config`)
      .then(res => {
        if (!res.ok) throw new Error('Config not found');
        return res.json();
      })
      .then(data => {
        if (data.success && data.data.logo_url) {
          setLogoUrl(data.data.logo_url);
        }
      })
      .catch(err => console.error('Failed to load Navbar logo', err));
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-black tracking-tighter text-primary transition-transform hover:scale-105 active:scale-95">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain drop-shadow-sm" />
            ) : (
              <>ECOM<span className="text-foreground">PLUS</span></>
            )}
          </Link>
          
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/catalogue" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Catalogue</Link>
            <Link href="/panier" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Panier</Link>
            {isAuthenticated && (
              <Link 
                href={user?.role === 'admin' || user?.role === 'agent' ? '/admin/products' : '/client/dashboard'} 
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {user?.role === 'admin' || user?.role === 'agent' ? 'Admin' : 'Mon Espace'}
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="/panier" 
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-all hover:bg-secondary/80 hover:scale-105 active:scale-95"
            aria-label="Voir le panier"
            title="Mon panier"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 animate-slide-up items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm shadow-primary/40">
                {cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href={user?.role === 'admin' || user?.role === 'agent' ? '/admin/products' : '/client/dashboard'}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-muted transition-all duration-200"
                title="Accéder à mon espace"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm shadow-inner">
                  {user?.nom?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden flex-col items-start sm:flex text-left">
                  <span className="text-xs font-bold leading-none text-slate-800 dark:text-slate-200">{user?.nom}</span>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">{user?.role === 'client' ? 'Client' : user?.role}</span>
                </div>
              </Link>
              <button 
                onClick={handleLogout}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background transition-all hover:bg-muted hover:scale-105 active:scale-95"
                aria-label="Se déconnecter"
                title="Se déconnecter"
              >
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="flex h-10 items-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-105 active:scale-95">
              <User className="h-4 w-4" /> Connexion
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
