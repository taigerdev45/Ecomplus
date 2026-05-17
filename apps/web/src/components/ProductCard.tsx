import Image from 'next/image';
import { Product } from '@ecom/types';
import Link from 'next/link';
import { ShoppingCart, Ruler } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  exchangeRate: number;
  categoryName?: string;
}

export function ProductCard({ product, exchangeRate, categoryName }: ProductCardProps) {
  const { addItem } = useCart();
  const prixXaf = Math.round((product.prix_cny / 100) * exchangeRate);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast.success(`${product.nom} ajouté au panier`);
  };

  // Dimensions formatted nicely if present
  const hasDimensions = product.longueur_m && product.largeur_m && product.hauteur_m;
  const formattedDimensions = hasDimensions 
    ? `${product.longueur_m} × ${product.largeur_m} × ${product.hauteur_m} m`
    : null;

  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:border-primary/20">
      {/* Product Image Link */}
      <Link href={`/produit/${product.id}`} className="block relative aspect-[4/3] overflow-hidden bg-slate-50 dark:bg-slate-950">
        <Image
          src={product.images[0] || '/icons/logo_ecomplus.jpeg'}
          alt={product.nom}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </Link>

      {/* Card Content */}
      <div className="p-5">
        {/* Category & Weight Row */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[10px] font-bold text-primary bg-primary/5 dark:bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
            {categoryName || 'Import Chine'}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded-md">
            {product.poids_kg} kg
          </span>
        </div>

        {/* Product Title */}
        <Link href={`/produit/${product.id}`}>
          <h3 className="mb-2 line-clamp-1 text-base font-extrabold text-slate-950 dark:text-white transition-colors group-hover:text-primary leading-tight">
            {product.nom}
          </h3>
        </Link>

        {/* Dimensions Display if present */}
        {formattedDimensions && (
          <div className="mb-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <Ruler className="h-3.5 w-3.5 text-slate-400" />
            <span className="truncate">{formattedDimensions}</span>
          </div>
        )}

        {/* Price & Add to Cart Action Row */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800/40">
          <div className="space-y-0.5">
            <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {prixXaf.toLocaleString()} <span className="text-xs font-bold text-primary">FCFA</span>
            </p>
          </div>
          <button 
            onClick={handleAddToCart}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all duration-300 hover:bg-primary hover:text-white hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-primary/20 z-10"
            aria-label="Ajouter au panier"
            title="Ajouter au panier"
          >
            <ShoppingCart className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
