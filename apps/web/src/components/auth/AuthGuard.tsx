'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import Image from 'next/image';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      await checkAuth();
    };
    verify();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
        <div className="relative flex flex-col items-center">
          {/* Soft pulsing aura backdrop */}
          <div className="absolute -inset-10 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10 animate-pulse" />
          
          {/* Logo card container */}
          <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-[2rem] border-2 border-slate-100/80 bg-white p-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] transition-all hover:scale-105 duration-300">
            <Image
              src="/icons/logo_ecomplus.jpeg"
              alt="Ecom Plus Gabon"
              width={64}
              height={64}
              priority
              className="rounded-2xl object-cover mix-blend-multiply dark:mix-blend-normal"
            />
          </div>

          <h2 className="mt-6 text-base font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Ecom<span className="text-primary">Plus</span> Gabon
          </h2>
          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Sourcing & Logistique
          </p>

          {/* Glowing Spinner */}
          <div className="relative mt-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}
