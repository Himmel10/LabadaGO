import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Message, Conversation, UserRole } from '@/types';

const MESSAGES_KEY = 'labadago_messages';
const CONVERSATIONS_KEY = 'labadago_conversations';

export const [MessageProvider, useMessages] = createContextHook(() => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const conversationsRef = useRef(conversations);
  conversationsRef.current = conversations;

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [storedMessages, storedConvos] = await Promise.all([
        AsyncStorage.getItem(MESSAGES_KEY),
        AsyncStorage.getItem(CONVERSATIONS_KEY),
      ]);
      if (storedMessages) setMessages(JSON.parse(storedMessages));
      if (storedConvos) setConversations(JSON.parse(storedConvos));
      console.log('Loaded messages:', storedMessages ? JSON.parse(storedMessages).length : 0);
    } catch (e) {
      console.log('Failed to load message data:', e);
    }
  };

  const saveMessages = useCallback(async (updated: Message[]) => {
    setMessages(updated);
    await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
  }, []);

  const saveConversations = useCallback(async (updated: Conversation[]) => {
    setConversations(updated);
    await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updated));
  }, []);

  const getOrCreateConversation = useCallback(async (
    participant1: { id: string; name: string; role: UserRole },
    participant2: { id: string; name: string; role: UserRole },
    orderId?: string,
  ): Promise<Conversation> => {
    const currentConvos = conversationsRef.current;
    const existing = currentConvos.find((c) => {
      const ids = c.participants.map((p) => p.id).sort();
      const target = [participant1.id, participant2.id].sort();
      return ids[0] === target[0] && ids[1] === target[1] && (orderId ? c.orderId === orderId : true);
    });

    if (existing) return existing;

    const newConvo: Conversation = {
      id: `convo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      participants: [participant1, participant2],
      orderId,
      unreadCount: { [participant1.id]: 0, [participant2.id]: 0 },
    };

    const updated = [newConvo, ...currentConvos];
    await saveConversations(updated);
    console.log('Created conversation:', newConvo.id);
    return newConvo;
  }, [saveConversations]);

  const sendMessage = useCallback(async (
    conversationId: string,
    senderId: string,
    senderName: string,
    senderRole: UserRole,
    receiverId: string,
    receiverName: string,
    text: string,
  ) => {
    const newMsg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      conversationId,
      senderId,
      senderName,
      senderRole,
      receiverId,
      receiverName,
      text,
      createdAt: new Date().toISOString(),
    };

    const updatedMessages = [...messagesRef.current, newMsg];
    await saveMessages(updatedMessages);

    const updatedConvos = conversationsRef.current.map((c) => {
      if (c.id === conversationId) {
        return {
          ...c,
          lastMessage: text,
          lastMessageAt: newMsg.createdAt,
          unreadCount: {
            ...c.unreadCount,
            [receiverId]: (c.unreadCount[receiverId] ?? 0) + 1,
          },
        };
      }
      return c;
    });
    await saveConversations(updatedConvos);
    console.log('Sent message in conversation:', conversationId);
    return newMsg;
  }, [saveMessages, saveConversations]);

  const getConversationMessages = useCallback((conversationId: string) => {
    return messages.filter((m) => m.conversationId === conversationId);
  }, [messages]);

  const getConversationsForUser = useCallback((userId: string) => {
    return conversations
      .filter((c) => c.participants.some((p) => p.id === userId))
      .sort((a, b) => {
        const aTime = a.lastMessageAt ?? '';
        const bTime = b.lastMessageAt ?? '';
        return bTime.localeCompare(aTime);
      });
  }, [conversations]);

  const markConversationRead = useCallback(async (conversationId: string, userId: string) => {
    const updated = conversationsRef.current.map((c) => {
      if (c.id === conversationId) {
        return {
          ...c,
          unreadCount: { ...c.unreadCount, [userId]: 0 },
        };
      }
      return c;
    });
    await saveConversations(updated);
  }, [saveConversations]);

  const getTotalUnread = useCallback((userId: string) => {
    return conversations.reduce((sum, c) => sum + (c.unreadCount[userId] ?? 0), 0);
  }, [conversations]);

  return {
    messages,
    conversations,
    getOrCreateConversation,
    sendMessage,
    getConversationMessages,
    getConversationsForUser,
    markConversationRead,
    getTotalUnread,
  };
});
