'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Download, Loader2, Calendar, DollarSign, Tag } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { useAuth } from '@/store/useAuth';
import { downloadDevisPDF, ClientQuote } from '@/lib/pdf';

export default function ClientQuotes() {
  const [quotes, setQuotes] = useState<ClientQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const { user } = useAuth();

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

  const handleDownloadPdf = async (quote: ClientQuote) => {
    setDownloadingId(quote.id);
    try {
      await downloadDevisPDF(quote, user?.nom || 'Client Ecom Plus');
      toast.success('Devis téléchargé avec succès !');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du téléchargement du devis');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleAcceptQuote = async (quote: ClientQuote) => {
    setActionId(quote.id);
    try {
      await api.post(`/orders/validate/${quote.id}`);
      toast.success('Félicitations ! Votre devis a été validé et transformé en commande. Vous pouvez maintenant procéder au paiement.');
      fetchQuotes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la validation du devis');
    } finally {
      setActionId(null);
    }
  };

  const handleRejectQuote = async (quote: ClientQuote) => {
    if (!confirm('Voulez-vous vraiment rejeter ce devis ?')) return;
    setActionId(quote.id);
    try {
      await api.post(`/orders/reject/${quote.id}`);
      toast.success('Le devis a été rejeté.');
      fetchQuotes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors du rejet du devis');
    } finally {
      setActionId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VALIDATED':
        return <span className="badge-success">Validé</span>;
      case 'EXPIRED':
        return <span className="badge-danger">Expiré</span>;
      default:
        return <span className="badge-primary">En attente</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mes Devis</h1>
          <p className="page-subtitle">Gérez vos demandes de devis et téléchargez vos documents au format PDF.</p>
        </div>
      </div>

      {quotes.length === 0 ? (
        <div className="card p-12 text-center flex flex-col items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center dark:bg-slate-800 mb-4">
            <FileText className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-white">Aucun devis disponible</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">Ajoutez des produits au panier depuis notre catalogue pour générer un devis.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block table-wrapper">
            <table className="w-full text-left text-sm">
              <thead className="table-head">
                <tr>
                  <th>Référence</th>
                  <th>Date</th>
                  <th>Montant TTC</th>
                  <th>Statut</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {quotes.map((quote) => (
                  <tr key={quote.id}>
                    <td className="font-bold text-slate-900 dark:text-white">{quote.reference}</td>
                    <td className="text-slate-500 dark:text-slate-400">
                      {new Date(quote.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="font-black text-primary">{quote.total_ttc.toLocaleString()} F</td>
                    <td>{getStatusBadge(quote.status)}</td>
                    <td className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => handleDownloadPdf(quote)}
                          disabled={downloadingId === quote.id || actionId === quote.id}
                          className="btn-outline btn-sm inline-flex items-center gap-1.5"
                        >
                          {downloadingId === quote.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Download className="h-3.5 w-3.5" />
                          )}
                          PDF
                        </button>
                        {quote.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleAcceptQuote(quote)}
                              disabled={actionId !== null || downloadingId !== null}
                              className="btn-success btn-sm inline-flex items-center gap-1"
                            >
                              Accepter
                            </button>
                            <button
                              onClick={() => handleRejectQuote(quote)}
                              disabled={actionId !== null || downloadingId !== null}
                              className="btn-danger btn-outline btn-sm inline-flex items-center gap-1"
                            >
                              Rejeter
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Grid/Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {quotes.map((quote) => (
              <div key={quote.id} className="card p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Référence</span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">{quote.reference}</h3>
                  </div>
                  {getStatusBadge(quote.status)}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-50 dark:border-slate-800/40 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{new Date(quote.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-primary font-bold">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>{quote.total_ttc.toLocaleString()} F</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleDownloadPdf(quote)}
                    disabled={downloadingId === quote.id || actionId === quote.id}
                    className="btn-outline w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs"
                  >
                    {downloadingId === quote.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Télécharger PDF
                  </button>
                  {quote.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptQuote(quote)}
                        disabled={actionId !== null || downloadingId !== null}
                        className="btn-success w-full py-2.5 rounded-xl text-xs font-bold"
                      >
                        Accepter
                      </button>
                      <button
                        onClick={() => handleRejectQuote(quote)}
                        disabled={actionId !== null || downloadingId !== null}
                        className="btn-danger btn-outline w-full py-2.5 rounded-xl text-xs font-bold"
                      >
                        Rejeter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
