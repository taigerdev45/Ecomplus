import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { processAndUploadImage } from '../services/upload.service';
import { z } from 'zod';
import { query } from '../lib/db';

export const recordVisit = async (req: Request, res: Response) => {
  try {
    const { page } = req.body;
    const ip = req.ip || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    const { error } = await supabase
      .from('visite')
      .insert({
        ip,
        user_agent: userAgent,
        page: page || '/'
      });

    if (error) throw error;

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error recording visit:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const configSchema = z.object({
  logo_url: z.string().optional(),
  description_services: z.string().min(10, 'La description doit faire au moins 10 caractères'),
  footer_text: z.string().min(5, 'Le footer doit faire au moins 5 caractères'),
  whatsapp_service_1: z.string().min(8, 'Numéro WhatsApp invalide'),
  whatsapp_service_2: z.string().min(8, 'Numéro WhatsApp invalide'),
  exchange_rate: z.number().positive('Le taux de change doit être supérieur à 0'),
  cbm_rate: z.number().positive('Le tarif CBM doit être supérieur à 0')
});

export const getConfig = async (req: Request, res: Response) => {
  try {
    const { data: siteConfig, error: siteConfigError } = await supabase
      .from('configuration_site')
      .select('*')
      .eq('id', 1)
      .single();

    if (siteConfigError) throw siteConfigError;

    // Fetch exchange rate and CBM rate from configuration table
    const { data: configData } = await supabase
      .from('configuration')
      .select('cle, valeur');

    const configMap = (configData || []).reduce((acc: any, item) => {
      acc[item.cle] = item.valeur;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        ...siteConfig,
        exchange_rate: configMap['TAUX_CHANGE_CNY_XAF'] ? Number(configMap['TAUX_CHANGE_CNY_XAF']) : 95,
        cbm_rate: configMap['TARIF_CBM_XAF'] ? Number(configMap['TARIF_CBM_XAF']) : 450000
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateConfig = async (req: Request, res: Response) => {
  try {
    const validatedData = configSchema.parse(req.body);

    const { exchange_rate, cbm_rate, ...siteData } = validatedData;

    const { data, error } = await supabase
      .from('configuration_site')
      .update({
        ...siteData,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)
      .select()
      .single();

    if (error) throw error;

    // Parallel configuration key updates
    if (exchange_rate !== undefined) {
      await supabase
        .from('configuration')
        .update({ valeur: String(exchange_rate) })
        .eq('cle', 'TAUX_CHANGE_CNY_XAF');
    }

    if (cbm_rate !== undefined) {
      await supabase
        .from('configuration')
        .update({ valeur: String(cbm_rate) })
        .eq('cle', 'TARIF_CBM_XAF');
    }

    res.status(200).json({
      success: true,
      data: {
        ...data,
        exchange_rate,
        cbm_rate
      },
      message: 'Configuration mise à jour avec succès'
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.errors
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const uploadLogo = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier fourni' });
    }

    // Reuse the existing processAndUploadImage from upload.service
    // Note: processAndUploadImage currently uploads to 'products' bucket. 
    // For a real production app, we might want a 'branding' bucket, but let's stick to existing tools.
    const { url800 } = await processAndUploadImage(req.file);

    // Update the config with the new logo URL
    const { data, error } = await supabase
      .from('configuration_site')
      .update({
        logo_url: url800,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: { logo_url: url800 },
      message: 'Logo mis à jour avec succès'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
