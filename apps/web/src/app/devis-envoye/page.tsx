'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { PDFPreview } from '@/components/PDFPreview';

function SuccessContent() {
  const searchParams = useSearchParams();
  const pdfUrl = searchParams.get('pdf');
  const reference = searchParams.get('ref');

  return (
    <div className="min-h-screen bg-slate-50 py-12 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="h-16 w-16" />
          </div>
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 dark:text-white md:text-4xl">
          Demande de devis envoyée !
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          Votre demande portant la référence <span className="font-bold text-primary">{reference}</span> a été transmise à notre équipe.
        </p>

        <div className="mt-12 text-left">
          <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Votre devis PDF</h2>
          {pdfUrl ? (
            <PDFPreview url={pdfUrl} title={`Devis ${reference}`} />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
              <p className="text-slate-500">Génération du PDF en cours... Vous recevrez également un lien par WhatsApp.</p>
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link 
            href="/catalogue"
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-4 font-bold text-white transition-all hover:bg-slate-800 dark:bg-primary dark:hover:bg-primary/90"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour au catalogue
          </Link>
          <Link 
            href="/suivi"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 font-bold text-slate-900 transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          >
            Suivre mes commandes
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DevisEnvoyePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Chargement...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
