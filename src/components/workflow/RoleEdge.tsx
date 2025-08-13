import React from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import { CheckCircle, XCircle, Clock, User, Shield } from 'lucide-react';

interface RoleEdgeData {
  role: string;
  roleId?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  approvedBy?: string;
  comments?: string;
  approvalRequired: boolean;
}

const RoleEdge: React.FC<EdgeProps<RoleEdgeData>> = ({
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
        return '#f59e0b'; // yellow
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
        strokeWidth={selected ? 4 : 3}
        fill="none"
        markerEnd="url(#react-flow__arrowclosed)"
        strokeDasharray={data?.status === 'pending' ? '5,5' : 'none'}
        style={{ cursor: 'pointer' }}
      />
      
      {/* Clickable Dot in the Middle */}
      <circle
        cx={labelX}
        cy={labelY}
        r="8"
        fill="#3B82F6"
        stroke="#ffffff"
        strokeWidth="2"
        className="cursor-pointer hover:fill-blue-700 transition-colors"
        style={{ pointerEvents: 'all' }}
      />
      
      {/* Role Label */}
      {data?.role && (
        <foreignObject
          width={180}
          height={80}
          x={labelX - 90}
          y={labelY - 50}
          className="overflow-visible pointer-events-none"
        >
          <div className={`px-3 py-2 rounded-lg border shadow-lg ${getStatusBg()} transition-all duration-200`}>
            <div className="flex items-center space-x-2 mb-1">
              <Shield className="h-3 w-3 text-primary-600 dark:text-primary-400" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                {data.role}
              </span>
              {getStatusIcon()}
            </div>
            
            <div className="flex items-center space-x-1 mb-1">
              <User className="h-3 w-3 text-gray-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {data.status === 'pending' ? 'Awaiting approval' : 
                 data.status === 'approved' ? 'Approved' : 'Rejected'}
              </span>
            </div>

            {data.approvedBy && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                By: {data.approvedBy.split('@')[0]}
              </div>
            )}

            {data.approvedAt && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(data.approvedAt).toLocaleDateString()}
              </div>
            )}

            {data.comments && (
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

export default RoleEdge;