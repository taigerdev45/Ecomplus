'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import { useProduct } from '@/store/useProduct';
import { Plus, Edit, Trash2, Search, FileUp, X, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const { products, categories, isLoading, fetchProducts, fetchCategories, deleteProduct, createProduct, updateProduct } = useProduct();
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix_cny: '',
    poids_kg: '',
    categorie_id: '',
    stock: '1',
    lien_fournisseur: '',
    longueur_m: '0',
    largeur_m: '0',
    hauteur_m: '0',
    moq: '1'
  });
  
  const [couleurs, setCouleurs] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState('#4F46E5');
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

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      nom: product.nom,
      description: product.description || '',
      prix_cny: (product.prix_cny / 100).toString(),
      poids_kg: product.poids_kg.toString(),
      categorie_id: product.categorie_id,
      stock: product.stock.toString(),
      lien_fournisseur: product.lien_fournisseur || '',
      longueur_m: (product.longueur_m || 0).toString(),
      largeur_m: (product.largeur_m || 0).toString(),
      hauteur_m: (product.hauteur_m || 0).toString(),
      moq: (product.moq || 1).toString()
    });
    setCouleurs(product.couleurs || []);
    setImageFiles([]);
    setIsModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      nom: '',
      description: '',
      prix_cny: '',
      poids_kg: '',
      categorie_id: '',
      stock: '1',
      lien_fournisseur: '',
      longueur_m: '0',
      largeur_m: '0',
      hauteur_m: '0',
      moq: '1'
    });
    setCouleurs([]);
    setImageFiles([]);
    setIsModalOpen(true);
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
    const prixCnyCentimes = Math.round(Number(formData.prix_cny) * 100);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'prix_cny') {
        data.append(key, value);
      }
    });
    data.append('prix_cny', prixCnyCentimes.toString());
    data.append('couleurs', JSON.stringify(couleurs));
    
    imageFiles.forEach((file) => {
      data.append('images', file);
    });

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
        toast.success('Produit modifié avec succès');
      } else {
        await createProduct(data);
        toast.success('Produit ajouté avec succès');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement");
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
              onClick={handleOpenCreateModal}
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
                <th>MOQ / Stock</th>
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
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-white leading-tight">{product.nom}</span>
                        {product.lien_fournisseur ? (
                          <a 
                            href={product.lien_fournisseur} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-0.5"
                          >
                            Lien Fournisseur ↗
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic mt-0.5">Aucun lien</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="text-slate-500 dark:text-slate-400 text-xs font-semibold">{product.categorie_id}</td>
                  <td className="font-black text-slate-900 dark:text-white">
                    {Math.round((product.prix_cny / 100) * (useProduct.getState().exchangeRate || 95)).toLocaleString('fr-FR')} FCFA
                  </td>
                  <td>
                    <div className="flex flex-col gap-1">
                      <span className="badge badge-success text-[10px] py-0.5">
                        {product.stock} dispo
                      </span>
                      <span className="badge badge-warning text-[10px] py-0.5">
                        MOQ: {product.moq || 1}
                      </span>
                    </div>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => handleEdit(product)}
                        aria-label="Modifier le produit" 
                        title="Modifier le produit" 
                        className="btn-ghost btn-icon p-1.5 text-slate-400 hover:text-primary rounded-lg"
                      >
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
                  {product.lien_fournisseur && (
                    <a 
                      href={product.lien_fournisseur} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-1 inline-block"
                    >
                      Lien Fournisseur ↗
                    </a>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-50 dark:border-slate-800/40 text-xs">
                <div className="font-black text-primary">
                  {Math.round((product.prix_cny / 100) * (useProduct.getState().exchangeRate || 95)).toLocaleString('fr-FR')} FCFA
                </div>
                <div className="flex gap-1.5">
                  <span className="badge badge-success text-[10px]">
                    Stock: {product.stock}
                  </span>
                  <span className="badge badge-warning text-[10px]">
                    MOQ: {product.moq || 1}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(product)}
                  className="btn-outline w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs"
                >
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
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {editingProduct ? 'Modifier le Produit' : 'Ajouter un Produit'}
              </h2>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="product-price" className="block text-xs font-black uppercase tracking-wider text-slate-400">Prix (CNY) *</label>
                    <input id="product-price" required type="number" step="0.01" min="0" name="prix_cny" value={formData.prix_cny} onChange={handleInputChange} className="field" placeholder="10.50" title="Prix en CNY" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="product-weight" className="block text-xs font-black uppercase tracking-wider text-slate-400">Poids (KG) *</label>
                    <input id="product-weight" required type="number" step="0.01" min="0" name="poids_kg" value={formData.poids_kg} onChange={handleInputChange} className="field" placeholder="1.5" title="Poids en KG" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="product-stock" className="block text-xs font-black uppercase tracking-wider text-slate-400">Stock disponible *</label>
                    <input id="product-stock" required type="number" min="0" name="stock" value={formData.stock} onChange={handleInputChange} className="field" placeholder="10" title="Stock disponible" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="product-moq" className="block text-xs font-black uppercase tracking-wider text-slate-400">MOQ (Qté Minimum) *</label>
                    <input id="product-moq" required type="number" min="1" name="moq" value={formData.moq} onChange={handleInputChange} className="field" placeholder="1" title="Quantité minimale par commande" />
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

                {/* Colors management with Spectrum Picker */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400">Nuancier de couleurs</label>
                  <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={selectedColor} 
                        onChange={(e) => setSelectedColor(e.target.value)} 
                        className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent shrink-0" 
                        title="Choisir une couleur" 
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          if (!couleurs.includes(selectedColor)) {
                            setCouleurs([...couleurs, selectedColor]);
                          }
                        }}
                        className="btn-primary py-2 px-3 text-xs shrink-0"
                      >
                        Ajouter
                      </button>
                    </div>
                    
                    <div className="flex-1 flex flex-wrap gap-1.5 min-h-[40px] items-center border-l border-slate-200 dark:border-slate-700 pl-3">
                      {couleurs.length === 0 ? (
                        <span className="text-[10px] text-slate-400 italic">Aucune couleur</span>
                      ) : (
                        couleurs.map((color, index) => (
                          <div 
                            key={index} 
                            className="group relative flex items-center justify-center w-7 h-7 rounded-full shadow-sm border border-black/10 transition-transform hover:scale-110"
                            style={{ backgroundColor: color }}
                            title={color}
                          >
                            <button 
                              type="button" 
                              onClick={() => setCouleurs(couleurs.filter((_, idx) => idx !== index))}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm flex items-center justify-center"
                              style={{ width: '12px', height: '12px', fontSize: '8px' }}
                            >
                              <X className="h-2 w-2" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="block text-xs font-black uppercase tracking-wider text-slate-400">Images (Max 4) *</span>
                  <div className="flex flex-col justify-center rounded-2xl border border-dashed border-slate-200 px-6 py-5 text-center dark:border-slate-800 hover:bg-slate-50/50 transition-colors">
                    <Upload className="mx-auto h-6 w-6 text-slate-400" />
                    <label className="mt-2 relative cursor-pointer font-bold text-xs text-primary focus-within:outline-none hover:underline">
                      <span>Sélectionner des images</span>
                      <input id="product-images" required={imageFiles.length === 0 && !editingProduct} type="file" multiple accept="image/*" className="sr-only" onChange={handleFileChange} title="Sélectionner des images" />
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
