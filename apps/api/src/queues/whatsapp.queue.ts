import { Queue, Worker } from 'bullmq';
import redisConnection from '../lib/redis';
import * as whatsappService from '../services/whatsapp.service';
import { WhatsAppPayload } from '@ecom/types';

export const whatsappQueue = new Queue('whatsapp-sender', { 
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    }
  }
});

export const whatsappWorker = new Worker('whatsapp-sender', async (job) => {
  const payload: WhatsAppPayload = job.data;
  
  console.log(`Processing WhatsApp message for job ${job.id} (${payload.type})`);

  const result = (await whatsappService.sendMessage(payload)) as any;
  
  if (result.error && !result.fallback) {
    throw new Error(`WhatsApp API failed: ${JSON.stringify(result.error)}`);
  }

  if (result.fallback) {
    console.info(`WhatsApp API fallback generated for job ${job.id}: ${result.fallback}`);
  }

  return result;
}, { connection: redisConnection });
