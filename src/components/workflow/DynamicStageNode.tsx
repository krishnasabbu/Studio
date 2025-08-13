import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Database, 
  Globe, 
  UserCheck,
  Webhook,
  Mail,
  Activity,
  Settings
} from 'lucide-react';

interface DynamicStageNodeData {
  stageName: string;
  environment: string;
  parameters: {
    [key: string]: any;
  };
  status?: 'not_started' | 'running' | 'awaiting_approval' | 'completed' | 'failed';
  executionTime?: string;
  lastExecuted?: string;
}

const DynamicStageNode: React.FC<NodeProps<DynamicStageNodeData>> = ({ data, selected }) => {
  const getStatusIcon = () => {
    switch (data.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'awaiting_approval':
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStageIcon = () => {
    switch (data.stageName.toLowerCase()) {
      case 'start':
        return <Activity className="h-5 w-5 text-green-600" />;
      case 'dev':
      case 'development':
        return <Database className="h-5 w-5 text-blue-600" />;
      case 'qa':
      case 'test':
      case 'testing':
        return <UserCheck className="h-5 w-5 text-yellow-600" />;
      case 'stage':
      case 'staging':
        return <Globe className="h-5 w-5 text-purple-600" />;
      case 'prod':
      case 'production':
        return <Webhook className="h-5 w-5 text-red-600" />;
      case 'end':
        return <Activity className="h-5 w-5 text-gray-600" />;
      default:
        return <Settings className="h-5 w-5 text-primary-600" />;
    }
  };

  const getStatusColor = () => {
    switch (data.status) {
      case 'completed':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-green-100';
      case 'running':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-blue-100 animate-pulse';
      case 'awaiting_approval':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 shadow-yellow-100';
      case 'failed':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-red-100';
      default:
        return 'border-gray-300 bg-white dark:bg-gray-800 shadow-gray-100';
    }
  };

  const getStageColor = () => {
    switch (data.stageName.toLowerCase()) {
      case 'start':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'dev':
      case 'development':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'qa':
      case 'test':
      case 'testing':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'stage':
      case 'staging':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      case 'prod':
      case 'production':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'end':
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
      default:
        return 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300';
    }
  };

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-xl border-2 min-w-[140px] max-w-[180px] transition-all duration-300 cursor-pointer ${getStatusColor()} ${
        selected ? 'ring-2 ring-primary-500 scale-105' : 'hover:scale-102'
      }`}
    >
      {/* Input Handle */}
      {data.stageName.toLowerCase() !== 'start' && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 !bg-primary-500 border-2 border-white shadow-md"
        />
      )}
      
      {/* Node Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-lg ${getStageColor()}`}>
            {getStageIcon()}
          </div>
          <div className="font-bold text-sm text-gray-900 dark:text-white">
            {data.stageName}
          </div>
        </div>
        {data.status && getStatusIcon()}
      </div>
      
      {/* Environment Badge */}
      <div className="mb-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor()}`}>
          {data.environment}
        </span>
      </div>
      
      {/* Parameters Summary */}
      <div className="space-y-1">
        <div className="text-xs text-gray-600 dark:text-gray-300">
          Parameters: {Object.keys(data.parameters || {}).length}
        </div>
        
        {data.executionTime && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Runtime: {data.executionTime}
          </div>
        )}
        
        {data.lastExecuted && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last: {new Date(data.lastExecuted).toLocaleDateString()}
          </div>
        )}
      </div>
      
      {/* Progress Bar */}
      {data.status && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-2">
          <div 
            className={`h-1 rounded-full transition-all duration-500 ${
              data.status === 'completed' ? 'bg-green-500 w-full' :
              data.status === 'running' ? 'bg-blue-500 w-1/2' :
              data.status === 'awaiting_approval' ? 'bg-yellow-500 w-3/4' :
              data.status === 'failed' ? 'bg-red-500 w-1/4' : 'bg-gray-400 w-0'
            }`}
          />
        </div>
      )}
      
      {/* Output Handle */}
      {data.stageName.toLowerCase() !== 'end' && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-primary-500 border-2 border-white shadow-md"
        />
      )}
    </div>
  );
};

export default DynamicStageNode;