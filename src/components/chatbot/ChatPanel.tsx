import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Menu, ChevronDown, Sun, Moon, Trash2 } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import NavigationPanel from './NavigationPanel';
import { Message, ChatPanelState, FileAttachment } from './types';
import { toggleTheme } from '../../store/slices/themeSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';

interface ChatPanelProps {
  isOpen: boolean;
  isMaximized: boolean;
  onClose: () => void;
  onToggleMaximize: () => void;
  messages: Message[];
  onSendMessage: (message: string, attachments?: FileAttachment[], intent?: any) => void;
  panelState: ChatPanelState;
  isNavOpen: boolean;
  toggleNavigation: () => void;
  onNewChat: () => void;
  chatSessions: any[];
  currentChatId?: string;
  onSelectChat: (chatId: string) => void;
  onClearChat: () => void; // Added new prop
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  isMaximized,
  onClose,
  onToggleMaximize,
  messages,
  onSendMessage,
  panelState,
  isNavOpen,
  toggleNavigation,
  onNewChat,
  chatSessions,
  currentChatId,
  onSelectChat,
  onClearChat // Destructure the new prop
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = React.useState(false);
  const dispatch = useAppDispatch();
  const { isDarkMode } = useAppSelector(state => state.theme);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Theme toggle
  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  // Scroll-to-bottom button visibility
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom && messages.length > 3);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages.length]);

  // 🔴 Prevent scroll propagation (wheel)
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !isOpen) return;

    const preventScroll = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtTop = scrollTop === 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight;
      const delta = e.deltaY;

      if ((isAtTop && delta < 0) || (isAtBottom && delta > 0)) {
        e.preventDefault();
      }
    };

    container.addEventListener('wheel', preventScroll, { passive: false });
    return () => container.removeEventListener('wheel', preventScroll);
  }, [isOpen]);

  // 🔴 Prevent touch scroll propagation (mobile)
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !isOpen) return;

    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY - currentY;
      touchStartY = currentY;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtTop = scrollTop === 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight;

      if ((isAtTop && deltaY < 0) || (isAtBottom && deltaY > 0)) {
        e.preventDefault();
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isOpen]);

  // 🔒 Body scroll lock when chat is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  // Escape key closes chat
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus panel when opened
  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen]);

  // Animation variants
  const panelVariants = {
    closed: {
      opacity: 0,
      scale: 0.8,
      y: 20,
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    },
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    }
  };

  const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 }
  };

  // Message actions
  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      console.log('Message copied');
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleDownload = (content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `message-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleThumbsUp = (messageId: string) => {
    console.log('Thumbs up:', messageId);
  };

  const handleThumbsDown = (messageId: string) => {
    console.log('Thumbs down:', messageId);
  };

  const handleSpeak = (content: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    } else {
      console.log('TTS not supported');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Chat panel */}
          <motion.div
            ref={panelRef}
            className={`fixed bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden focus:outline-none ${
              isMaximized
                ? 'inset-0 rounded-none'
                : 'bottom-4 right-4 w-full max-w-md md:w-[520px] h-[780px] max-h-[85vh] lg:max-w-lg xl:w-[580px]'
            }`}
            variants={panelVariants}
            initial="closed"
            animate="open"
            exit="closed"
            tabIndex={-1}
            role="dialog"
            aria-label="Chat assistant"
            aria-modal="true"
          >
            {/* ChatGPT-like Layout when Maximized */}
            {isMaximized ? (
              <div className="flex h-full bg-white dark:bg-[#212121] relative">
                {/* Left Navigation Panel */}
                <div className={`${isNavOpen ? 'w-80' : 'w-0'} transition-all duration-300 flex-shrink-0 bg-white dark:bg-[#212121] border-r border-gray-200 dark:border-gray-600 overflow-hidden`}>
                  <NavigationPanel
                    isOpen={isNavOpen}
                    onToggle={toggleNavigation}
                    onNewChat={onNewChat}
                    chatSessions={chatSessions}
                    currentChatId={currentChatId}
                    onSelectChat={onSelectChat}
                    onClearChat={onClearChat}
                  />
                </div>

                {/* Nav toggle button (when collapsed) */}
                {!isNavOpen && (
                  <button
                    onClick={toggleNavigation}
                    className="absolute top-4 left-4 z-20 p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="Open navigation"
                  >
                    <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                )}

                {/* Center Chat Area */}
                <div className="flex-1 flex flex-col">
                  {/* Header */}
                  <div className="flex items-center p-4 border-gray-200 dark:border-gray-700 bg-white dark:bg-[#212121] w-full">
                    <button
                      onClick={toggleNavigation}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 mr-3"
                      aria-label="Toggle navigation"
                    >
                      <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>

                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-500 dark:bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">AI</span>
                      </div>
                      <div>
                        <h3 className="chat-heading chat-text-base text-gray-900 dark:text-white">Assistant</h3>
                        <p className="chat-text-xs text-gray-600 dark:text-gray-400">Always here to help</p>
                      </div>
                    </div>

                    <div className="flex-1"></div>

                    {/* Controls */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {messages.length > 0 && (
                        <button
                          onClick={onClearChat}
                          className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors"
                          aria-label="Clear current chat"
                        >
                          <Trash2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </button>
                      )}
                      <button
                        onClick={handleThemeToggle}
                        className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Toggle theme"
                      >
                        {isDarkMode ? (
                          <Sun className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <Moon className="h-5 w-5 text-primary-600" />
                        )}
                      </button>
                      <button
                        onClick={onToggleMaximize}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                        aria-label="Restore size"
                      >
                        <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                        aria-label="Close chat"
                      >
                        <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto bg-white dark:bg-[#212121] relative chat-messages-container chat-scrollbar"
                  >
                    <div className="max-w-4xl mx-auto p-6">
                      <div id="chat-error-container" className="hidden mb-4 z-10">
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 chat-text-sm text-red-600 dark:text-red-300">
                          <span id="chat-error-message"></span>
                        </div>
                      </div>

                      {messages.map((message) => (
                        <ChatMessage
                          key={message.id}
                          message={message}
                          onCopy={handleCopy}
                          onDownload={handleDownload}
                          onThumbsUp={handleThumbsUp}
                          onThumbsDown={handleThumbsDown}
                          onSpeak={handleSpeak}
                        />
                      ))}

                      <div ref={messagesEndRef} />
                    </div>

                    {/* Scroll to bottom button */}
                    {showScrollButton && (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        onClick={scrollToBottom}
                        className="absolute bottom-14 right-6 bg-white dark:bg-gray-800 
                                     shadow-lg hover:shadow-xl rounded-full p-2 border border-gray-200 dark:border-gray-600
                                     hover:scale-105 transition-all duration-200 z-20"
                        aria-label="Scroll to latest messages"
                      >
                        <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </motion.button>
                    )}
                  </div>

                  {/* Input */}
                  <div className="border-gray-200 dark:border-gray-700">
                    <div className="max-w-4xl mx-auto">
                      <ChatInput onSendMessage={onSendMessage} onClearChat={onClearChat} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <NavigationPanel
                  isOpen={isNavOpen}
                  onToggle={toggleNavigation}
                  onNewChat={onNewChat}
                  chatSessions={chatSessions}
                  currentChatId={currentChatId}
                  onSelectChat={onSelectChat}
                />

                {/* Header */}
                <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-800">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={toggleNavigation}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                      aria-label="Toggle navigation"
                    >
                      <Menu className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <div className="w-10 h-10 bg-primary-500 dark:bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">AI</span>
                    </div>
                    <div>
                      <h3 className="chat-heading chat-text-base text-gray-900 dark:text-white">Assistant</h3>
                      <p className="chat-text-xs text-gray-600 dark:text-gray-400">Always here to help</p>
                    </div>
                  </div>

                  <div className="flex-1"></div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {messages.length > 0 && (
                      <button
                        onClick={onClearChat}
                        className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Clear current chat"
                      >
                        <Trash2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </button>
                    )}
                    <button
                      onClick={handleThemeToggle}
                      className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Toggle theme"
                    >
                      {isDarkMode ? (
                        <Sun className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <Moon className="h-5 w-5 text-primary-600" />
                      )}
                    </button>
                    <button
                      onClick={onToggleMaximize}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                      aria-label="Maximize chat"
                    >
                      <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                      aria-label="Close chat"
                    >
                      <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Messages Area */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 bg-white dark:bg-[#212121] relative chat-messages-container chat-scrollbar"
                >
                  <div id="chat-error-container" className="hidden absolute top-4 left-4 right-4 z-10">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 chat-text-sm text-red-600 dark:text-red-300">
                      <span id="chat-error-message"></span>
                    </div>
                  </div>

                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      onCopy={handleCopy}
                      onDownload={handleDownload}
                      onThumbsUp={handleThumbsUp}
                      onThumbsDown={handleThumbsDown}
                      onSpeak={handleSpeak}
                    />
                  ))}

                  <div ref={messagesEndRef} />

                  {showScrollButton && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={scrollToBottom}
                      className="scroll-to-bottom"
                      aria-label="Scroll to bottom"
                    >
                      <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </motion.button>
                  )}
                </div>

                {/* Input */}
                <div className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <ChatInput onSendMessage={onSendMessage} onClearChat={onClearChat} />
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatPanel;