'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import { useProduct } from '@/store/useProduct';
import { Plus, Edit, Trash2, Search, FileUp, X, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const { products, categories, isLoading, fetchProducts, fetchCategories, deleteProduct, createProduct } = useProduct();
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix_fcfa: '',
    poids_kg: '',
    categorie_id: '',
    stock: '1',
    lien_fournisseur: '',
    longueur_m: '0',
    largeur_m: '0',
    hauteur_m: '0'
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    // Ensure exchange rate is loaded to correctly calculate prices
    useProduct.getState().fetchExchangeRate();
  }, [fetchProducts, fetchCategories]);

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
    toast.info('Fonctionnalité d\'importation CSV bientôt disponible');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImageFiles(prev => {
        const combined = [...prev, ...newFiles];
        if (combined.length > 4) toast.info('Maximum 4 images autorisées, les autres ont été ignorées.');
        return combined.slice(0, 4);
      });
      // Reset input value to allow selecting the same file again if needed
      e.target.value = '';
    }
  };
  
  const removeImage = (indexToRemove: number) => {
    setImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categorie_id) {
      return toast.error('Veuillez sélectionner une catégorie');
    }

    setIsSubmitting(true);
    
    // Convert FCFA to CNY centimes before sending
    const exchangeRate = useProduct.getState().exchangeRate || 95;
    const prixCnyCentimes = Math.round((Number(formData.prix_fcfa) / exchangeRate) * 100);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'prix_fcfa') {
        data.append(key, value);
      }
    });
    data.append('prix_cny', prixCnyCentimes.toString());
    
    imageFiles.forEach((file) => {
      data.append('images', file);
    });

    try {
      await createProduct(data);
      toast.success('Produit ajouté avec succès');
      setIsModalOpen(false);
      setFormData({
        nom: '',
        description: '',
        prix_fcfa: '',
        poids_kg: '',
        categorie_id: '',
        stock: '1',
        lien_fournisseur: '',
        longueur_m: '0',
        largeur_m: '0',
        hauteur_m: '0'
      });
      setImageFiles([]);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'ajout");
    } finally {
      setIsSubmitting(false);
    }
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
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
            >
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
                  <th className="px-6 py-4">Prix (FCFA)</th>
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
                      {Math.round((product.prix_cny / 100) * (useProduct.getState().exchangeRate || 95)).toLocaleString('fr-FR')} FCFA
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

      {/* Modal Ajout Produit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ajouter un produit</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                aria-label="Fermer le formulaire"
                title="Fermer"
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom du produit *</label>
                    <input required type="text" name="nom" value={formData.nom} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800" placeholder="Ex: iPhone 15 Pro Max" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Catégorie *</label>
                    <select required name="categorie_id" value={formData.categorie_id} onChange={handleInputChange} aria-label="Catégorie du produit" title="Catégorie" className="w-full rounded-lg border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white">
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.nom}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description *</label>
                  <textarea required name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full rounded-lg border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800" placeholder="Description détaillée..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prix (FCFA) *</label>
                    <input required type="number" min="0" name="prix_fcfa" value={formData.prix_fcfa} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800" placeholder="Ex: 5000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Poids estimé (KG) *</label>
                    <input required type="number" step="0.01" min="0" name="poids_kg" value={formData.poids_kg} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800" placeholder="Ex: 1.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stock</label>
                    <input required type="number" min="0" name="stock" value={formData.stock} onChange={handleInputChange} placeholder="Ex: 10" aria-label="Stock disponible" className="w-full rounded-lg border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lien fournisseur (Optionnel)</label>
                  <input type="url" name="lien_fournisseur" value={formData.lien_fournisseur} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800" placeholder="https://1688.com/..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Longueur (mètres)</label>
                    <input type="number" step="0.001" min="0" name="longueur_m" value={formData.longueur_m} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800" placeholder="Ex: 0.15" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Largeur (mètres)</label>
                    <input type="number" step="0.001" min="0" name="largeur_m" value={formData.largeur_m} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800" placeholder="Ex: 0.10" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hauteur (mètres)</label>
                    <input type="number" step="0.001" min="0" name="hauteur_m" value={formData.hauteur_m} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 p-2.5 dark:border-slate-700 dark:bg-slate-800" placeholder="Ex: 0.20" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Images (Maximum 4) *</label>
                  <div className="mt-1 flex flex-col justify-center rounded-lg border border-dashed border-slate-300 px-6 py-8 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-slate-400" />
                      <div className="mt-4 flex text-sm leading-6 text-slate-600 dark:text-slate-400 justify-center">
                        <label className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none hover:underline dark:bg-slate-900">
                          <span>Sélectionner des fichiers</span>
                          <input required={imageFiles.length === 0} type="file" multiple accept="image/*" className="sr-only" onChange={handleFileChange} />
                        </label>
                      </div>
                      <p className="text-xs leading-5 text-slate-500">PNG, JPG, WEBP jusqu&apos;à 5MB</p>
                    </div>
                    {imageFiles.length > 0 && (
                      <div className="mt-6">
                        <p className="text-sm font-bold text-primary mb-2">{imageFiles.length}/4 fichier(s) prêt(s)</p>
                        <ul className="grid grid-cols-2 gap-2 text-xs">
                          {imageFiles.map((file, i) => (
                            <li key={i} className="flex justify-between items-center bg-slate-100 p-2 rounded-md dark:bg-slate-800">
                              <span className="truncate max-w-[120px]">{file.name}</span>
                              <button type="button" onClick={() => removeImage(i)} aria-label="Supprimer l'image" title="Supprimer" className="text-red-500 hover:bg-red-50 rounded-full p-1"><X className="h-3 w-3" /></button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>

            <div className="border-t border-slate-100 p-6 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 flex justify-end gap-3 rounded-b-2xl">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Annuler
              </button>
              <button 
                form="product-form"
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-70 min-w-[140px]"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
