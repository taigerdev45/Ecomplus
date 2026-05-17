'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  Download, 
  Calendar, 
  PieChart as PieIcon, 
  BarChart3, 
  Users, 
  Percent, 
  Layers, 
  Plane, 
  TrendingUp, 
  Database,
  ArrowUpRight
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface ReportsStats {
  onboarding: {
    roles: Array<{ role: string; count: number }>;
    trend: Array<{ date: string; count: number }>;
  };
  metadata: {
    shipping: Array<{ shipping_method: string; count: number; total_shipping_revenue: number }>;
    commission: { avg_commission_rate: number; total_commission_revenue: number };
    categories: Array<{ category_name: string; product_count: number }>;
    popularProducts: Array<{ nom: string; stock: number; prix_cny: number; poids_kg: number }>;
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get<ReportsStats>('/admin/reports-stats');
      setData(res.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des statistiques de rapports');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!data) return;
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Type de Statistique,Cle,Valeur\n";
      
      // Roles
      data.onboarding.roles.forEach(r => {
        csvContent += `Onboarding - Rôle,${r.role},${r.count}\n`;
      });
      // Commission
      csvContent += `Commission,Taux Moyen,${data.metadata.commission.avg_commission_rate}%\n`;
      csvContent += `Commission,Total Commissions,${data.metadata.commission.total_commission_revenue} F\n`;
      // Categories
      data.metadata.categories.forEach(c => {
        csvContent += `Categories - Catalogue,${c.category_name},${c.product_count} produits\n`;
      });
      // Shipping
      data.metadata.shipping.forEach(s => {
        csvContent += `Livraison - Option,${s.shipping_method},${s.count} colis (${s.total_shipping_revenue} F)\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `rapport_plateforme_ecomplus_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Rapport exporté avec succès !');
    } catch (err) {
      toast.error("Impossible d'exporter les statistiques");
    }
  };

  if (loading) return <AdminLayout>Chargement des statistiques...</AdminLayout>;

  // Compute Total Users
  const totalUsers = data?.onboarding.roles.reduce((acc, curr) => acc + curr.count, 0) || 0;
  // Get main shipping method
  const preferredShipping = data?.metadata.shipping.reduce((prev, current) => (prev.count > current.count) ? prev : current, { shipping_method: 'N/A', count: 0 });

  const kpis = [
    { 
      name: 'Utilisateurs Globaux', 
      value: totalUsers, 
      desc: 'Tous rôles confondus',
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      name: 'Taux Commission Moyen', 
      value: `${Math.round(data?.metadata.commission.avg_commission_rate || 0)}%`, 
      desc: `Total: ${(data?.metadata.commission.total_commission_revenue || 0).toLocaleString()} F`,
      icon: Percent, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50' 
    },
    { 
      name: 'Catégories Catalogue', 
      value: data?.metadata.categories.length || 0, 
      desc: 'Catégories actives',
      icon: Layers, 
      color: 'text-teal-600', 
      bg: 'bg-teal-50' 
    },
    { 
      name: 'Transit Préféré', 
      value: preferredShipping?.shipping_method || 'Aucun', 
      desc: `${preferredShipping?.count || 0} expéditions enregistrées`,
      icon: Plane, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50' 
    },
  ];

  // Convert role names to french for charts
  const roleTranslation: Record<string, string> = {
    client: 'Clients',
    agent: 'Agents',
    secretaire: 'Secrétaires',
    admin: 'Administrateurs'
  };

  const chartRolesData = data?.onboarding.roles.map(r => ({
    name: roleTranslation[r.role] || r.role,
    value: r.count
  })) || [];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black">Rapports & Analyses</h1>
            <p className="text-slate-500">Données approfondies de l&apos;onboarding, préférences logistiques et métadonnées financières.</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold dark:border-slate-800 dark:bg-slate-900">
              <Calendar className="h-4 w-4" />
              Historique Global
            </button>
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              <Download className="h-4 w-4" />
              Exporter (CSV)
            </button>
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.name} className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900 border border-slate-50 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className={`rounded-xl ${kpi.bg} p-3 ${kpi.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                    Actif <ArrowUpRight className="h-3 w-3" />
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-500">{kpi.name}</p>
                  <h3 className="text-2xl font-black mt-1">{kpi.value}</h3>
                  <p className="text-xs text-slate-400 mt-1">{kpi.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* User Onboarding Trend */}
          <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900 lg:col-span-2">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-900/10">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Courbe d&apos;Onboarding Utilisateurs (30j)</h3>
                <p className="text-xs text-slate-400">Nombre cumulé d&apos;inscriptions quotidiennes</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              {data?.onboarding.trend && data.onboarding.trend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.onboarding.trend}>
                    <defs>
                      <linearGradient id="colorOnboarding" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="count" name="Inscriptions" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorOnboarding)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">Aucun onboarding enregistré sur les 30 derniers jours.</div>
              )}
            </div>
          </div>

          {/* User Roles Distribution */}
          <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900 lg:col-span-1">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600 dark:bg-purple-900/10">
                <PieIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Répartition des Rôles</h3>
                <p className="text-xs text-slate-400">Structure de la communauté</p>
              </div>
            </div>
            <div className="h-[260px] w-full">
              {chartRolesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartRolesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartRolesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">Aucune donnée utilisateur.</div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Preferred Shipping Methods */}
          <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-teal-50 p-2.5 text-teal-600 dark:bg-teal-900/10">
                <Plane className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Volume d&apos;expédition par méthode</h3>
                <p className="text-xs text-slate-400">Préférence logistique des clients (colis)</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              {data?.metadata.shipping && data.metadata.shipping.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.metadata.shipping}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="shipping_method" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" name="Colis" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">Aucune expédition enregistrée.</div>
              )}
            </div>
          </div>

          {/* Product Counts per Category */}
          <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-orange-50 p-2.5 text-orange-600 dark:bg-orange-900/10">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Produits Référencés par Catégorie</h3>
                <p className="text-xs text-slate-400">Composition du catalogue produit</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              {data?.metadata.categories && data.metadata.categories.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.metadata.categories}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="category_name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="product_count" name="Produits" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">Aucune catégorie ni produit configuré.</div>
              )}
            </div>
          </div>
        </div>

        {/* Top Sourced Products */}
        <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900 border border-slate-50 dark:border-slate-800">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-rose-50 p-2.5 text-rose-600 dark:bg-rose-900/10">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Top Produits en Stock</h3>
              <p className="text-xs text-slate-400">Produits phares sourcés en Chine actuellement disponibles</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase text-slate-500">
                  <th className="pb-4">Nom du produit</th>
                  <th className="pb-4">Unités en Stock</th>
                  <th className="pb-4">Prix Chine (CNY)</th>
                  <th className="pb-4">Poids Moyen (Kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data?.metadata.popularProducts && data.metadata.popularProducts.length > 0 ? (
                  data.metadata.popularProducts.map((p, index) => (
                    <tr key={index} className="group">
                      <td className="py-4 font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{p.nom}</td>
                      <td className="py-4 text-slate-600 dark:text-slate-300 font-medium">{p.stock} unités</td>
                      <td className="py-4 text-slate-900 dark:text-white font-bold">{p.prix_cny.toLocaleString()} ¥</td>
                      <td className="py-4 text-slate-500 dark:text-slate-400 font-medium">{p.poids_kg} Kg</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-sm text-slate-400">Aucun produit référencé.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
