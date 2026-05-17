import { Queue, Worker } from 'bullmq';
import redisConnection from '../lib/redis';
import * as pdfService from '../services/pdf.service';
import { supabase } from '../lib/supabase';

import { whatsappQueue } from './whatsapp.queue';

export const pdfQueue = new Queue('pdf-generation', { connection: redisConnection });

export const pdfWorker = new Worker('pdf-generation', async (job) => {
  const { type, data, clientName } = job.data;
  console.log(`Dynamic PDF generation is now done on-the-fly in memory. Skipping background worker for job ${job.id} (${type})`);
  return '';
}, { connection: redisConnection });
