'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Search, Download, FileText, Loader2, Eye, Trash2, X, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { downloadReceiptPDF, ClientOrder } from '@/lib/pdf';
import { useProduct } from '@/store/useProduct';

interface OrderRow extends ClientOrder {
  client_id?: string;
  clientName?: string;
  items?: any[];
  shipping_method?: string;
  shipping_montant?: number;
  commission_montant?: number;
  subtotal_products?: number;
}

export default function AdminReceiptsPage() {
  const [receipts, setReceipts] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Details Modal States
  const [selectedReceipt, setSelectedReceipt] = useState<OrderRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, clientsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/admin/clients')
      ]);

      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      const clients = Array.isArray(clientsRes.data) ? clientsRes.data : [];

      const clientMap = new Map<string, string>();
      clients.forEach((c: any) => {
        clientMap.set(c.id, c.nom);
      });

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

  const handleDeleteReceipt = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce reçu définitivement ?')) {
      try {
        setDeletingId(id);
        await api.delete(`/orders/${id}`);
        toast.success('Reçu supprimé avec succès !');
        fetchData();
      } catch (err: any) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleViewDetails = (rec: OrderRow) => {
    setSelectedReceipt(rec);
    setIsModalOpen(true);
  };

  const filteredReceipts = receipts.filter(rec => 
    rec.numero_tracking.toLowerCase().includes(search.toLowerCase()) ||
    (rec.clientName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestion des Reçus</h1>
            <p className="text-slate-500">Suivi des paiements et génération des reçus officiels.</p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <label htmlFor="receipts-search" className="sr-only">Rechercher par numéro de reçu ou client</label>
            <input
              id="receipts-search"
              type="text"
              placeholder="Rechercher par reçu ou client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-800 dark:bg-slate-900 sm:w-64"
            />
          </div>
        </div>

        {/* List of receipts */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block w-full overflow-x-auto rounded-[2rem] border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <table className="w-full text-left text-sm min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:border-slate-800 dark:bg-slate-950/50">
                    <th className="px-6 py-4">Référence / Tracking</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Date de Paiement</th>
                    <th className="px-6 py-4">Montant</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60 dark:divide-slate-800/60">
                  {filteredReceipts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        <FileText className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
                        <p>Aucun reçu disponible.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredReceipts.map((rec) => {
                      const reference = `REC-${rec.numero_tracking.replace('ECOM-', '')}`;
                      return (
                        <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4.5 font-mono font-semibold">
                            <span className="text-slate-400 font-normal mr-1">{reference}</span>
                            <span className="text-slate-950 dark:text-white">({rec.numero_tracking})</span>
                          </td>
                          <td className="px-6 py-4.5 font-semibold text-slate-900 dark:text-white">{rec.clientName}</td>
                          <td className="px-6 py-4.5 text-slate-500 dark:text-slate-400 text-xs">
                            {new Date(rec.created_at).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4.5 font-black text-slate-950 dark:text-white">
                            {rec.total_ttc.toLocaleString()} FCFA
                          </td>
                          <td className="px-6 py-4.5">
                            <span className="badge badge-success text-[10px] py-0.5">
                              ✓ Payé
                            </span>
                          </td>
                          <td className="px-6 py-4.5 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => handleViewDetails(rec)}
                                aria-label="Voir le reçu"
                                title="Voir le reçu"
                                className="btn-ghost btn-icon p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDownloadReceipt(rec)}
                                disabled={downloadingId === rec.id}
                                aria-label="Télécharger le reçu"
                                title="Télécharger le reçu"
                                className="btn-ghost btn-icon p-1.5 text-slate-400 hover:text-green-600 rounded-lg disabled:opacity-50 transition-colors"
                              >
                                {downloadingId === rec.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Download className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteReceipt(rec.id)}
                                disabled={deletingId === rec.id}
                                aria-label="Supprimer le reçu"
                                title="Supprimer le reçu"
                                className="btn-ghost btn-icon p-1.5 text-slate-400 hover:text-red-600 rounded-lg disabled:opacity-50 transition-colors"
                              >
                                {deletingId === rec.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
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

            {/* Mobile Card View (Highly Responsive) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredReceipts.length === 0 ? (
                <div className="card p-8 text-center text-xs text-slate-400">Aucun reçu trouvé</div>
              ) : (
                filteredReceipts.map((rec) => {
                  const reference = `REC-${rec.numero_tracking.replace('ECOM-', '')}`;
                  return (
                    <div key={rec.id} className="card p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{reference}</span>
                          <h3 className="text-xs font-black text-slate-900 dark:text-white mt-0.5">{rec.numero_tracking}</h3>
                        </div>
                        <span className="badge badge-success text-[9px] py-0.5">✓ Payé</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-50 dark:border-slate-800/40">
                        <div>
                          <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Client</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{rec.clientName}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Date</span>
                          <span className="text-slate-600 dark:text-slate-300">
                            {new Date(rec.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <div className="text-xs">
                          <span className="text-slate-400 font-bold block text-[10px] uppercase">Total</span>
                          <span className="font-black text-primary text-sm">{rec.total_ttc.toLocaleString()} F</span>
                        </div>
                        
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleViewDetails(rec)}
                            className="p-2 text-slate-500 hover:text-indigo-600 bg-slate-50 rounded-xl dark:bg-slate-800"
                            aria-label="Voir le reçu"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadReceipt(rec)}
                            disabled={downloadingId === rec.id}
                            className="p-2 text-slate-500 hover:text-green-600 bg-slate-50 rounded-xl dark:bg-slate-800"
                            aria-label="Télécharger le reçu"
                          >
                            {downloadingId === rec.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteReceipt(rec.id)}
                            disabled={deletingId === rec.id}
                            className="p-2 text-slate-500 hover:text-red-600 bg-slate-50 rounded-xl dark:bg-slate-800"
                            aria-label="Supprimer le reçu"
                          >
                            {deletingId === rec.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      {/* Details Preview Modal */}
      {isModalOpen && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white shadow-xl dark:bg-slate-900 flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Reçu {`REC-${selectedReceipt.numero_tracking.replace('ECOM-', '')}`}
                </h2>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{selectedReceipt.numero_tracking}</p>
              </div>
              <button 
                aria-label="Fermer" 
                title="Fermer" 
                onClick={() => setIsModalOpen(false)} 
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-5 space-y-5">
              
              {/* Client Info Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Client</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white">{selectedReceipt.clientName}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Date d&apos;émission</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white">
                    {new Date(selectedReceipt.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="block text-xs font-black uppercase tracking-wider text-slate-400">Articles Commandés</span>
                <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedReceipt.items?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-slate-50 border flex items-center justify-center shrink-0 text-slate-400 dark:bg-slate-800 dark:border-slate-700">
                          <ShoppingBag className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{item.product?.nom || 'Article'}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">Qté: {item.quantity} | Poids: {item.product?.poids_kg} kg</p>
                        </div>
                      </div>
                      <span className="font-black text-slate-900 dark:text-white shrink-0 ml-3">
                        {Math.round(((item.product?.prix_cny || 0) / 100) * (useProduct.getState().exchangeRate || 95) * item.quantity).toLocaleString()} F
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price breakdown */}
              <div className="space-y-2.5 bg-slate-50/50 dark:bg-slate-800/10 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Sous-total Produits</span>
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {selectedReceipt.subtotal_products ? selectedReceipt.subtotal_products.toLocaleString() : (selectedReceipt.total_ttc - (selectedReceipt.shipping_montant || 0) - (selectedReceipt.commission_montant || 0)).toLocaleString()} F
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Commission Logistique</span>
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {selectedReceipt.commission_montant?.toLocaleString() || '0'} F
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Frais de Livraison ({selectedReceipt.shipping_method === 'AIR_EXPRESS' ? 'Aérien Express' : selectedReceipt.shipping_method === 'AIR_NORMAL' ? 'Aérien Normal' : 'Maritime'})</span>
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {selectedReceipt.shipping_montant?.toLocaleString() || '0'} F
                  </span>
                </div>
                
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2.5 flex justify-between font-black text-sm text-primary">
                  <span>Total TTC</span>
                  <span>{selectedReceipt.total_ttc.toLocaleString()} FCFA</span>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 p-4 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="btn-outline py-2 text-xs"
              >
                Fermer
              </button>
              <button 
                type="button" 
                onClick={() => handleDownloadReceipt(selectedReceipt)}
                disabled={downloadingId === selectedReceipt.id}
                className="btn-primary py-2 text-xs min-w-[120px] inline-flex items-center justify-center gap-1.5"
              >
                {downloadingId === selectedReceipt.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" /> Télécharger Reçu
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </AdminLayout>
  );
}
