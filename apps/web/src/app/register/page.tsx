'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import { toast } from 'sonner';
import { UserPlus, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
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
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
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
                type="password"
                required
                className="block w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 placeholder-slate-500 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:text-sm"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                name="confirmPassword"
                type="password"
                required
                className="block w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 placeholder-slate-500 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:text-sm"
                placeholder="Confirmer le mot de passe"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
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
