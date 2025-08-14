import React, { useState } from 'react';
import { Download, FileText, FileImage, Eye, File } from 'lucide-react';
import { FileAttachment } from './types'; // Ensure this type is defined in your project
import PreviewModal from './PreviewModal';

const FilePreview: React.FC<{ attachment: FileAttachment }> = ({ attachment }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const isImage = attachment.type.startsWith('image/');
  const isPDF = attachment.type === 'application/pdf';
  const isText = attachment.type === 'text/plain';
  const canPreview = isImage || isPDF || isText;

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (canPreview) {
      setIsPreviewOpen(true);
    }
  };

  const renderFileIcon = () => {
    if (isImage) {
      return <FileImage className="h-5 w-5 text-gray-400 flex-shrink-0" />;
    }
    if (isPDF || isText) {
      return <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />;
    }
    return <File className="h-5 w-5 text-gray-400 flex-shrink-0" />;
  };

  if (isImage && attachment.url) {
    return (
      <>
        <div className="mt-2 relative group">
          <img
            src={attachment.url}
            alt={attachment.name}
            className="max-w-xs rounded-lg shadow-sm border border-gray-200 cursor-pointer"
            style={{ maxHeight: '200px' }}
            onClick={handlePreviewClick}
          />
          <div className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md transition-opacity opacity-0 group-hover:opacity-100">
            <button onClick={handlePreviewClick} className="text-gray-500 hover:text-blue-600">
              <Eye className="h-5 w-5" />
            </button>
          </div>
        </div>
        {isPreviewOpen && <PreviewModal file={attachment} onClose={() => setIsPreviewOpen(false)} />}
      </>
    );
  }

  return (
    <>
      <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm">
        <div className="flex items-center justify-between p-2 rounded-md transition-colors">
          <div className="flex items-center space-x-2">
            {renderFileIcon()}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">{attachment.name}</div>
              <div className="text-gray-500 text-xs">
                {(attachment.size / 1024).toFixed(1)} KB
              </div>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
            {canPreview && (
              <button
                onClick={handlePreviewClick}
                className="text-gray-500 hover:text-blue-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Eye className="h-5 w-5" />
              </button>
            )}
            <a
              href={attachment.url}
              download={attachment.name}
              className="text-gray-500 hover:text-blue-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Download className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
      {isPreviewOpen && <PreviewModal file={attachment} onClose={() => setIsPreviewOpen(false)} />}
    </>
  );
};

export default FilePreview;