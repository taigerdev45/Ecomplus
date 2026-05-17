import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { hashPassword, comparePassword, generateTokens, verifyRefreshToken } from '../services/auth.service';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { AuthRequest } from '../middlewares/auth.middleware';
import { query } from '../lib/db';

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // Check if email already exists in either client or utilisateur
    const { data: existingClient } = await supabase
      .from('client')
      .select('id')
      .eq('email', validatedData.email)
      .single();

    const { data: existingUser } = await supabase
      .from('utilisateur')
      .select('id')
      .eq('email', validatedData.email)
      .single();

    if (existingClient || existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await hashPassword(validatedData.mot_de_passe);

    let newUser: any = null;
    let error: any = null;

    if (validatedData.role === 'client') {
      const { data, error: insertError } = await supabase
        .from('client')
        .insert([{
          email: validatedData.email,
          mot_de_passe: hashedPassword,
          nom: validatedData.nom,
          telephone: validatedData.telephone
        }])
        .select('id, email, nom, telephone, created_at')
        .single();
      
      if (data) {
        newUser = { ...data, role: 'client' };
      }
      error = insertError;
    } else {
      const { data, error: insertError } = await supabase
        .from('utilisateur')
        .insert([{
          email: validatedData.email,
          mot_de_passe: hashedPassword,
          nom: validatedData.nom,
          telephone: validatedData.telephone,
          role: validatedData.role
        }])
        .select('id, email, nom, telephone, role, created_at')
        .single();
      
      newUser = data;
      error = insertError;
    }

    if (error) throw error;

    const { accessToken, refreshToken } = generateTokens(newUser);

    if (newUser.role === 'client') {
      try {
        const ip = req.ip || req.socket.remoteAddress || '';
        const userAgent = req.headers['user-agent'] || '';
        await supabase.from('connexion_log').insert({
          client_id: newUser.id,
          ip,
          user_agent: userAgent
        });
      } catch (err) {
        console.error('Error logging connection after register:', err);
      }
    }

    res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.status(201).json({ user: newUser, accessToken });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erreur lors de l\'inscription' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, mot_de_passe } = loginSchema.parse(req.body);

    let user: any = null;

    // Try client table first
    const { data: clientUser } = await supabase
      .from('client')
      .select('*')
      .eq('email', email)
      .single();

    if (clientUser) {
      user = { ...clientUser, role: 'client' };
    } else {
      // Try utilisateur table (admins/agents)
      const { data: adminUser } = await supabase
        .from('utilisateur')
        .select('*')
        .eq('email', email)
        .single();

      if (adminUser) {
        user = adminUser;
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const isMatch = await comparePassword(mot_de_passe, user.mot_de_passe);
    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    if (user.role === 'client') {
      try {
        const ip = req.ip || req.socket.remoteAddress || '';
        const userAgent = req.headers['user-agent'] || '';
        await supabase.from('connexion_log').insert({
          client_id: user.id,
          ip,
          user_agent: userAgent
        });
      } catch (err) {
        console.error('Error logging connection:', err);
      }
    }

    res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 });

    const { mot_de_passe: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, accessToken });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erreur lors de la connexion' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ message: 'Déconnexion réussie' });
};

export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ message: 'Refresh token manquant' });

  try {
    const decoded = verifyRefreshToken(token) as any;
    let user: any = null;
    let error: any = null;

    if (decoded.role === 'client') {
      const { data, error: fetchErr } = await supabase
        .from('client')
        .select('id, email, nom, telephone')
        .eq('id', decoded.id)
        .single();
      
      if (data) {
        user = { ...data, role: 'client' };
      }
      error = fetchErr;
    } else {
      const { data, error: fetchErr } = await supabase
        .from('utilisateur')
        .select('id, email, nom, telephone, role')
        .eq('id', decoded.id)
        .single();
      user = data;
      error = fetchErr;
    }

    if (error || !user) throw new Error();

    const { accessToken } = generateTokens(user);
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 });
    
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: 'Session expirée' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Non autorisé' });
  
  if (req.user.role === 'client') {
    const { data: user, error } = await supabase
      .from('client')
      .select('id, email, nom, telephone, created_at')
      .eq('id', req.user.id)
      .single();

    if (error) return res.status(404).json({ message: 'Client non trouvé' });

    res.json({ user: { ...user, role: 'client' } });
  } else {
    const { data: user, error } = await supabase
      .from('utilisateur')
      .select('id, email, nom, telephone, role, created_at')
      .eq('id', req.user.id)
      .single();

    if (error) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    res.json({ user });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Non autorisé' });

  try {
    const { nom, telephone, mot_de_passe_actuel, nouveau_mot_de_passe } = req.body;
    const userTable = req.user.role === 'client' ? 'client' : 'utilisateur';

    const { data: user, error: fetchError } = await supabase
      .from(userTable)
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (fetchError || !user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const updates: any = {};
    if (nom) updates.nom = nom;
    if (telephone !== undefined) updates.telephone = telephone;

    if (nouveau_mot_de_passe) {
      if (!mot_de_passe_actuel) {
        return res.status(400).json({ message: 'Le mot de passe actuel est requis pour le modifier' });
      }

      const isMatch = await comparePassword(mot_de_passe_actuel, user.mot_de_passe);
      if (!isMatch) {
        return res.status(400).json({ message: 'Le mot de passe actuel est incorrect' });
      }

      updates.mot_de_passe = await hashPassword(nouveau_mot_de_passe);
    }

    let updatedUser: any = null;
    let updateError: any = null;

    if (req.user.role === 'client') {
      const { data, error } = await supabase
        .from('client')
        .update(updates)
        .eq('id', req.user.id)
        .select('id, email, nom, telephone, created_at')
        .single();
      
      if (data) {
        updatedUser = { ...data, role: 'client' };
      }
      updateError = error;
    } else {
      const { data, error } = await supabase
        .from('utilisateur')
        .update(updates)
        .eq('id', req.user.id)
        .select('id, email, nom, telephone, role, created_at')
        .single();
      
      updatedUser = data;
      updateError = error;
    }

    if (updateError) throw updateError;

    res.json({ success: true, user: updatedUser, message: 'Profil mis à jour avec succès' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erreur lors de la mise à jour du profil' });
  }
};

