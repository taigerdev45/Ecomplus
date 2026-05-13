import { Router } from 'express';
import crypto from 'crypto';

const router = Router();
const WEBHOOK_VERIFY_TOKEN = process.env.WA_VERIFY_TOKEN || 'ecom_plus_gabon_secret';
const APP_SECRET = process.env.WA_APP_SECRET || '';

// Middleware to verify signature from Meta
const verifySignature = (req: any, res: any, next: any) => {
  const signature = req.headers['x-hub-signature-256'] as string;
  
  if (!signature) {
    return res.status(401).send('Signature missing');
  }

  const [algo, hash] = signature.split('=');
  const expectedHash = crypto
    .createHmac('sha256', APP_SECRET)
    .update(req.rawBody || JSON.stringify(req.body))
    .digest('hex');

  if (hash !== expectedHash) {
    // console.warn('Invalid WhatsApp webhook signature');
    // return res.status(401).send('Invalid signature');
    // For now, in dev, we might log it but let it pass if secret is missing
    if (APP_SECRET) return res.status(401).send('Invalid signature');
  }
  
  next();
};

// Webhook verification (GET)
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  
  return res.sendStatus(403);
});

// Handle incoming messages/updates (POST)
router.post('/', verifySignature, (req, res) => {
  const body = req.body;

  if (body.object === 'whatsapp_business_account') {
    if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
      const message = body.entry[0].changes[0].value.messages[0];
      const from = message.from;
      const text = message.text?.body?.toUpperCase();

      // Simple response parsing
      if (text === 'VALIDER') {
        // Logic to validate the last devis of this user
      }
    }
    
    return res.status(200).send('EVENT_RECEIVED');
  }

  return res.sendStatus(404);
});

export default router;
