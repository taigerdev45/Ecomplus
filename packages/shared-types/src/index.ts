export type UserRole = 'client' | 'agent' | 'secretaire' | 'admin';

export interface User {
  id: string;
  email: string;
  nom: string;
  telephone: string;
  role: UserRole;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface RegisterDTO {
  email: string;
  mot_de_passe: string;
  nom: string;
  telephone: string;
  role?: UserRole;
}

export interface LoginDTO {
  email: string;
  mot_de_passe: string;
}

export interface Category {
  id: string;
  nom: string;
  description?: string;
  parent_id?: string;
  created_at: string;
}

export interface Product {
  id: string;
  nom: string;
  description: string;
  prix_cny: number; // en centimes (ex: 1000 = 10.00 CNY)
  poids_kg: number;
  categorie_id: string;
  images: string[]; // URLs des images (800x800)
  thumbnails?: string[]; // URLs des versions 200x200
  stock: number;
  lien_fournisseur?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  categorie_id?: string;
  prix_min?: number;
  prix_max?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type ShippingMethod = 'AIR' | 'SEA';

export interface QuoteRequest {
  items: CartItem[];
  shippingMethod: ShippingMethod;
  address: string;
  city: string;
  whatsapp: string;
  gps?: string;
}

export interface CommissionInfo {
  taux: number;
  montant: number;
}

export interface ShippingInfo {
  method: ShippingMethod;
  montant: number;
  delai: string;
}

export interface Devis {
  subtotal_products: number;
  commission: CommissionInfo;
  shipping: ShippingInfo;
  total_ttc: number;
}
