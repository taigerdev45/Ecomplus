'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Search, Filter, FileText, MessageCircle, MoreVertical, Loader2, Calendar, PlusCircle, Sparkles, User, Package, Calculator, Check, ArrowRight } from 'lucide-react';
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

interface ClientOption {
  id: string;
  nom: string;
  email: string;
  telephone: string;
}

interface CategoryOption {
  id: string;
  nom: string;
}

export default function AdminQuotesPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'special'>('list');
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Form states for Devis Spécial
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null);
  
  const [formData, setFormData] = useState({
    nom: '',
    categorie_id: '',
    description: '',
    prix_cny: '',
    poids_kg: '',
    moq: '1',
    lien_fournisseur: '',
    longueur_m: '',
    largeur_m: '',
    hauteur_m: '',
    couleurs: '',
    image_url: '',
    quantite: '1'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchQuotes();
    fetchFormHelpers();
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

  const fetchFormHelpers = async () => {
    try {
      const [clientsRes, catsRes] = await Promise.all([
        api.get<ClientOption[]>('/admin/clients'),
        api.get<CategoryOption[]>('/products/categories')
      ]);
      setClients(clientsRes.data || []);
      setCategories(catsRes.data || []);
    } catch (err) {
      console.error('Failed to load helpers for form', err);
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

  const handleCreateSpecialQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) {
      return toast.error('Veuillez sélectionner un client.');
    }
    if (!formData.nom || !formData.prix_cny || !formData.quantite) {
      return toast.error('Veuillez remplir les champs obligatoires (Nom de l\'article, Prix CNY, Quantité).');
    }

    setIsSubmitting(true);
    try {
      const payload = {
        client_id: selectedClient.id,
        quantite: Number(formData.quantite),
        nom: formData.nom,
        categorie_id: formData.categorie_id || null,
        description: formData.description,
        prix_cny: Number(formData.prix_cny),
        poids_kg: formData.poids_kg ? Number(formData.poids_kg) : null,
        moq: formData.moq ? Number(formData.moq) : 1,
        lien_fournisseur: formData.lien_fournisseur,
        longueur_m: formData.longueur_m ? Number(formData.longueur_m) : null,
        largeur_m: formData.largeur_m ? Number(formData.largeur_m) : null,
        hauteur_m: formData.hauteur_m ? Number(formData.hauteur_m) : null,
        couleurs: formData.couleurs ? formData.couleurs.split(',').map(c => c.trim()) : [],
        image_url: formData.image_url
      };

      await api.post('/admin/quotes/special', payload);
      toast.success('Devis spécial créé avec succès ! Portefeuilles crédités.');
      
      // Reset form
      setFormData({
        nom: '',
        categorie_id: '',
        description: '',
        prix_cny: '',
        poids_kg: '',
        moq: '1',
        lien_fournisseur: '',
        longueur_m: '',
        largeur_m: '',
        hauteur_m: '',
        couleurs: '',
        image_url: '',
        quantite: '1'
      });
      setSelectedClient(null);
      setClientSearch('');
      setActiveTab('list');
      fetchQuotes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création du devis spécial.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredQuotes = Array.isArray(quotes) ? quotes.filter(q => 
    q.reference.toLowerCase().includes(search.toLowerCase()) ||
    (q.client?.nom || '').toLowerCase().includes(search.toLowerCase())
  ) : [];

  // Filter clients dynamically based on search
  const filteredClients = clients.filter(c => 
    c.nom.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.telephone.includes(clientSearch)
  );

  // Dynamic cost estimates preview:
  const previewExchangeRate = 95;
  const previewSubtotal = Math.round((Number(formData.prix_cny) || 0) * previewExchangeRate * (Number(formData.quantite) || 1));
  let previewCommissionRate = 0.10;
  if (previewSubtotal >= 350000 && previewSubtotal < 1000000) {
    previewCommissionRate = 0.15;
  } else if (previewSubtotal >= 1000000) {
    previewCommissionRate = 0.20;
  }
  const previewCommission = Math.round(previewSubtotal * previewCommissionRate);
  const previewTotal = previewSubtotal + previewCommission;

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Gestion des Devis</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Gérez et concevez les demandes de devis de vos clients en toute simplicité.</p>
          </div>

          {/* Sourcing/Special creation action */}
          {activeTab === 'list' && (
            <button
              onClick={() => setActiveTab('special')}
              className="btn-primary flex items-center gap-2 py-2 px-4 rounded-xl text-xs"
            >
              <PlusCircle className="h-4 w-4" /> Créer un Devis Spécial
            </button>
          )}
        </div>

        {/* Tab System Selector */}
        <div className="flex border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-3 px-6 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'list' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            Liste des Devis
          </button>
          <button
            onClick={() => setActiveTab('special')}
            className={`py-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'special' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            Créer un Devis Spécial
          </button>
        </div>

        {activeTab === 'list' ? (
          <>
            {/* Search and Filters */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par référence ou nom client..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-xs outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-900"
                />
              </div>
              <button aria-label="Filtrer les devis" title="Filtrer les devis" className="btn-outline btn-icon py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900">
                <Filter className="h-4 w-4" />
              </button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block table-wrapper bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-850 overflow-hidden shadow-xs">
              <table className="w-full text-left text-sm">
                <thead className="table-head bg-slate-50 dark:bg-slate-950 px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="p-4">Référence</th>
                    <th className="p-4">Client</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Montant</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredQuotes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-slate-400">Aucun devis trouvé.</td>
                    </tr>
                  ) : (
                    filteredQuotes.map((quote) => (
                      <tr key={quote.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-950 dark:text-white">{quote.reference}</td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{quote.client?.nom}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{quote.client?.telephone}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-500 dark:text-slate-400">
                          {new Date(quote.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="p-4 font-black text-primary">{quote.total_ttc.toLocaleString()} F</td>
                        <td className="p-4">
                          <span className={statusConfig[quote.status]?.color}>{statusConfig[quote.status]?.label}</span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleDownloadPdf(quote)}
                              disabled={downloadingId === quote.id}
                              className="btn bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 py-1.5 px-2.5 rounded-lg text-slate-600 dark:text-slate-300"
                              title="Télécharger PDF"
                            >
                              {downloadingId === quote.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <FileText className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <button className="btn bg-green-50 hover:bg-green-100 dark:bg-green-950/20 dark:hover:bg-green-900/30 py-1.5 px-2.5 rounded-lg text-green-600" title="Relancer WhatsApp">
                              <MessageCircle className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">
              {filteredQuotes.length === 0 ? (
                <div className="text-center p-8 text-slate-400 bg-white dark:bg-slate-900 rounded-3xl">Aucun devis trouvé.</div>
              ) : (
                filteredQuotes.map((quote) => (
                  <div key={quote.id} className="card bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
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
                        className="btn-outline w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800"
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
                ))
              )}
            </div>
          </>
        ) : (
          /* ── CREATE SPECIAL QUOTE FORM ── */
          <form onSubmit={handleCreateSpecialQuote} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Form Fields: Sourced product details */}
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Package className="h-4.5 w-4.5 text-primary" /> Informations sur l&apos;Article Prospecté
                </h2>

                {/* Nom & Catégorie */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Nom de l&apos;article *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Machine de presse hydraulique"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="field"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Catégorie</label>
                    <select
                      value={formData.categorie_id}
                      onChange={(e) => setFormData({ ...formData, categorie_id: e.target.value })}
                      className="field"
                      title="Sélectionner la catégorie"
                    >
                      <option value="">Sélectionner une catégorie...</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.nom}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Description / Spécifications</label>
                  <textarea
                    placeholder="Saisissez les caractéristiques spécifiques (couleurs, matériaux, usage)..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="field h-24 resize-none"
                  />
                </div>

                {/* Prix, MOQ & Poids */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Prix unitaire (CNY) *</label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      placeholder="Ex: 120"
                      value={formData.prix_cny}
                      onChange={(e) => setFormData({ ...formData, prix_cny: e.target.value })}
                      className="field"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Quantité commandée *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Ex: 5"
                      value={formData.quantite}
                      onChange={(e) => setFormData({ ...formData, quantite: e.target.value })}
                      className="field"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Poids unitaire (KG)</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Ex: 2.5"
                      value={formData.poids_kg}
                      onChange={(e) => setFormData({ ...formData, poids_kg: e.target.value })}
                      className="field"
                    />
                  </div>
                </div>

                {/* Lien Fournisseur & Image URL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Lien du fournisseur (Alibaba, Taobao...)</label>
                    <input
                      type="url"
                      placeholder="Ex: https://detail.1688.com/..."
                      value={formData.lien_fournisseur}
                      onChange={(e) => setFormData({ ...formData, lien_fournisseur: e.target.value })}
                      className="field"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">URL d&apos;une photo de l&apos;article</label>
                    <input
                      type="url"
                      placeholder="Ex: https://image.com/photo.jpg"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="field"
                    />
                  </div>
                </div>

                {/* MOQ & Couleurs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Quantité Minimum de Commande (MOQ)</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Ex: 1"
                      title="Quantité Minimum de Commande"
                      value={formData.moq}
                      onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
                      className="field"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Couleurs disponibles (séparées par des virgules)</label>
                    <input
                      type="text"
                      placeholder="Rouge, Bleu, Noir"
                      value={formData.couleurs}
                      onChange={(e) => setFormData({ ...formData, couleurs: e.target.value })}
                      className="field"
                    />
                  </div>
                </div>

                {/* Dimensions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Longueur (m)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 0.5"
                      value={formData.longueur_m}
                      onChange={(e) => setFormData({ ...formData, longueur_m: e.target.value })}
                      className="field"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Largeur (m)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 0.3"
                      value={formData.largeur_m}
                      onChange={(e) => setFormData({ ...formData, largeur_m: e.target.value })}
                      className="field"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Hauteur (m)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 0.8"
                      value={formData.hauteur_m}
                      onChange={(e) => setFormData({ ...formData, hauteur_m: e.target.value })}
                      className="field"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Client selector & Cost dynamic summary */}
            <div className="space-y-6">
              
              {/* Client Selection */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <User className="h-4.5 w-4.5 text-primary" /> Client Destinataire *
                </h2>

                {selectedClient ? (
                  <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{selectedClient.nom}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{selectedClient.telephone} • {selectedClient.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedClient(null)}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      Changer
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Rechercher un client..."
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs outline-none focus:border-primary dark:bg-slate-950 dark:border-slate-800"
                      />
                    </div>
                    
                    <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40 border border-slate-100 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
                      {filteredClients.length === 0 ? (
                        <p className="p-3 text-[10px] text-slate-400 text-center">Aucun client trouvé.</p>
                      ) : (
                        filteredClients.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setSelectedClient(c)}
                            className="w-full text-left p-3 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 transition-colors flex flex-col"
                          >
                            <span className="text-xs font-bold text-slate-850 dark:text-white">{c.nom}</span>
                            <span className="text-[9px] text-slate-400 font-semibold mt-0.5">{c.telephone} • {c.email}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic cost calculations wallet panel */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white border border-white/5 shadow-lg space-y-5">
                <h2 className="text-xs font-black uppercase tracking-wider text-white/55 flex items-center gap-2">
                  <Calculator className="h-4.5 w-4.5 text-primary" /> Estimation du Devis Spécial
                </h2>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-white/60">
                    <span>Taux de change appliqué</span>
                    <span className="font-mono text-white">1 CNY = {previewExchangeRate} FCFA</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Sous-total articles</span>
                    <span className="font-mono text-white">{previewSubtotal.toLocaleString()} F</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Frais logistiques ({Math.round(previewCommissionRate * 100)}%)</span>
                    <span className="font-mono text-white">{previewCommission.toLocaleString()} F</span>
                  </div>
                  <hr className="border-white/10 my-2" />
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold">Montant Total Devis</span>
                    <span className="text-xl font-black text-primary">{previewTotal.toLocaleString()} F</span>
                  </div>
                </div>

                {/* Sourcing wallet notice */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-[10px] text-white/70 leading-relaxed">
                  💡 A l&apos;enregistrement de ce devis spécial, le montant de <span className="font-bold text-white">{previewTotal.toLocaleString()} F</span> sera automatiquement ajouté au solde applicatif du client concerné ({selectedClient?.nom || 'Non sélectionné'}) et crédité dans le solde de l&apos;espace administrateur.
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <>
                      Enregistrer &amp; Créditer Devis <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

            </div>
          </form>
        )}

      </div>
    </AdminLayout>
  );
}
