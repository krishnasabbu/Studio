import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CheckCircle, Clock, XCircle, AlertCircle, Settings, Package, GitBranch, Play, Square } from 'lucide-react';

interface CustomNodeData {
  label: string;
  nodeType?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  description?: string;
  assignedTo?: string;
  completedAt?: string;
}

const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({ data, selected }) => {
  const getStatusIcon = () => {
    switch (data.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNodeTypeIcon = () => {
    switch (data.nodeType) {
      case 'start':
        return <Play className="h-4 w-4 text-green-600" />;
      case 'end':
        return <Square className="h-4 w-4 text-red-600" />;
      case 'decision':
        return <GitBranch className="h-4 w-4 text-blue-600" />;
      default:
        return <Package className="h-4 w-4 text-primary-600" />;
    }
  };

  const getStatusColor = () => {
    switch (data.status) {
      case 'completed':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-green-200';
      case 'in_progress':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 shadow-yellow-200 animate-pulse';
      case 'rejected':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-red-200';
      default:
        return 'border-gray-300 bg-white dark:bg-gray-800 shadow-gray-200';
    }
  };

  const getNodeTypeColor = () => {
    switch (data.nodeType) {
      case 'start':
        return 'bg-green-100 dark:bg-green-900/30';
      case 'end':
        return 'bg-red-100 dark:bg-red-900/30';
      case 'decision':
        return 'bg-blue-100 dark:bg-blue-900/30';
      default:
        return 'bg-primary-100 dark:bg-primary-900/30';
    }
  };

  const getProgressBar = () => {
    const progress = data.status === 'completed' ? 100 : 
                    data.status === 'in_progress' ? 50 : 
                    data.status === 'rejected' ? 0 : 25;
    
    return (
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
        <div 
          className={`h-1.5 rounded-full transition-all duration-500 ${
            data.status === 'completed' ? 'bg-green-500' :
            data.status === 'in_progress' ? 'bg-yellow-500' :
            data.status === 'rejected' ? 'bg-red-500' : 'bg-gray-400'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-xl border-2 min-w-[160px] max-w-[200px] transition-all duration-300 ${getStatusColor()} ${
        selected ? 'ring-2 ring-primary-500 scale-105' : 'hover:scale-102'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-primary-500 border-2 border-white shadow-md"
      />
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`p-1 rounded ${getNodeTypeColor()}`}>
            {getNodeTypeIcon()}
          </div>
          <div className="font-bold text-sm text-gray-900 dark:text-white truncate">
            {data.label}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {getStatusIcon()}
        </div>
      </div>
      
      {data.description && (
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
          {data.description}
        </div>
      )}
      
      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-1">
        Type: {data.nodeType || 'process'}
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-1">
        Status: {data.status.replace('_', ' ')}
      </div>

      {data.assignedTo && (
        <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">
          Assigned: {data.assignedTo}
        </div>
      )}

      {data.completedAt && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Completed: {new Date(data.completedAt).toLocaleDateString()}
        </div>
      )}
      
      {getProgressBar()}
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-primary-500 border-2 border-white shadow-md"
      />
    </div>
  );
};

export default CustomNode;