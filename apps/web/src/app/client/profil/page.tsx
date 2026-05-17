'use client';

import React, { useState } from 'react';
import { useAuth } from '@/store/useAuth';
import { User, Phone, Mail, Lock, ShieldCheck, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

export default function ClientProfile() {
  const { user, checkAuth } = useAuth();
  const [profileData, setProfileData] = useState({
    nom: user?.nom || '',
    telephone: user?.telephone || '',
  });

  const [passwordData, setPasswordData] = useState({
    mot_de_passe_actuel: '',
    nouveau_mot_de_passe: '',
    confirm_password: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.nom.trim()) {
      toast.error('Le nom est requis');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', {
        nom: profileData.nom,
        telephone: profileData.telephone,
      });

      const data = res.data as { success: boolean; message?: string };
      if (data.success) {
        toast.success('Informations personnelles mises à jour');
        await checkAuth(); // Re-sync auth store
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.mot_de_passe_actuel) {
      toast.error('Veuillez saisir votre mot de passe actuel');
      return;
    }
    if (passwordData.nouveau_mot_de_passe.length < 8) {
      toast.error('Le nouveau mot de passe doit faire au moins 8 caractères');
      return;
    }
    if (passwordData.nouveau_mot_de_passe !== passwordData.confirm_password) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await api.put('/auth/profile', {
        mot_de_passe_actuel: passwordData.mot_de_passe_actuel,
        nouveau_mot_de_passe: passwordData.nouveau_mot_de_passe,
      });

      const data = res.data as { success: boolean; message?: string };
      if (data.success) {
        toast.success('Votre mot de passe a été modifié avec succès');
        setPasswordData({
          mot_de_passe_actuel: '',
          nouveau_mot_de_passe: '',
          confirm_password: '',
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Mot de passe actuel incorrect');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Mon Profil</h1>
        <p className="mt-2 text-slate-500">Gérez vos informations de contact et la sécurité de votre compte.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card & Info overview */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-center relative overflow-hidden">
            {/* Emerald ambient accent */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/80 to-primary"></div>
            
            <div className="relative w-24 h-24 mx-auto mt-4 rounded-full overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nom || 'Client')}&background=10b981&color=fff&size=150`} 
                alt={user?.nom} 
                className="w-full h-full object-cover"
              />
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-4">{user?.nom}</h3>
            <p className="text-xs font-bold text-primary bg-primary/10 uppercase px-3 py-1 rounded-full inline-block mt-2 tracking-wider">
              {user?.role === 'client' ? 'Client ecomplus' : user?.role}
            </p>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-left space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{user?.telephone || 'Non renseigné'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <ShieldCheck className="h-4 w-4 text-slate-400 shrink-0" />
                <span>Compte sécurisé et actif</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Form: General info */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informations Personnelles
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nom-complet" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Nom Complet
                  </label>
                  <input
                    id="nom-complet"
                    type="text"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 p-4 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                    value={profileData.nom}
                    onChange={(e) => setProfileData({ ...profileData, nom: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="telephone-input" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Numéro de Téléphone
                  </label>
                  <input
                    id="telephone-input"
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 p-4 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                    placeholder="Ex: 066XXXXXX"
                    value={profileData.telephone}
                    onChange={(e) => setProfileData({ ...profileData, telephone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email-input" className="block text-sm font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider text-xs">
                  Adresse E-mail (Non modifiable)
                </label>
                <input
                  id="email-input"
                  type="email"
                  disabled
                  className="w-full rounded-xl border border-slate-100 bg-slate-100/50 dark:bg-slate-950/20 dark:border-slate-800/50 p-4 text-sm text-slate-400 cursor-not-allowed"
                  value={user?.email || ''}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {savingProfile ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>

          {/* Form: Password */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Sécurité & Mot de Passe
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label htmlFor="mot-passe-actuel" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Mot de passe actuel
                </label>
                <input
                  id="mot-passe-actuel"
                  type="password"
                  required
                  placeholder="Saisissez votre mot de passe actuel"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 p-4 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                  value={passwordData.mot_de_passe_actuel}
                  onChange={(e) => setPasswordData({ ...passwordData, mot_de_passe_actuel: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nouveau-mot-passe" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    id="nouveau-mot-passe"
                    type="password"
                    required
                    placeholder="Min. 8 caractères"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 p-4 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                    value={passwordData.nouveau_mot_de_passe}
                    onChange={(e) => setPasswordData({ ...passwordData, nouveau_mot_de_passe: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="confirm-nouveau-mot-passe" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    id="confirm-nouveau-mot-passe"
                    type="password"
                    required
                    placeholder="Confirmez le mot de passe"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 p-4 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {savingPassword ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Mettre à jour le mot de passe
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
