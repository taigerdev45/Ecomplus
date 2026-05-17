'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/store/useAuth';
import { Package, FileText, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/axios';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingQuotes: 0,
    activeOrders: 0,
    totalSpent: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [quotesRes, ordersRes] = await Promise.all([
          api.get('/api/v1/orders/client-quotes'),
          api.get('/api/v1/orders/client-orders')
        ]);
        
        const quotes = quotesRes.data;
        const orders = ordersRes.data;

        setStats({
          pendingQuotes: quotes.filter((q: any) => q.status === 'PENDING').length,
          activeOrders: orders.filter((o: any) => o.statut !== 'livre' && o.statut !== 'annule').length,
          totalSpent: orders.reduce((sum: number, o: any) => sum + o.total_ttc, 0)
        });
      } catch (error) {
        console.error("Erreur lors de la récupération des données", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <div className="animate-pulse space-y-6">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>)}
      </div>
    </div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bonjour, {user?.nom}</h1>
        <p className="mt-2 text-slate-500">Bienvenue sur votre espace client Ecom Plus Gabon.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Devis en attente</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{stats.pendingQuotes}</h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
              <FileText className="h-6 w-6" />
            </div>
          </div>
          <Link href="/client/quotes" className="text-sm text-blue-600 font-medium mt-4 inline-block hover:underline">
            Voir mes devis →
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Commandes en cours</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{stats.activeOrders}</h3>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl">
              <Package className="h-6 w-6" />
            </div>
          </div>
          <Link href="/client/orders" className="text-sm text-green-600 font-medium mt-4 inline-block hover:underline">
            Suivre mes commandes →
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total des achats</p>
              <h3 className="text-3xl font-black text-primary mt-2">{stats.totalSpent.toLocaleString()} F</h3>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 dark:bg-primary/10 rounded-2xl p-8 text-center text-white dark:text-slate-900">
        <h2 className="text-2xl font-bold dark:text-primary mb-2">Besoin d&apos;un nouveau produit ?</h2>
        <p className="text-slate-300 dark:text-slate-500 mb-6 max-w-lg mx-auto">
          Parcourez notre catalogue et ajoutez des articles à votre panier pour obtenir une estimation immédiate.
        </p>
        <Link 
          href="/catalogue" 
          className="inline-block bg-white dark:bg-primary text-slate-900 dark:text-white font-bold px-8 py-3 rounded-xl hover:bg-slate-50 transition-all shadow-lg"
        >
          Voir le catalogue
        </Link>
      </div>
    </div>
  );
}
