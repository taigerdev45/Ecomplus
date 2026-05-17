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
      <div className="space-y-6 animate-fade-in">
        
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Gestion des Produits</h1>
            <p className="page-subtitle">Ajoutez, modifiez ou supprimez des articles du catalogue public.</p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleCSVImport}
              className="btn-outline btn-sm inline-flex items-center gap-1.5"
            >
              <FileUp className="h-4 w-4" /> Importer CSV
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-primary btn-sm inline-flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Nouveau Produit
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un produit par nom..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-800 dark:bg-slate-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Products list desktop view */}
        <div className="hidden md:block table-wrapper">
          <table className="w-full text-left text-sm">
            <thead className="table-head">
              <tr>
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Prix (FCFA)</th>
                <th>Stock</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {isLoading ? (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400">Aucun produit trouvé</td></tr>
              ) : filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-slate-50 border border-slate-100 shrink-0">
                        <Image
                          src={product.images[0] || '/icons/logo_ecomplus.jpeg'}
                          alt={product.nom}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white leading-tight">{product.nom}</span>
                    </div>
                  </td>
                  <td className="text-slate-500 dark:text-slate-400 text-xs font-semibold">{product.categorie_id}</td>
                  <td className="font-black text-slate-900 dark:text-white">
                    {Math.round((product.prix_cny / 100) * (useProduct.getState().exchangeRate || 95)).toLocaleString('fr-FR')} FCFA
                  </td>
                  <td>
                    <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                      {product.stock} dispo
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1">
                      <button aria-label="Modifier le produit" title="Modifier le produit" className="btn-ghost btn-icon p-1.5 text-slate-400 hover:text-primary rounded-lg">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        aria-label="Supprimer le produit"
                        title="Supprimer le produit"
                        className="btn-ghost btn-icon p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filteredProducts.length === 0 ? (
            <div className="card p-8 text-center text-xs text-slate-400">Aucun produit trouvé</div>
          ) : filteredProducts.map((product) => (
            <div key={product.id} className="card p-4 space-y-4">
              <div className="flex gap-3">
                <div className="relative h-12 w-12 rounded-xl overflow-hidden shrink-0 bg-slate-50 border">
                  <Image src={product.images[0] || '/icons/logo_ecomplus.jpeg'} alt={product.nom} fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-center">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white truncate leading-tight">{product.nom}</h3>
                  <span className="text-[10px] font-semibold text-slate-400 mt-1">{product.categorie_id}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-50 dark:border-slate-800/40 text-xs">
                <div className="font-black text-primary">
                  {Math.round((product.prix_cny / 100) * (useProduct.getState().exchangeRate || 95)).toLocaleString('fr-FR')} FCFA
                </div>
                <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                  {product.stock} en stock
                </span>
              </div>

              <div className="flex gap-2">
                <button className="btn-outline w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs">
                  <Edit className="h-4 w-4" /> Modifier
                </button>
                <button 
                  onClick={() => handleDelete(product.id)}
                  className="btn bg-red-50 text-red-600 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs dark:bg-red-950/20"
                >
                  <Trash2 className="h-4 w-4" /> Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Modal addition */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white shadow-xl dark:bg-slate-900 flex flex-col max-h-[90vh] overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
              <h2 className="text-base font-black text-slate-900 dark:text-white">Ajouter un produit</h2>
              <button aria-label="Fermer" title="Fermer" onClick={() => setIsModalOpen(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4">
              <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="product-name" className="block text-xs font-black uppercase tracking-wider text-slate-400">Nom du produit *</label>
                    <input id="product-name" required type="text" name="nom" value={formData.nom} onChange={handleInputChange} className="field" placeholder="Ex: iPhone 15 Pro Max" title="Nom du produit" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="product-category" className="block text-xs font-black uppercase tracking-wider text-slate-400">Catégorie *</label>
                    <select id="product-category" required name="categorie_id" value={formData.categorie_id} onChange={handleInputChange} className="field" title="Catégorie">
                      <option value="">Sélectionner</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.nom}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="product-description" className="block text-xs font-black uppercase tracking-wider text-slate-400">Description *</label>
                  <textarea id="product-description" required name="description" value={formData.description} onChange={handleInputChange} rows={3} className="field" placeholder="Description détaillée..." title="Description" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="product-price" className="block text-xs font-black uppercase tracking-wider text-slate-400">Prix (FCFA) *</label>
                    <input id="product-price" required type="number" min="0" name="prix_fcfa" value={formData.prix_fcfa} onChange={handleInputChange} className="field" placeholder="5000" title="Prix en FCFA" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="product-weight" className="block text-xs font-black uppercase tracking-wider text-slate-400">Poids (KG) *</label>
                    <input id="product-weight" required type="number" step="0.01" min="0" name="poids_kg" value={formData.poids_kg} onChange={handleInputChange} className="field" placeholder="1.5" title="Poids en KG" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="product-stock" className="block text-xs font-black uppercase tracking-wider text-slate-400">Stock *</label>
                    <input id="product-stock" required type="number" min="0" name="stock" value={formData.stock} onChange={handleInputChange} className="field" placeholder="10" title="Stock disponible" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="product-supplier" className="block text-xs font-black uppercase tracking-wider text-slate-400">Lien fournisseur (Optionnel)</label>
                  <input id="product-supplier" type="url" name="lien_fournisseur" value={formData.lien_fournisseur} onChange={handleInputChange} className="field" placeholder="https://1688.com/..." title="Lien fournisseur" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="product-length" className="block text-xs font-black uppercase tracking-wider text-slate-400">Long. (m)</label>
                    <input id="product-length" type="number" step="0.001" min="0" name="longueur_m" value={formData.longueur_m} onChange={handleInputChange} className="field" placeholder="0.0" title="Longueur en mètres" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="product-width" className="block text-xs font-black uppercase tracking-wider text-slate-400">Larg. (m)</label>
                    <input id="product-width" type="number" step="0.001" min="0" name="largeur_m" value={formData.largeur_m} onChange={handleInputChange} className="field" placeholder="0.0" title="Largeur en mètres" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="product-height" className="block text-xs font-black uppercase tracking-wider text-slate-400">Haut. (m)</label>
                    <input id="product-height" type="number" step="0.001" min="0" name="hauteur_m" value={formData.hauteur_m} onChange={handleInputChange} className="field" placeholder="0.0" title="Hauteur en mètres" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="block text-xs font-black uppercase tracking-wider text-slate-400">Images (Max 4) *</span>
                  <div className="flex flex-col justify-center rounded-2xl border border-dashed border-slate-200 px-6 py-5 text-center dark:border-slate-800 hover:bg-slate-50/50 transition-colors">
                    <Upload className="mx-auto h-6 w-6 text-slate-400" />
                    <label className="mt-2 relative cursor-pointer font-bold text-xs text-primary focus-within:outline-none hover:underline">
                      <span>Sélectionner des images</span>
                      <input id="product-images" required={imageFiles.length === 0} type="file" multiple accept="image/*" className="sr-only" onChange={handleFileChange} title="Sélectionner des images" />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP jusqu&apos;à 5MB</p>
                    
                    {imageFiles.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-left">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{imageFiles.length}/4 images prêtes</span>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {imageFiles.map((file, i) => (
                            <div key={i} className="flex justify-between items-center bg-slate-50 border p-2 rounded-xl text-[10px] font-semibold dark:bg-slate-800 dark:border-slate-700">
                              <span className="truncate max-w-[100px]">{file.name}</span>
                              <button type="button" aria-label="Supprimer l'image" title="Supprimer l'image" onClick={() => removeImage(i)} className="text-red-500 hover:bg-red-50 p-1 rounded-full"><X className="h-3 w-3" /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>

            <div className="border-t border-slate-100 p-4 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="btn-outline py-2 text-xs"
              >
                Annuler
              </button>
              <button 
                form="product-form"
                type="submit" 
                disabled={isSubmitting}
                className="btn-primary py-2 text-xs min-w-[120px]"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer'}
              </button>
            </div>

          </div>
        </div>
      )}
    </AdminLayout>
  );
}
