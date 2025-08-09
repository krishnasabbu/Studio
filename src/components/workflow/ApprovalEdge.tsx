import React from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';

interface ApprovalEdgeData {
  approver: string;
  status: 'pending' | 'approved' | 'rejected';
  approvalRequired: boolean;
  approvedAt?: string;
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
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getEdgeColor = () => {
    switch (data?.status) {
      case 'approved':
        return '#10b981'; // green
      case 'rejected':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const getStatusBg = () => {
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
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        stroke={getEdgeColor()}
        strokeWidth={selected ? 3 : 2}
        fill="none"
        markerEnd="url(#react-flow__arrowclosed)"
      />
      
      {data?.approvalRequired && (
        <foreignObject
          width={160}
          height={60}
          x={labelX - 80}
          y={labelY - 30}
          className="overflow-visible"
        >
          <div className={`px-3 py-2 rounded-lg border shadow-lg ${getStatusBg()} transition-all duration-200`}>
            <div className="flex items-center space-x-2 mb-1">
              {getStatusIcon()}
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Approval Required
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3 text-gray-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {data?.approver?.split('@')[0] || 'Approver'}
              </span>
            </div>
            {data?.status && data.status !== 'pending' && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {data.status === 'approved' ? 'Approved' : 'Rejected'}
                {data.approvedAt && (
                  <div className="text-xs">
                    {new Date(data.approvedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}
          </div>
        </foreignObject>
      )}
    </>
  );
};

export default ApprovalEdge;