'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

export default function ValiderDevisPage() {
  const { id } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const validateDevis = async () => {
      try {
        await api.post(`/orders/validate/${id}`);
        setStatus('success');
        toast.success('Votre devis a été validé avec succès !');
      } catch (err: any) {
        setStatus('error');
        setError(err.response?.data?.message || 'Une erreur est survenue lors de la validation.');
      }
    };

    if (id) validateDevis();
  }, [id]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center">
      {status === 'loading' && (
        <div className="space-y-4">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <h1 className="text-2xl font-bold">Validation de votre devis...</h1>
          <p className="text-slate-500">Veuillez patienter quelques instants.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="max-w-md space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Félicitations !</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Votre devis est validé. Une commande a été créée et notre équipe va procéder à l&apos;achat de vos articles.
          </p>
          <div className="pt-6">
            <button 
              onClick={() => router.push('/suivi')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-white transition-all hover:bg-primary/90 shadow-xl shadow-primary/20"
            >
              Suivre mon colis <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="max-w-md space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <AlertTriangle className="h-12 w-12" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Oups !</h1>
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-6 font-semibold text-primary hover:underline"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      )}
    </div>
  );
}
