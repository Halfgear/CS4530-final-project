import ChatModel from '../models/chat.model';
import MessageModel from '../models/messages.model';
import { Chat, ChatResponse, CreateChatPayload } from '../types/chat';
import { Message, MessageResponse } from '../types/message';

/**
 * Creates and saves a new chat document in the database, saving messages dynamically.
 *
 * @param chat - The chat object to be saved, including full message objects.
 * @returns {Promise<ChatResponse>} - Resolves with the saved chat or an error message.
 */
export const saveChat = async (chatPayload: CreateChatPayload): Promise<ChatResponse> => {
  try {
    // Verify all participants exist
    if (chatPayload.participants.length === 0) {
      throw Error('No participants or messages provided');
    }

    const messageResult = await MessageModel.create(chatPayload.messages);

    const result = await ChatModel.create({
      participants: chatPayload.participants,
      messages: messageResult.map((m: Message) => m._id),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (!result) {
      throw Error('Failed to create chat');
    }

    return result;
  } catch (error) {
    return { error: `Error occurred when saving chat: ${error}` };
  }
};

/**
 * Creates and saves a new message document in the database.
 * @param messageData - The message data to be created.
 * @returns {Promise<MessageResponse>} - Resolves with the created message or an error message.
 */
export const createMessage = async (messageData: Message): Promise<MessageResponse> => {
  try {
    const result = await MessageModel.create(messageData);
    if (!result) {
      throw Error('Failed to create message');
    }
    return result;
  } catch (error) {
    return { error: `Error occurred when creating message: ${error}` };
  }
};

/**
 * Adds a message ID to an existing chat.
 * @param chatId - The ID of the chat to update.
 * @param messageId - The ID of the message to add to the chat.
 * @returns {Promise<ChatResponse>} - Resolves with the updated chat object or an error message.
 */
export const addMessageToChat = async (
  chatId: string,
  messageId: string,
): Promise<ChatResponse> => {
  try {
    const result = await ChatModel.findByIdAndUpdate(
      chatId,
      { $push: { messages: messageId } },
      { new: true },
    );
    if (!result) {
      throw Error('Failed to add message to chat');
    }
    return result;
  } catch (error) {
    return { error: `Error occurred when adding message to chat: ${error}` };
  }
};

/**
 * Retrieves a chat document by its ID.
 * @param chatId - The ID of the chat to retrieve.
 * @returns {Promise<ChatResponse>} - Resolves with the found chat object or an error message.
 */
export const getChat = async (chatId: string): Promise<ChatResponse> => {
  try {
    const result = await ChatModel.findById(chatId);
    if (!result) {
      throw Error('Chat not found');
    }
    return result;
  } catch (error) {
    return { error: `Error occurred when getting chat: ${error}` };
  }
};

/**
 * Retrieves chats that include all the provided participants.
 * @param p An array of participant usernames to match in the chat's participants.
 * @returns {Promise<Chat[]>} A promise that resolves to an array of chats where the participants match.
 * If no chats are found or an error occurs, the promise resolves to an empty array.
 */
export const getChatsByParticipants = async (p: string[]): Promise<Chat[]> => {
  try {
    const result = await ChatModel.find({ participants: { $all: p } });
    if (!result) {
      throw Error('No chats found');
    }
    return result;
  } catch (error) {
    return [];
  }
};

/**
 * Adds a participant to an existing chat.
 *
 * @param chatId - The ID of the chat to update.
 * @param userId - The ID of the user to add to the chat.
 * @returns {Promise<ChatResponse>} - Resolves with the updated chat object or an error message.
 */
export const addParticipantToChat = async (
  chatId: string,
  userId: string,
): Promise<ChatResponse> => {
  try {
    const result = await ChatModel.findByIdAndUpdate(
      chatId,
      { $push: { participants: userId } },
      { new: true },
    );
    if (!result) {
      throw Error('Failed to add participant to chat');
    }
    return result;
  } catch (error) {
    return { error: `Error occurred when adding participant to chat: ${error}` };
  }
};
