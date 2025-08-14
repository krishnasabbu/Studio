import React, { useState } from 'react';
import { Copy, Download, ThumbsUp, ThumbsDown, Volume2, Check } from 'lucide-react';
import { MessageActionsProps } from './types';

const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  onCopy,
  onDownload,
  onThumbsUp,
  onThumbsDown,
  onSpeak
}) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const handleCopy = async () => {
    await onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleThumbsUp = () => {
    onThumbsUp(message.id);
    setFeedback(feedback === 'up' ? null : 'up');
  };

  const handleThumbsDown = () => {
    onThumbsDown(message.id);
    setFeedback(feedback === 'down' ? null : 'down');
  };

  return (
    <div className="flex items-center space-x-2 mt-2 opacity-100 transition-opacity duration-200">
      <button
        onClick={handleCopy}
        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        title="Copy message"
        aria-label="Copy message to clipboard"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Copy className="w-4 h-4 text-gray-500 hover:text-gray-700" />
        )}
      </button>

      <button
        onClick={() => onDownload(message.content)}
        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        title="Download message"
        aria-label="Download message content"
      >
        <Download className="w-4 h-4 text-gray-500 hover:text-gray-700" />
      </button>

      <button
        onClick={handleThumbsUp}
        className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors ${
          feedback === 'up' ? 'bg-green-50 text-green-600' : ''
        }`}
        title="Good response"
        aria-label="Mark as good response"
      >
        <ThumbsUp className={`w-4 h-4 ${
          feedback === 'up' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
        }`} />
      </button>

      <button
        onClick={handleThumbsDown}
        className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors ${
          feedback === 'down' ? 'bg-red-50 text-red-600' : ''
        }`}
        title="Poor response"
        aria-label="Mark as poor response"
      >
        <ThumbsDown className={`w-4 h-4 ${
          feedback === 'down' ? 'text-red-600' : 'text-gray-500 hover:text-gray-700'
        }`} />
      </button>

      <button
        onClick={() => onSpeak(message.content)}
        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        title="Read aloud"
        aria-label="Read message aloud"
      >
        <Volume2 className="w-4 h-4 text-gray-500 hover:text-gray-700" />
      </button>
    </div>
  );
};

export default MessageActions;