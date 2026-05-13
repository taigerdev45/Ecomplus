'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Search, Download, FileText, Printer, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminReceiptsPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder fetch
    setTimeout(() => {
      setReceipts([
        { id: '1', reference: 'REC-2026-001', order_ref: 'ECOM-2026-A1B2', client: 'John Doe', amount: 450000, date: '2026-05-12', payment: 'Integral' },
        { id: '2', reference: 'REC-2026-002', order_ref: 'ECOM-2026-C3D4', client: 'Jane Smith', amount: 120000, date: '2026-05-11', payment: 'Partiel' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestion des Reçus</h1>
            <p className="text-slate-500">Suivi des paiements et génération des reçus officiels.</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="N° reçu ou client..." 
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-900 sm:w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm dark:bg-slate-900">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                <th className="px-6 py-4">N° Reçu</th>
                <th className="px-6 py-4">Commande</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Montant</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {receipts.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-mono text-sm font-bold">{rec.reference}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{rec.order_ref}</td>
                  <td className="px-6 py-4 font-medium">{rec.client}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{new Date(rec.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-bold text-primary">{rec.amount.toLocaleString()} F</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800">
                        <Printer className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
