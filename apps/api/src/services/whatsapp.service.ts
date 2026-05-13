import axios from 'axios';
import { WhatsAppMessageType, WhatsAppPayload } from '@ecom/types';

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
    return { fallback: generateWAMeLink(payload) };
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
      fallback: generateWAMeLink(payload) 
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
export const generateWAMeLink = (payload: WhatsAppPayload): string => {
  const { to, type, data } = payload;
  const phone = formatPhoneNumber(to);
  
  let text = '';
  switch (type) {
    case 'DEVIS_READY':
      text = `Bonjour ${data.clientName}, votre devis ${data.reference} est prêt. Montant: ${data.amount?.toLocaleString()} F CFA. Voir ici: ${data.link}`;
      break;
    case 'ORDER_CONFIRMED':
      text = `Bonjour ${data.clientName}, votre commande est confirmée ! N° tracking: ${data.trackingNumber}. Suivez ici: ${data.link}`;
      break;
    case 'STATUS_UPDATE':
      text = `Mise à jour commande ${data.trackingNumber}: Nouveau statut "${data.status}". Détails: ${data.link}`;
      break;
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};
