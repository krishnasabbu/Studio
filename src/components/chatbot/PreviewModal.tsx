import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { FileAttachment } from './types'; // Ensure this type is defined

interface PreviewModalProps {
  file: FileAttachment;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ file, onClose }) => {
  const [text, setText] = useState<string>('Loading...');

  const isPDF = file.type === 'application/pdf';
  const isImage = file.type.startsWith('image/');
  const isText = file.type === 'text/plain';

  useEffect(() => {
    if (isText) {
      fetch(file.url)
        .then(response => response.text())
        .then(data => setText(data))
        .catch(() => setText('Failed to load text file.'));
    }
  }, [file.url, isText]);

  const renderPreviewContent = () => {
    if (isPDF) {
      return (
        <iframe
          src={file.url}
          title={file.name}
          className="w-full h-full"
          style={{ border: 'none' }}
        />
      );
    }
    if (isImage) {
      return (
        <img
          src={file.url}
          alt={file.name}
          className="max-w-full max-h-full object-contain"
        />
      );
    }
    if (isText) {
      return (
        <pre className="p-4 bg-gray-100 text-sm font-mono overflow-auto w-full h-full">
          {text}
        </pre>
      );
    }
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-gray-600">No preview available for this file type.</p>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
    >
      <div
        className="relative w-11/12 h-5/6 max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevents modal from closing when clicking inside
      >
        <div className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <span className="font-semibold text-gray-900 dark:text-gray-100">{file.name}</span>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-grow p-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          {renderPreviewContent()}
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-end">
          <a
            href={file.url}
            download={file.name}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </a>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;