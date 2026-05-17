import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { AuthRequest } from '../middlewares/auth.middleware';

// -------------------------------------------------------------
// TECHNICAL SUPPORT CHAT (CLIENT <-> ADMIN)
// -------------------------------------------------------------

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;

    let dbQuery = supabase
      .from('conversation')
      .select(`
        *,
        client:client!client_id(nom, email),
        agent:utilisateur!agent_id(nom)
      `);

    if (user.role === 'client') {
      dbQuery = dbQuery.eq('client_id', user.id);
    }

    const { data: conversations, error } = await dbQuery.order('updated_at', { ascending: false });

    if (error) throw error;

    // Flatten to format expected by frontend
    const formatted = conversations?.map((c: any) => ({
      id: c.id,
      client_id: c.client_id,
      agent_id: c.agent_id,
      status: c.status,
      created_at: c.created_at,
      updated_at: c.updated_at,
      client_name: c.client?.nom || 'Client inconnu',
      client_email: c.client?.email || '',
      agent_name: c.agent?.nom || ''
    })) || [];

    res.json({ success: true, conversations: formatted });
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des conversations' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const user = req.user!;

    // Verify conversation access
    if (user.role === 'client') {
      const { data: convCheck, error: checkError } = await supabase
        .from('conversation')
        .select('id')
        .eq('id', conversationId)
        .eq('client_id', user.id);

      if (checkError || !convCheck || convCheck.length === 0) {
        return res.status(403).json({ success: false, message: 'Accès non autorisé à cette conversation' });
      }
    }

    const { data: messages, error } = await supabase
      .from('message')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (!messages || messages.length === 0) {
      return res.json({ success: true, messages: [] });
    }

    const senderIds = Array.from(new Set(messages.map((m: any) => m.sender_id)));

    // Fetch from utilisateur (admins/agents)
    const { data: users } = await supabase
      .from('utilisateur')
      .select('id, nom, role')
      .in('id', senderIds);

    // Fetch from client
    const { data: clients } = await supabase
      .from('client')
      .select('id, nom')
      .in('id', senderIds);

    const senderMap: Record<string, { nom: string; role: string }> = {};

    users?.forEach((u: any) => {
      senderMap[u.id] = { nom: u.nom, role: u.role };
    });

    clients?.forEach((c: any) => {
      senderMap[c.id] = { nom: c.nom, role: 'client' };
    });

    const formatted = messages.map((m: any) => ({
      id: m.id,
      conversation_id: m.conversation_id,
      sender_id: m.sender_id,
      content: m.content,
      is_read: m.is_read,
      created_at: m.created_at,
      sender_name: senderMap[m.sender_id]?.nom || 'Utilisateur',
      sender_role: senderMap[m.sender_id]?.role || 'client'
    }));

    res.json({ success: true, messages: formatted });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des messages' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, content } = req.body;
    const user = req.user!;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Le contenu du message est requis' });
    }

    let targetConversationId = conversationId;

    // If client sends a message without a conversation, create one
    if (!targetConversationId && user.role === 'client') {
      const { data: existingConv } = await supabase
        .from('conversation')
        .select('id')
        .eq('client_id', user.id)
        .limit(1);

      if (existingConv && existingConv.length > 0) {
        targetConversationId = existingConv[0].id;
      } else {
        const { data: newConv, error: newConvErr } = await supabase
          .from('conversation')
          .insert({ client_id: user.id, status: 'open' })
          .select('id')
          .single();

        if (newConvErr) throw newConvErr;
        targetConversationId = newConv?.id;
      }
    }

    if (!targetConversationId) {
      return res.status(400).json({ success: false, message: 'ID de conversation manquant' });
    }

    // Verify access
    if (user.role === 'client') {
      const { data: convCheck } = await supabase
        .from('conversation')
        .select('id')
        .eq('id', targetConversationId)
        .eq('client_id', user.id);

      if (!convCheck || convCheck.length === 0) {
        return res.status(403).json({ success: false, message: 'Accès non autorisé à cette conversation' });
      }
    }

    // Insert message
    const { data: newMessage, error: insertError } = await supabase
      .from('message')
      .insert({
        conversation_id: targetConversationId,
        sender_id: user.id,
        content
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Update conversation timestamp
    await supabase
      .from('conversation')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', targetConversationId);

    // Fetch sender info dynamically
    let senderName = 'Utilisateur';
    let senderRole = 'client';

    if (user.role === 'client') {
      const { data: clientInfo } = await supabase
        .from('client')
        .select('nom')
        .eq('id', user.id)
        .single();
      senderName = clientInfo?.nom || 'Client';
      senderRole = 'client';
    } else {
      const { data: userInfo } = await supabase
        .from('utilisateur')
        .select('nom, role')
        .eq('id', user.id)
        .single();
      senderName = userInfo?.nom || 'Admin/Agent';
      senderRole = userInfo?.role || 'agent';
    }

    const formattedMessage = {
      ...newMessage,
      sender_name: senderName,
      sender_role: senderRole
    };

    res.json({ success: true, message: formattedMessage });
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi du message' });
  }
};

