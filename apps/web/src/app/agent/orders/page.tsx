'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/store/useAuth';
import { Package, Search, Filter, ChevronRight, Camera, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { Order, OrderStatus } from '@ecom/types';
import { toast } from 'sonner';

const statusLabels: Record<OrderStatus, string> = {
  devis_envoye: 'Devis envoyé',
  en_attente_validation: 'En attente validation',
  valide: 'Validée',
  commande_fournisseur: 'Chez fournisseur',
  en_preparation: 'En préparation',
  expedie_chine: 'Expédié Chine',
  en_transit: 'En transit',
  arrive_libreville: 'Arrivé Libreville',
  en_cours_livraison: 'Livraison locale',
  livre: 'Livrée',
  annule: 'Annulée',
};

export default function AgentOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [comment, setComment] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    setUpdating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/${selectedOrder.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          statut: newStatus,
          commentaire: comment,
          photos: [] // Placeholder for actual upload
        })
      });

      if (!res.ok) throw new Error();
      
      toast.success('Statut mis à jour');
      setSelectedOrder(null);
      setNewStatus('');
      setComment('');
      fetchOrders();
    } catch (err) {
      toast.error('Erreur de mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestion des Commandes</h1>
            <p className="text-slate-500">Agent : {user?.nom}</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Chercher tracking..." 
                className="rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-900"
              />
            </div>
            <button className="rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* List */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : orders.map(order => (
              <div 
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`cursor-pointer rounded-2xl border-2 p-5 transition-all ${
                  selectedOrder?.id === order.id ? 'border-primary bg-white shadow-lg' : 'border-transparent bg-white hover:border-slate-200 shadow-sm dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                      <Package className="h-6 w-6 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-mono text-sm font-bold uppercase">{order.numero_tracking}</p>
                      <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="font-bold text-primary">{order.total_ttc.toLocaleString()} F</p>
                      <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {statusLabels[order.statut]}
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Details & Action */}
          <div className="lg:col-span-1">
            {selectedOrder ? (
              <div className="sticky top-8 rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-900">
                <h2 className="text-xl font-bold">Détails Commande</h2>
                <div className="mt-6 space-y-4">
                  <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                    <p className="text-xs text-slate-500 uppercase">Statut Actuel</p>
                    <p className="font-bold text-slate-900 dark:text-white">{statusLabels[selectedOrder.statut]}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mettre à jour le statut</label>
                    <select 
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-900"
                    >
                      <option value="">Sélectionner un statut...</option>
                      {Object.entries(statusLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Commentaire</label>
                    <textarea 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Ex: Colis chargé dans le container..."
                      className="h-24 w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Photos (Optionnel)</label>
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 p-6 text-slate-400 hover:border-primary hover:text-primary dark:border-slate-800">
                      <Camera className="h-6 w-6" />
                      <span>Ajouter des photos</span>
                    </button>
                  </div>

                  <button 
                    onClick={handleUpdateStatus}
                    disabled={updating || !newStatus}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-white transition-all hover:bg-primary/90 disabled:opacity-50"
                  >
                    {updating ? 'Mise à jour...' : 'Confirmer le changement'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 text-center text-slate-400 dark:border-slate-800">
                <CheckCircle2 className="mb-4 h-12 w-12" />
                <p>Sélectionnez une commande pour la gérer</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
