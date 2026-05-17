'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Search, Filter, FileText, MessageCircle, MoreVertical, Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { downloadDevisPDF } from '@/lib/pdf';

type QuoteStatus = 'PENDING' | 'VALIDATED' | 'CANCELLED' | 'EXPIRED';

const statusConfig: Record<QuoteStatus, { label: string; color: string }> = {
  PENDING: { label: 'En attente', color: 'badge-warning' },
  VALIDATED: { label: 'Validé', color: 'badge-success' },
  CANCELLED: { label: 'Annulé', color: 'badge-danger' },
  EXPIRED: { label: 'Expiré', color: 'badge-muted' },
};

interface QuoteRow {
  id: string;
  reference: string;
  status: QuoteStatus;
  total_ttc: number;
  created_at: string;
  client?: { nom: string; telephone: string };
  items?: any[];
  subtotal_products?: number;
  commission?: any;
  shipping?: any;
}

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const res = await api.get('/admin/quotes');
      setQuotes(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors du chargement des devis');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (quote: QuoteRow) => {
    try {
      setDownloadingId(quote.id);
      await downloadDevisPDF(quote as any, quote.client?.nom || 'Client Ecom Plus');
      toast.success('Devis téléchargé avec succès !');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredQuotes = Array.isArray(quotes) ? quotes.filter(q => 
    q.reference.toLowerCase().includes(search.toLowerCase()) ||
    q.client?.nom.toLowerCase().includes(search.toLowerCase())
  ) : [];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Gestion des Devis</h1>
            <p className="page-subtitle">Gérez et validez les demandes de devis de vos clients en un clic.</p>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Réf ou client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-900 sm:w-64"
              />
            </div>
            <button className="btn-outline btn-icon py-2 px-2.5 rounded-xl">
              <Filter className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Desktop view */}
        <div className="hidden lg:block table-wrapper">
          <table className="w-full text-left text-sm">
            <thead className="table-head">
              <tr>
                <th>Référence</th>
                <th>Client</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredQuotes.map((quote) => (
                <tr key={quote.id}>
                  <td className="font-mono font-bold text-slate-950 dark:text-white">{quote.reference}</td>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-semibold">{quote.client?.nom}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{quote.client?.telephone}</span>
                    </div>
                  </td>
                  <td className="text-slate-500 dark:text-slate-400">
                    {new Date(quote.created_at).toLocaleDateString()}
                  </td>
                  <td className="font-black text-primary">{quote.total_ttc.toLocaleString()} F</td>
                  <td>
                    <span className={statusConfig[quote.status]?.color}>{statusConfig[quote.status]?.label}</span>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => handleDownloadPdf(quote)}
                        disabled={downloadingId === quote.id}
                        className="btn bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 py-1.5 px-2 rounded-lg text-slate-500 dark:text-slate-400"
                        title="Télécharger PDF"
                      >
                        {downloadingId === quote.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <FileText className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button className="btn bg-green-50 hover:bg-green-100 dark:bg-green-950/20 dark:hover:bg-green-900/30 py-1.5 px-2 rounded-lg text-green-600" title="Relancer WhatsApp">
                        <MessageCircle className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="grid grid-cols-1 gap-4 lg:hidden">
          {filteredQuotes.map((quote) => (
            <div key={quote.id} className="card p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Référence</span>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5">{quote.reference}</h3>
                </div>
                <span className={statusConfig[quote.status]?.color}>{statusConfig[quote.status]?.label}</span>
              </div>

              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white">{quote.client?.nom}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{quote.client?.telephone}</p>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800/40 text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>{new Date(quote.created_at).toLocaleDateString()}</span>
                </div>
                <div className="font-black text-primary">{quote.total_ttc.toLocaleString()} F</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadPdf(quote)}
                  disabled={downloadingId === quote.id}
                  className="btn-outline w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs"
                >
                  {downloadingId === quote.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  PDF
                </button>
                <button className="btn bg-green-50 text-green-600 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs dark:bg-green-950/20">
                  <MessageCircle className="h-4 w-4" /> Relancer
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </AdminLayout>
  );
}
