'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Package, MapPin, Calendar, CheckCircle2, Clock, AlertCircle, Camera } from 'lucide-react';
import { OrderStatus } from '@ecom/types';

interface OrderStep {
  id: string;
  statut: OrderStatus;
  commentaire: string;
  photos: string[];
  created_at: string;
}

interface OrderDetails {
  numero_tracking: string;
  statut: OrderStatus;
  date_livraison_estimee: string;
  steps: OrderStep[];
  client: { nom: string };
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  devis_envoye: { label: 'Devis envoyé', color: 'bg-slate-400', icon: Clock },
  en_attente_validation: { label: 'En attente de validation', color: 'bg-amber-500', icon: Clock },
  valide: { label: 'Commande validée', color: 'bg-green-500', icon: CheckCircle2 },
  commande_fournisseur: { label: 'Commandé chez le fournisseur', color: 'bg-blue-500', icon: Package },
  en_preparation: { label: 'En préparation', color: 'bg-blue-500', icon: Package },
  expedie_chine: { label: 'Expédié de Chine', color: 'bg-indigo-500', icon: MapPin },
  en_transit: { label: 'En transit', color: 'bg-indigo-500', icon: MapPin },
  arrive_libreville: { label: 'Arrivé à Libreville', color: 'bg-green-600', icon: MapPin },
  en_cours_livraison: { label: 'En cours de livraison', color: 'bg-green-600', icon: MapPin },
  livre: { label: 'Livré', color: 'bg-green-700', icon: CheckCircle2 },
  annule: { label: 'Annulé', color: 'bg-red-500', icon: AlertCircle },
};

export default function TrackingPage() {
  const { tracking } = useParams();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/tracking/${tracking}`);
        if (!res.ok) throw new Error('Numéro de suivi non trouvé');
        const data = await res.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
  }, [tracking]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );

  if (error || !order) return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <AlertCircle className="mb-4 h-16 w-16 text-red-500" />
      <h1 className="text-2xl font-bold">Oups !</h1>
      <p className="mt-2 text-slate-600">{error || 'Commande introuvable'}</p>
      <a href="/catalogue" className="mt-6 font-semibold text-primary hover:underline">Retour au catalogue</a>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-12 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-primary px-4 py-12 text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold">Suivi de commande</h1>
          <p className="mt-2 opacity-90">Numéro : <span className="font-mono font-bold uppercase">{order.numero_tracking}</span></p>
          
          <div className="mt-8 flex flex-wrap gap-4 rounded-2xl bg-white/10 p-6 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5" />
              <div>
                <p className="text-xs opacity-70 uppercase">Livraison estimée</p>
                <p className="font-semibold">{new Date(order.date_livraison_estimee).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="h-10 w-px bg-white/20 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5" />
              <div>
                <p className="text-xs opacity-70 uppercase">Statut actuel</p>
                <p className="font-semibold">{statusConfig[order.statut]?.label}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="mx-auto mt-[-2rem] max-w-3xl px-4">
        <div className="rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-900 lg:p-10">
          <h2 className="mb-8 text-xl font-bold">Historique du colis</h2>
          
          <div className="relative space-y-12">
            {/* Vertical Line */}
            <div className="absolute left-[1.4rem] top-2 h-[calc(100%-2rem)] w-0.5 bg-slate-200 dark:bg-slate-800"></div>

            {order.steps.slice().reverse().map((step, idx) => {
              const config = statusConfig[step.statut];
              const Icon = config.icon;
              const isLatest = idx === 0;

              return (
                <div key={step.id} className="relative pl-12">
                  {/* Dot */}
                  <div className={`absolute left-0 top-1 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white shadow-md dark:border-slate-900 ${config.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className={`font-bold ${isLatest ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                        {config.label}
                      </h3>
                      <span className="text-xs text-slate-500">
                        {new Date(step.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {step.commentaire && (
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {step.commentaire}
                      </p>
                    )}
                    
                    {step.photos && step.photos.length > 0 && (
                      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                        {step.photos.map((url, i) => (
                          <div key={i} className="group relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                            <img src={url} alt={`Étape ${step.statut}`} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                              <Camera className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 rounded-2xl bg-slate-50 p-6 text-center dark:bg-slate-800/50">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Vous souhaitez recevoir les mises à jour automatiquement ?
            </p>
            <button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-bold text-white transition-all hover:bg-green-600 shadow-lg shadow-green-500/20">
              Recevoir les màj par WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
