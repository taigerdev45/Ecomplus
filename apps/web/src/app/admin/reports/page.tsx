'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Download, Filter, Calendar, PieChart as PieIcon, BarChart3 } from 'lucide-react';
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
  CartesianGrid
} from 'recharts';

const categoryData = [
  { name: 'Électronique', value: 4500000 },
  { name: 'Vêtements', value: 2800000 },
  { name: 'Maison', value: 1500000 },
  { name: 'Beauté', value: 1200000 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const topProducts = [
  { id: 1, name: 'iPhone 15 Pro', sales: 124, revenue: 18600000, growth: '+15%' },
  { id: 2, name: 'MacBook Air M2', sales: 85, revenue: 12750000, growth: '+8%' },
  { id: 3, name: 'AirPods Pro 2', sales: 210, revenue: 4200000, growth: '+24%' },
  { id: 4, name: 'Sony WH-1000XM5', sales: 56, revenue: 2800000, growth: '-2%' },
];

export default function AdminReportsPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Rapports & Analyses</h1>
            <p className="text-slate-500">Analysez la performance par catégorie et par produit.</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold dark:border-slate-800 dark:bg-slate-900">
              <Calendar className="h-4 w-4" />
              Ce mois
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2 text-sm font-bold text-white transition-all hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Download className="h-4 w-4" />
              Exporter (CSV)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Category Distribution */}
          <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/10">
                <PieIcon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">Répartition par Catégorie</h3>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Bar Chart */}
          <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-green-50 p-2 text-green-600 dark:bg-green-900/10">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">CA par Catégorie (F XAF)</h3>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={(val) => `${val/1000000}M`} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Products Table */}
        <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <h3 className="mb-6 text-lg font-bold">Top Produits Performants</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase text-slate-500 dark:border-slate-800">
                  <th className="pb-4">Produit</th>
                  <th className="pb-4">Ventes</th>
                  <th className="pb-4">Chiffre d&apos;Affaires</th>
                  <th className="pb-4">Croissance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {topProducts.map((p) => (
                  <tr key={p.id} className="group">
                    <td className="py-4 font-medium group-hover:text-primary transition-colors">{p.name}</td>
                    <td className="py-4">{p.sales} unités</td>
                    <td className="py-4 font-bold">{p.revenue.toLocaleString()} F</td>
                    <td className={`py-4 font-bold ${p.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {p.growth}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
