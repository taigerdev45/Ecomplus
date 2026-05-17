import Image from 'next/image';
import { Product } from '@ecom/types';
import Link from 'next/link';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { useProduct } from '@/store/useProduct';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  exchangeRate: number;
  categoryName?: string;
  compact?: boolean;
}

export function ProductCard({ product, exchangeRate, categoryName, compact }: ProductCardProps) {
  const { addItem } = useCart();
  const { likedProductIds, toggleLikeProduct } = useProduct();
  const prixXaf = Math.round((product.prix_cny / 100) * exchangeRate);
  
  const isLiked = likedProductIds.includes(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.nom} ajouté au panier`);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Check if token exists in localStorage to see if user is authenticated
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      return toast.error("Veuillez vous connecter pour aimer ce produit");
    }
    try {
      await toggleLikeProduct(product.id);
      toast.success(isLiked ? 'Produit retiré des favoris' : 'Produit ajouté aux favoris');
    } catch (err) {
      toast.error("Erreur lors de la modification des favoris");
    }
  };

  /* ── LIST / COMPACT mode ── */
  if (compact) {
    return (
      <div className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition-all hover:border-primary/20 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900">
        {/* Thumbnail */}
        <Link href={`/produit/${product.id}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-800">
          <Image
            src={product.images[0] || '/icons/logo_ecomplus.jpeg'}
            alt={product.nom}
            fill
            sizes="64px"
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
          {/* MOQ over thumbnail */}
          <span className="absolute bottom-1 left-1 bg-black/75 text-[8px] font-black text-white px-1.5 py-0.5 rounded-md backdrop-blur-sm">
            MOQ: {product.moq || 1}
          </span>
        </Link>

        {/* Info */}
        <div className="flex flex-1 min-w-0 items-center gap-3">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary/80">
              {categoryName || 'Import Chine'}
            </span>
            <Link href={`/produit/${product.id}`}>
              <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                {product.nom}
              </h3>
            </Link>
            
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-slate-400">{product.poids_kg} kg</span>
              {/* Color swatches */}
              {product.couleurs && product.couleurs.length > 0 && (
                <div className="flex gap-0.5">
                  {product.couleurs.slice(0, 3).map((color, idx) => (
                    <span 
                      key={idx} 
                      className="w-2 h-2 rounded-full border border-black/5 shadow-sm block" 
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <p className="text-base font-black text-slate-900 dark:text-white">
              {prixXaf.toLocaleString()} <span className="text-xs font-bold text-primary">F</span>
            </p>
            
            {/* Heart Button */}
            <button
              onClick={handleLike}
              className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
                isLiked 
                  ? 'bg-rose-50 border-rose-100 text-rose-500' 
                  : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600'
              }`}
              title="Aimer le produit"
            >
              <Heart className="h-4 w-4" fill={isLiked ? '#F43F5E' : 'none'} />
            </button>

            {/* Cart Button */}
            <button
              onClick={handleAddToCart}
              aria-label="Ajouter au panier"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/20 active:scale-95 dark:bg-slate-800 dark:text-slate-300"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── GRID mode (default) ── */
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:border-primary/20 dark:border-slate-800/80 dark:bg-slate-900">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-800">
        <Link href={`/produit/${product.id}`} className="block w-full h-full">
          <Image
            src={product.images[0] || '/icons/logo_ecomplus.jpeg'}
            alt={product.nom}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Link>

        {/* Heart button over image */}
        <button
          onClick={handleLike}
          className={`absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full shadow-sm backdrop-blur-md transition-all active:scale-90 ${
            isLiked 
              ? 'bg-rose-500 text-white' 
              : 'bg-white/80 text-slate-600 hover:bg-white hover:text-rose-500'
          }`}
          title={isLiked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart className="h-4 w-4" fill={isLiked ? 'currentColor' : 'none'} />
        </button>

        {/* MOQ overlay over image */}
        <span className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-sm text-[9px] font-black text-white px-2 py-0.5 rounded-full">
          MOQ: {product.moq || 1} pcs
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3">
        {/* Category */}
        <span className="mb-1.5 inline-block self-start rounded-full bg-primary/8 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-primary dark:bg-primary/15">
          {categoryName || 'Import Chine'}
        </span>

        {/* Title */}
        <Link href={`/produit/${product.id}`} className="flex-1">
          <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-primary dark:text-white">
            {product.nom}
          </h3>
        </Link>

        {/* Colors and specs row */}
        <div className="mt-2.5 flex items-center justify-between min-h-[16px]">
          {product.couleurs && product.couleurs.length > 0 ? (
            <div className="flex gap-1 items-center">
              {product.couleurs.slice(0, 4).map((color, idx) => (
                <span 
                  key={idx} 
                  className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-sm block hover:scale-110 transition-transform" 
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              {product.couleurs.length > 4 && (
                <span className="text-[8px] font-black text-slate-400">+{product.couleurs.length - 4}</span>
              )}
            </div>
          ) : (
            <span className="text-[10px] text-slate-400 italic">Teinte unique</span>
          )}
          <span className="text-[10px] text-slate-400">{product.poids_kg} kg</span>
        </div>

        {/* Price + Cart */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-50 dark:border-slate-800/40 pt-2.5">
          <div>
            <p className="text-base font-black text-slate-900 dark:text-white leading-none">
              {prixXaf.toLocaleString()}
            </p>
            <span className="text-[10px] font-bold text-primary">FCFA</span>
          </div>
          <button
            onClick={handleAddToCart}
            aria-label="Ajouter au panier"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all duration-200 hover:bg-primary hover:text-white hover:shadow-md hover:shadow-primary/25 active:scale-95 dark:bg-slate-800 dark:text-slate-300"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
