import { Request, Response } from 'express';
import { quoteRequestSchema } from '../schemas/order.schema';
import * as orderService from '../services/order.service';
import { supabase } from '../lib/supabase';

export const getQuotePreview = async (req: Request, res: Response) => {
  try {
    const validatedData = quoteRequestSchema.parse(req.body);
    
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

export const submitQuoteRequest = async (req: Request, res: Response) => {
  // Logic to save quote to DB and trigger WhatsApp notification will go here in Phase 4
  res.status(501).json({ message: 'Not implemented yet' });
};
