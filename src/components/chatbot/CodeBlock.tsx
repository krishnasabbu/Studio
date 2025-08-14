import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { useAppSelector } from '../../hooks/useRedux';

interface CodeBlockProps {
  language: string;
  children: string;
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, children, className }) => {
  const [copied, setCopied] = useState(false);
  const { isDarkMode } = useAppSelector(state => state.theme);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="relative group my-4">
      {/* Code Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-t-lg border border-gray-200 dark:border-gray-600 border-b-0">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
          {language || 'code'}
        </span>
        
        {/* Copy Button - Shows on hover */}
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Copy code to clipboard"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="relative overflow-hidden rounded-b-lg border border-gray-200 dark:border-gray-600 border-t-0">
        <SyntaxHighlighter
          style={isDarkMode ? tomorrow : prism}
          language={language}
          PreTag="div"
          className={`!mt-0 !mb-0 !rounded-t-none ${className || ''}`}
          customStyle={{
            margin: 0,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBottomLeftRadius: '0.5rem',
            borderBottomRightRadius: '0.5rem',
            fontSize: '14px',
            lineHeight: '1.5',
            padding: '16px',
            background: isDarkMode ? '#171717' : '#f8f8f8',
            color: isDarkMode ? '#ffffff' : '#1f2937',
          }}
          codeTagProps={{
            style: {
              fontSize: '14px',
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              color: isDarkMode ? '#ffffff' : '#1f2937',
              background: 'transparent',
            }
          }}
          wrapLongLines={true}
        >
          {children.replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;