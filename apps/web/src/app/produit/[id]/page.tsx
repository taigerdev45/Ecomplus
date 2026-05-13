'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useProduct } from '@/store/useProduct';
import { useCart } from '@/store/useCart';
import { Product } from '@ecom/types';
import { Loader2, MessageCircle, ShoppingBag, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { getProduct, exchangeRate, fetchExchangeRate, settings, fetchSettings } = useProduct();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([fetchExchangeRate(), fetchSettings()]);
        const data = await getProduct(id as string);
        setProduct(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, getProduct, fetchExchangeRate, fetchSettings]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Produit non trouvé</h1>
        <Link href="/catalogue" className="text-primary hover:underline">Retour au catalogue</Link>
      </div>
    );
  }

  const prixXaf = Math.round((product.prix_cny / 100) * exchangeRate);
  
  const handleAddToCart = () => {
    addItem(product);
    toast.success(`${product.nom} ajouté au panier`);
  };

  const whatsappNumber = settings.WHATSAPP_SERVICE_CLIENT || '24100000000';
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Bonjour, je suis intéressé par le produit : ${product.nom}.\n\nPrix : ${prixXaf.toLocaleString()} F CFA\nLien : ${window.location.origin}/produit/${product.id}`
  )}`;

  return (
    <div className="min-h-screen bg-white pb-12 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <Link href="/catalogue" className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-400">
          <ArrowLeft className="h-4 w-4" /> Retour au catalogue
        </Link>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Images Section */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
              <img
                src={product.images[activeImage] || 'https://via.placeholder.com/800'}
                alt={product.nom}
                className="h-full w-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      activeImage === idx ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white lg:text-4xl">
              {product.nom}
            </h1>
            
            <div className="mt-6 flex items-end gap-4">
              <div className="space-y-1">
                <p className="text-4xl font-extrabold text-primary">
                  {prixXaf.toLocaleString()} F CFA
                </p>
                <p className="text-sm text-slate-500">
                  Estimation basée sur le taux de change actuel ({(product.prix_cny / 100).toFixed(2)} CNY)
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div className="flex items-center gap-4 border-y border-slate-100 py-6 dark:border-slate-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Qualité Vérifiée</h4>
                  <p className="text-sm text-slate-500">Sourcing direct auprès de fournisseurs certifiés en Chine.</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold">Description</h3>
                <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                  {product.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6">
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                  <p className="text-xs text-slate-500 uppercase">Poids estimé</p>
                  <p className="text-lg font-bold">{product.poids_kg} kg</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                  <p className="text-xs text-slate-500 uppercase">Disponibilité</p>
                  <p className="text-lg font-bold text-green-600">{product.stock > 0 ? 'En Stock' : 'Sur commande'}</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-8 sm:flex-row">
                <button 
                  onClick={handleAddToCart}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-white transition-all hover:bg-primary/90"
                >
                  <ShoppingBag className="h-5 w-5" /> Ajouter au panier
                </button>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-green-500 px-8 py-4 font-bold text-green-600 transition-all hover:bg-green-50 dark:hover:bg-green-900/10"
                >
                  <MessageCircle className="h-5 w-5" /> Commander via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
