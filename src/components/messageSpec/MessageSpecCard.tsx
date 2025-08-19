import React from 'react';
import { Eye, Edit, Trash2, Download } from 'lucide-react';
import { MessageSpec } from '../../types/messageSpec';

interface MessageSpecCardProps {
  spec: MessageSpec;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
}

const MessageSpecCard: React.FC<MessageSpecCardProps> = ({
  spec,
  onView,
  onEdit,
  onDelete,
  onDownload
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'email': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'sms': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'push': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'in-app': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      case 'archived': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'Fraud': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'Regulatory with Financial Impact': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'High Business Importance': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'regular': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'shell': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };


  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
              {spec.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {spec.description}
            </p>
          </div>
          <div className="flex items-center space-x-1 ml-4">
            <button
              onClick={() => onView(spec.id)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(spec.id)}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDownload(spec.id)}
              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(spec.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(spec.category)}`}>
            {spec.category.toUpperCase()}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTierColor(spec.tier)}`}>
            {spec.tier}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(spec.type)}`}>
            {spec.type.toUpperCase()}
          </span>
        </div>

        {/* Key Information */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium mr-2">Business Line:</span>
            <span>{spec.owningBusinessLine}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium mr-2">Trigger:</span>
            <span>{spec.triggerEvent}</span>
          </div>
          {spec.deliveryChannels && spec.deliveryChannels.length > 0 && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium mr-2">Channels:</span>
              <span>{spec.deliveryChannels.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Status and Regulatory Info */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-gray-500 dark:text-gray-400 mr-1">Volume:</span>
              <span className="font-medium text-gray-900 dark:text-white">{spec.volumeEstimate}</span>
            </div>
            {spec.regulatory === 'yes' && (
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 rounded-full">
                Regulatory
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            v{spec.version}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>By {spec.createdBy}</span>
          <span>{formatDate(spec.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default MessageSpecCard;