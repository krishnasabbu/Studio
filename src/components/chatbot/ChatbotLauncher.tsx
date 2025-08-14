import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

interface ChatbotLauncherProps {
  isOpen: boolean;
  onClick: () => void;
  hasUnreadMessages?: boolean;
}

const ChatbotLauncher: React.FC<ChatbotLauncherProps> = ({ 
  isOpen, 
  onClick, 
  hasUnreadMessages = false 
}) => {
  return (
    <motion.button
      className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-full shadow-lg hover:shadow-xl z-40 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-primary-200 transition-all duration-200"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        rotate: isOpen ? 180 : 0,
      }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut'
      }}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
      role="button"
    >
      {/* Notification badge */}
      {hasUnreadMessages && !isOpen && (
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}

      {/* Icon with smooth transition */}
      <motion.div
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </motion.div>

      {/* Pulse animation when closed */}
      {!isOpen && (
        <motion.div
          className="absolute inset-0 rounded-full bg-primary-400"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 0, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.button>
  );
};

export default ChatbotLauncher;