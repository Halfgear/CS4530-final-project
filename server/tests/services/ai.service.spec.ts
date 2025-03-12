import { getChatResponse } from '../../services/ai.service';

describe('AI Service', () => {
  it('should get a response from AI', async () => {
    const response = await getChatResponse('Hello, this is a test message');
    console.log('AI Response:', response.content);
    expect(response).toBeDefined();
    expect(response.content).toBeDefined();
    expect(response.error).toBeUndefined();
  });
});
