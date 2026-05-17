'use client';

import React, { useEffect, useState } from 'react';
import { useProduct } from '@/store/useProduct';
import { ProductCard } from '@/components/ProductCard';
import { Search, Filter, Loader2, ChevronLeft, ChevronRight, Package, SlidersHorizontal, X } from 'lucide-react';

export default function CataloguePage() {
  const { products, categories, exchangeRate, isLoading, fetchProducts, fetchCategories, fetchExchangeRate } = useProduct();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchCategories();
    fetchExchangeRate();
  }, [fetchCategories, fetchExchangeRate]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory]);

  useEffect(() => {
    fetchProducts({ 
      search: debouncedSearch, 
      categorie_id: selectedCategory, 
      page 
    });
  }, [debouncedSearch, selectedCategory, page, fetchProducts]);

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setPage(1);
  };

  const hasFilters = search !== '' || selectedCategory !== '';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 pb-16 pt-14 lg:px-8">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 40%)'}} />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Import direct Chine</span>
          </div>
          <h1 className="text-4xl font-black text-white sm:text-5xl">
            Catalogue <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Produits</span>
          </h1>
          <p className="mt-3 max-w-xl text-base text-slate-400">
            Des milliers d&apos;articles sélectionnés directement depuis la Chine, livrés à Libreville.
          </p>

          {/* Search + Filters */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                className="w-full rounded-2xl border border-white/10 bg-white/10 py-3.5 pl-12 pr-4 text-white placeholder-slate-400 backdrop-blur-sm outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20 focus:bg-white/15"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  aria-label="Effacer la recherche"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="relative">
              <SlidersHorizontal className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                className="h-full w-full rounded-2xl border border-white/10 bg-white/10 py-3.5 pl-11 pr-8 text-white backdrop-blur-sm outline-none appearance-none cursor-pointer transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20 focus:bg-white/15"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                title="Sélectionner une catégorie"
                aria-label="Sélectionner une catégorie"
              >
                <option value="" className="bg-slate-800 text-white">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-slate-800 text-white">{cat.nom}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Area */}
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        {/* Active filters bar */}
        {hasFilters && (
          <div className="mb-6 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Filtres actifs :</span>
            {search && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 dark:bg-violet-900/20 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700/40">
                &ldquo;{search}&rdquo;
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/40">
                {categories.find(c => c.id === selectedCategory)?.nom}
              </span>
            )}
            <button
              onClick={handleClearFilters}
              className="ml-auto text-xs font-bold text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex h-64 w-full flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
            <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">Chargement des produits...</p>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => {
                const category = categories.find(c => c.id === product.categorie_id);
                return (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    exchangeRate={exchangeRate} 
                    categoryName={category?.nom}
                  />
                );
              })}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex items-center justify-center gap-3">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                title="Page précédente"
                aria-label="Page précédente"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="min-w-[80px] text-center text-sm font-bold text-slate-700 dark:text-slate-300">
                Page {page}
              </span>
              <button
                disabled={products.length < 12}
                onClick={() => setPage(p => p + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                title="Page suivante"
                aria-label="Page suivante"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Package className="h-9 w-9 text-slate-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-700 dark:text-slate-300">Aucun produit trouvé</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">Essayez de modifier vos critères de recherche.</p>
            </div>
            {hasFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
              >
                Voir tous les produits
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
