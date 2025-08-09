import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface StageNodeData {
  label: string;
  stage: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  description?: string;
}

const StageNode: React.FC<NodeProps<StageNodeData>> = ({ data, selected }) => {
  const getStatusIcon = () => {
    switch (data.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'running':
        return <Clock className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (data.status) {
      case 'completed':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'running':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'failed':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      default:
        return 'border-gray-300 bg-white dark:bg-gray-800';
    }
  };

  const getStageColor = () => {
    switch (data.stage) {
      case 'development':
        return 'text-blue-600 dark:text-blue-400';
      case 'testing':
        return 'text-green-600 dark:text-green-400';
      case 'staging':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'production':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg border-2 min-w-[120px] transition-all duration-200 ${getStatusColor()} ${
        selected ? 'ring-2 ring-primary-500' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-primary-500 border-2 border-white"
      />
      
      <div className="flex items-center justify-between mb-2">
        <div className={`font-bold text-lg ${getStageColor()}`}>
          {data.label}
        </div>
        {getStatusIcon()}
      </div>
      
      {data.description && (
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          {data.description}
        </div>
      )}
      
      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
        Status: {data.status}
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-primary-500 border-2 border-white"
      />
    </div>
  );
};

export default StageNode;