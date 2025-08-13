import React, {useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflowStore } from '../../store/workflowStore';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { GitBranch, Calendar, User, Play, Edit, Trash2 } from 'lucide-react';

interface WorkflowListProps {
  onEdit?: (workflowId: string) => void;
  onExecute?: (workflowId: string) => void;
  onDelete?: (workflowId: string) => void;
  compact?: boolean;
}

const WorkflowList: React.FC<WorkflowListProps> = ({
  onEdit,
  onExecute,
  onDelete,
  compact = false,
}) => {
  const navigate = useNavigate();
  const { workflows, isLoading, fetchWorkflows } = useWorkflowStore();

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const handleEdit = (workflowId: string) => {
    if (onEdit) {
      onEdit(workflowId);
    } else {
      navigate(`/workflows/builder/${workflowId}`);
    }
  };

  const handleExecute = (workflowId: string) => {
    if (onExecute) {
      onExecute(workflowId);
    } else {
      navigate(`/workflows/execution/${workflowId}`);
    }
  };

  const handleDelete = (workflowId: string) => {
    if (onDelete) {
      onDelete(workflowId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (workflows.length === 0) {
    return (
      <Card className="p-8 text-center bg-white hover:shadow-xl transition-all duration-300">
        <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No workflows available
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Create your first workflow to get started
        </p>
      </Card>
    );
  }

  return (
    <div className={`space-y-${compact ? '3' : '4'}`}>
      {workflows.map((workflow) => (
        <Card 
          key={workflow.id} 
          className={`${compact ? 'p-4' : 'p-6'} bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary-500`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <GitBranch className={`${compact ? 'h-5 w-5' : 'h-6 w-6'} text-primary-500`} />
              <div>
                <h3 className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-primary-700 dark:text-white`}>
                  {workflow.name}
                </h3>
                <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-500 dark:text-gray-400`}>
                  v{workflow.version} | {workflow.nodes?.length || 0} nodes
                </p>
                {!compact && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {workflow.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
              </span>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(workflow.id)}
                  className="border-primary-300 text-primary-600 hover:bg-primary-50"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleExecute(workflow.id)}
                  className="bg-accent-600 hover:bg-accent-700 text-white"
                >
                  <Play className="h-4 w-4" />
                </Button>
                
                {onDelete && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(workflow.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {!compact && (
            <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{workflow.createdBy.split('@')[0]}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(workflow.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default WorkflowList;