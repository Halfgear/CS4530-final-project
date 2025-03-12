import OpenAI from 'openai';
import dotenv from 'dotenv';
import { AIResponse } from '../types/ai.response.d';

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Sends a message to ChatGPT and gets a response
 */
export async function getChatResponse(message: string): Promise<AIResponse> {
  if (!message.trim()) {
    return {
      content: null,
      error: 'Message cannot be empty',
    };
  }

  try {
    const completion = await client.chat.completions.create({
      messages: [{ role: 'user', content: message }],
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('No response from AI');
    }

    return { content: response };
  } catch (error) {
    return {
      content: null,
      error: error instanceof Error ? error.message : 'Error getting response from AI service',
    };
  }
}

export default getChatResponse;
