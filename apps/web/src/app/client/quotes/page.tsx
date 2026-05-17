'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Download, Loader2, RefreshCw } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface ClientQuote {
  id: string;
  reference: string;
  created_at: string;
  total_ttc: number;
  status: string;
  pdf_url?: string;
}

export default function ClientQuotes() {
  const [quotes, setQuotes] = useState<ClientQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const res = await api.get('/orders/client-quotes');
      setQuotes(res.data as ClientQuote[]);
    } catch (error) {
      toast.error('Erreur lors de la récupération des devis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegeneratePdf = async (id: string) => {
    setRegeneratingId(id);
    try {
      const res = await api.post(`/orders/quotes/${id}/regenerate-pdf`);
      toast.success((res.data as { message?: string }).message || 'Génération lancée');
      
      // On recharge la liste après quelques secondes pour voir si l'URL est mise à jour
      setTimeout(() => {
        fetchQuotes();
      }, 5000);
    } catch (error) {
      toast.error('Erreur lors de la régénération du devis');
    } finally {
      setRegeneratingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mes Devis</h1>
          <p className="text-sm text-slate-500">Gérez vos demandes de devis et téléchargez les PDF.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {quotes.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
            <p>Vous n&apos;avez aucun devis pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Référence</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Montant TTC</th>
                  <th className="px-6 py-4 font-semibold">Statut</th>
                  <th className="px-6 py-4 font-semibold text-right">Document</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {quote.reference}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {new Date(quote.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">
                      {quote.total_ttc.toLocaleString()} F
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                        quote.status === 'VALIDATED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        quote.status === 'EXPIRED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {quote.status === 'VALIDATED' ? 'Validé' : quote.status === 'EXPIRED' ? 'Expiré' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {quote.pdf_url ? (
                        <a 
                          href={quote.pdf_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors text-xs"
                        >
                          <Download className="h-4 w-4" />
                          Télécharger PDF
                        </a>
                      ) : (
                        <button 
                          onClick={() => handleRegeneratePdf(quote.id)}
                          disabled={regeneratingId === quote.id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-medium transition-colors text-xs disabled:opacity-50"
                        >
                          {regeneratingId === quote.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                          Générer PDF
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
