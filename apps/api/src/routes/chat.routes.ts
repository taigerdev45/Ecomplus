import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  getInternalMessages, 
  sendInternalMessage,
  createConversation
} from '../controllers/chat.controller';

const router = Router();

// Protect all chat routes
router.use(authenticateJWT);

router.get('/conversations', getConversations);
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/messages', sendMessage);
router.post('/conversations', createConversation);

// Team Chat routes
router.get('/internal', getInternalMessages);
router.post('/internal', sendInternalMessage);

export default router;
