import { z } from 'zod';

export const productSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  prix_cny: z.number().int().positive(),
  poids_kg: z.number().positive(),
  categorie_id: z.string().uuid(),
  images: z.array(z.string()).optional(),
  stock: z.number().int().nonnegative().default(0),
  lien_fournisseur: z.string().url().optional().or(z.literal('')),
});

export const categorySchema = z.object({
  nom: z.string().min(2),
  description: z.string().optional(),
  parent_id: z.string().uuid().optional().nullable(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
