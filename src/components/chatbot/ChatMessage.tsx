import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Download, File, Image } from 'lucide-react';
import mermaid from 'mermaid';
import MessageActions from './MessageActions';
import CodeBlock from './CodeBlock';
import { useAppSelector } from '../../hooks/useRedux';
import { Message, FileAttachment } from './types';
import PreviewModal from './PreviewModal';
import FilePreview from './FilePreview';
import MermaidDiagram from './MermaidDiagram';

interface ChatMessageProps {
  message: Message;
  onCopy: (content: string) => void;
  onDownload: (content: string) => void;
  onThumbsUp: (messageId: string) => void;
  onThumbsDown: (messageId: string) => void;
  onSpeak: (content: string) => void;
};

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  onCopy, 
  onDownload, 
  onThumbsUp, 
  onThumbsDown, 
  onSpeak 
}) => {
  const isBot = message.sender === 'bot';

  // Check if the message is a bot message and a typing indicator
  const isTypingMessage = isBot && message.isTyping;


  return (
    <div className={`w-full mb-4 ${isBot ? '' : 'flex justify-end'}`}>
      <div className={`${isBot ? 'max-w-none' : 'max-w-2xl ml-auto'}`}>
        {/* Message content */}
        <div className={`${
          isBot 
            ? 'bg-transparent text-gray-800 dark:text-gray-200 py-2 w-full' 
            : 'bg-[#f4f4f4] dark:bg-[#303030] rounded-2xl px-4 py-3 text-gray-900 dark:text-gray-100'
        }`}>
          {isTypingMessage ? (
            // Render loading animation if the bot is typing
            <div className="flex items-center space-x-2 p-2">
              <div className="dot-flashing"></div>
            </div>
          ) : (
            <div className={`${isBot ? 'prose prose-sm max-w-none dark:prose-invert prose-gray' : ''}`}>
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : '';
                    
                    // Handle Mermaid diagrams
                    if (language === 'mermaid') {
                      //return <MermaidDiagram chart={String(children).replace(/\n$/, '')} />;
                    }
                    
                    return !inline && match ? (
                      <CodeBlock language={language} {...props}>{String(children)}</CodeBlock>
                    ) : (
                      <code className={`${className} bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1 py-0.5 rounded text-xs`} {...props}>
                        {children}
                      </code>
                    );
                  },
                  p: ({ children }) => <p className={`${isBot ? 'mb-3 last:mb-0' : 'mb-2 last:mb-0'} leading-relaxed chat-text-base`}>{children}</p>,
                  ul: ({ children }) => <ul className={`list-disc list-inside ${isBot ? 'mb-3' : 'mb-2'} space-y-1 chat-text-base`}>{children}</ul>,
                  ol: ({ children }) => <ol className={`list-decimal list-inside ${isBot ? 'mb-3' : 'mb-2'} space-y-1 chat-text-base`}>{children}</ol>,
                  li: ({ children }) => <li className="leading-relaxed chat-text-base">{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote className={`border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic ${isBot ? 'mb-3' : 'mb-2'} text-gray-600 dark:text-gray-400 chat-text-base`}>
                      {children}
                    </blockquote>
                  ),
                  h1: ({ children }) => <h1 className={`text-xl font-bold ${isBot ? 'mb-2 mt-4' : 'mb-1 mt-2'} first:mt-0 text-gray-900 dark:text-gray-100 chat-heading`}>{children}</h1>,
                  h2: ({ children }) => <h2 className={`text-lg font-bold ${isBot ? 'mb-2 mt-3' : 'mb-1 mt-2'} first:mt-0 text-gray-900 dark:text-gray-100 chat-heading`}>{children}</h2>,
                  h3: ({ children }) => <h3 className={`text-base font-bold ${isBot ? 'mb-2 mt-3' : 'mb-1 mt-2'} first:mt-0 text-gray-900 dark:text-gray-100 chat-heading`}>{children}</h3>,
                  strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-gray-100 chat-text-base">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  a: ({ children, href }) => (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 underline hover:no-underline chat-text-base"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {String(message.content || '')}
              </ReactMarkdown>
            </div>
          )}
          
          {/* File Attachments */}
          {!isTypingMessage && message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment) => (
                <FilePreview key={attachment.id} attachment={attachment} />
              ))}
            </div>
          )}
        </div>
        
        {/* Message Actions for Bot Messages */}
        {isBot && (
          <MessageActions
            message={message}
            onCopy={onCopy}
            onDownload={onDownload}
            onThumbsUp={onThumbsUp}
            onThumbsDown={onThumbsDown}
            onSpeak={onSpeak}
          />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;