// -------------------------------------------------------------
// INTERNAL CHAT (ADMIN <-> AGENT <-> SECRETARY)
// -------------------------------------------------------------

export const getInternalMessages = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;

    // Block non-admin space users
    if (user.role === 'client') {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }

    const { data: messages, error } = await supabase
      .from('internal_message')
      .select(`
        *,
        sender:utilisateur!sender_id(nom, role)
      `)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const formatted = messages?.map((m: any) => ({
      id: m.id,
      sender_id: m.sender_id,
      content: m.content,
      created_at: m.created_at,
      sender_name: m.sender?.nom || 'Membre d\'équipe',
      sender_role: m.sender?.role || 'agent'
    })) || [];

    res.json({ success: true, messages: formatted });
  } catch (error: any) {
    console.error('Error fetching internal messages:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des messages' });
  }
};

export const sendInternalMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    const user = req.user!;

    // Block non-admin space users
    if (user.role === 'client') {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Le contenu du message est requis' });
    }

    const { data: newMessage, error } = await supabase
      .from('internal_message')
      .insert({
        sender_id: user.id,
        content
      })
      .select()
      .single();

    if (error) throw error;

    const { data: senderInfo } = await supabase
      .from('utilisateur')
      .select('nom, role')
      .eq('id', user.id)
      .single();

    const formattedMessage = {
      ...newMessage,
      sender_name: senderInfo?.nom || 'Membre d\'équipe',
      sender_role: senderInfo?.role || 'agent'
    };

    res.json({ success: true, message: formattedMessage });
  } catch (error: any) {
    console.error('Error sending internal message:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi du message' });
  }
};

export const createConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { client_id } = req.body;
    const user = req.user!;

    if (user.role === 'client') {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }

    if (!client_id) {
      return res.status(400).json({ success: false, message: 'ID client manquant' });
    }

    // Check if conversation already exists
    const { data: existingConv } = await supabase
      .from('conversation')
      .select('*')
      .eq('client_id', client_id)
      .limit(1);

    if (existingConv && existingConv.length > 0) {
      const c = existingConv[0];
      const { data: client } = await supabase.from('client').select('nom, email').eq('id', client_id).single();
      
      return res.json({ 
        success: true, 
        conversation: {
          id: c.id,
          client_id: c.client_id,
          agent_id: c.agent_id,
          status: c.status,
          created_at: c.created_at,
          updated_at: c.updated_at,
          client_name: client?.nom || 'Client inconnu',
          client_email: client?.email || ''
        }
      });
    }

    // Create new conversation
    const { data: newConv, error } = await supabase
      .from('conversation')
      .insert({ client_id, status: 'open' })
      .select()
      .single();

    if (error) throw error;

    const { data: client } = await supabase.from('client').select('nom, email').eq('id', client_id).single();

    res.json({
      success: true,
      conversation: {
        id: newConv.id,
        client_id: newConv.client_id,
        agent_id: newConv.agent_id,
        status: newConv.status,
        created_at: newConv.created_at,
        updated_at: newConv.updated_at,
        client_name: client?.nom || 'Client inconnu',
        client_email: client?.email || ''
      }
    });
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de la conversation' });
  }
};
