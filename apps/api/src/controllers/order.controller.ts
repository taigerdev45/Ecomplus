import { Request, Response } from 'express';
import { quoteRequestSchema, quotePreviewSchema } from '../schemas/order.schema';
import * as orderService from '../services/order.service';
import * as pdfService from '../services/pdf.service';
import { supabase } from '../lib/supabase';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getQuotePreview = async (req: Request, res: Response) => {
  try {
    const validatedData = quotePreviewSchema.parse(req.body);
    
    // Get current configurations from DB
    const { data: configData } = await supabase
      .from('configuration')
      .select('cle, valeur');
    
    const configMap = (configData || []).reduce((acc: Record<string, string>, item) => {
      acc[item.cle] = item.valeur;
      return acc;
    }, {});
    
    const exchangeRate = configMap['TAUX_CHANGE_CNY_XAF'] ? Number(configMap['TAUX_CHANGE_CNY_XAF']) : 95;
    const cbmRate = configMap['TARIF_CBM_XAF'] ? Number(configMap['TARIF_CBM_XAF']) : 450000;

    const quote = orderService.calculateQuote(
      validatedData.items,
      validatedData.shippingMethod,
      exchangeRate,
      cbmRate
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

    // 1. Get configurations from DB
    const { data: configData } = await supabase
      .from('configuration')
      .select('cle, valeur');
    
    const configMap = (configData || []).reduce((acc: Record<string, string>, item) => {
      acc[item.cle] = item.valeur;
      return acc;
    }, {});
    
    const exchangeRate = configMap['TAUX_CHANGE_CNY_XAF'] ? Number(configMap['TAUX_CHANGE_CNY_XAF']) : 95;
    const cbmRate = configMap['TARIF_CBM_XAF'] ? Number(configMap['TARIF_CBM_XAF']) : 450000;

    // 2. Calculate totals
    const quoteData = orderService.calculateQuote(
      validatedData.items,
      validatedData.shippingMethod,
      exchangeRate,
      cbmRate
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

    res.status(201).json({ 
      message: 'Demande de devis enregistrée avec succès. Vous pouvez le télécharger dès maintenant.',
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

export const rejectQuote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data: quote, error: fetchError } = await supabase
      .from('devis')
      .update({ status: 'EXPIRED' })
      .eq('id', id)
      .select()
      .single();

    if (fetchError || !quote) throw new Error('Devis non trouvé');
    res.status(200).json({ message: 'Devis rejeté', quote });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const submitOrderPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({ message: 'Référence de transaction requise' });
    }

    // 1. Fetch order
    const { data: order, error: fetchError } = await supabase
      .from('commande')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !order) throw new Error('Commande non trouvée');

    // 2. Add tracking step
    const { error: stepError } = await supabase
      .from('suivi_commande')
      .insert({
        commande_id: id,
        statut: order.statut,
        commentaire: `💰 Paiement soumis par le client. Référence de transaction : ${transactionId}. En attente de validation par l'équipe Ecom Plus.`
      });

    if (stepError) throw stepError;

    res.status(200).json({ message: 'Paiement soumis avec succès' });
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

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const mappedQuotes = (quotes || []).map((quote: any) => ({
      ...quote,
      pdf_url: `${baseUrl}/api/v1/orders/quotes/${quote.id}/download-pdf`
    }));

    res.json(mappedQuotes);
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
  res.json({ message: "Le PDF est généré à la volée de manière dynamique." });
};

export const downloadQuotePdf = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Fetch the devis
    let query = supabase
      .from('devis')
      .select('*')
      .eq('id', id);

    if (userRole === 'client') {
      query = query.eq('client_id', userId);
    }

    const { data: devis, error } = await query.single();
    if (error || !devis) {
      return res.status(404).json({ message: "Devis introuvable ou non autorisé" });
    }

    // Fetch client name from client table
    const { data: clientData } = await supabase
      .from('client')
      .select('nom')
      .eq('id', devis.client_id)
      .single();

    const clientName = clientData?.nom || 'Client Ecom Plus';
    const pdfBuffer = await pdfService.generateDevisPDF(devis, clientName);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=devis_${devis.reference}.pdf`);
    res.send(pdfBuffer);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const downloadReceiptPdf = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Fetch order
    let query = supabase
      .from('commande')
      .select('*')
      .eq('id', id);

    if (userRole === 'client') {
      query = query.eq('client_id', userId);
    }

    const { data: order, error } = await query.single();
    if (error || !order) {
      return res.status(404).json({ message: "Commande introuvable ou non autorisée" });
    }

    // Fetch client name from client table
    const { data: clientData } = await supabase
      .from('client')
      .select('nom')
      .eq('id', order.client_id)
      .single();

    const clientName = clientData?.nom || 'Client Ecom Plus';

    const receipt = {
      id: order.id,
      reference: `REC-${order.numero_tracking.replace('ECOM-', '')}`,
      order_id: order.id,
      tracking_number: order.numero_tracking,
      pdf_url: '',
      created_at: order.created_at
    };

    const pdfBuffer = await pdfService.generateReceiptPDF(receipt, clientName);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=recu_${order.numero_tracking}.pdf`);
    res.send(pdfBuffer);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
