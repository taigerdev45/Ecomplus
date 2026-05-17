'use client';

import React, { useEffect, useState } from 'react';
import { Package, Download, Loader2, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { useAuth } from '@/store/useAuth';
import { downloadReceiptPDF, ClientOrder } from '@/lib/pdf';

export default function ClientOrders() {
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/client-orders');
      setOrders(res.data as ClientOrder[]);
    } catch (error) {
      toast.error('Erreur lors de la récupération des commandes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReceiptPdf = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      toast.error('Commande introuvable');
      return;
    }

    try {
      setDownloadingId(orderId);
      await downloadReceiptPDF(order, user?.nom || 'Client Ecom Plus');
      toast.success('Reçu PDF téléchargé avec succès !');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du téléchargement du reçu PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    if (status === 'livre') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    if (status === 'annule') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'devis_envoye': 'Devis envoyé',
      'en_attente_validation': 'En attente',
      'valide': 'Validé',
      'commande_fournisseur': 'Commandé au fournisseur',
      'en_preparation': 'En préparation',
      'expedie_chine': 'Expédié de Chine',
      'en_transit': 'En transit',
      'arrive_libreville': 'Arrivé à Libreville',
      'en_cours_livraison': 'En cours de livraison',
      'livre': 'Livré',
      'annule': 'Annulé'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mes Commandes & Reçus</h1>
          <p className="text-sm text-slate-500">Suivez l&apos;évolution de vos commandes et téléchargez vos reçus.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Package className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
            <p>Vous n&apos;avez aucune commande pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">N° Tracking</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Montant TTC</th>
                  <th className="px-6 py-4 font-semibold">Statut</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {order.numero_tracking}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">
                      {order.total_ttc.toLocaleString()} F
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.statut)}`}>
                        {getStatusLabel(order.statut)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {order.statut !== 'annule' && order.statut !== 'devis_envoye' && (
                          <button 
                            onClick={() => handleDownloadReceiptPdf(order.id)}
                            disabled={downloadingId === order.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors text-xs disabled:opacity-50"
                          >
                            {downloadingId === order.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Download className="h-3.5 w-3.5" />
                            )}
                            Reçu PDF
                          </button>
                        )}
                        <a 
                          href={`/suivi/${order.numero_tracking}`} 
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors text-xs"
                        >
                          Suivre
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl p-4 flex gap-3">
        <AlertCircle className="h-5 w-5 text-blue-500 shrink-0" />
        <div className="text-sm text-blue-800 dark:text-blue-300">
          <p className="font-semibold mb-1">Information sur vos documents</p>
          <p>Pour des raisons de sécurité et d&apos;optimisation, les reçus sont générés localement et instantanément en haute définition.</p>
        </div>
      </div>
    </div>
  );
}
