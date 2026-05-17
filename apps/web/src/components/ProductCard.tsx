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
    <div className="group relative overflow-hidden rounded-[2rem] bg-card border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-primary/20">
      <Link href={`/produit/${product.id}`} className="block relative aspect-[4/3] overflow-hidden bg-secondary/50">
        <Image
          src={product.images[0] || 'https://via.placeholder.com/400'}
          alt={product.nom}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </Link>
      <div className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-full">
            {product.categorie_id}
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            {product.poids_kg} kg
          </span>
        </div>
        <Link href={`/produit/${product.id}`}>
          <h3 className="mb-3 line-clamp-1 text-base font-bold text-foreground transition-colors group-hover:text-primary">
            {product.nom}
          </h3>
        </Link>
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <p className="text-xl font-black text-foreground">
              {prixXaf.toLocaleString()} <span className="text-sm font-medium text-muted-foreground">FCFA</span>
            </p>
          </div>
          <button 
            onClick={handleAddToCart}
            className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:scale-110 active:scale-95 hover:shadow-lg hover:shadow-primary/30 z-10"
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
