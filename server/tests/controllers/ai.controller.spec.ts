import request from 'supertest';
import express from 'express';
import aiController from '../../controllers/ai.controller';
import * as aiService from '../../services/ai.service';

jest.mock('../../services/ai.service');

describe('AI Controller', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/ai', aiController());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /ai/chat', () => {
    it('should return AI response when message is valid', async () => {
      const mockResponse = { content: 'Hello, I am AI!' };
      jest.spyOn(aiService, 'getChatResponse').mockResolvedValue(mockResponse);

      const response = await request(app).post('/ai/chat').send({ message: 'Hello AI' });
      console.log('response', response);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ content: 'Hello, I am AI!' });
      expect(aiService.getChatResponse).toHaveBeenCalledWith('Hello AI');
    });

    it('should return 400 when message is missing', async () => {
      const response = await request(app).post('/ai/chat').send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid message format' });
    });

    it('should return 400 when message is not a string', async () => {
      const response = await request(app).post('/ai/chat').send({ message: 123 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid message format' });
    });

    it('should return 500 when AI service returns an error', async () => {
      const mockError = { content: null, error: 'Service error' };
      jest.spyOn(aiService, 'getChatResponse').mockResolvedValue(mockError);

      const response = await request(app).post('/ai/chat').send({ message: 'Hello AI' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Service error' });
    });

    it('should return 500 when AI service throws an error', async () => {
      jest.spyOn(aiService, 'getChatResponse').mockRejectedValue(new Error('Service failed'));

      const response = await request(app).post('/ai/chat').send({ message: 'Hello AI' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });
});
