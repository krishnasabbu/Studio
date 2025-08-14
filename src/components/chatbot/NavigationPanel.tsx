import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, X } from 'lucide-react';
import { ChatSession } from './types';

interface NavigationPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  chatSessions: ChatSession[];
  currentChatId?: string;
  onSelectChat: (chatId: string) => void;
}

const NavigationPanel: React.FC<NavigationPanelProps> = ({
  isOpen,
  onToggle,
  onNewChat,
  chatSessions,
  currentChatId,
  onSelectChat
}) => {
  const panelVariants = {
    closed: {
      x: '-100%',
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    open: {
      x: 0,
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  };

  const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 }
  };

  const shakeVariants = {
    initial: { x: 0 },
    shake: {
      x: [0, -5, 5, -5, 5, 0],
      transition: { duration: 0.4 }
    }
  };

  const [shouldShake, setShouldShake] = useState(false);

  useEffect(() => {
    if (!isOpen && chatSessions.length > 0) {
      const timer = setTimeout(() => {
        setShouldShake(true);
        setTimeout(() => setShouldShake(false), 500);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, chatSessions.length]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onToggle}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Navigation Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="h-full w-full bg-white dark:bg-[#212121] flex flex-col"
            variants={panelVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
              <h2 className="chat-heading chat-text-base text-gray-900 dark:text-white">
                Chat History
              </h2>
              <button
                onClick={onToggle}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Close navigation panel"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* New Chat Button */}
            <div className="p-4">
              <button
                onClick={onNewChat}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 chat-text-base"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">New Chat</span>
              </button>
            </div>

            {/* Chat Sessions */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <div className="space-y-2">
                {chatSessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="chat-text-sm">No chat history yet</p>
                    <p className="chat-text-xs mt-1">
                      Start a new conversation to see it here
                    </p>
                  </div>
                ) : (
                  chatSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => onSelectChat(session.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        currentChatId === session.id
                          ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <MessageSquare className="w-4 h-4 mt-1 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="chat-text-sm font-medium text-gray-900 dark:text-white truncate">
                            {session.title}
                          </h3>
                          <p className="chat-text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {session.preview}
                          </p>
                          <p className="chat-text-xs text-gray-400 dark:text-gray-500 mt-2">
                            {formatTime(new Date(session.timestamp))}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button (shakes when closed & has history) */}
      {!isOpen && (
        <motion.button
          className="fixed bottom-4 left-4 z-50 p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg md:hidden"
          onClick={onToggle}
          variants={shakeVariants}
          animate={shouldShake ? 'shake' : 'initial'}
        >
          <MessageSquare className="w-6 h-6" />
        </motion.button>
      )}
    </>
  );
};

export default NavigationPanel;
