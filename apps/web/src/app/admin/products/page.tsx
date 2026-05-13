'use client';

import React, { useEffect, useState } from 'react';
import { useProduct } from '@/store/useProduct';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Plus, Edit, Trash2, Search, Package, ExternalLink } from 'lucide-react';
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

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['admin']}>
        <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 sm:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Gestion des Produits</h1>
                <p className="text-slate-500">Ajoutez, modifiez ou supprimez des articles du catalogue.</p>
              </div>
              <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90">
                <Plus className="h-5 w-5" /> Nouveau Produit
              </button>
            </div>

            <div className="mb-6 flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom..."
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Produit</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Catégorie</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Prix (CNY)</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Stock</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 overflow-hidden rounded bg-slate-100">
                              <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
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
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            product.stock > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {product.stock} en stock
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button className="rounded p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800">
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="rounded p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800"
                            >
                              <Trash2 className="h-5 w-5" />
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
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
