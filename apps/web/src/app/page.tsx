'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Globe, Shield, Truck, Package, Search, ClipboardCheck } from 'lucide-react';

interface SiteConfig {
  description_services: string;
  logo_url: string;
}

export default function Home() {
  const [config, setConfig] = useState<SiteConfig>({
    description_services: 'Nous sourçons les meilleurs produits, nous négocions pour vous, et nous assurons la logistique jusqu\'à votre porte à Libreville.',
    logo_url: ''
  });

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/config`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setConfig(data.data);
      })
      .catch(err => console.error('Failed to load home config', err));
  }, []);

  const services = [
    {
      title: 'Sourcing Chine',
      description: 'Nous trouvons les meilleurs fournisseurs et négocions les prix pour vous.',
      icon: <Search className="h-8 w-8" />,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
    },
    {
      title: 'Livraison Gabon',
      description: 'Transport aérien et maritime sécurisé jusqu\'à Libreville.',
      icon: <Truck className="h-8 w-8" />,
      color: 'bg-green-50 text-green-600 dark:bg-green-900/20'
    },
    {
      title: 'Devis Clair',
      description: 'Calcul automatique des commissions et frais sans frais cachés.',
      icon: <ClipboardCheck className="h-8 w-8" />,
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20'
    },
    {
      title: 'Suivi Temps Réel',
      description: 'Suivez chaque étape de votre colis avec des photos de preuves.',
      icon: <Package className="h-8 w-8" />,
      color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20'
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 py-20 dark:bg-slate-900 lg:py-32">
        <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary blur-3xl"></div>
          <div className="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-blue-500 blur-3xl"></div>
        </div>

        {/* Floating Animated Illustrations */}
        <div className="absolute left-2 bottom-4 sm:left-10 sm:top-32 z-20 animate-float" style={{ animationDelay: '0s' }}>
          <div className="relative w-20 h-20 sm:w-32 sm:h-32 lg:w-48 lg:h-48 rounded-full bg-white/50 backdrop-blur-sm shadow-xl p-2 sm:p-4 flex items-center justify-center border border-white/20">
            <Image src="/images/shopping.png" alt="Shopping" width={150} height={150} className="object-contain w-14 h-14 sm:w-24 sm:h-24 lg:w-[150px] lg:h-[150px]" />
          </div>
        </div>
        <div className="absolute right-2 bottom-8 sm:right-10 sm:top-40 z-20 animate-float" style={{ animationDelay: '1.5s' }}>
          <div className="relative w-24 h-24 sm:w-36 sm:h-36 lg:w-56 lg:h-56 rounded-full bg-white/50 backdrop-blur-sm shadow-xl p-2 sm:p-4 flex items-center justify-center border border-white/20">
            <Image src="/images/delivery.png" alt="Delivery" width={180} height={180} className="object-contain w-16 h-16 sm:w-28 sm:h-28 lg:w-[180px] lg:h-[180px]" />
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-sm font-bold text-primary">
              <Globe className="mr-2 h-4 w-4" /> Le sourcing de demain, aujourd&apos;hui
            </div>
            <h1 className="mt-8 max-w-4xl text-5xl font-black tracking-tight text-slate-900 dark:text-white md:text-7xl">
              Simplifiez vos achats en <span className="text-primary">Chine</span> vers le <span className="text-primary">Gabon</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              {config.description_services}
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/catalogue"
                className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-8 text-lg font-bold text-white shadow-xl shadow-primary/30 transition-transform hover:scale-105 active:scale-95"
              >
                Explorer le catalogue <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/suivi"
                className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 text-lg font-bold text-slate-900 transition-transform hover:scale-105 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                Suivre mon colis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white md:text-4xl">Nos Services Experts</h2>
            <p className="mt-4 text-slate-500">Une solution complète de bout en bout pour vos importations.</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => (
              <div key={index} className="group relative rounded-[2.5rem] border border-slate-100 bg-slate-50/50 p-8 transition-all hover:bg-white hover:shadow-2xl hover:shadow-primary/10 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900">
                <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-3xl transition-transform group-hover:scale-110 ${service.color}`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{service.title}</h3>
                <p className="mt-3 text-slate-500 dark:text-slate-400">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-950 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-10 rounded-[3.5rem] bg-primary p-12 lg:flex-row lg:p-20">
            <div className="max-w-2xl text-center lg:text-left">
              <h2 className="text-4xl font-black text-white md:text-5xl">
                Prêt à lancer votre business ?
              </h2>
              <p className="mt-6 text-xl text-white/80">
                Rejoignez des centaines d&apos;entrepreneurs gabonais qui nous font confiance pour leur sourcing.
              </p>
            </div>
            <Link
              href="/catalogue"
              className="shrink-0 rounded-2xl bg-white px-10 py-5 text-xl font-black text-primary transition-transform hover:scale-105 active:scale-95"
            >
              Commencer maintenant
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

