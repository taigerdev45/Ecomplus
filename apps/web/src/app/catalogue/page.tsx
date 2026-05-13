'use client';

import React, { useEffect, useState } from 'react';
import { useProduct } from '@/store/useProduct';
import { ProductCard } from '@/components/ProductCard';
import { Search, Filter, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CataloguePage() {
  const { products, categories, exchangeRate, totalProducts, isLoading, fetchProducts, fetchCategories, fetchExchangeRate } = useProduct();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCategories();
    fetchExchangeRate();
  }, [fetchCategories, fetchExchangeRate]);

  useEffect(() => {
    fetchProducts({ 
      search, 
      categorie_id: selectedCategory, 
      page 
    });
  }, [search, selectedCategory, page, fetchProducts]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header Section */}
      <div className="bg-white px-4 py-8 shadow-sm dark:bg-slate-900 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Catalogue Produits</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Découvrez nos articles sélectionnés directement depuis la Chine.</p>
          
          <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <select
                className="rounded-lg border border-slate-200 bg-white py-3 pl-4 pr-10 focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                title="Sélectionner une catégorie"
                aria-label="Sélectionner une catégorie"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nom}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        {isLoading ? (
          <div className="flex h-64 w-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} exchangeRate={exchangeRate} />
              ))}
            </div>
            
            {/* Pagination */}
            <div className="mt-12 flex items-center justify-center gap-4">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900"
                title="Page précédente"
                aria-label="Page précédente"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm font-medium">Page {page}</span>
              <button
                disabled={products.length < 12}
                onClick={() => setPage(p => p + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900"
                title="Page suivante"
                aria-label="Page suivante"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-lg text-slate-600 dark:text-slate-400">Aucun produit trouvé pour votre recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
}
