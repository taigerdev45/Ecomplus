'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import { useProduct } from '@/store/useProduct';
import { Plus, Edit, Trash2, Search, FileUp } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const { products, isLoading, fetchProducts, deleteProduct } = useProduct();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await deleteProduct(id);
        toast.success('Produit supprimé');
        fetchProducts();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleCSVImport = () => {
    // Placeholder for CSV import logic
    toast.info('Fonctionnalité d\'importation CSV bientôt disponible');
  };

  const filteredProducts = products.filter(p => 
    p.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">Gestion des Produits</h1>
            <p className="text-slate-500">Ajoutez, modifiez ou supprimez des articles du catalogue.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleCSVImport}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
            >
              <FileUp className="h-4 w-4" /> Importer CSV
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Nouveau Produit
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-900"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                  <th className="px-6 py-4">Produit</th>
                  <th className="px-6 py-4">Catégorie</th>
                  <th className="px-6 py-4">Prix (CNY)</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr><td colSpan={5} className="py-12 text-center text-slate-400">Chargement...</td></tr>
                ) : filteredProducts.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-slate-400">Aucun produit trouvé</td></tr>
                ) : filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-slate-100">
                          <Image
                            src={product.images[0] || 'https://placehold.co/40x40/f1f5f9/94a3b8?text=...'}
                            alt={`Photo de ${product.nom}`}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{product.nom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {product.categorie_id}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                      {(product.prix_cny / 100).toFixed(2)} ¥
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {product.stock} en stock
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          aria-label={`Modifier ${product.nom}`}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800"
                        >
                          <Edit className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          aria-label={`Supprimer ${product.nom}`}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
