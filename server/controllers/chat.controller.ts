import express, { Response } from 'express';
import {
  saveChat,
  createMessage,
  addMessageToChat,
  getChat,
  addParticipantToChat,
  getChatsByParticipants,
} from '../services/chat.service';
import { populateDocument } from '../utils/database.util';
import {
  CreateChatRequest,
  AddMessageRequestToChat,
  AddParticipantRequest,
  ChatIdRequest,
  GetChatByParticipantsRequest,
} from '../types/chat';
import { FakeSOSocket } from '../types/socket';
import { Message } from '../types/message';

/*
 * This controller handles chat-related routes.
 * @param socket The socket instance to emit events.
 * @returns {express.Router} The router object containing the chat routes.
 * @throws {Error} Throws an error if the chat creation fails.
 */
const chatController = (socket: FakeSOSocket) => {
  const router = express.Router();

  // This validates if a message is a valid message
  const isValidMessage = (message: Partial<Message>): boolean =>
    typeof message.msg === 'string' && typeof message.msgFrom === 'string';

  /**
   * Validates that the request body contains all required fields for a chat.
   * @param req The incoming request containing chat data.
   * @returns `true` if the body contains valid chat fields; otherwise, `false`.
   */
  const isCreateChatRequestValid = (req: CreateChatRequest): boolean => {
    if (!req.body?.participants?.length || req.body.participants.length < 2) {
      return false;
    }
    // This validates that the participants are valid
    if (!req.body.participants.every(id => typeof id === 'string' && id.trim().length > 0)) {
      return false;
    }
    // This validates that the messages are valid
    if (req.body.messages?.length) {
      if (!Array.isArray(req.body.messages)) {
        return false;
      }
      return req.body.messages.every(msg => isValidMessage(msg));
    }

    return true;
  };

  /**
   * Validates that the request body contains all required fields for a message.
   * @param req The incoming request containing message data.
   * @returns `true` if the body contains valid message fields; otherwise, `false`.
   */
  const isAddMessageRequestValid = (req: AddMessageRequestToChat): boolean => {
    if (!req.body?.msg || !req.body?.msgFrom) return false;
    return isValidMessage(req.body);
  };

  /**
   * Validates that the request body contains all required fields for a participant.
   * @param req The incoming request containing participant data.
   * @returns `true` if the body contains valid participant fields; otherwise, `false`.
   */
  const isAddParticipantRequestValid = (req: AddParticipantRequest): boolean => {
    const hasValidUserId =
      typeof req.body?.userId === 'string' && req.body.userId.trim().length > 0;
    const hasValidChatId =
      typeof req.params?.chatId === 'string' && req.params.chatId.trim().length > 0;

    return hasValidUserId && hasValidChatId;
  };

  /**
   * Creates a new chat with the given participants (and optional initial messages).
   * @param req The request object containing the chat data.
   * @param res The response object to send the result.
   * @returns {Promise<void>} A promise that resolves when the chat is created.
   * @throws {Error} Throws an error if the chat creation fails.
   */
  const createChatRoute = async (req: CreateChatRequest, res: Response): Promise<void> => {
    if (!isCreateChatRequestValid(req)) {
      res.status(400).send('Invalid chat request');
      return;
    }
    try {
      const chatFromDb = await saveChat({
        participants: req.body.participants,
        messages: req.body.messages || [],
      });

      if ('error' in chatFromDb) {
        throw new Error(chatFromDb.error as string);
      }

      const populatedChat = await populateDocument(chatFromDb._id.toString(), 'chat');
      // Needed this const result to add correct type to the result. Json will not use this to pass tests.
      const result = {
        chat: populatedChat,
        type: 'created',
      };
      socket.emit('chatUpdate', result);
      res.json(populatedChat);
    } catch (err) {
      res.status(500).send(`Error creating chat: ${(err as Error).message}`);
    }
  };

  /**
   * Adds a new message to an existing chat.
   * @param req The request object containing the message data.
   * @param res The response object to send the result.
   * @returns {Promise<void>} A promise that resolves when the message is added.
   * @throws {Error} Throws an error if the message addition fails.
   */
  const addMessageToChatRoute = async (
    req: AddMessageRequestToChat,
    res: Response,
  ): Promise<void> => {
    if (!isAddMessageRequestValid(req)) {
      res.status(400).send('Invalid message request');
      return;
    }

    try {
      // Create the message with type 'direct'
      const newMessage = await createMessage({
        msg: req.body.msg,
        msgFrom: req.body.msgFrom,
        type: 'direct',
        msgDateTime: req.body.msgDateTime || new Date(),
      });

      if ('error' in newMessage) {
        throw new Error(newMessage.error as string);
      }

      // Add the message to the chat
      const updatedChat = await addMessageToChat(
        req.params.chatId,
        newMessage._id?.toString() || '',
      );

      if ('error' in updatedChat) {
        throw new Error(updatedChat.error as string);
      }
      const populatedChat = await populateDocument(updatedChat._id.toString(), 'chat');
      const result = {
        chat: populatedChat,
        type: 'newMessage',
      };

      socket.emit('chatUpdate', result);

      res.json(populatedChat);
    } catch (err) {
      res.status(500).send(`Error adding message to chat: ${(err as Error).message}`);
    }
  };

  /**
   * Retrieves a chat by its ID, optionally populating participants and messages.
   * @param req The request object containing the chat ID.
   * @param res The response object to send the result.
   * @returns {Promise<void>} A promise that resolves when the chat is retrieved.
   * @throws {Error} Throws an error if the chat retrieval fails.
   */
  const getChatRoute = async (req: ChatIdRequest, res: Response): Promise<void> => {
    try {
      const { chatId } = req.params;
      const chat = await getChat(chatId);

      if ('error' in chat) {
        throw new Error(chat.error as string);
      }

      const populatedChat = await populateDocument(chat._id.toString(), 'chat');
      res.json(populatedChat);
    } catch (err) {
      res.status(500).send(`Error retrieving chat: ${(err as Error).message}`);
    }
  };

  /**
   * Retrieves chats for a user based on their username.
   * @param req The request object containing the username parameter in `req.params`.
   * @param res The response object to send the result, either the populated chats or an error message.
   * @returns {Promise<void>} A promise that resolves when the chats are successfully retrieved and populated.
   */
  const getChatsByUserRoute = async (
    req: GetChatByParticipantsRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const { username } = req.params;
      const chats = await getChatsByParticipants([username]);

      if ('error' in chats) {
        throw new Error(chats.error as string);
      }

      // Populate all chats with participant and message details
      const populatedChats = await Promise.all(
        chats.map(async chat => {
          const populated = await populateDocument(chat._id.toString(), 'chat');
          if ('error' in populated) {
            throw new Error(`Failed populating chats`);
          }
          return populated;
        }),
      );

      res.json(populatedChats);
    } catch (err) {
      res.status(500).send(`Error retrieving chat: ${(err as Error).message}`);
    }
  };

  /**
   * Adds a participant to an existing chat.
   * @param req The request object containing the participant data.
   * @param res The response object to send the result.
   * @returns {Promise<void>} A promise that resolves when the participant is added.
   * @throws {Error} Throws an error if the participant addition fails.
   */
  const addParticipantToChatRoute = async (
    req: AddParticipantRequest,
    res: Response,
  ): Promise<void> => {
    if (!isAddParticipantRequestValid(req)) {
      res.status(400).send('Invalid participant request');
      return;
    }
    try {
      const updatedChat = await addParticipantToChat(req.params.chatId, req.body.userId);
      if ('error' in updatedChat) {
        throw new Error(updatedChat.error as string);
      }
      socket.to(req.params.chatId).emit('chatUpdate', updatedChat);
      res.json(updatedChat);
    } catch (err) {
      res.status(500).send(`Error adding participant to chat: ${(err as Error).message}`);
    }
  };

  socket.on('connection', conn => {
    conn.on('joinChat', (chatId: string | undefined) => {
      if (chatId) {
        conn.join(chatId);
      }
    });
    conn.on('leaveChat', (chatId: string | undefined) => {
      if (chatId) {
        conn.leave(chatId);
      }
    });
  });

  // Register the routes
  router.post('/createChat', createChatRoute);
  router.post('/:chatId/addMessage', addMessageToChatRoute);
  router.get('/:chatId', getChatRoute);
  router.get('/getChatsByUser/:username', getChatsByUserRoute);
  router.post('/:chatId/addParticipant', addParticipantToChatRoute);
  return router;
};

export default chatController;
