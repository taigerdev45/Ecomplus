import { CommissionInfo, Devis, ShippingMethod, ShippingInfo, CartItem } from '@ecom/types';

export const calculateCommission = (subtotal: number): CommissionInfo => {
  if (subtotal < 350000) {
    return { taux: 10, montant: Math.round(subtotal * 0.10) };
  }
  if (subtotal < 1000000) {
    return { taux: 15, montant: Math.round(subtotal * 0.15) };
  }
  return { taux: 20, montant: Math.round(subtotal * 0.20) };
};

export const calculateShipping = (method: ShippingMethod, totalWeight: number): ShippingInfo => {
  // Grille tarifaire simplifiée (Air: 10000 FCFA/kg, Sea: 2500 FCFA/kg)
  const rate = method === 'AIR' ? 10000 : 2500;
  const delai = method === 'AIR' ? '7-10 jours' : '30-45 jours';
  
  return {
    method,
    montant: Math.round(totalWeight * rate),
    delai
  };
};

export const calculateQuote = (
  items: { product: { prix_cny: number, poids_kg: number }, quantity: number }[], 
  method: ShippingMethod, 
  exchangeRate: number
): Devis => {
  // 1. Sous-total produits en XAF
  const subtotalProducts = items.reduce((acc, item) => {
    const priceXaf = (item.product.prix_cny / 100) * exchangeRate;
    return acc + (priceXaf * item.quantity);
  }, 0);

  // 2. Commission
  const commission = calculateCommission(subtotalProducts);

  // 3. Livraison (poids total)
  const totalWeight = items.reduce((acc, item) => acc + (item.product.poids_kg * item.quantity), 0);
  const shipping = calculateShipping(method, totalWeight);

  // 4. Total TTC
  const total_ttc = subtotalProducts + commission.montant + shipping.montant;

  return {
    subtotal_products: Math.round(subtotalProducts),
    commission,
    shipping,
    total_ttc: Math.round(total_ttc)
  };
};
