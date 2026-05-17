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
  logo_url: z.string().nullable().optional(),
  description_services: z.string().min(1, 'La description est requise'),
  footer_text: z.string().min(1, 'Le texte de bas de page est requis'),
  whatsapp_service_1: z.string().nullable().optional().or(z.literal('')),
  whatsapp_service_2: z.string().nullable().optional().or(z.literal('')),
  exchange_rate: z.coerce.number().positive('Le taux de change doit être supérieur à 0'),
  cbm_rate: z.coerce.number().positive('Le tarif CBM doit être supérieur à 0'),
  airtel_money_number: z.string().nullable().optional().or(z.literal('')),
  airtel_money_name: z.string().nullable().optional().or(z.literal('')),
  moov_money_number: z.string().nullable().optional().or(z.literal('')),
  moov_money_name: z.string().nullable().optional().or(z.literal(''))
});

export const getConfig = async (req: Request, res: Response) => {
  try {
    let { data: siteConfig, error: siteConfigError } = await supabase
      .from('configuration_site')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (siteConfigError) throw siteConfigError;

    // Auto-seed initial configuration_site if missing
    if (!siteConfig) {
      const { data: newConfig, error: insertError } = await supabase
        .from('configuration_site')
        .insert({
          id: 1,
          description_services: 'Nous sourçons les meilleurs produits, nous négocions pour vous, et nous assurons la logistique jusqu\'à votre porte à Libreville.',
          footer_text: '© 2026 EcomPlus Gabon. Tous droits réservés.',
          whatsapp_service_1: '24100000000',
          whatsapp_service_2: '24111111111'
        })
        .select()
        .single();
      if (insertError) throw insertError;
      siteConfig = newConfig;
    }

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

    // Parallel configuration key upserts
    if (exchange_rate !== undefined) {
      await supabase
        .from('configuration')
        .upsert({ cle: 'TAUX_CHANGE_CNY_XAF', valeur: String(exchange_rate) });
    }

    if (cbm_rate !== undefined) {
      await supabase
        .from('configuration')
        .upsert({ cle: 'TARIF_CBM_XAF', valeur: String(cbm_rate) });
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
