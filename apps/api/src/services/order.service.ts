import { CommissionInfo, Devis, ShippingMethod, ShippingInfo, CartItem, DevisPreview } from '@ecom/types';

export const calculateCommission = (subtotal: number): CommissionInfo => {
  // Tranche 1: < 350 000 FCFA -> 10%
  if (subtotal < 350000) {
    return { taux: 10, montant: Math.round(subtotal * 0.10) };
  }
  // Tranche 2: 350 000 - 1 000 000 FCFA -> 15%
  if (subtotal >= 350000 && subtotal < 1000000) {
    return { taux: 15, montant: Math.round(subtotal * 0.15) };
  }
  // Tranche 3: >= 1 000 000 FCFA -> 20%
  return { taux: 20, montant: Math.round(subtotal * 0.20) };
};

export const calculateShipping = (
  method: ShippingMethod, 
  totalWeight: number,
  totalVolumeCbm: number,
  cbmRate: number
): ShippingInfo => {
  let rate = 10000;
  let delai = '7-15 jours';
  let montant = 0;

  if (method === 'AIR_EXPRESS') {
    rate = 15000;
    delai = '4-5 jours';
    montant = Math.round(totalWeight * rate);
  } else if (method === 'AIR_NORMAL') {
    rate = 10000;
    delai = '7-15 jours';
    montant = Math.round(totalWeight * rate);
  } else if (method === 'SEA') {
    delai = '30-45 jours';
    montant = Math.round(totalVolumeCbm * cbmRate);
  }

  return {
    method,
    montant,
    delai
  };
};

export const calculateQuote = (
  items: { 
    product: { 
      prix_cny: number; 
      poids_kg: number; 
      longueur_m?: number | null; 
      largeur_m?: number | null; 
      hauteur_m?: number | null;
    }; 
    quantity: number; 
  }[], 
  method: ShippingMethod, 
  exchangeRate: number,
  cbmRate: number = 450000
): DevisPreview => {
  // 1. Sous-total produits en XAF
  const subtotalProducts = items.reduce((acc, item) => {
    const priceXaf = (item.product.prix_cny / 100) * exchangeRate;
    return acc + (priceXaf * item.quantity);
  }, 0);

  // 2. Commission
  const commission = calculateCommission(subtotalProducts);

  // 3. Livraison (poids total et volume CBM total)
  const totalWeight = items.reduce((acc, item) => acc + (item.product.poids_kg * item.quantity), 0);
  
  const totalVolumeCbm = items.reduce((acc, item) => {
    // Si dimensions manquantes ou égales à 0, valeur par défaut de 0.1m (10cm)
    const l = item.product.longueur_m || 0.1;
    const w = item.product.largeur_m || 0.1;
    const h = item.product.hauteur_m || 0.1;
    const itemVolumeCbm = Number(l) * Number(w) * Number(h);
    return acc + (itemVolumeCbm * item.quantity);
  }, 0);

  const shipping = calculateShipping(method, totalWeight, totalVolumeCbm, cbmRate);

  // 4. Total TTC
  const total_ttc = subtotalProducts + commission.montant + shipping.montant;

  return {
    subtotal_products: Math.round(subtotalProducts),
    commission,
    shipping,
    total_ttc: Math.round(total_ttc)
  };
};

