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
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<ClientOrder | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
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

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForPayment || !transactionId.trim()) return;

    setIsSubmittingPayment(true);
    try {
      await api.post(`/orders/${selectedOrderForPayment.id}/submit-payment`, {
        transactionId: transactionId.trim()
      });
      toast.success('Paiement soumis avec succès ! Notre équipe va procéder à la vérification sous peu.');
      setSelectedOrderForPayment(null);
      setTransactionId('');
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la soumission du paiement');
    } finally {
      setIsSubmittingPayment(false);
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
    if (status === 'valide') return 'badge-warning';
    return 'badge-primary';
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'devis_envoye': 'Devis envoyé',
      'en_attente_validation': 'En attente',
      'valide': 'En attente de paiement',
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
                        {order.statut === 'valide' && (
                          <button
                            onClick={() => setSelectedOrderForPayment(order)}
                            className="btn-success btn-sm inline-flex items-center gap-1.5 font-bold"
                          >
                            Payer 💸
                          </button>
                        )}
                        {order.statut !== 'annule' && order.statut !== 'devis_envoye' && order.statut !== 'valide' && (
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
                  {order.statut === 'valide' && (
                    <button
                      onClick={() => setSelectedOrderForPayment(order)}
                      className="btn-success w-full flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-bold"
                    >
                      Payer 💸
                    </button>
                  )}
                  {order.statut !== 'annule' && order.statut !== 'devis_envoye' && order.statut !== 'valide' && (
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

      {selectedOrderForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="card w-full max-w-lg p-6 space-y-6 bg-white dark:bg-slate-900 shadow-2xl relative border border-slate-200/50 dark:border-slate-800/50">
            <button
              onClick={() => setSelectedOrderForPayment(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold"
              aria-label="Fermer"
            >
              ×
            </button>

            <div className="text-center">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Procéder au Paiement</h2>
              <p className="text-xs text-slate-400 mt-1">
                Commande N° <span className="font-bold text-primary">{selectedOrderForPayment.numero_tracking}</span> · Montant : <span className="font-black text-primary">{selectedOrderForPayment.total_ttc.toLocaleString()} F</span>
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Choisissez votre méthode de paiement Mobile Money :</p>
              
              {/* Airtel Money Card */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50/50 dark:border-red-950/20 dark:bg-red-950/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-xs shrink-0">
                    Airtel
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">Airtel Money</h3>
                    <p className="text-[10px] text-slate-500">Nom : ECOM PLUS GABON</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">+241 77 00 00 00</span>
                  <span className="text-[9px] text-red-600 font-bold bg-red-100 dark:bg-red-950 px-1.5 py-0.5 rounded">Recommandé</span>
                </div>
              </div>

              {/* Moov Money Card */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-blue-100 bg-blue-50/50 dark:border-blue-950/20 dark:bg-blue-950/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs shrink-0">
                    Moov
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">Moov Money</h3>
                    <p className="text-[10px] text-slate-500">Nom : ECOM PLUS GABON</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">+241 66 00 00 00</span>
                  <span className="text-[9px] text-blue-600 font-bold bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded">Disponible</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div>
                <label htmlFor="txn-id" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Référence de la transaction (ID de transaction)
                </label>
                <input
                  id="txn-id"
                  type="text"
                  required
                  placeholder="Ex : TXN123456789 ou Numéro de dépôt"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="field"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForPayment(null)}
                  className="btn-outline w-full py-3 rounded-xl font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="btn-success w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  {isSubmittingPayment ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Confirmer le paiement 💰'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
