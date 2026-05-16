'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Search, Filter, FileText, MessageCircle, MoreVertical, ExternalLink } from 'lucide-react';
import { Devis } from '@ecom/types';
import { toast } from 'sonner';

type QuoteStatus = 'PENDING' | 'VALIDATED' | 'CANCELLED' | 'EXPIRED';

const statusConfig: Record<QuoteStatus, { label: string; color: string }> = {
  PENDING: { label: 'En attente', color: 'bg-amber-100 text-amber-700' },
  VALIDATED: { label: 'Validé', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Annulé', color: 'bg-red-100 text-red-700' },
  EXPIRED: { label: 'Expiré', color: 'bg-slate-100 text-slate-700' },
};

interface QuoteRow {
  id: string;
  reference: string;
  status: QuoteStatus;
  total_ttc: number;
  created_at: string;
  client?: { nom: string; telephone: string };
}

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/quotes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setQuotes(data);
    } catch (err) {
      toast.error('Erreur lors du chargement des devis');
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotes = quotes.filter(q => 
    q.reference.toLowerCase().includes(search.toLowerCase()) ||
    q.client?.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestion des Devis</h1>
            <p className="text-slate-500">Gérez les demandes de devis et transformez-les en commandes.</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <label htmlFor="quotes-search" className="sr-only">Rechercher par référence ou client</label>
              <input
                id="quotes-search"
                type="text"
                placeholder="Réf ou client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-900 sm:w-64"
              />
            </div>
            <button
              aria-label="Filtrer les devis"
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
            >
              <Filter className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden overflow-hidden rounded-3xl bg-white shadow-sm dark:bg-slate-900 lg:block">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                <th className="px-6 py-4">Référence</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Montant</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredQuotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-mono text-sm font-bold">{quote.reference}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{quote.client?.nom}</span>
                      <span className="text-xs text-slate-500">{quote.client?.telephone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {new Date(quote.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-bold text-primary">
                    {quote.total_ttc.toLocaleString()} F
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase ${statusConfig[quote.status]?.color}`}>
                      {statusConfig[quote.status]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        aria-label={`Voir PDF du devis ${quote.reference}`}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800"
                      >
                        <FileText className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        aria-label={`Renvoyer WhatsApp pour ${quote.reference}`}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-green-600 dark:hover:bg-slate-800"
                      >
                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        aria-label={`Plus d'options pour ${quote.reference}`}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <MoreVertical className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="grid grid-cols-1 gap-4 lg:hidden">
          {filteredQuotes.map((quote) => (
            <div key={quote.id} className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold">{quote.reference}</span>
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${statusConfig[quote.status]?.color}`}>
                  {statusConfig[quote.status]?.label}
                </span>
              </div>
              <div className="mt-4">
                <p className="font-bold">{quote.client?.nom}</p>
                <p className="text-xs text-slate-500">{quote.client?.telephone}</p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <p className="font-bold text-primary">{quote.total_ttc.toLocaleString()} F</p>
                <div className="flex gap-2">
                  <button
                    aria-label={`Télécharger PDF du devis ${quote.reference}`}
                    className="rounded-lg bg-slate-100 p-2 text-slate-600 dark:bg-slate-800"
                  >
                    <FileText className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    aria-label={`Renvoyer WhatsApp pour le devis ${quote.reference}`}
                    className="rounded-lg bg-green-50 p-2 text-green-600 dark:bg-green-900/20"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