export const generateTrackingNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ECOM-${year}-${random}`;
};

import { supabase } from '../lib/supabase';
import { OrderStatus } from '@ecom/types';
import { whatsappQueue } from '../queues/whatsapp.queue';

export const createOrderFromQuote = async (quoteId: string) => {
  // 1. Fetch quote
  const { data: devis, error: fetchError } = await supabase
    .from('devis')
    .select('*')
    .eq('id', quoteId)
    .single();
  
  if (fetchError || !devis) throw new Error('Devis non trouvé');
  if (devis.status === 'VALIDATED') throw new Error('Ce devis a déjà été transformé en commande');

  const trackingNumber = `TEMP-${devis.reference}`;

  // 2. Create order
  const { data: order, error: orderError } = await supabase
    .from('commande')
    .insert({
      client_id: devis.client_id,
      devis_id: devis.id,
      numero_tracking: trackingNumber,
      statut: 'valide',
      items: devis.items,
      total_ttc: devis.total_ttc,
      date_livraison_estimee: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() // Default 15 days
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // 3. Update quote status
  await supabase
    .from('devis')
    .update({ status: 'VALIDATED' })
    .eq('id', quoteId);

  // 4. Create initial tracking step
  await supabase
    .from('suivi_commande')
    .insert({
      commande_id: order.id,
      statut: 'valide',
      commentaire: 'Commande validée et enregistrée.'
    });

  // 5. Trigger in-app notification for the client
  try {
    await supabase.from('notification').insert({
      client_id: devis.client_id,
      title: 'Commande validée',
      content: `Votre devis ${devis.reference} a été transformé en commande. N° tracking temporaire : ${trackingNumber}.`,
      type: 'devis',
      is_read: false
    });
  } catch (err) {
    console.error('Failed to create notification for validated quote:', err);
  }

  return order;
};

export const updateOrderStatus = async (
  orderId: string, 
  status: OrderStatus, 
  agentId: string, 
  comment?: string, 
  photos: string[] = []
) => {
  // 1. Fetch current order to check tracking number
  const { data: currentOrder } = await supabase
    .from('commande')
    .select('numero_tracking')
    .eq('id', orderId)
    .single();

  let updateFields: any = { statut: status, updated_at: new Date().toISOString() };
  
  if (currentOrder && (!currentOrder.numero_tracking || currentOrder.numero_tracking.startsWith('TEMP-'))) {
    // Generate tracking number only if transitioning to a paid/validated status
    if (status !== 'valide' && status !== 'annule') {
      updateFields.numero_tracking = generateTrackingNumber();
    }
  }

  // 2. Update order
  const { data: order, error: orderError } = await supabase
    .from('commande')
    .update(updateFields)
    .eq('id', orderId)
    .select()
    .single();

  if (orderError) throw orderError;

  // 2. Add tracking step
  const { error: stepError } = await supabase
    .from('suivi_commande')
    .insert({
      commande_id: orderId,
      statut: status,
      commentaire: comment,
      photos,
      agent_id: agentId
    });

  if (stepError) throw stepError;

  // 3. Notify client via WhatsApp
  const { data: client } = await supabase
    .from('utilisateur')
    .select('telephone, nom')
    .eq('id', order.client_id)
    .single();

  if (client) {
    await whatsappQueue.add('send-notification', {
      to: client.telephone,
      type: 'STATUS_UPDATE',
      data: {
        clientName: client.nom,
        trackingNumber: order.numero_tracking,
        status: status,
        link: `${process.env.CLIENT_URL || 'https://ecomplus.ga'}/suivi/${order.numero_tracking}`
      }
    });
  }

  // 4. Trigger in-app notification for the client
  try {
    const statusLabels: Record<string, string> = {
      valide: 'Validée',
      paye: 'Payée',
      en_cours: 'En cours de préparation',
      expedie: 'Expédiée',
      livre: 'Livrée',
      annule: 'Annulée'
    };
    const prettyStatus = statusLabels[status] || status;

    await supabase.from('notification').insert({
      client_id: order.client_id,
      title: 'Statut de commande mis à jour',
      content: `Votre commande ${order.numero_tracking || ''} est maintenant : "${prettyStatus}".`,
      type: 'commande',
      is_read: false
    });
  } catch (err) {
    console.error('Failed to create order status update notification:', err);
  }

  return order;
};

export const getOrderByTracking = async (trackingNumber: string) => {
  const { data: order, error } = await supabase
    .from('commande')
    .select(`
      *,
      client:utilisateur!client_id(nom),
      steps:suivi_commande(*)
    `)
    .eq('numero_tracking', trackingNumber)
    .single();

  if (error || !order) throw new Error('Numéro de suivi invalide');
  
  // Sort steps by date
  if (order.steps) {
    order.steps.sort((a: any, b: any) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }

  return order;
};
