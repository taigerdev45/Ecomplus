import { Queue, Worker } from 'bullmq';
import redisConnection from '../lib/redis';
import * as pdfService from '../services/pdf.service';
import { supabase } from '../lib/supabase';

import { whatsappQueue } from './whatsapp.queue';

export const pdfQueue = new Queue('pdf-generation', { connection: redisConnection });

export const pdfWorker = new Worker('pdf-generation', async (job) => {
  const { type, data, clientName } = job.data;
  
  // console.log(`Processing PDF generation for job ${job.id} (${type})`);

  try {
    let pdfUrl = '';
    if (type === 'DEVIS') {
      pdfUrl = await pdfService.generateDevisPDF(data, clientName);
      
      await supabase
        .from('devis')
        .update({ pdf_url: pdfUrl })
        .eq('id', data.id);
    } else if (type === 'RECU') {
      pdfUrl = await pdfService.generateReceiptPDF(data, clientName);
      
      await supabase
        .from('receipts')
        .update({ pdf_url: pdfUrl })
        .eq('id', data.id);
    }
    
    // DÉSACTIVÉ: Envoi WhatsApp complètement coupé pour les devis et reçus
    // conformément à la nouvelle logique (Espace Client).
    // Les utilisateurs se connecteront pour télécharger leurs PDF.

    console.log(`PDF Generated successfully: ${pdfUrl}`);
    return pdfUrl;
  } catch (error) {
    console.error(`Error in PDF worker:`, error);
    throw error;
  }
}, { connection: redisConnection });
