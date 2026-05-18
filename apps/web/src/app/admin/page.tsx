'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import { TrendingUp, Users, ShoppingBag, FileText, ArrowUpRight, AlertCircle, Sparkles } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface DashboardStats {
  kpis: {
    totalOrders: number;
    pendingQuotes: number;
    totalRevenue: number;
    avgOrderValue: number;
    totalVisits?: number;
  };
  soldeAdmin?: number;
  chartData: Array<{ date: string; amount: number }>;
  dailyVisits?: Array<{ date: string; count: number }>;
  dailyLogins?: Array<{ date: string; count: number }>;
}

import api from '@/lib/axios';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get<DashboardStats>('/admin/dashboard-stats');
      setStats(res.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const kpis = [
    { name: 'Visites Globales', value: stats?.kpis.totalVisits || 0, icon: Users, color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/20' },
    { name: 'Commandes', value: stats?.kpis.totalOrders || 0, icon: ShoppingBag, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20' },
    { name: 'Devis en attente', value: stats?.kpis.pendingQuotes || 0, icon: FileText, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20' },
    { name: 'CA Total', value: `${(stats?.kpis.totalRevenue || 0).toLocaleString()} F`, icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20' },
    { name: 'Moyenne / Cmd', value: `${(stats?.kpis.avgOrderValue || 0).toLocaleString()} F`, icon: ArrowUpRight, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20' },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        
        {/* Welcome Admin banner */}
        <div className="relative overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-slate-900 via-primary/95 to-indigo-950 p-6 md:p-8 text-white shadow-xl">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 40%, #ffffff 0%, transparent 40%)' }} />
          <div className="relative z-10 flex flex-col justify-between h-full gap-6 md:flex-row md:items-center">
            <div className="space-y-2 max-w-xl">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white/95 backdrop-blur-sm inline-flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> Espace Administration
              </span>
              <h1 className="text-2xl md:text-3xl font-black">Tableau de Bord</h1>
              <p className="text-xs md:text-sm text-white/70 leading-relaxed">
                Visualisez globalement l&apos;activité d&apos;EcomPlus, gérez l&apos;onboarding, suivez les commissions et pilotez les performances.
              </p>
            </div>
            
            <div className="flex items-center gap-6 self-start md:self-auto">
              {/* Premium Glassmorphic Admin Balance Wallet */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 min-w-[220px] flex flex-col justify-between shadow-lg">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Solde Compte Admin</span>
                <span className="text-2xl font-black mt-2">{(Number(stats?.soldeAdmin) || 0).toLocaleString()} F</span>
                <span className="text-[9px] text-white/50 font-semibold mt-1">Total commissions &amp; devis spéciaux</span>
              </div>

              {/* Animated avatar / graphic */}
              <div className="relative h-24 w-24 shrink-0 hidden md:block animate-float">
                <Image src="/icons/logo_ecomplus.jpeg" alt="EcomPlus Logo" fill className="object-cover rounded-2xl border-2 border-white/20 shadow-md" />
              </div>
            </div>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.name} className="card p-4 flex flex-col justify-between gap-3 hover:-translate-y-0.5 transition-all">
                <div className="flex items-center justify-between">
                  <div className={`rounded-xl p-2 flex items-center justify-center shrink-0 ${kpi.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
                    +12% <ArrowUpRight className="h-2.5 w-2.5" />
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider truncate">{kpi.name}</p>
                  <h3 className="text-lg font-black text-slate-900 mt-1 dark:text-white truncate">{kpi.value}</h3>
                </div>
              </div>
            );
          })}
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Chart */}
          <div className="card p-5 lg:col-span-2 space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest text-slate-400 dark:text-white">Évolution des ventes (30j)</h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.chartData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} tickFormatter={(val) => `${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Action side cards */}
          <div className="space-y-6 lg:col-span-1">
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest text-slate-400 dark:text-white">Alertes urgentes</h3>
              <div className="space-y-3">
                <div className="flex gap-3 rounded-2xl bg-red-50 p-3.5 text-red-700 border border-red-100 dark:bg-red-950/20 dark:border-red-900/30">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black">5 Devis en retard</p>
                    <p className="text-[10px] opacity-80 mt-0.5">Plus de 48h sans modification ou validation client.</p>
                  </div>
                </div>
                <div className="flex gap-3 rounded-2xl bg-amber-50 p-3.5 text-amber-700 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30">
                  <TrendingUp className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black">Objectif mensuel</p>
                    <p className="text-[10px] opacity-80 mt-0.5">Vous avez atteint 85% de l&apos;objectif de ventes.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-5 bg-primary text-white border-0 shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at bottom right, #ffffff 0%, transparent 65%)' }} />
              <h3 className="text-sm font-black uppercase tracking-wider text-white/90">Paliers de Commissions</h3>
              <p className="text-[11px] opacity-75 mt-1">Modifiez la structure de commissionnement du sourcing :</p>
              
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between border-b border-white/10 pb-1.5">
                  <span className="opacity-80">&lt; 350k F</span>
                  <span className="font-black">10%</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-1.5">
                  <span className="opacity-80">350k - 1M F</span>
                  <span className="font-black">15%</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">&gt; 1M F</span>
                  <span className="font-black">20%</span>
                </div>
              </div>
              <button className="mt-5 w-full btn bg-white/20 text-white font-black py-2.5 rounded-xl hover:bg-white/30 transition-all text-xs">
                Modifier les paliers
              </button>
            </div>
          </div>
        </div>

        {/* Double charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Daily Visits */}
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest text-slate-400 dark:text-white">Visites Globales (30j)</h3>
            <div className="h-[200px] w-full">
              {stats?.dailyVisits && stats.dailyVisits.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.dailyVisits}>
                    <defs>
                      <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8'}} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', fontSize: 11 }} />
                    <Area type="monotone" dataKey="count" name="Visites" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVisits)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">Aucune donnée disponible</div>
              )}
            </div>
          </div>

          {/* Daily Logins */}
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest text-slate-400 dark:text-white">Connexions Clients (30j)</h3>
            <div className="h-[200px] w-full">
              {stats?.dailyLogins && stats.dailyLogins.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.dailyLogins}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8'}} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', fontSize: 11 }} />
                    <Bar dataKey="count" name="Connexions" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">Aucune donnée disponible</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
