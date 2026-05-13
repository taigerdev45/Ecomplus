import React from 'react';
import { Product } from '@ecom/types';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  exchangeRate: number;
}

export function ProductCard({ product, exchangeRate }: ProductCardProps) {
  const prixXaf = Math.round((product.prix_cny / 100) * exchangeRate);

  return (
    <div className="group relative overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:bg-slate-900">
      <Link href={`/produit/${product.id}`} className="block aspect-square overflow-hidden bg-slate-100">
        <img
          src={product.images[0] || 'https://via.placeholder.com/400'}
          alt={product.nom}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-primary uppercase tracking-wider">
            {product.categorie_id}
          </span>
          <span className="text-xs text-slate-500">
            {product.poids_kg} kg
          </span>
        </div>
        <Link href={`/produit/${product.id}`}>
          <h3 className="mb-2 line-clamp-1 text-sm font-semibold text-slate-900 dark:text-white">
            {product.nom}
          </h3>
        </Link>
        <div className="flex items-end justify-between">
          <div className="space-y-0.5">
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {prixXaf.toLocaleString()} F CFA
            </p>
            <p className="text-xs text-slate-500">
              {(product.prix_cny / 100).toFixed(2)} CNY
            </p>
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white transition-colors hover:bg-primary/90">
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
