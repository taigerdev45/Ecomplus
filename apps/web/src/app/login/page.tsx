'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import { toast } from 'sonner';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await login({ email, mot_de_passe: password });
      toast.success('Connexion réussie');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-900">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Ecom Plus Gabon
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Connectez-vous à votre espace client
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="block w-full rounded-lg border border-slate-300 py-3 pl-10 pr-3 placeholder-slate-500 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:text-sm"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full rounded-lg border border-slate-300 py-3 pl-10 pr-3 placeholder-slate-500 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:text-sm"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex w-full justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Se connecter'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Pas encore de compte ?{' '}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
