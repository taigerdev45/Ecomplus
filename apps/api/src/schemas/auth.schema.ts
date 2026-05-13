import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  mot_de_passe: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  telephone: z.string().optional(),
  role: z.enum(['client', 'agent', 'secretaire', 'admin']).default('client'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  mot_de_passe: z.string(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
