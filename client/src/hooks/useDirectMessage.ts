import { useEffect, useState } from 'react';
import { Chat, ChatUpdatePayload, Message, User } from '../types';
import useUserContext from './useUserContext';
import { createChat, getChatById, getChatsByUser, sendMessage } from '../services/chatService';

/**
 * useDirectMessage is a custom hook that provides state and functions for direct messaging between users.
 * It includes a selected user, messages, and a new message state.
 */

const useDirectMessage = () => {
  const { user, socket } = useUserContext();
  const [showCreatePanel, setShowCreatePanel] = useState<boolean>(false);
  const [chatToCreate, setChatToCreate] = useState<string>('');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const handleJoinChat = (chatID: string) => {
    socket.emit('joinChat', chatID);
    setSelectedChat(chats.find(chat => chat._id === chatID) || null);
  };

  /** Sends a message to the selected chat if it's not empty */
  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;
    if (!selectedChat) return;
    const newMsg: Omit<Message, 'type'> = {
      msg: newMessage,
      msgFrom: user.username,
      msgDateTime: new Date(),
    };
    if (!selectedChat._id) return;
    await sendMessage(newMsg, selectedChat._id);
    setNewMessage('');
  };

  /** Handles the selection of a chat by fetching the chat details and updating the state variables */
  const handleChatSelect = async (chatID: string | undefined) => {
    if (!chatID) return;
    const chat = await getChatById(chatID);
    if (!chat) return;
    setSelectedChat(chat);
    setChats(chats.map(c => (c._id === chatID ? chat : c)));
    socket.emit('joinChat', chatID);
  };

  const handleUserSelect = (selectedUser: User) => {
    setChatToCreate(selectedUser.username);
  };

  /** Creates a new chat between the current user and the chosen user */
  const handleCreateChat = async () => {
    if (!user.username) return;
    if (!chatToCreate) return;
    const newChat = await createChat([user.username, chatToCreate]);
    if (!newChat) return;
    setSelectedChat(newChat);
    setChats([...chats, newChat]);
    setChatToCreate('');
    setShowCreatePanel(false);
  };

  useEffect(() => {
    const fetchChats = async () => {
      // Fetch all the chats with the current user and update the state variable.
      const userChats = await getChatsByUser(user.username);
      setChats(userChats);
    };

    /** Handles socket events for new chats and messages, updating state accordingly.
     * Only receives message updates for subscribed chat rooms */
    const handleChatUpdate = (chatUpdate: ChatUpdatePayload) => {
      const { chat, type } = chatUpdate;

      switch (type) {
        case 'created':
          // Only add the chat to the list if the current user is a participant
          if (chat.participants.includes(user.username)) {
            setChats(prevChats => [...prevChats, chat]);
          }
          break;

        case 'newMessage':
          setChats(prevChats =>
            prevChats.map(existingChat => (existingChat._id === chat._id ? chat : existingChat)),
          );
          setSelectedChat(currentChat => (currentChat?._id === chat._id ? chat : currentChat));
          break;

        default:
          throw new Error(`Invalid chat update type: ${type}`);
      }
    };

    fetchChats();

    // Register the 'chatUpdate' event listener
    socket.on('chatUpdate', handleChatUpdate);

    return () => {
      // Unsubscribe from the socket event
      socket.off('chatUpdate', handleChatUpdate);
      // Emit a socket event to leave the particular chat room
      // they are currently in when the component unmounts.
      if (selectedChat?._id) {
        socket.emit('leaveChat', selectedChat._id);
      }
    };
  }, [user.username, socket, selectedChat?._id]);

  return {
    selectedChat,
    chatToCreate,
    chats,
    newMessage,
    setNewMessage,
    showCreatePanel,
    setShowCreatePanel,
    handleSendMessage,
    handleChatSelect,
    handleUserSelect,
    handleCreateChat,
    handleJoinChat,
    // currentUser is to filter chats to only show ones where the current user is a participant
    currentUser: user.username,
  };
};

export default useDirectMessage;
