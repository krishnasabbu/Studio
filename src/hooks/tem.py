// src/hooks/useChatHistory.ts

// Assuming you have this hook already
import { useState, useCallback } from 'react';
import { Message, ChatSession } from '../types';

export const useChatHistory = () => {
    // ... existing state and methods (chatSessions, currentChatId, messages, etc.)
    const [messages, setMessages] = useState<Message[]>([]);

    // A helper method to create a message with a temporary ID
    const insertBotMessage = useCallback((content: string): string => {
        const tempId = `temp-bot-${Date.now()}-${Math.random()}`;
        const newBotMessage: Message = {
            id: tempId,
            content: content,
            sender: 'bot',
            timestamp: new Date(),
            type: 'text',
        };
        setMessages(prevMessages => [...prevMessages, newBotMessage]);
        return tempId; // Return the temporary ID
    }, []);

    // A helper method to update a message based on its ID
    const updateBotMessage = useCallback((messageId: string, newContent: string) => {
        setMessages(prevMessages =>
            prevMessages.map(msg =>
                msg.id === messageId
                    ? { ...msg, content: newContent, timestamp: new Date() }
                    : msg
            )
        );
    }, []);

    // You would also need to update the `updateMessages` method or remove it if these new methods replace its functionality.
    // For now, let's assume you'll keep both.
    const updateMessages = useCallback((updater: (prev: Message[]) => Message[]) => {
      setMessages(updater);
    }, []);

    // ... return existing methods and new methods
    return {
        // ... existing returns
        messages,
        updateMessages,
        insertBotMessage,
        updateBotMessage,
    };
};
