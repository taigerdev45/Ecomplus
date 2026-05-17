import { Request, Response } from 'express';
import { quoteRequestSchema, quotePreviewSchema } from '../schemas/order.schema';
import * as orderService from '../services/order.service';
import { supabase } from '../lib/supabase';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getQuotePreview = async (req: Request, res: Response) => {
  try {
    const validatedData = quotePreviewSchema.parse(req.body);
    
    // Get current exchange rate from DB
    const { data: rateData } = await supabase
      .from('configuration')
      .select('valeur')
      .eq('cle', 'TAUX_CHANGE_CNY_XAF')
      .single();
    
    const exchangeRate = rateData ? Number(rateData.valeur) : 95;

    const quote = orderService.calculateQuote(
      validatedData.items,
      validatedData.shippingMethod,
      exchangeRate
    );

    res.json(quote);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

import { pdfQueue } from '../queues/pdf.queue';

export const submitQuoteRequest = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = quoteRequestSchema.parse(req.body);
    const userId = req.user!.id;

    // 1. Get exchange rate
    const { data: rateData } = await supabase
      .from('configuration')
      .select('valeur')
      .eq('cle', 'TAUX_CHANGE_CNY_XAF')
      .single();
    const exchangeRate = rateData ? Number(rateData.valeur) : 95;

    // 2. Calculate totals
    const quoteData = orderService.calculateQuote(
      validatedData.items,
      validatedData.shippingMethod,
      exchangeRate
    );

    // 3. Save to DB
    const reference = `DEV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const { data: devis, error } = await supabase
      .from('devis')
      .insert({
        client_id: userId,
        reference,
        items: validatedData.items,
        subtotal_products: quoteData.subtotal_products,
        commission_taux: quoteData.commission.taux,
        commission_montant: quoteData.commission.montant,
        shipping_method: quoteData.shipping.method,
        shipping_montant: quoteData.shipping.montant,
        total_ttc: quoteData.total_ttc,
        status: 'PENDING'
      })
      .select()
      .single();

    if (error) throw error;

    // 4. Trigger PDF Generation in background
    await pdfQueue.add('generate-pdf', {
      type: 'DEVIS',
      data: devis,
      clientName: req.user!.nom || req.user!.email,
      whatsapp: null // DÉSACTIVÉ : On n'envoie plus par WhatsApp
    });

    res.status(201).json({ 
      message: 'Demande de devis enregistrée. Votre PDF sera disponible dans votre espace client sous peu.',
      devis 
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { quoteId } = req.params;
    const order = await orderService.createOrderFromQuote(quoteId);
    res.status(201).json(order);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const validateQuote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await orderService.createOrderFromQuote(id);
    res.status(200).json({ message: 'Devis validé', order });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { statut, commentaire, photos } = req.body;
    const agentId = req.user!.id;

    const order = await orderService.updateOrderStatus(
      id,
      statut,
      agentId,
      commentaire,
      photos
    );

    res.json(order);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getTrackingDetails = async (req: Request, res: Response) => {
  try {
    const { number } = req.params;
    const order = await orderService.getOrderByTracking(number);
    res.json(order);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const { data: orders, error } = await supabase
      .from('commande')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100); // Pagination / Protection anti-fuite mémoire

    if (error) throw error;
    res.json(orders);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getClientQuotes = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { data: quotes, error } = await supabase
      .from('devis')
      .select('*')
      .eq('client_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(quotes);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getClientOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { data: orders, error } = await supabase
      .from('commande')
      .select('*')
      .eq('client_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(orders);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const regenerateQuotePdf = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if the quote belongs to the user
    const { data: devis, error } = await supabase
      .from('devis')
      .select('*, utilisateur!client_id(nom)')
      .eq('id', id)
      .eq('client_id', userId)
      .single();

    if (error || !devis) {
      throw new Error("Devis introuvable ou non autorisé");
    }

    // Trigger PDF generation job and wait for it or just add to queue and return
    // Since we need it on demand, it's better to generate it directly or trigger the queue.
    // We will trigger the queue and tell the user it will be ready.
    await pdfQueue.add('generate-pdf', {
      type: 'DEVIS',
      data: devis,
      clientName: devis.utilisateur.nom,
      whatsapp: null // No whatsapp
    });

    res.json({ message: "La génération du PDF a été lancée. Il sera disponible dans quelques secondes." });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
