'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, ArrowRight, Loader2, Globe, Truck } from 'lucide-react';

export default function SuiviLanding() {
  const [tracking, setTracking] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tracking.trim()) return;
    
    setLoading(true);
    router.push(`/suivi/${tracking.trim()}`);
  };

  return (
    <div className="flex min-h-[calc(100-64px)] flex-col bg-white dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 py-20">
        <div className="relative mb-12 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-primary/10 text-primary">
          <div className="absolute inset-0 animate-ping rounded-[2rem] bg-primary/20 opacity-20"></div>
          <Package className="h-10 w-10" />
        </div>

        <div className="max-w-2xl text-center">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-6xl">
            Où est votre <span className="text-primary">colis</span> ?
          </h1>
          <p className="mt-6 text-lg text-slate-500 dark:text-slate-400">
            Entrez votre numéro de tracking (ex: ECOM-2026-X7K9) pour suivre l&apos;acheminement de votre commande en temps réel depuis la Chine.
          </p>
        </div>

        <form onSubmit={handleSearch} className="mt-12 w-full max-w-lg">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-6 text-slate-400 group-focus-within:text-primary transition-colors">
              <Search className="h-6 w-6" />
            </div>
            <input
              type="text"
              value={tracking}
              onChange={(e) => setTracking(e.target.value.toUpperCase())}
              placeholder="ECOM-YYYY-XXXX"
              className="h-20 w-full rounded-[2rem] border-2 border-slate-100 bg-slate-50 pl-16 pr-32 text-xl font-bold uppercase tracking-wider outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 dark:border-slate-800 dark:bg-slate-900 dark:focus:border-primary dark:focus:bg-slate-950"
              required
            />
            <button
              type="submit"
              disabled={loading || !tracking}
              className="absolute right-3 top-3 flex h-14 items-center gap-2 rounded-[1.5rem] bg-primary px-6 font-bold text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <>
                  Suivre <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-20 grid grid-cols-1 gap-12 border-t border-slate-100 pt-20 dark:border-slate-800 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="font-bold">Préparation</h3>
            <p className="mt-1 text-sm text-slate-500">Validation fournisseur</p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="font-bold">En Transit</h3>
            <p className="mt-1 text-sm text-slate-500">Chine vers Gabon</p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400">
              <Truck className="h-6 w-6" />
            </div>
            <h3 className="font-bold">Libreville</h3>
            <p className="mt-1 text-sm text-slate-500">Livraison à domicile</p>
          </div>
        </div>
      </div>
    </div>
  );
}
