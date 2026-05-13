import Image from 'next/image';
import { Product } from '@ecom/types';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  exchangeRate: number;
}

export function ProductCard({ product, exchangeRate }: ProductCardProps) {
  const { addItem } = useCart();
  const prixXaf = Math.round((product.prix_cny / 100) * exchangeRate);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast.success(`${product.nom} ajouté au panier`);
  };

  return (
    <div className="group relative overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:bg-slate-900">
      <Link href={`/produit/${product.id}`} className="block relative aspect-square overflow-hidden bg-slate-100">
        <Image
          src={product.images[0] || 'https://via.placeholder.com/400'}
          alt={product.nom}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-primary uppercase tracking-wider">
            {product.categorie_id}
          </span>
          <span className="text-xs text-slate-500">
            {product.poids_kg} kg
          </span>
        </div>
        <Link href={`/produit/${product.id}`}>
          <h3 className="mb-2 line-clamp-1 text-sm font-semibold text-slate-900 dark:text-white">
            {product.nom}
          </h3>
        </Link>
        <div className="flex items-end justify-between">
          <div className="space-y-0.5">
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {prixXaf.toLocaleString()} F CFA
            </p>
            <p className="text-xs text-slate-500">
              {(product.prix_cny / 100).toFixed(2)} CNY
            </p>
          </div>
          <button 
            onClick={handleAddToCart}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white transition-colors hover:bg-primary/90"
            aria-label="Ajouter au panier"
            title="Ajouter au panier"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
