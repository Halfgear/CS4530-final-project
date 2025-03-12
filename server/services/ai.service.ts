import OpenAI from 'openai';
import { AIResponse } from '../types/ai.response.d';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Sends a message to ChatGPT and gets a response
 */
export async function getChatResponse(message: string): Promise<AIResponse> {
  try {
    const completion = await client.chat.completions.create({
      messages: [{ role: 'user', content: message }],
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('No response from AI');
    }

    return { content: response };
  } catch (error) {
    console.error('Error in AI service:', error);
    return {
      content: null,
      error: 'Error getting response from AI service',
    };
  }
}

export default getChatResponse;
