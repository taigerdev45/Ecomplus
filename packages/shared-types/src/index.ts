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
  longueur_m?: number;
  largeur_m?: number;
  hauteur_m?: number;
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

export type ShippingMethod = 'AIR_NORMAL' | 'AIR_EXPRESS' | 'SEA';

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

export interface Devis extends DevisPreview {
  id: string;
  reference: string;
  client_id: string;
  items: CartItem[];
  status: 'PENDING' | 'VALIDATED' | 'CANCELLED' | 'EXPIRED';
  pdf_url?: string;
  created_at: string;
}

export interface Receipt {
  id: string;
  reference: string;
  order_id: string;
  tracking_number: string;
  pdf_url: string;
  created_at: string;
}

export interface DevisPreview {
  subtotal_products: number;
  commission: CommissionInfo;
  shipping: ShippingInfo;
  total_ttc: number;
}

export type OrderStatus = 
  | 'devis_envoye' 
  | 'en_attente_validation' 
  | 'valide'
  | 'commande_fournisseur' 
  | 'en_preparation' 
  | 'expedie_chine'
  | 'en_transit' 
  | 'arrive_libreville' 
  | 'en_cours_livraison' 
  | 'livre' 
  | 'annule';

export interface Order {
  id: string;
  client_id: string;
  agent_id?: string;
  devis_id: string;
  numero_tracking: string;
  statut: OrderStatus;
  items: CartItem[];
  total_ttc: number;
  date_livraison_estimee?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderStep {
  id: string;
  commande_id: string;
  statut: OrderStatus;
  commentaire?: string;
  photos: string[];
  agent_id?: string;
  created_at: string;
}

export type WhatsAppMessageType = 'DEVIS_READY' | 'ORDER_CONFIRMED' | 'STATUS_UPDATE';

export interface WhatsAppPayload {
  to: string;
  type: WhatsAppMessageType;
  data: {
    clientName: string;
    reference?: string;
    trackingNumber?: string;
    amount?: number;
    link?: string;
    status?: string;
  };
}
