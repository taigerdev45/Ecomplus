import { Router } from 'express';

const router = Router();
const WEBHOOK_VERIFY_TOKEN = process.env.WA_VERIFY_TOKEN || 'ecom_plus_gabon_secret';

// Webhook verification (GET)
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
    console.log('WhatsApp Webhook Verified');
    return res.status(200).send(challenge);
  }
  
  return res.sendStatus(403);
});

// Handle incoming messages/updates (POST)
router.post('/', (req, res) => {
  const body = req.body;

  // Check if it's a WhatsApp message
  if (body.object === 'whatsapp_business_account') {
    if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
      const message = body.entry[0].changes[0].value.messages[0];
      const from = message.from;
      const text = message.text?.body;

      console.log(`Received message from ${from}: ${text}`);
      
      // Future logic: Parse message to validate quote or answer FAQ
    }
    
    // Always return 200 to acknowledge receipt
    return res.status(200).send('EVENT_RECEIVED');
  }

  return res.sendStatus(404);
});

export default router;
