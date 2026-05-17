'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import { TrendingUp, Users, ShoppingBag, FileText, ArrowUpRight, AlertCircle } from 'lucide-react';
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
  };
  chartData: Array<{ date: string; amount: number }>;
}

import api from '@/lib/axios';
import { toast } from 'sonner';

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
    { name: 'Commandes', value: stats?.kpis.totalOrders || 0, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Devis en attente', value: stats?.kpis.pendingQuotes || 0, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: 'CA Total', value: `${(stats?.kpis.totalRevenue || 0).toLocaleString()} F`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { name: 'Moyenne / Cmd', value: `${(stats?.kpis.avgOrderValue || 0).toLocaleString()} F`, icon: ArrowUpRight, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  if (loading) return <AdminLayout>Chargement...</AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-primary to-primary/80 p-8 text-white shadow-lg">
          <div className="relative z-10">
            <h1 className="text-3xl font-black mb-2">Tableau de Bord</h1>
            <p className="text-white/80 text-lg max-w-xl">Aperçu global de l&apos;activité EcomPlus et pilotage de vos performances en temps réel.</p>
          </div>
          
          {/* Floating Admin Illustration */}
          <div className="absolute right-8 -top-4 z-0 hidden lg:block animate-float">
            <div className="relative h-40 w-40">
              <Image src="/images/admin.png" alt="Admin Dashboard" fill className="object-contain drop-shadow-2xl" />
            </div>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.name} className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div className={`rounded-xl ${kpi.bg} p-3 ${kpi.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                    +12% <ArrowUpRight className="h-3 w-3" />
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-slate-500">{kpi.name}</p>
                  <h3 className="text-2xl font-bold">{kpi.value}</h3>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Chart */}
          <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900 lg:col-span-2">
            <h3 className="mb-6 text-lg font-bold">Évolution des ventes (30j)</h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.chartData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={(val) => `${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side Info */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
              <h3 className="mb-4 text-lg font-bold">Alertes</h3>
              <div className="space-y-4">
                <div className="flex gap-4 rounded-2xl bg-red-50 p-4 text-red-600 dark:bg-red-900/10">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold">5 Devis en retard</p>
                    <p className="text-xs opacity-80">Plus de 48h sans validation.</p>
                  </div>
                </div>
                <div className="flex gap-4 rounded-2xl bg-amber-50 p-4 text-amber-600 dark:bg-amber-900/10">
                  <TrendingUp className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold">Objectif CA</p>
                    <p className="text-xs opacity-80">Vous êtes à 85% de l&apos;objectif mensuel.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-primary p-6 text-white shadow-lg shadow-primary/20">
              <h3 className="text-lg font-bold">Commissions</h3>
              <p className="mt-2 text-sm opacity-80">Configuration actuelle des paliers :</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>&lt; 350k F</span>
                  <span className="font-bold">10%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>350k - 1M F</span>
                  <span className="font-bold">15%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>&gt; 1M F</span>
                  <span className="font-bold">20%</span>
                </div>
              </div>
              <button className="mt-6 w-full rounded-xl bg-white/20 py-3 text-sm font-bold backdrop-blur-md hover:bg-white/30 transition-all">
                Modifier les paliers
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

