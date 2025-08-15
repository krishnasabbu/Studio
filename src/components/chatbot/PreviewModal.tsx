import React, { useEffect, useRef } from 'react';
import { Download, X } from 'lucide-react';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import { renderAsync } from 'docx-preview';
import { FileAttachment } from './types';

interface PreviewModalProps {
  file: FileAttachment;
  onClose: () => void;
}

// Convert Base64 to Blob URL
const createObjectURLFromBase64 = (base64String: string, fileType: string) => {
  const byteCharacters = atob(base64String);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: fileType });
  return URL.createObjectURL(blob);
};

const PreviewModal: React.FC<PreviewModalProps> = ({ file, onClose }) => {
  const isBase64 = file.url.startsWith('data:');
  const isDocx =
    file.type ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  const blobUrl = isBase64
    ? createObjectURLFromBase64(file.url.split(',')[1], file.type)
    : file.url;

  const docxContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let objectUrlToRevoke: string | null = null;

    if (isDocx && docxContainerRef.current) {
      const fetchAndRender = async () => {
        let arrayBuffer: ArrayBuffer;

        if (isBase64) {
          // Already converted to blob URL above
          const response = await fetch(blobUrl);
          arrayBuffer = await response.arrayBuffer();
          objectUrlToRevoke = blobUrl;
        } else {
          const response = await fetch(file.url);
          arrayBuffer = await response.arrayBuffer();
        }

        renderAsync(arrayBuffer, docxContainerRef.current as HTMLElement, null, {
          inWrapper: true,
        });
      };

      fetchAndRender();
    }

    return () => {
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
    };
  }, [isDocx, isBase64, blobUrl, file.url]);

  const docs = [
    { uri: blobUrl, fileName: file.name, fileType: file.type }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
    >
      <div
        className="relative w-11/12 h-5/6 max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {file.name}
          </span>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-grow p-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-center overflow-auto">
          {isDocx ? (
            <div ref={docxContainerRef} className="w-full h-full overflow-auto" />
          ) : (
            <DocViewer
              documents={docs}
              pluginRenderers={DocViewerRenderers}
              config={{
                header: { disableHeader: true },
              }}
            />
          )}
        </div>

        <div className="p-4 bg-gray-100 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-end">
          <a
            href={blobUrl}
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