'use client';

import React, { useEffect, useState } from 'react';
import { Package, Download, Loader2, AlertCircle, Calendar, DollarSign, ArrowUpRight } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { useAuth } from '@/store/useAuth';
import { downloadReceiptPDF, ClientOrder } from '@/lib/pdf';
import Link from 'next/link';

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
    if (status === 'livre') return 'badge-success';
    if (status === 'annule') return 'badge-danger';
    return 'badge-primary';
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
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mes Commandes & Reçus</h1>
          <p className="page-subtitle">Suivez l&apos;évolution de vos livraisons et téléchargez vos reçus officiels.</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="card p-12 text-center flex flex-col items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center dark:bg-slate-800 mb-4">
            <Package className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-white">Aucune commande en cours</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">Dès que vous validez un devis, vos commandes et expéditions apparaîtront ici.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block table-wrapper">
            <table className="w-full text-left text-sm">
              <thead className="table-head">
                <tr>
                  <th>N° Tracking</th>
                  <th>Date</th>
                  <th>Montant TTC</th>
                  <th>Statut</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-bold text-slate-900 dark:text-white">{order.numero_tracking}</td>
                    <td className="text-slate-500 dark:text-slate-400">
                      {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="font-black text-primary">{order.total_ttc.toLocaleString()} F</td>
                    <td>
                      <span className={getStatusColor(order.statut)}>{getStatusLabel(order.statut)}</span>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        {order.statut !== 'annule' && order.statut !== 'devis_envoye' && (
                          <button
                            onClick={() => handleDownloadReceiptPdf(order.id)}
                            disabled={downloadingId === order.id}
                            className="btn-outline btn-sm inline-flex items-center gap-1.5"
                          >
                            {downloadingId === order.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Download className="h-3.5 w-3.5" />
                            )}
                            Reçu PDF
                          </button>
                        )}
                        <Link
                          href={`/suivi/${order.numero_tracking}`}
                          className="btn-primary btn-sm inline-flex items-center gap-1"
                        >
                          Suivre <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Grid/Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {orders.map((order) => (
              <div key={order.id} className="card p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">N° Tracking</span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">{order.numero_tracking}</h3>
                  </div>
                  <span className={getStatusColor(order.statut)}>{getStatusLabel(order.statut)}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-50 dark:border-slate-800/40 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-primary font-bold">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>{order.total_ttc.toLocaleString()} F</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {order.statut !== 'annule' && order.statut !== 'devis_envoye' && (
                    <button
                      onClick={() => handleDownloadReceiptPdf(order.id)}
                      disabled={downloadingId === order.id}
                      className="btn-outline w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs"
                    >
                      {downloadingId === order.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      Reçu PDF
                    </button>
                  )}
                  <Link
                    href={`/suivi/${order.numero_tracking}`}
                    className="btn-primary w-full flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs"
                  >
                    Suivre <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Info Notice */}
      <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 flex gap-3">
        <AlertCircle className="h-5 w-5 text-blue-500 shrink-0" />
        <div className="text-xs text-blue-800 dark:text-blue-300">
          <p className="font-bold mb-0.5">Note sur la génération de vos reçus</p>
          <p>Les documents PDF sont générés de manière sécurisée en local dans votre navigateur. Cela vous évite toute attente réseau ou erreur de téléchargement.</p>
        </div>
      </div>
    </div>
  );
}
