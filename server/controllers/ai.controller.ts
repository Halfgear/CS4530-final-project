import express, { Response, Request } from 'express';
import { getChatResponse } from '../services/ai.service';

const aiController = () => {
  const router = express.Router();

  /**
   * Handles AI chat requests by validating the message and getting a response from the AI service.
   *
   * @param req The request object containing the message.
   * @param res The HTTP response object used to send back the result.
   *
   * @returns A Promise that resolves to void.
   */
  const handleChat = async (req: Request, res: Response): Promise<void> => {
    try {
      const { message } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Invalid message format' });
        return;
      }

      const response = await getChatResponse(message);

      if (response.error) {
        res.status(500).json({ error: response.error });
        return;
      }

      res.status(200).json({ content: response.content });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // add appropriate HTTP verbs and their endpoints to the router
  router.post('/chat', handleChat);

  return router;
};

export default aiController;
