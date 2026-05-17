'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useProduct } from '@/store/useProduct';
import { ProductCard } from '@/components/ProductCard';
import {
  Search, Loader2, ChevronLeft, ChevronRight, Package,
  SlidersHorizontal, X, LayoutGrid, List
} from 'lucide-react';

export default function CataloguePage() {
  const { products, categories, exchangeRate, isLoading, fetchProducts, fetchCategories, fetchExchangeRate } = useProduct();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setSelectedCategory('');
    setPage(1);
  }, []);

  const hasFilters = search !== '' || selectedCategory !== '';
  const pageStart = (page - 1) * 12 + 1;
  const pageEnd = (page - 1) * 12 + products.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary/90 to-indigo-900 px-4 py-14 lg:px-8 lg:py-20">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 15% 60%, #818cf8 0%, transparent 45%), radial-gradient(circle at 85% 10%, #6366f1 0%, transparent 40%)' }} />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="rounded-full bg-white/10 px-3 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/70 backdrop-blur-sm">
              Import direct Chine
            </span>
          </div>
          <h1 className="text-3xl font-black text-white sm:text-4xl lg:text-5xl">
            Catalogue <span className="bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">Produits</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-300 lg:text-base">
            Des milliers d&apos;articles sélectionnés directement depuis la Chine, livrés à Libreville.
          </p>

          {/* Search bar */}
          <div className="mt-6 max-w-2xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                aria-label="Rechercher un produit"
                className="w-full rounded-2xl border border-white/10 bg-white/10 py-3.5 pl-12 pr-10 text-white placeholder-slate-400 backdrop-blur-sm outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20 focus:bg-white/15"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  aria-label="Effacer"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
        <div className="flex gap-6 lg:gap-8">

          {/* ── Sidebar Filters (desktop) ── */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-20 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800/70 dark:bg-slate-900">
              <h2 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Filtres</h2>

              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Catégorie</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    aria-label="Filtrer par catégorie"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              {hasFilters && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 w-full rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-500 hover:border-red-200 hover:text-red-500 transition-colors dark:border-slate-700 dark:hover:text-red-400"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </aside>

          {/* ── Product area ── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="mb-5 flex flex-wrap items-center gap-3">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:border-primary/30 hover:text-primary transition-all dark:border-slate-800 dark:bg-slate-900 lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtres
                {hasFilters && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-black text-white">!</span>
                )}
              </button>

              {/* Results count */}
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {isLoading ? 'Chargement...' : products.length > 0 ? `Produits ${pageStart}–${pageEnd}` : '0 résultats'}
              </span>

              {/* Active filters chips */}
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory('')}
                  className="flex items-center gap-1.5 rounded-full bg-violet-50 border border-violet-200/60 px-2.5 py-1 text-xs font-semibold text-violet-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors dark:bg-violet-900/20 dark:border-violet-700/40 dark:text-violet-300"
                >
                  {categories.find(c => c.id === selectedCategory)?.nom}
                  <X className="h-3 w-3" />
                </button>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* View toggle */}
              <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <button
                  onClick={() => setViewMode('grid')}
                  aria-label="Vue grille"
                  className={`flex h-8 w-8 items-center justify-center transition-colors ${
                    viewMode === 'grid' ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  aria-label="Vue liste"
                  className={`flex h-8 w-8 items-center justify-center transition-colors ${
                    viewMode === 'list' ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Mobile filters panel */}
            {filtersOpen && (
              <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Filtres</span>
                  <button onClick={() => setFiltersOpen(false)} aria-label="Fermer les filtres" title="Fermer les filtres" className="text-slate-400">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setFiltersOpen(false); }}
                  aria-label="Filtrer par catégorie"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nom}</option>
                  ))}
                </select>
                {hasFilters && (
                  <button
                    onClick={() => { handleClearFilters(); setFiltersOpen(false); }}
                    className="mt-2 w-full rounded-xl border border-slate-200 py-1.5 text-xs font-bold text-red-500 transition-colors"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            )}

            {/* ── Products grid ── */}
            {isLoading ? (
              <div className="flex h-64 w-full flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-slate-500 animate-pulse">Chargement des produits...</p>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 lg:gap-4'
                    : 'flex flex-col gap-3'
                }>
                  {products.map((product) => {
                    const category = categories.find(c => c.id === product.categorie_id);
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        exchangeRate={exchangeRate}
                        categoryName={category?.nom}
                        compact={viewMode === 'list'}
                      />
                    );
                  })}
                </div>

                {/* Pagination */}
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    aria-label="Page précédente"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    Page {page}
                  </div>
                  <button
                    disabled={products.length < 12}
                    onClick={() => setPage(p => p + 1)}
                    aria-label="Page suivante"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <ChevronRight className="h-4 w-4" />
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
                  <p className="mt-1 text-sm text-slate-500">Essayez de modifier vos critères de recherche.</p>
                </div>
                {hasFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
                  >
                    Voir tous les produits
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
