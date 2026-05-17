import Image from 'next/image';
import { Product } from '@ecom/types';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  exchangeRate: number;
  categoryName?: string;
  compact?: boolean;
}

export function ProductCard({ product, exchangeRate, categoryName, compact }: ProductCardProps) {
  const { addItem } = useCart();
  const prixXaf = Math.round((product.prix_cny / 100) * exchangeRate);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.nom} ajouté au panier`);
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
            <span className="text-xs text-slate-400">{product.poids_kg} kg</span>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <p className="text-base font-black text-slate-900 dark:text-white">
              {prixXaf.toLocaleString()} <span className="text-xs font-bold text-primary">F</span>
            </p>
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
      {/* Image */}
      <Link href={`/produit/${product.id}`} className="relative block aspect-square overflow-hidden bg-slate-50 dark:bg-slate-800">
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

        {/* Price + Cart */}
        <div className="mt-3 flex items-center justify-between">
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
