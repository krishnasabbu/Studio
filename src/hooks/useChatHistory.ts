import { useState, useEffect, useCallback } from 'react';
import { Message, ChatSession as BaseChatSession } from '../components/chatbot/types';

const STORAGE_KEY = 'chat-history';
const CURRENT_CHAT_KEY = 'current-chat-id';
const CHAT_HISTORY_VERSION = 1; // Increment when schema changes

// Extend ChatSession to make version required
export interface ChatSession extends BaseChatSession {
  version: number;
}

type StoredChatSession = ChatSession & { version?: number };

export const useChatHistory = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('default');
  const [messages, setMessages] = useState<Message[]>([]);

  /** ---------------------
   * Migration Logic
   * --------------------- */
  const migrateSession = (session: any): ChatSession => {
    if (!session.version || session.version < CHAT_HISTORY_VERSION) {
      // Old or missing schema, migrate
      return {
        ...session,
        id: session.id || 'chat-' + Date.now(),
        title: session.title || 'Untitled Chat',
        timestamp: session.timestamp ? new Date(session.timestamp) : new Date(),
        preview: session.preview || '',
        messages: Array.isArray(session.messages)
          ? session.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp || Date.now()),
            }))
          : [],
        version: CHAT_HISTORY_VERSION,
      };
    }

    // Already latest version
    return {
      ...session,
      timestamp: new Date(session.timestamp),
      messages: Array.isArray(session.messages)
        ? session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
        : [],
      version: session.version,
    };
  };

  /** ---------------------
   * Load from Storage
   * --------------------- */
  useEffect(() => {
    try {
      const savedSessions = localStorage.getItem(STORAGE_KEY);
      const savedCurrentId = localStorage.getItem(CURRENT_CHAT_KEY);

      if (savedSessions) {
        let parsedSessions: any[] = [];
        try {
          parsedSessions = JSON.parse(savedSessions);
        } catch (e) {
          console.warn('Corrupted chat history JSON, resetting:', e);
        }

        if (!Array.isArray(parsedSessions)) {
          parsedSessions = [];
        }

        const migratedSessions: ChatSession[] = parsedSessions.map(migrateSession);
        setChatSessions(migratedSessions);
      }

      if (savedCurrentId) {
        setCurrentChatId(savedCurrentId);
      }
    } catch (error) {
      console.warn('Failed to load chat history:', error);
      setChatSessions([]);
      setCurrentChatId('default');
    }
  }, []);

  /** ---------------------
   * Save to Storage
   * --------------------- */
  useEffect(() => {
    try {
      const sessionsToSave: StoredChatSession[] = chatSessions.map(s => ({
        ...s,
        version: CHAT_HISTORY_VERSION,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionsToSave));
    } catch (error) {
      console.warn('Failed to save chat history:', error);
    }
  }, [chatSessions]);

  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_CHAT_KEY, currentChatId);
    } catch (error) {
      console.warn('Failed to save current chat ID:', error);
    }
  }, [currentChatId]);

  /** ---------------------
   * Load Messages for Current Chat
   * --------------------- */
  useEffect(() => {
    const currentSession = chatSessions.find(session => session.id === currentChatId);
    if (currentSession && Array.isArray(currentSession.messages)) {
      setMessages(currentSession.messages);
    } else {
      setMessages([]);
    }
  }, [currentChatId, chatSessions]);

  /** ---------------------
   * Save Current Chat
   * --------------------- */
  const saveCurrentChat = useCallback(
    (chatMessages: Message[] | ((prev: Message[]) => Message[])) => {
      const getMessagesArray = (): Message[] => {
        if (typeof chatMessages === 'function') {
          const result = chatMessages(messages);
          return Array.isArray(result) ? result : [];
        }
        return Array.isArray(chatMessages) ? chatMessages : [];
      };

      const finalMessages = getMessagesArray();
      if (finalMessages.length === 0) return;

      const firstUserMessage = finalMessages.find(msg => msg.sender === 'user');
      const title = firstUserMessage?.content
        ? firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
        : 'New Chat';
      const preview = firstUserMessage?.content
        ? firstUserMessage.content.slice(0, 100) + (firstUserMessage.content.length > 100 ? '...' : '')
        : '';

      setChatSessions(prev => {
        const existingIndex = prev.findIndex(session => session.id === currentChatId);
        const updatedSession: ChatSession = {
          id: currentChatId,
          title,
          timestamp: new Date(),
          preview,
          messages: finalMessages,
          version: CHAT_HISTORY_VERSION,
        };

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = updatedSession;
          return updated;
        } else {
          return [updatedSession, ...prev];
        }
      });
    },
    [currentChatId, messages]
  );

  /** ---------------------
   * Chat Management
   * --------------------- */
  const createNewChat = useCallback(() => {
    const newChatId = 'chat-' + Date.now();
    setCurrentChatId(newChatId);
    setMessages([]);
    return newChatId;
  }, []);

  const selectChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId);
  }, []);

  const deleteChat = useCallback(
    (chatId: string) => {
      setChatSessions(prev => prev.filter(session => session.id !== chatId));
      if (currentChatId === chatId) {
        createNewChat();
      }
    },
    [currentChatId, createNewChat]
  );

  /** ---------------------
   * Update Messages
   * --------------------- */
  const updateMessages = useCallback(
    (newMessages: Message[] | ((prev: Message[]) => Message[])) => {
      if (typeof newMessages === 'function') {
        setMessages(prev => {
          const result = newMessages(prev);
          if (!Array.isArray(result)) {
            console.error('updateMessages: function did not return an array:', result);
            return prev;
          }
          saveCurrentChat(result);
          return result;
        });
      } else if (Array.isArray(newMessages)) {
        setMessages(newMessages);
        saveCurrentChat(newMessages);
      } else {
        console.error('updateMessages: invalid value:', newMessages);
      }
    },
    [saveCurrentChat]
  );

  return {
    chatSessions,
    currentChatId,
    messages,
    createNewChat,
    selectChat,
    deleteChat,
    updateMessages,
    saveCurrentChat,
  };
};
