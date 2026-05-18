'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import { 
  ArrowRight, Globe, Shield, Truck, Package, Search, ClipboardCheck, 
  Users, CheckCircle, ChevronRight, MessageSquare, X, ShieldAlert, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';

interface SiteConfig {
  description_services: string;
  logo_url: string;
}

export default function Home() {
  const [config, setConfig] = useState<SiteConfig>({
    description_services: 'Nous sourçons les meilleurs produits, nous négocions pour vous, et nous assurons la logistique jusqu\'à votre porte à Libreville.',
    logo_url: ''
  });

  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);
  const [isConnectingAnon, setIsConnectingAnon] = useState(false);
  const { loginAnonymous, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleStartAnonymousChat = async () => {
    setIsConnectingAnon(true);
    try {
      await loginAnonymous();
      toast.success('Session anonyme créée avec succès ! Redirection vers le support...');
      router.push('/client/chat');
    } catch (err: any) {
      toast.error('Impossible d\'initier la session anonyme : ' + (err.message || 'erreur serveur'));
    } finally {
      setIsConnectingAnon(false);
    }
  };

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/config`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setConfig(data.data);
      })
      .catch(err => console.error('Failed to load home config', err));
  }, []);

  const stats = [
    { value: '5,000+', label: 'Articles importés', icon: Package, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    { value: '98%', label: 'Clients satisfaits', icon: Users, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
    { value: '100%', label: 'Livraison sécurisée', icon: Shield, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
  ];

  const services = [
    {
      title: 'Sourcing Chine',
      description: 'Nous trouvons les meilleurs fournisseurs certifiés et négocions les prix de gros pour vous.',
      icon: <Search className="h-6 w-6" />,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
    },
    {
      title: 'Livraison Gabon',
      description: 'Transport aérien rapide et maritime sécurisé directement vers nos entrepôts de Libreville.',
      icon: <Truck className="h-6 w-6" />,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
    },
    {
      title: 'Devis Transparent',
      description: 'Calcul automatique des commissions et frais de douane sans frais cachés ni surprises.',
      icon: <ClipboardCheck className="h-6 w-6" />,
      color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20'
    },
    {
      title: 'Suivi Temps Réel',
      description: 'Visualisez chaque étape de transit de votre colis avec des photos réelles de preuves.',
      icon: <Package className="h-6 w-6" />,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      
      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-16 lg:py-28">
        {/* Decorative dynamic ambient glow */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary blur-[120px]" />
          <div className="absolute top-1/2 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-500 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            
            {/* Left Col: Info */}
            <div className="flex flex-col items-start text-left lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-xs font-bold text-primary dark:bg-primary/20">
                <Globe className="h-3.5 w-3.5" /> Le sourcing de demain, aujourd&apos;hui
              </div>
              
              <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl leading-[1.1]">
                Simplifiez vos achats en <span className="gradient-text">Chine</span> vers le <span className="gradient-text">Gabon</span>
              </h1>
              
              <p className="mt-6 text-base text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                {config.description_services}
              </p>
              
              <div className="mt-8 flex flex-col gap-3 sm:flex-row w-full sm:w-auto">
                <Link href="/catalogue" className="btn-primary btn-lg flex items-center justify-center gap-2">
                  Explorer le catalogue <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/suivi" className="btn-outline btn-lg flex items-center justify-center gap-2">
                  Suivre mon colis
                </Link>
              </div>
            </div>

            {/* Right Col: Graphic Cards */}
            <div className="relative flex items-center justify-center lg:col-span-5">
              {/* Main floating phone frame/card mock */}
              <div className="relative w-full max-w-[360px] aspect-[3/4] rounded-[2.5rem] bg-slate-900 border-[8px] border-slate-950 shadow-2xl overflow-hidden p-6 text-white flex flex-col justify-between dark:border-slate-800">
                
                {/* Status Bar */}
                <div className="flex justify-between items-center text-xs opacity-75">
                  <span>9:41</span>
                  <div className="flex items-center gap-1">
                    <span className="h-2.5 w-4 bg-white rounded-sm inline-block" />
                  </div>
                </div>

                {/* Simulated App Card */}
                <div className="flex-1 flex flex-col justify-center gap-4">
                  <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-primary-foreground/75">Suivi de commande</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">En mer</span>
                    </div>
                    <p className="text-sm font-black">Colis #EC-9844-LBV</p>
                    <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[65%]" />
                    </div>
                    <div className="flex justify-between text-[10px] opacity-75">
                      <span>Yiwu, Chine</span>
                      <span>Libreville, Gabon</span>
                    </div>
                  </div>

                  {/* Tiny simulated product card */}
                  <div className="rounded-2xl bg-white p-3 flex gap-3 text-slate-900 shadow-md">
                    <div className="relative h-12 w-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                      <Image src="/icons/logo_ecomplus.jpeg" alt="Simulated Product" fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-[11px] font-black truncate leading-tight">Chaussures Sport Ultralight</p>
                      <p className="text-[10px] font-semibold text-primary mt-0.5">Import Direct Chine</p>
                    </div>
                  </div>
                </div>

                {/* Bottom line */}
                <div className="h-1 w-24 bg-white/30 rounded-full mx-auto" />
              </div>

              {/* Decorative badges */}
              <div className="absolute -left-6 top-12 glass-card rounded-2xl p-4 flex items-center gap-3 shadow-lg animate-float max-w-[200px]">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800 dark:text-white">Qualité Vérifiée</p>
                  <p className="text-[10px] text-slate-400">Inspections d&apos;usine</p>
                </div>
              </div>

              <div className="absolute -right-6 bottom-12 glass-card rounded-2xl p-4 flex items-center gap-3 shadow-lg animate-float-delayed max-w-[200px]">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800 dark:text-white">Douanes Incluses</p>
                  <p className="text-[10px] text-slate-400">Prise en charge totale</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── STATISTICS SECTION ── */}
      <section className="relative -mt-8 z-20 max-w-5xl mx-auto w-full px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 p-6 shadow-xl dark:border-slate-800/80">
          {stats.map(({ value, label, icon: Icon, color }) => (
            <div key={label} className="flex items-center gap-4 p-4 first:border-b md:first:border-b-0 md:first:border-r border-slate-100 dark:border-slate-800/60 last:border-t md:last:border-t-0 md:last:border-l">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{value}</p>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES SECTION ── */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-16 text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white md:text-4xl">Nos Services Experts</h2>
            <p className="text-sm text-slate-400">Une infrastructure logistique et commerciale solide pour sécuriser toutes vos importations.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => (
              <div 
                key={index} 
                onClick={() => setSelectedService(service)}
                className="card-hover group p-6 flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div>
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-105 ${service.color}`}>
                    {service.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{service.title}</h3>
                  <p className="mt-3 text-xs text-slate-400 leading-relaxed">{service.description}</p>
                </div>
                <div className="mt-6 flex items-center gap-1 text-[11px] font-black text-primary uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                  En savoir plus <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="bg-slate-950 dark:bg-slate-900 py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 80%, #2563eb 0%, transparent 60%)' }} />
        <div className="mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
          <div className="flex flex-col items-center justify-between gap-8 rounded-3xl bg-primary p-8 lg:flex-row lg:p-14 shadow-2xl">
            <div className="max-w-2xl text-center lg:text-left space-y-3">
              <h2 className="text-3xl font-black text-white md:text-4xl leading-tight">
                Prêt à propulser votre commerce ?
              </h2>
              <p className="text-sm text-white/80 leading-relaxed">
                Rejoignez des centaines de commerçants gabonais qui importent intelligemment et sans intermédiaire.
              </p>
            </div>
            <Link
              href="/catalogue"
              className="btn bg-white hover:bg-slate-50 text-primary font-black py-4 px-8 rounded-2xl shadow-xl hover:scale-[1.03] transition-all active:scale-[0.97]"
            >
              Commencer maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* ── SERVICE DETAIL MODAL ── */}
      {selectedService && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedService(null)}
        >
          <div 
            className="relative w-full max-w-lg rounded-3xl border border-slate-100 bg-white/95 p-6 shadow-2xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/95 overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background glowing orb */}
            <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/20 shrink-0">
                  {selectedService.icon}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{selectedService.title}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Expertise Logistique</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body Content */}
            <div className="mt-6 space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p className="font-medium text-slate-800 dark:text-slate-100 text-sm">
                {selectedService.description}
              </p>
              
              {selectedService.title === 'Sourcing Chine' && (
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-100/50 dark:border-slate-800/50 space-y-2">
                  <p>🔹 <strong>Sélection rigoureuse :</strong> Nous trions sur le volet des usines certifiées ISO en Chine (Yiwu, Shenzhen, Guangzhou).</p>
                  <p>🔹 <strong>Négociation de prix :</strong> Notre équipe locale négocie les tarifs au plus bas, directement à la source d&apos;usine.</p>
                  <p>🔹 <strong>Contrôle qualité :</strong> Inspection minutieuse des marchandises avant expédition pour éviter les défauts.</p>
                </div>
              )}

              {selectedService.title === 'Livraison Gabon' && (
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-100/50 dark:border-slate-800/50 space-y-2">
                  <p>✈️ <strong>Fret Aérien (Rapide) :</strong> Expédition en 5 à 9 jours ouvrés pour vos colis urgents ou de haute valeur.</p>
                  <p>🚢 <strong>Fret Maritime (Économique) :</strong> Idéal pour les gros volumes ou colis lourds, transit de 35 à 45 jours.</p>
                  <p>📦 <strong>Dédouanement :</strong> Prise en charge intégrale des formalités et taxes. Aucun coût surprise à Libreville.</p>
                </div>
              )}

              {selectedService.title === 'Devis Transparent' && (
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-100/50 dark:border-slate-800/50 space-y-2">
                  <p>💰 <strong>Calcul Instantané :</strong> Notre outil intègre tous les coûts de douane et de fret en temps réel.</p>
                  <p>🛡️ <strong>Zéro surcoût :</strong> Aucun frais supplémentaire lors de la récupération de vos marchandises.</p>
                  <p>📄 <strong>Facturation Pro :</strong> Factures détaillées fournies pour votre comptabilité commerciale.</p>
                </div>
              )}

              {selectedService.title === 'Suivi Temps Réel' && (
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-100/50 dark:border-slate-800/50 space-y-2">
                  <p>📸 <strong>Preuves Photos :</strong> Nous prenons des photos de vos colis à chaque étape clé (entrepôt Yiwu, port...).</p>
                  <p>📲 <strong>Notifications :</strong> Alerte SMS et email pour vous informer de chaque mouvement majeur de votre fret.</p>
                  <p>📍 <strong>Localisation précise :</strong> Sachez exactement si votre cargaison est en mer, en douane ou disponible.</p>
                </div>
              )}

              {/* Warning Alert about Anonymous Chat deletion */}
              <div className="flex gap-2.5 items-start rounded-2xl bg-amber-500/10 p-3.5 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[10px] uppercase tracking-wider">Sécurité & Confidentialité</p>
                  <p className="text-[10px] leading-snug mt-0.5">Le chat anonyme est idéal pour poser vos questions à chaud. Par mesure de sécurité, tous les comptes et messages anonymes sont définitivement supprimés après 3 jours.</p>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={isAuthenticated ? () => router.push('/client/chat') : handleStartAnonymousChat}
                disabled={isConnectingAnon}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/95 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {isConnectingAnon ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Création de la session en cours...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4" />
                    {isAuthenticated ? 'Discuter avec le service client' : 'Discuter en anonyme (Effacé sous 3j)'}
                  </>
                )}
              </button>
              
              <button
                onClick={() => setSelectedService(null)}
                className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
