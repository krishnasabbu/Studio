import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useGetWorkflowInstancesQuery, 
  useApproveWorkflowStepMutation, 
  useRejectWorkflowStepMutation, 
  useGetWorkflowsQuery 
} from '../services/api';
import { useAppSelector } from '../hooks/useRedux';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import WorkflowCanvas from '../components/workflow/WorkflowCanvas';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Eye, 
  GitBranch, 
  AlertCircle,
  MessageSquare 
} from 'lucide-react';

interface WorkflowInstance {
  id: string;
  workflowId: string;
  currentStage: string;
  currentActivity: string;
  status: string;
  startedAt: string;
  startedBy: string;
  [key: string]: any;
}

interface Workflow {
  id: string;
  name: string;
  flowData?: any;
  stages?: Array<{
    id: string;
    activities?: Array<{
      id: string;
      name?: string;
      type?: string;
      config?: {
        approvers?: string[];
        instructions?: string;
      };
    }>;
  }>;
}

const WorkflowActionDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);

  const { data: workflowInstances = [], isLoading: isInstancesLoading, error: instancesError } = useGetWorkflowInstancesQuery();
  const { data: workflows = [], isLoading: isWorkflowsLoading, error: workflowsError } = useGetWorkflowsQuery();
  const [approveStep] = useApproveWorkflowStepMutation();
  const [rejectStep] = useRejectWorkflowStepMutation();

  const [selectedInstance, setSelectedInstance] = useState<WorkflowInstance | null>(null);
  const [showWorkflowView, setShowWorkflowView] = useState(false);
  const [comments, setComments] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  // Show loading until both queries are resolved
  if (isInstancesLoading || isWorkflowsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading workflows...</span>
      </div>
    );
  }

  // Show error if any
  if (instancesError || workflowsError) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-700">Failed to Load Data</h3>
        <p className="text-gray-600 mt-2">
          {instancesError 
            ? 'Could not load workflow instances.' 
            : 'Could not load workflows.'
          }
        </p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </Card>
    );
  }

  // Build action items safely
  const actionItemsByRole: Record<string, Array<WorkflowInstance & { workflow: Workflow, currentStage: any, currentActivity: any, requiredRole: string }>> = {};

  workflowInstances.forEach((instance: WorkflowInstance) => {
    const workflow = workflows.find(w => w.id === instance.workflowId);
    if (!workflow) {
      console.warn(`Workflow not found for instance ${instance.id}`);
      return;
    }

    const currentStage = workflow.stages?.find((s: any) => s.id === instance.currentStage);
    const currentActivity = currentStage?.activities?.find((a: any) => a.id === instance.currentActivity);

    if (currentActivity?.type === 'Manual Approval') {
      const email = currentActivity.config?.approvers?.[0];
      const roleName = email ? email.split('@')[0] : 'Team';
      
      if (!actionItemsByRole[roleName]) {
        actionItemsByRole[roleName] = [];
      }

      actionItemsByRole[roleName].push({
        ...instance,
        workflow,
        currentStage,
        currentActivity,
        requiredRole: roleName,
      });
    }
  });

  const handleAction = async (instance: any, action: 'approve' | 'reject') => {
    if (action === 'reject' && !comments.trim()) {
      alert('Comments are required when rejecting.');
      return;
    }

    try {
      const actionData = {
        instanceId: instance.id,
        comments: comments.trim() || undefined,
      };

      if (action === 'approve') {
        await approveStep(actionData).unwrap();
      } else {
        await rejectStep(actionData).unwrap();
      }

      setComments('');
      setActionType(null);
      setSelectedInstance(null);
      alert(`Workflow ${action}d successfully!`);
    } catch (error: any) {
      console.error(`Failed to ${action} workflow:`, error);
      alert(error?.data?.message || `Failed to ${action} workflow. Please try again.`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const viewWorkflowDiagram = (instance: any) => {
    setSelectedInstance(instance);
    setShowWorkflowView(true);
  };

  // === Workflow View Mode ===
  if (showWorkflowView && selectedInstance) {
    const flowData = selectedInstance.workflow.flowData;

    if (!flowData || !flowData.nodes) {
      return (
        <div className="p-8 text-center text-gray-600">
          <AlertCircle className="h-8 w-8 mx-auto mb-3 text-red-500" />
          <p>Workflow diagram data not available.</p>
          <Button onClick={() => setShowWorkflowView(false)} className="mt-4">
            Back
          </Button>
        </div>
      );
    }

    const workflowData = {
      ...flowData,
      nodes: flowData.nodes.map((node: any) => ({
        ...node,
        data: {
          ...node.data,
          status: node.id === selectedInstance.currentStage ? 'in_progress' : 'pending',
        },
      })),
    };

    return (
      <div className="h-screen flex flex-col animate-fade-in bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setShowWorkflowView(false)}
              className="border-primary-300 text-primary-600"
            >
              ← Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary-700">
                {selectedInstance.workflow.name}
              </h1>
              <p className="text-gray-600">
                Stage: {selectedInstance.currentStage} | Status: {selectedInstance.status}
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="primary"
              onClick={() => {
                setActionType('approve');
                setShowWorkflowView(false);
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setActionType('reject');
                setShowWorkflowView(false);
              }}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>

        <div className="flex-1">
          <WorkflowCanvas
            onSave={() => {}}
            initialData={workflowData}
            readOnly={true}
          />
        </div>
      </div>
    );
  }

  // === Main Dashboard View ===
  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
          Workflow Action Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and approve workflow steps assigned to your role
        </p>
      </div>

      {/* No Actions */}
      {Object.keys(actionItemsByRole).length === 0 ? (
        <Card className="p-12 text-center">
          <GitBranch className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Action Items
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            There are no workflow steps waiting for your approval at this time.
          </p>
        </Card>
      ) : (
        Object.entries(actionItemsByRole).map(([role, instances]) => (
          <Card key={role} className="p-6 border-l-4 border-l-primary-500">
            <div className="flex items-center space-x-3 mb-6">
              <User className="h-6 w-6 text-primary-600" />
              <div>
                <h2 className="text-xl font-semibold text-primary-700">
                  {role} Actions
                </h2>
                <p className="text-gray-600">
                  {instances.length} item(s) requiring your attention
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {instances.map((instance) => (
                <div
                  key={instance.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-primary-50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(instance.status)}
                        <h3 className="font-semibold">{instance.workflow.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(instance.status)}`}>
                          {instance.status.charAt(0).toUpperCase() + instance.status.slice(1)}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <p>Current Stage: <span className="font-medium">{instance.currentStage}</span></p>
                        <p>Activity: <span className="font-medium">{instance.currentActivity?.name || 'Manual Approval'}</span></p>
                        <p>Started: <span className="font-medium">{new Date(instance.startedAt).toLocaleString()}</span></p>
                        <p>Started By: <span className="font-medium">{instance.startedBy}</span></p>
                      </div>

                      {instance.currentActivity?.config?.instructions && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            <strong>Instructions:</strong> {instance.currentActivity.config.instructions}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewWorkflowDiagram(instance)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedInstance(instance);
                          setActionType('approve');
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setSelectedInstance(instance);
                          setActionType('reject');
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))
      )}

      {/* Action Modal */}
      {selectedInstance && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              {actionType === 'approve' ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              <h3 className="text-lg font-semibold">
                {actionType === 'approve' ? 'Approve' : 'Reject'} Workflow Step
              </h3>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Workflow:</strong> {selectedInstance.workflow.name}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Stage:</strong> {selectedInstance.currentStage}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Activity:</strong> {selectedInstance.currentActivity?.name || 'Approval Required'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Comments {actionType === 'reject' ? '(Required)' : '(Optional)'}
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700"
                  placeholder={`Add your ${actionType} comments...`}
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant={actionType === 'approve' ? 'primary' : 'danger'}
                onClick={() => handleAction(selectedInstance, actionType)}
                disabled={actionType === 'reject' && !comments.trim()}
                className={`flex-1 ${actionType === 'approve' ? 'bg-green-600' : 'bg-red-600'} text-white`}
              >
                {actionType === 'approve' ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedInstance(null);
                  setActionType(null);
                  setComments('');
                }}
                className="flex-1 border-primary-300 text-primary-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowActionDashboard;