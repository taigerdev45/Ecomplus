'use client';

import React, { useState } from 'react';
import { useAuth } from '@/store/useAuth';
import { User, Phone, Mail, Lock, ShieldCheck, Loader2, Save, Eye, EyeOff } from 'lucide-react';
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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mon Profil</h1>
          <p className="page-subtitle">Gérez vos informations de contact et la sécurité de votre compte.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar & Overview card */}
        <div className="lg:col-span-1">
          <div className="card p-6 text-center flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
            
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm mt-4 dark:border-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nom || 'Client')}&background=2563eb&color=fff&size=128&bold=true`} 
                alt={user?.nom} 
                className="w-full h-full object-cover"
              />
            </div>

            <h3 className="text-base font-black text-slate-900 dark:text-white mt-4">{user?.nom}</h3>
            <span className="badge-primary mt-2 uppercase tracking-wider text-[9px] font-black px-3 py-1 rounded-full">
              {user?.role === 'client' ? 'Client EcomPlus' : user?.role}
            </span>

            <div className="w-full mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-left space-y-4">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{user?.telephone || 'Non renseigné'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4 text-slate-400 shrink-0" />
                <span>Compte actif et vérifié</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* General profile form */}
          <div className="card p-6">
            <h3 className="section-title">
              <User className="h-4.5 w-4.5 text-primary" />
              Informations Personnelles
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="nom" className="block text-xs font-black uppercase tracking-wider text-slate-400">
                    Nom Complet
                  </label>
                  <input
                    id="nom"
                    type="text"
                    required
                    value={profileData.nom}
                    onChange={(e) => setProfileData({ ...profileData, nom: e.target.value })}
                    className="field"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="telephone" className="block text-xs font-black uppercase tracking-wider text-slate-400">
                    Numéro de Téléphone
                  </label>
                  <input
                    id="telephone"
                    type="tel"
                    placeholder="Ex: 066XXXXXX"
                    value={profileData.telephone}
                    onChange={(e) => setProfileData({ ...profileData, telephone: e.target.value })}
                    className="field"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  Adresse E-mail (Non modifiable)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="field bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-950 dark:border-slate-800/60"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn-primary flex items-center gap-1.5"
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

          {/* Password change form */}
          <div className="card p-6">
            <h3 className="section-title">
              <Lock className="h-4.5 w-4.5 text-primary" />
              Sécurité & Mot de Passe
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="mot_de_passe_actuel" className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <input
                    id="mot_de_passe_actuel"
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    placeholder="Saisissez votre mot de passe actuel"
                    value={passwordData.mot_de_passe_actuel}
                    onChange={(e) => setPasswordData({ ...passwordData, mot_de_passe_actuel: e.target.value })}
                    className="field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="nouveau_mot_de_passe" className="block text-xs font-black uppercase tracking-wider text-slate-400">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="nouveau_mot_de_passe"
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="Min. 8 caractères"
                      value={passwordData.nouveau_mot_de_passe}
                      onChange={(e) => setPasswordData({ ...passwordData, nouveau_mot_de_passe: e.target.value })}
                      className="field pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="confirm_password" className="block text-xs font-black uppercase tracking-wider text-slate-400">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="confirm_password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Confirmez"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      className="field pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="btn-primary flex items-center gap-1.5"
                >
                  {savingPassword ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
