import { Response } from 'express';
import { supabase } from '../lib/supabase';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    let query = supabase
      .from('notification')
      .select('*')
      .order('created_at', { ascending: false });

    if (role === 'client') {
      // Clients get notifications assigned to their client_id
      query = query.eq('client_id', userId);
    } else {
      // Agents/Admins get notifications for staff (where client_id is null or assigned to user_id)
      query = query.or(`user_id.eq.${userId},client_id.is.null`);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const role = req.user!.role;

    let query = supabase
      .from('notification')
      .update({ is_read: true })
      .eq('id', id);

    if (role === 'client') {
      query = query.eq('client_id', userId);
    }

    const { data, error } = await query.select();
    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    let query = supabase
      .from('notification')
      .update({ is_read: true })
      .eq('is_read', false);

    if (role === 'client') {
      query = query.eq('client_id', userId);
    } else {
      query = query.or(`user_id.eq.${userId},client_id.is.null`);
    }

    const { error } = await query;
    if (error) throw error;

    res.json({ success: true, message: "Toutes les notifications ont été marquées comme lues." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const role = req.user!.role;

    let query = supabase
      .from('notification')
      .delete()
      .eq('id', id);

    if (role === 'client') {
      query = query.eq('client_id', userId);
    }

    const { error } = await query;
    if (error) throw error;

    res.json({ success: true, message: "Notification supprimée." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Utility function to trigger a new notification from other parts of the backend
export const createSystemNotification = async (payload: {
  userId?: string;
  clientId?: string;
  title: string;
  content: string;
  type: 'devis' | 'commande' | 'paiement' | 'chat' | 'systeme';
}) => {
  try {
    const { error } = await supabase
      .from('notification')
      .insert({
        user_id: payload.userId || null,
        client_id: payload.clientId || null,
        title: payload.title,
        content: payload.content,
        type: payload.type,
        is_read: false
      });
    if (error) throw error;
  } catch (error) {
    console.error('Error creating system notification:', error);
  }
};
