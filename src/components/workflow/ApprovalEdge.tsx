import React from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import { CheckCircle, XCircle, Clock, User, Shield, AlertTriangle } from 'lucide-react';

interface ApprovalEdgeData {
  requiresApproval: boolean;
  approverRole: string;
  status: 'pending' | 'approved' | 'rejected';
  approvalTimeout?: string;
  autoApprove?: boolean;
  approvedAt?: string;
  approvedBy?: string;
  comments?: string;
}

const ApprovalEdge: React.FC<EdgeProps<ApprovalEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const getStatusIcon = () => {
    switch (data?.status) {
      case 'approved':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-3 w-3 text-red-500" />;
      default:
        return <Clock className="h-3 w-3 text-yellow-500" />;
    }
  };

  const getEdgeColor = () => {
    if (!data?.requiresApproval) return '#6b7280'; // gray for no approval
    
    switch (data?.status) {
      case 'approved':
        return '#10b981'; // green
      case 'rejected':
        return '#ef4444'; // red
      default:
        return '#f59e0b'; // yellow for pending
    }
  };

  const getDotColor = () => {
    if (!data?.requiresApproval) return '#3B82F6'; // blue for no approval
    if (!data?.approverRole) return '#ef4444'; // red for missing role
    
    switch (data?.status) {
      case 'approved':
        return '#10b981'; // green
      case 'rejected':
        return '#ef4444'; // red
      default:
        return '#f59e0b'; // yellow for pending
    }
  };

  const getDotIcon = () => {
    if (!data?.requiresApproval) return '→';
    if (!data?.approverRole) return '!';
    
    switch (data?.status) {
      case 'approved':
        return '✓';
      case 'rejected':
        return '✗';
      default:
        return '?';
    }
  };

  const getTooltipContent = () => {
    if (!data?.requiresApproval) {
      return 'No approval required';
    }
    if (!data?.approverRole) {
      return 'Click to configure approval';
    }
    return `Approval: ${data.approverRole}`;
  };

  const getStatusBg = () => {
    if (!data?.requiresApproval) {
      return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700';
    }
    if (!data?.approverRole) {
      return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700';
    }
    
    switch (data?.status) {
      case 'approved':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700';
      case 'rejected':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700';
      default:
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700';
    }
  };

  return (
    <>
      {/* Edge Path */}
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        stroke={getEdgeColor()}
        strokeWidth={selected ? 4 : 3}
        fill="none"
        markerEnd="url(#react-flow__arrowclosed)"
        strokeDasharray={data?.requiresApproval && data?.status === 'pending' ? '5,5' : 'none'}
      />
      
      {/* Clickable Dot for Configuration */}
      <g style={{ cursor: 'pointer' }}>
        <circle
          cx={labelX}
          cy={labelY}
          r="12"
          fill={getDotColor()}
          stroke="#ffffff"
          strokeWidth="3"
          className="hover:opacity-80 transition-all duration-200"
          style={{ pointerEvents: 'all' }}
        />
        
        {/* Dot Icon/Text */}
        <text
          x={labelX}
          y={labelY + 4}
          textAnchor="middle"
          className="text-xs font-bold fill-white pointer-events-none select-none"
        >
          {getDotIcon()}
        </text>
      </g>
      
      {/* Approval Info Tooltip */}
      {(data?.requiresApproval || data?.approverRole) && (
        <foreignObject
          width={160}
          height={70}
          x={labelX - 80}
          y={labelY - 45}
          className="overflow-visible pointer-events-none"
        >
          <div className={`px-3 py-2 rounded-lg border shadow-lg ${getStatusBg()} transition-all duration-200`}>
            <div className="flex items-center space-x-2 mb-1">
              <Shield className="h-3 w-3 text-primary-600 dark:text-primary-400" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {data?.requiresApproval ? 'Approval Required' : 'Auto Transition'}
              </span>
            </div>
            
            {data?.approverRole && (
              <div className="flex items-center space-x-1 mb-1">
                <User className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {data.approverRole}
                </span>
              </div>
            )}

            {data?.status && data.status !== 'pending' && (
              <div className="flex items-center space-x-1">
                {getStatusIcon()}
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {data.status === 'approved' ? 'Approved' : 'Rejected'}
                </span>
              </div>
            )}

            {data?.approvedBy && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                By: {data.approvedBy.split('@')[0]}
              </div>
            )}

            {data?.approvedAt && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(data.approvedAt).toLocaleDateString()}
              </div>
            )}

            {data?.comments && (
              <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 italic truncate">
                "{data.comments}"
              </div>
            )}
          </div>
        </foreignObject>
      )}
    </>
  );
};

export default ApprovalEdge;