import { z } from 'zod';

export const quotePreviewSchema = z.object({
  items: z.array(z.object({
    product: z.object({
      id: z.string().uuid(),
      nom: z.string(),
      prix_cny: z.number(),
      poids_kg: z.number(),
      longueur_m: z.number().optional().nullable(),
      largeur_m: z.number().optional().nullable(),
      hauteur_m: z.number().optional().nullable(),
    }),
    quantity: z.number().int().positive(),
  })).min(1, 'Le panier est vide'),
  shippingMethod: z.enum(['AIR_NORMAL', 'AIR_EXPRESS', 'SEA']),
  address: z.string().min(5, 'Adresse trop courte'),
  city: z.string().min(2, 'Ville requise'),
  gps: z.string().optional(),
});

export const quoteRequestSchema = z.object({
  items: z.array(z.object({
    product: z.object({
      id: z.string().uuid(),
      nom: z.string(),
      prix_cny: z.number(),
      poids_kg: z.number(),
      longueur_m: z.number().optional().nullable(),
      largeur_m: z.number().optional().nullable(),
      hauteur_m: z.number().optional().nullable(),
    }),
    quantity: z.number().int().positive(),
  })).min(1, 'Le panier est vide'),
  shippingMethod: z.enum(['AIR_NORMAL', 'AIR_EXPRESS', 'SEA']),
  address: z.string().min(5, 'Adresse trop courte'),
  city: z.string().min(2, 'Ville requise'),
  whatsapp: z.string().min(8, 'Numéro WhatsApp requis'),
  gps: z.string().optional(),
});

export const orderSchema = z.object({
  // ... future order fields
});
