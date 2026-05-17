'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Search, Download, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { downloadReceiptPDF, ClientOrder } from '@/lib/pdf';

interface OrderRow extends ClientOrder {
  client_id?: string;
  clientName?: string;
}

export default function AdminReceiptsPage() {
  const [receipts, setReceipts] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch both orders and clients to map client names
      const [ordersRes, clientsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/admin/clients')
      ]);

      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      const clients = Array.isArray(clientsRes.data) ? clientsRes.data : [];

      // Create a map of client_id -> name
      const clientMap = new Map<string, string>();
      clients.forEach((c: any) => {
        clientMap.set(c.id, c.nom);
      });

      // Filter paid/validated orders and map client name
      const validReceipts = orders
        .filter((o: any) => o.statut !== 'annule' && o.statut !== 'devis_envoye')
        .map((o: any) => ({
          ...o,
          clientName: clientMap.get(o.client_id) || 'Client Ecom Plus'
        }));

      setReceipts(validReceipts);
    } catch (err: any) {
      console.error(err);
      toast.error('Erreur lors du chargement des reçus');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (rec: OrderRow) => {
    try {
      setDownloadingId(rec.id);
      await downloadReceiptPDF(rec, rec.clientName || 'Client Ecom Plus');
      toast.success('Reçu PDF téléchargé avec succès !');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la génération du reçu PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredReceipts = receipts.filter(rec => 
    rec.numero_tracking.toLowerCase().includes(search.toLowerCase()) ||
    (rec.clientName || '').toLowerCase().includes(search.toLowerCase())
  );

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
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <label htmlFor="receipts-search" className="sr-only">Rechercher par numéro de reçu ou client</label>
              <input
                id="receipts-search"
                type="text"
                placeholder="N° reçu ou client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-900 sm:w-64"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm dark:bg-slate-900">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                  <th className="px-6 py-4">N° Tracking</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Montant</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredReceipts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <FileText className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
                      <p>Aucun reçu trouvé.</p>
                    </td>
                  </tr>
                ) : (
                  filteredReceipts.map((rec) => {
                    const reference = `REC-${rec.numero_tracking.replace('ECOM-', '')}`;
                    return (
                      <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-6 py-4 font-mono text-sm font-bold">
                          <span className="text-slate-400 font-normal mr-1">{reference}</span>
                          ({rec.numero_tracking})
                        </td>
                        <td className="px-6 py-4 font-medium">{rec.clientName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          {new Date(rec.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-bold text-primary">
                          {rec.total_ttc.toLocaleString()} F
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            ✓ Payé
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleDownloadReceipt(rec)}
                              disabled={downloadingId === rec.id}
                              aria-label={`Télécharger le reçu ${rec.numero_tracking}`}
                              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800 disabled:opacity-50"
                            >
                              {downloadingId === rec.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" aria-hidden="true" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
