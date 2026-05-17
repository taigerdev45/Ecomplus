'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/store/useAuth';
import { Package, FileText, CheckCircle2, ShoppingBag, MessageSquare, User, ArrowRight, Loader2 } from 'lucide-react';
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
          api.get('/orders/client-quotes'),
          api.get('/orders/client-orders')
        ]);
        
        interface Quote {
          status: string;
        }
        interface Order {
          statut: string;
          total_ttc: number;
        }

        const quotes = quotesRes.data as Quote[];
        const orders = ordersRes.data as Order[];
        
        setStats({
          pendingQuotes: quotes.filter((q) => q.status === 'PENDING').length,
          activeOrders: orders.filter((o) => o.statut !== 'livre' && o.statut !== 'annule').length,
          totalSpent: orders.reduce((sum: number, o) => sum + o.total_ttc, 0)
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
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Devis en attente',
      value: stats.pendingQuotes,
      desc: 'En attente de validation',
      icon: FileText,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
      link: '/client/quotes'
    },
    {
      title: 'Commandes actives',
      value: stats.activeOrders,
      desc: 'En cours d\'importation',
      icon: Package,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
      link: '/client/orders'
    },
    {
      title: 'Total investi',
      value: `${stats.totalSpent.toLocaleString()} F`,
      desc: 'Total de vos achats',
      icon: CheckCircle2,
      color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
      link: null
    }
  ];

  const quickActions = [
    { title: 'Passer une commande', desc: 'Consulter notre catalogue', icon: ShoppingBag, link: '/catalogue' },
    { title: 'Contacter un agent', desc: 'Une question ? Discutez avec nous', icon: MessageSquare, link: '/client/chat' },
    { title: 'Gérer mon profil', desc: 'Mettre à jour vos coordonnées', icon: User, link: '/client/profil' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-primary/95 to-indigo-950 p-8 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 10% 20%, #ffffff 0%, transparent 40%)' }} />
        <div className="relative z-10 max-w-xl space-y-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white/90 backdrop-blur-sm">
            Portail Client EcomPlus
          </span>
          <h1 className="text-3xl font-black">Bonjour, {user?.nom} !</h1>
          <p className="text-sm text-white/70">
            Bienvenue sur votre espace client Ecom Plus Gabon. Suivez vos devis, factures et colis importés de Chine.
          </p>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="kpi-card justify-between group">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{kpi.title}</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{kpi.value}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${kpi.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-50 dark:border-slate-800/40">
                <span className="text-[11px] font-medium text-slate-400">{kpi.desc}</span>
                {kpi.link && (
                  <Link href={kpi.link} className="text-[11px] font-black text-primary uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Gérer <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Quick Actions ── */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Actions rapides</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} href={action.link} className="card-hover p-5 flex items-start gap-4 group">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors dark:bg-slate-800 dark:text-slate-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{action.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{action.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
