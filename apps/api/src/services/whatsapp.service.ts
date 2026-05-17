import axios from 'axios';
import { WhatsAppMessageType, WhatsAppPayload } from '@ecom/types';
import { supabase } from '../lib/supabase';

const WA_API_VERSION = 'v20.0';
const WA_PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID;
const WA_CLOUD_API_TOKEN = process.env.WA_CLOUD_API_TOKEN;

/**
 * Send a WhatsApp message using Meta Cloud API
 */
export const sendMessage = async (payload: WhatsAppPayload) => {
  const { to, type, data } = payload;
  
  if (!WA_PHONE_NUMBER_ID || !WA_CLOUD_API_TOKEN) {
    console.warn('WhatsApp API credentials missing. Falling back to wa.me link generation.');
    return { fallback: await generateWAMeLink(payload) };
  }

  const url = `https://graph.facebook.com/${WA_API_VERSION}/${WA_PHONE_NUMBER_ID}/messages`;

  let templateName = '';
  let components: any[] = [];

  switch (type) {
    case 'DEVIS_READY':
      templateName = 'devis_pret'; // Name of approved template in Meta Dashboard
      components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: data.clientName },
            { type: 'text', text: data.reference || '' },
            { type: 'text', text: data.amount?.toLocaleString() || '0' },
            { type: 'text', text: data.link || '' }
          ]
        }
      ];
      break;

    case 'ORDER_CONFIRMED':
      templateName = 'commande_confirmee';
      components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: data.clientName },
            { type: 'text', text: data.trackingNumber || '' },
            { type: 'text', text: data.link || '' }
          ]
        }
      ];
      break;

    case 'STATUS_UPDATE':
      templateName = 'statut_commande_maj';
      components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: data.trackingNumber || '' },
            { type: 'text', text: data.status || '' },
            { type: 'text', text: data.link || '' }
          ]
        }
      ];
      break;
  }

  try {
    const response = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to: formatPhoneNumber(to),
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'fr' },
          components
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${WA_CLOUD_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('WhatsApp API Error:', error.response?.data || error.message);
    // If API fails, provide the fallback link
    return { 
      error: error.response?.data || error.message,
      fallback: await generateWAMeLink(payload) 
    };
  }
};

/**
 * Format phone number to international format without + or spaces
 * (Expected by WhatsApp API)
 */
const formatPhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

/**
 * Generate a wa.me link as fallback
 */
export const generateWAMeLink = async (payload: WhatsAppPayload): Promise<string> => {
  const { type, data } = payload;
  
  // Fetch dynamic customer service phone number from configuration_site
  let servicePhone = '24177000000'; // Default fallback
  try {
    const { data: config } = await supabase
      .from('configuration_site')
      .select('whatsapp_service_1')
      .eq('id', 1)
      .single();
    if (config?.whatsapp_service_1) {
      servicePhone = config.whatsapp_service_1.replace(/\D/g, '');
    }
  } catch (err) {
    console.error('Failed to fetch service phone number:', err);
  }
  
  let text = '';
  switch (type) {
    case 'DEVIS_READY':
      text = `Bonjour, mon devis ${data.reference} de ${data.amount?.toLocaleString()} F CFA est prêt. Voir les détails ici : ${data.link}`;
      break;
    case 'ORDER_CONFIRMED':
      text = `Bonjour, j'ai bien pris note de ma commande ${data.trackingNumber}. Suivi : ${data.link}`;
      break;
    case 'STATUS_UPDATE':
      text = `Bonjour, concernant ma commande ${data.trackingNumber} au statut "${data.status}". Détails : ${data.link}`;
      break;
  }

  return `https://wa.me/${servicePhone}?text=${encodeURIComponent(text)}`;
};
