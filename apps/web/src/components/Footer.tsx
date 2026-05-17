'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface SiteConfig {
  footer_text: string;
}

export function Footer() {
  const [config, setConfig] = useState<SiteConfig>({
    footer_text: '© 2026 EcomPlus Gabon. Tous droits réservés.'
  });

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/config`)
      .then(res => {
        if (!res.ok) throw new Error('Config not found');
        return res.json();
      })
      .then(data => {
        if (data.success) setConfig(data.data);
      })
      .catch(err => console.error('Failed to load Footer config', err));
  }, []);

  return (
    <footer className="border-t border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 md:gap-8">
          <div className="md:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/logo_ecomplus.jpeg" alt="Ecom Plus Gabon" className="h-10 md:h-12 w-auto object-contain mix-blend-multiply dark:mix-blend-normal rounded-sm mb-2 md:mb-4" />
            <p className="mt-2 md:mt-4 max-w-xs text-xs md:text-sm text-slate-500 dark:text-slate-400">
              Votre partenaire de confiance pour le sourcing en Chine et la logistique vers le Gabon.
            </p>
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Navigation</h3>
            <ul className="mt-2 md:mt-4 space-y-1.5 md:space-y-2">
              <li><Link href="/" className="text-xs md:text-sm text-slate-500 hover:text-primary dark:text-slate-400">Accueil</Link></li>
              <li><Link href="/catalogue" className="text-xs md:text-sm text-slate-500 hover:text-primary dark:text-slate-400">Catalogue</Link></li>
              <li><Link href="/suivi" className="text-xs md:text-sm text-slate-500 hover:text-primary dark:text-slate-400">Suivre mon colis</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Légal</h3>
            <ul className="mt-2 md:mt-4 space-y-1.5 md:space-y-2">
              <li><Link href="#" className="text-xs md:text-sm text-slate-500 hover:text-primary dark:text-slate-400">Mentions Légales</Link></li>
              <li><Link href="#" className="text-xs md:text-sm text-slate-500 hover:text-primary dark:text-slate-400">CGV</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 md:mt-12 border-t border-slate-100 pt-6 md:pt-8 dark:border-slate-800">
          <p className="text-center text-[10px] md:text-xs text-slate-400">
            {config.footer_text}
          </p>
        </div>
      </div>
    </footer>
  );
}

