'use client';

import React, { useEffect, useState } from 'react';
import { useCart } from '@/store/useCart';
import { useProduct } from '@/store/useProduct';
import { useAuth } from '@/store/useAuth';
import { Devis, ShippingMethod } from '@ecom/types';
import { Trash2, Plus, Minus, Calculator, Send, Truck, Info, Loader2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getQuotePreview, getTotalPrice, submitQuoteRequest } = useCart();
  const { exchangeRate, fetchExchangeRate } = useProduct();
  
  const { user, isAuthenticated } = useAuth();
  
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('AIR');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [quote, setQuote] = useState<Devis | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    fetchExchangeRate();
  }, [fetchExchangeRate]);

  const handleCalculateQuote = async () => {
    if (!address || !city) {
      toast.error('Veuillez remplir toutes les coordonnées de livraison');
      return;
    }
    
    setIsCalculating(true);
    try {
      // Pour le preview, le numéro whatsapp n'est plus requis
      const data = await getQuotePreview(shippingMethod, address, city, '');
      setQuote(data);
      toast.success('Devis mis à jour');
    } catch (error) {
      toast.error('Erreur lors du calcul du devis');
    } finally {
      setIsCalculating(false);
    }
  };

  const router = useRouter();

  const handleSubmitQuote = async () => {
    if (!address || !city) {
      toast.error('Veuillez remplir toutes les coordonnées de livraison');
      return;
    }

    setIsCalculating(true);
    try {
      // Soumission de la demande sans whatsapp manuel
      const res = await submitQuoteRequest(shippingMethod, address, city, user?.telephone || '');
      toast.success(res.message);
      setQuote(null); // Clear local quote
      
      // Redirect to client quotes page
      router.push('/client/quotes');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la demande');
    } finally {
      setIsCalculating(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
        <div className="mb-6 rounded-full bg-slate-100 p-6 dark:bg-slate-900">
          <ShoppingBag className="h-12 w-12 text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold">Votre panier est vide</h1>
        <p className="mt-2 text-slate-500">Parcourez notre catalogue pour ajouter des articles.</p>
        <Link href="/catalogue" className="mt-8 rounded-lg bg-primary px-8 py-3 font-semibold text-white transition-all hover:bg-primary/90">
          Découvrir le catalogue
        </Link>
      </div>
    );
  }

  const subtotalProducts = getTotalPrice(exchangeRate);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Mon Panier</h1>
        <p className="mt-2 text-slate-500">{items.length} article(s) dans votre panier</p>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item) => (
                  <div key={item.product.id} className="flex flex-col p-6 sm:flex-row sm:items-center gap-6">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      <Image 
                        src={item.product.images[0]} 
                        alt={item.product.nom} 
                        fill
                        className="object-cover" 
                      />
                    </div>
                    
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <h3 className="font-bold text-slate-900 dark:text-white">{item.product.nom}</h3>
                        <button 
                          onClick={() => removeItem(item.product.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                          aria-label="Supprimer du panier"
                          title="Supprimer du panier"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{item.product.poids_kg} kg / unité</p>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700">
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-2 text-slate-500 hover:text-primary"
                            aria-label="Diminuer la quantité"
                            title="Diminuer"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-10 text-center font-semibold">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-2 text-slate-500 hover:text-primary"
                            aria-label="Augmenter la quantité"
                            title="Augmenter"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {(Math.round((item.product.prix_cny / 100) * exchangeRate) * item.quantity).toLocaleString()} F CFA
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout / Quote Section */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-bold mb-6">Récapitulatif & Livraison</h2>
              
              {!isAuthenticated ? (
                <div className="rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 p-6 text-center">
                  <Info className="mx-auto h-8 w-8 text-primary mb-3" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Connectez-vous pour continuer</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                    Vous devez posséder un compte client pour demander un devis et suivre vos commandes.
                  </p>
                  <Link 
                    href="/login?redirect=/panier" 
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90"
                  >
                    Se connecter / Créer un compte
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mode de livraison</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setShippingMethod('AIR')}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                        shippingMethod === 'AIR' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 hover:border-slate-200'
                      }`}
                      aria-label="Sélectionner la livraison par air"
                      title="Livraison par air"
                    >
                      <Truck className="h-6 w-6" />
                      <span className="text-xs font-bold">AIR (Rapide)</span>
                    </button>
                    <button
                      onClick={() => setShippingMethod('SEA')}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                        shippingMethod === 'SEA' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 hover:border-slate-200'
                      }`}
                      aria-label="Sélectionner la livraison par mer"
                      title="Livraison par mer"
                    >
                      <Info className="h-6 w-6" />
                      <span className="text-xs font-bold">MER (Éco)</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <input
                    type="text"
                    placeholder="Ville de livraison"
                    className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-800 dark:bg-slate-800"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Adresse complète"
                    className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-800 dark:bg-slate-800"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleCalculateQuote}
                  disabled={isCalculating}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-4 font-bold text-white transition-all hover:bg-slate-800 dark:bg-primary dark:hover:bg-primary/90"
                >
                  {isCalculating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Calculator className="h-5 w-5" />}
                  Calculer mon devis
                </button>
              </div>

              {quote && (
                <div className="mt-8 space-y-4 border-t border-dashed border-slate-200 pt-8 dark:border-slate-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Sous-total produits</span>
                    <span className="font-semibold">{quote.subtotal_products.toLocaleString()} F CFA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Commission ({quote.commission.taux}%)</span>
                    <span className="font-semibold text-blue-600">+{quote.commission.montant.toLocaleString()} F CFA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Livraison ({quote.shipping.method})</span>
                    <span className="font-semibold">+{quote.shipping.montant.toLocaleString()} F CFA</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                    <span className="text-lg font-bold">TOTAL TTC</span>
                    <span className="text-2xl font-black text-primary">{quote.total_ttc.toLocaleString()} F CFA</span>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 italic">Délai estimé : {quote.shipping.delai}</p>

                  <button 
                    onClick={handleSubmitQuote}
                    disabled={isCalculating}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-4 font-bold text-white transition-all hover:bg-green-700 shadow-lg shadow-green-500/20 mt-6 disabled:opacity-50"
                  >
                    {isCalculating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    Envoyer la demande de devis
                  </button>
                </div>
              )}
              {isAuthenticated && quote && (
                <div className="mt-4 text-center">
                  <p className="text-xs text-slate-500">Votre devis sera généré et disponible instantanément dans votre espace client.</p>
                </div>
              )}
            </>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
