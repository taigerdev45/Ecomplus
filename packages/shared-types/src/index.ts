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
