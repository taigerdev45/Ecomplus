'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Save, Globe, MessageCircle, Image as ImageIcon, CheckCircle, AlertCircle, Eye, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SiteConfig {
  logo_url: string;
  description_services: string;
  footer_text: string;
  whatsapp_service_1: string;
  whatsapp_service_2: string;
  exchange_rate?: number;
  cbm_rate?: number;
}

import api from '@/lib/axios';

export default function AdminConfig() {
  const [config, setConfig] = useState<SiteConfig>({
    logo_url: '',
    description_services: '',
    footer_text: '',
    whatsapp_service_1: '',
    whatsapp_service_2: '',
    exchange_rate: 95,
    cbm_rate: 450000
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.get<{ success: boolean; data: SiteConfig }>('/config');
      if (res.data.success) {
        setConfig(res.data.data || {
          logo_url: '',
          description_services: '',
          footer_text: '',
          whatsapp_service_1: '',
          whatsapp_service_2: '',
          exchange_rate: 95,
          cbm_rate: 450000
        });
      }
    } catch (error) {
      toast.error('Erreur lors du chargement de la configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const res = await api.post<{ success: boolean; data: { logo_url: string }; message?: string }>('/config/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setConfig({ ...config, logo_url: res.data.data.logo_url });
        toast.success('Logo mis à jour');
      } else {
        throw new Error(res.data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put<{ success: boolean; message?: string }>('/config', config);
      if (res.data.success) {
        toast.success('Configuration enregistrée avec succès');
      } else {
        throw new Error(res.data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <AdminLayout>
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Configuration du Site</h1>
            <p className="text-slate-500">Personnalisez l&apos;identité visuelle et les textes publics de votre plateforme.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.open('/', '_blank')}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            >
              <Eye className="h-4 w-4" /> Prévisualiser
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* General Info */}
            <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                <Globe className="h-5 w-5 text-primary" />
                Informations Publiques
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                    Description des Services
                  </label>
                  <textarea
                    rows={5}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-slate-800 dark:bg-slate-950"
                    value={config.description_services}
                    onChange={(e) => setConfig({ ...config, description_services: e.target.value })}
                    placeholder="Décrivez vos services de sourcing et logistique de manière percutante..."
                  />
                  <p className="mt-2 text-xs text-slate-400">Ce texte apparaîtra dans la section Hero de la page d&apos;accueil.</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                    Texte du Footer
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-slate-800 dark:bg-slate-950"
                    value={config.footer_text}
                    onChange={(e) => setConfig({ ...config, footer_text: e.target.value })}
                    placeholder="© 2026 EcomPlus Gabon. Tous droits réservés."
                  />
                </div>
              </div>
            </div>

            {/* WhatsApp Config */}
            <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                <MessageCircle className="h-5 w-5 text-green-500" />
                Support WhatsApp
              </h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                    Service Client 1
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">+</span>
                    <input
                      type="text"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 pl-8 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-slate-800 dark:bg-slate-950"
                      value={config.whatsapp_service_1}
                      onChange={(e) => setConfig({ ...config, whatsapp_service_1: e.target.value })}
                      placeholder="241XXXXXXXX"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                    Service Client 2
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">+</span>
                    <input
                      type="text"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 pl-8 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-slate-800 dark:bg-slate-950"
                      value={config.whatsapp_service_2}
                      onChange={(e) => setConfig({ ...config, whatsapp_service_2: e.target.value })}
                      placeholder="241YYYYYYYY"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Rates & Shipping Config */}
            <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                <Globe className="h-5 w-5 text-amber-500" />
                Tarification & Devis
              </h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                    Taux de change (1 CNY en XAF)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-slate-800 dark:bg-slate-950"
                      value={config.exchange_rate}
                      onChange={(e) => setConfig({ ...config, exchange_rate: Number(e.target.value) })}
                      placeholder="95"
                    />
                    <span className="absolute inset-y-0 right-4 flex items-center text-xs font-bold text-slate-400">FCFA</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">Utilisé pour convertir les prix des produits depuis le Yuan (CNY).</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                    Tarif Transport Maritime (par CBM)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-slate-800 dark:bg-slate-950"
                      value={config.cbm_rate}
                      onChange={(e) => setConfig({ ...config, cbm_rate: Number(e.target.value) })}
                      placeholder="450000"
                    />
                    <span className="absolute inset-y-0 right-4 flex items-center text-xs font-bold text-slate-400">FCFA / m³</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">Tarif au mètre cube (CBM) configuré pour la livraison maritime.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-1">
            {/* Logo Upload */}
            <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                <ImageIcon className="h-5 w-5 text-indigo-500" />
                Identité Visuelle
              </h3>
              
              <div className="flex flex-col items-center gap-6">
                <div className="relative flex h-40 w-full items-center justify-center rounded-3xl bg-slate-50 dark:bg-slate-950 overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-800 group">
                  {config.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={config.logo_url} alt="Logo" className="h-full w-full object-contain p-6" />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-slate-300" />
                      <p className="mt-2 text-xs text-slate-400">Aucun logo</p>
                    </div>
                  )}
                  
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                </div>

                <div className="w-full">
                  <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                    <Upload className="h-4 w-4" />
                    Choisir un fichier
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
                  </label>
                </div>
                
                <div className="w-full space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ou URL directe</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-950"
                    value={config.logo_url}
                    onChange={(e) => setConfig({ ...config, logo_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl shadow-slate-950/20 dark:bg-primary dark:shadow-primary/20">
              <h3 className="text-xl font-bold">Publier</h3>
              <p className="mt-2 text-sm text-slate-400 dark:text-white/80">
                Enregistrez vos modifications pour les rendre visibles sur le site public.
              </p>
              
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-black text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 dark:bg-white dark:text-primary"
                >
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <>
                      <Save className="h-5 w-5" />
                      Enregistrer les modifications
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

