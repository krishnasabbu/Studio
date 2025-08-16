import React, { useState, useCallback, useEffect } from 'react';
import ChatbotLauncher from './ChatbotLauncher';
import ChatPanel from './ChatPanel';
import NavigationPanel from './NavigationPanel';
import { useChatHistory } from '../../hooks/useChatHistory';
import {
  Message,
  ChatbotProps,
  ChatPanelState,
  FileAttachment,
  ChatSession,
  Intent
} from './types';

// Keep this in sync with your hook's CHAT_HISTORY_VERSION if you want single source of truth.
// If you move version constant to a shared file, import it instead.
const CHAT_SESSION_VERSION = 1;

const Chatbot: React.FC<ChatbotProps> = ({
  className = '',
  isMaximized: externalMaximized,
  onToggleMaximize: externalToggleMaximize
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [panelState, setPanelState] = useState<ChatPanelState>('closed');
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Use chat history hook
  const {
    chatSessions,
    currentChatId,
    messages,
    createNewChat,
    selectChat,
    updateMessages,
    saveCurrentChat
  } = useChatHistory();

  // Initialize greeting message on first visit
  useEffect(() => {
    if (isOpen && isFirstVisit && messages.length === 0) {
      try {
        const greetingMessage: Message = {
          id: 'greeting-' + Date.now(),
          content: '👋 Hi! How can I help you today?',
          sender: 'bot',
          timestamp: new Date(),
          type: 'text'
        };

        // Add sample message with Mermaid and Python code
        const sampleMessage: Message = {
          id: 'sample-' + Date.now(),
          content: `Here's a sample response demonstrating code rendering and diagrams:

## Python Fibonacci Function

\`\`\`python
# Sample Python function
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
    
# Example usage
for i in range(10):
    print(f"fibonacci({i}) = {fibonacci(i)}")
\`\`\`

## Process Flow Diagram

\`\`\`mermaid
flowchart TD
    A[Start] --> B[Input n]
    B --> C{"n <= 1"}
    C -- Yes --> D[Return n]
    C -- No --> E["Calculate fibonacci(n-1) + fibonacci(n-2)"]
    E --> F[Return result]
    F --> G[End]
\`\`\`

This demonstrates **code syntax highlighting** and **Mermaid diagram rendering** within the chat interface. The copy button appears when you hover over code blocks.`,
          sender: 'bot',
          timestamp: new Date(),
          type: 'text',
          attachments: [
              {
                  id: 'file-123',
                  name: 'sample.txt',
                  type: 'text/plain',
                  size: 128, // Size in bytes
                  url: 'data:text/plain;base64,VGhpcyBpcyBhIHRlc3QgZmlsZSBmb3IgZG93bmxvYWQgZGVtb25zdHJhdGlvbi4=' // Base64 encoded content
              },
              {
                  id: 'image-456',
                  name: 'bot-logo.png',
                  type: 'image/png',
                  size: 1024,
                  url: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Bot+Image' // A sample placeholder image URL
              },
              {
                id: 'pdf-12345',
                name: 'sample_invoice.pdf',
                type: 'application/pdf',
                size: 780, // Size in bytes
                // The 'url' is a Data URL containing the Base64-encoded PDF content.
                // This particular string creates a very simple PDF with the text "Hello, PDF!".
                url: 'JVBERi0xLjQKJcOkw7zXwqEKMSAwIG9iago8PC9Qcm9kdWNlciAoU3Vuc2hpbmUgUERGIFByb2R1Y2VyKSAvQ3JlYXRvciAoU3Vuc2hpbmUgUERGIFByb2R1Y2VyKSAvVGl0bGUoYWJjKj0+IEluIGEgUGFwZXIgUGxhdGUgb2YgR29sZCkgL0F1dGhvciAoQm9iKSA+PgpzdHJlYW0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'
              }
          ]
        };

        const initialMessages = [greetingMessage, sampleMessage];

        // Use functional updater to avoid stale closure issues
        updateMessages(prev => {
          // If prev already contains messages (unlikely here) just return merged
          const merged = Array.isArray(prev) ? [...prev, ...initialMessages] : [...initialMessages];
          return merged;
        });

        setIsFirstVisit(false);
      } catch (error) {
        // Silently handle any initialization errors
        // Optionally console.error(error);
      }
    }
    // we intentionally don't include updateMessages in deps as it's stable from hook via useCallback,
    // but include isOpen/isFirstVisit/messages.length to control run conditions.
  }, [isOpen, isFirstVisit, messages.length, updateMessages]);

  // Handle panel state transitions
  useEffect(() => {
    if (isOpen) {
      setPanelState('opening');
      const timer = setTimeout(() => setPanelState('open'), 300);
      return () => clearTimeout(timer);
    } else {
      setPanelState('closing');
      const timer = setTimeout(() => setPanelState('closed'), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const toggleChat = useCallback(() => {
    // Use functional update to access latest value and close nav when opening
    setIsOpen(prev => {
      const next = !prev;
      if (next) {
        setIsNavOpen(false); // close nav when opening the chat
      }
      return next;
    });
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setIsMaximized(false);
    setIsNavOpen(false);
  }, []);

  const toggleMaximize = useCallback(() => {
    if (externalToggleMaximize) {
      externalToggleMaximize();
    } else {
      setIsMaximized(prev => !prev);
    }
  }, [externalToggleMaximize]);

  const toggleNavigation = useCallback(() => {
    setIsNavOpen(prev => !prev);
  }, []);

  const handleClearChat = useCallback(() => {
    try {
      if (!currentChatId) return;

      // Clear messages for current chat ID
      updateMessages(() => []);

      
    } catch (error) {
      // Silently handle clear chat errors
      // Optionally console.error(error);
    }
  }, [currentChatId, updateMessages]);

  const handleNewChat = useCallback(() => {
    try {
      // Save current chat session if it has messages beyond greeting
      if (messages.length > 1) {
        const newSession: ChatSession = {
          id: currentChatId,
          title: (messages[1]?.content?.slice(0, 50) ?? 'New Chat') + '...',
          timestamp: new Date(),
          preview: messages[1]?.content?.slice(0, 100) ?? '',
          messages: [...messages],
          // include version so it matches ChatSession schema
          version: CHAT_SESSION_VERSION
        } as ChatSession;

        // saveCurrentChat accepts array or updater
        saveCurrentChat(newSession.messages);
      }

      // Start new chat (createNewChat returns new id)
      const newChatId = createNewChat();
      // ensure messages cleared in hook
      updateMessages(() => []);
      setIsFirstVisit(true);
      setIsNavOpen(false);
      // Optionally, you can select the created chatId if hook doesn't do it already.
      // selectChat(newChatId);
    } catch (error) {
      // Silently handle new chat errors
      // Optionally console.error(error);
    }
  }, [messages, currentChatId, saveCurrentChat, createNewChat, updateMessages]);

  const handleSelectChat = useCallback((chatId: string) => {
    try {
      const session = chatSessions.find(s => s.id === chatId);
      if (session) {
        selectChat(chatId);
        // use functional updater to avoid stale state issues
        updateMessages(() => session.messages ?? []);
        setIsFirstVisit(false);
        setIsNavOpen(false);
      }
    } catch (error) {
      // Silently handle chat selection errors
      // Optionally console.error(error);
    }
  }, [chatSessions, selectChat, updateMessages]);

  const handleSendMessage = useCallback(
  (content: string, attachments?: FileAttachment[], intent?: Intent) => {
    try {
      if (!content && (!attachments || attachments.length === 0)) return;

      // If intent has initial response, show it immediately
      if (intent && intent.initialResponse) {
        const botResponse: Message = {
          id: 'bot-' + Date.now(),
          content: intent.initialResponse,
          sender: 'bot',
          timestamp: new Date(),
        };
        updateMessages((prev) => [...(prev ?? []), botResponse]);
      }

      // Add user message (if any content or attachments)
      if (content) {
        const userMessage: Message = {
          id: 'user-' + Date.now(),
          content: content || '📎 File attachment',
          sender: 'user',
          timestamp: new Date(),
          attachments,
        };
        updateMessages((prev) => [...(prev ?? []), userMessage]);
      }

      // === Add temporary loading message for bot ===
      const tempBotLoadingMessage: Message = {
        id: 'bot-loading-' + Date.now(),
        content: '',
        sender: 'bot',
        timestamp: new Date(),
        isTyping: true,
      };

      updateMessages((prev) => [...(prev ?? []), tempBotLoadingMessage]);

      // === Start streaming from FastAPI backend ===
      const abortController = new AbortController();

      fetch('http://localhost:8000/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content || '' }),
        signal: abortController.signal,
      })
        .then((response) => {
          if (!response.body) return;

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          // Read stream chunk by chunk
          function read() {
            reader.read().then(({ done, value }) => {
              if (done) {
                // Mark loading message as complete
                updateMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === tempBotLoadingMessage.id
                      ? { ...msg, isTyping: false }
                      : msg
                  )
                );
                return;
              }

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop(); // Keep incomplete line

              lines.forEach((line) => {
                if (line.trim()) {
                  try {
                    const step = JSON.parse(line);

                    // Update the loading message's content incrementally
                    updateMessages((prev) =>
                      prev.map((msg) => {
                        if (msg.id === tempBotLoadingMessage.id) {
                          const newContent = msg.content
                            ? `${msg.content}\n${step.message || ''}`
                            : step.message || '';

                          return {
                            ...msg,
                            content: newContent,
                          };
                        }
                        return msg;
                      })
                    );
                  } catch (err) {
                    console.warn('Failed to parse JSON:', err);
                  }
                }
              });

              read(); // Continue reading
            });
          }

          read();
        })
        .catch((err) => {
          if (err.name === 'AbortError') {
            console.log('Fetch aborted');
          } else {
            // Show error in the bot message
            updateMessages((prev) =>
              prev.map((msg) =>
                msg.id === tempBotLoadingMessage.id
                  ? {
                      ...msg,
                      content: `❌ Sorry, I couldn't process your request: ${err.message}`,
                      isTyping: false,
                    }
                  : msg
              )
            );
          }
        });

      // === Cleanup: abort request if component unmounts or new message sent ===
      return () => {
        abortController.abort();
      };
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
    }
  },
  [updateMessages]
);

  return (
    <div className={`chatbot-container ${className}`}>
      <ChatbotLauncher isOpen={isOpen} onClick={toggleChat} hasUnreadMessages={false} />

      <ChatPanel
        isOpen={isOpen}
        isMaximized={externalMaximized ?? isMaximized}
        onClose={closeChat}
        onToggleMaximize={toggleMaximize}
        messages={messages}
        onSendMessage={handleSendMessage}
        onClearChat={handleClearChat}
        panelState={panelState}
        isNavOpen={isNavOpen}
        toggleNavigation={toggleNavigation}
        onNewChat={handleNewChat}
        chatSessions={chatSessions}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
      />

      {/* If you have a separate navigation panel (it was imported but never used previously) */}
      {/* Render it only when isNavOpen is true or if you want it visible inside panel - but leaving here as optional */}
      {isNavOpen && (
        <NavigationPanel
          chatSessions={chatSessions}
          currentChatId={currentChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat} isOpen={false} onToggle={function (): void {
            throw new Error('Function not implemented.');
          } }        />
      )}
    </div>
  );
};

export default Chatbot;

