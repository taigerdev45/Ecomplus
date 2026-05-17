'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import { toast } from 'sonner';
import { UserPlus, Mail, Lock, User, Phone, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Les mots de passe ne correspondent pas');
    }

    setIsSubmitting(true);
    try {
      await register({
        nom: formData.nom,
        email: formData.email,
        telephone: formData.telephone,
        mot_de_passe: formData.password,
        role: 'client'
      });
      toast.success('Compte créé avec succès');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-900">
        <div className="text-center flex flex-col items-center">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/logo_ecomplus.jpeg" alt="Logo Ecom Plus Gabon" className="h-20 w-auto object-contain rounded-xl" />
          </div>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Inscription
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Rejoignez Ecom Plus Gabon
          </p>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                name="nom"
                type="text"
                autoComplete="name"
                required
                className="block w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 placeholder-slate-500 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:text-sm"
                placeholder="Nom complet"
                value={formData.nom}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 placeholder-slate-500 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:text-sm"
                placeholder="Adresse email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                name="telephone"
                type="tel"
                autoComplete="tel"
                className="block w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 placeholder-slate-500 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:text-sm"
                placeholder="Téléphone (WhatsApp)"
                value={formData.telephone}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="block w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-10 placeholder-slate-500 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:text-sm"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="block w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-10 placeholder-slate-500 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:text-sm"
                placeholder="Confirmer le mot de passe"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex w-full justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "S&apos;inscrire"
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Déjà un compte ?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
