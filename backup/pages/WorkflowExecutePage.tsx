import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import { useGetWorkflowQuery, useExecuteWorkflowMutation } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import WorkflowBuilder from '../components/workflow/WorkflowBuilder';
import { ArrowLeft, Play, Pause, CheckCircle, XCircle, Clock, AlertCircle, Database, Mail, Webhook, UserCheck } from 'lucide-react';

const WorkflowExecutePage: React.FC = () => {
  const { workflowId } = useParams<{ workflowId: string }>();
  const navigate = useNavigate();
  
  const { data: workflow, isLoading: isLoadingWorkflow } = useGetWorkflowQuery(workflowId!);
  const location = useLocation();
  const [executeWorkflow, { isLoading: isExecuting }] = useExecuteWorkflowMutation();
  
  const [currentExecution, setCurrentExecution] = useState<any>(null);
  const [executionLogs, setExecutionLogs] = useState<any[]>([]);

  const handleExecuteWorkflow = async (startFromStage?: string) => {
    // Use workflow from location state if available (for temp workflows)
    const workflowToExecute = location.state?.workflowData || workflow;
    if (!workflowToExecute) return;

    try {
      const result = await executeWorkflow({ workflowId: workflowId!, startFromStage }).unwrap();
      setCurrentExecution(result);
      
      // Simulate execution progress
      simulateExecution();
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      alert('Failed to execute workflow. Please try again.');
    }
  };

  const simulateExecution = () => {
    const workflowToExecute = location.state?.workflowData || workflow;
    if (!workflowToExecute) return;

    const logs: any[] = [];
    let currentStageIndex = 0;

    const executeStage = () => {
      if (currentStageIndex >= workflow.stages.length) {
        setExecutionLogs(prev => [...prev, {
          timestamp: new Date().toISOString(),
          stage: 'workflow',
          message: 'Workflow completed successfully',
          status: 'completed',
          type: 'success'
        }]);
        return;
      }

      const stage = workflowToExecute.stages?.[currentStageIndex] || { id: `stage-${currentStageIndex}`, name: `Stage ${currentStageIndex + 1}`, activities: [] };
      
      setExecutionLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        stage: stage.id,
        message: `Starting stage: ${stage.name}`,
        status: 'running',
        type: 'info'
      }]);

      // Simulate activities execution
      stage.activities.forEach((activity: any, activityIndex: number) => {
        setTimeout(() => {
          const success = Math.random() > 0.1; // 90% success rate
          setExecutionLogs(prev => [...prev, {
            timestamp: new Date().toISOString(),
            stage: stage.id,
            activity: activity.id,
            message: `${activity.name}: ${success ? 'Completed' : 'Failed'}`,
            status: success ? 'completed' : 'failed',
            type: success ? 'success' : 'error',
            details: getActivityExecutionDetails(activity, success)
          }]);

          // If this is the last activity in the stage
          if (activityIndex === stage.activities.length - 1) {
            setTimeout(() => {
              setExecutionLogs(prev => [...prev, {
                timestamp: new Date().toISOString(),
                stage: stage.id,
                message: `Stage ${stage.name} completed`,
                status: 'completed',
                type: 'success'
              }]);
              
              currentStageIndex++;
              setTimeout(executeStage, 1000);
            }, 500);
          }
        }, (activityIndex + 1) * 2000);
      });
    };

    executeStage();
  };

  const getActivityExecutionDetails = (activity: any, success: boolean) => {
    switch (activity.type) {
      case 'Execute DB Query':
        return success 
          ? `Query executed successfully on ${activity.config.database}`
          : `Query failed on ${activity.config.database}: Connection timeout`;
      case 'Email Alert':
        return success
          ? `Email sent to ${activity.config.recipients?.length || 0} recipients`
          : `Failed to send email: SMTP server unavailable`;
      case 'Webhook Trigger':
        return success
          ? `Webhook called successfully: ${activity.config.url}`
          : `Webhook failed: ${activity.config.url} returned 500`;
      case 'Manual Approval':
        return success
          ? `Approval received from ${activity.config.approvers?.[0]}`
          : `Approval timeout: No response from approvers`;
      default:
        return success ? 'Activity completed' : 'Activity failed';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Execute DB Query': return Database;
      case 'Email Alert': return Mail;
      case 'Webhook Trigger': return Webhook;
      case 'Manual Approval': return UserCheck;
      default: return AlertCircle;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'running':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoadingWorkflow) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Use workflow from location state if available (for temp workflows)
  const workflowToDisplay = location.state?.workflowData || workflow;

  if (!workflow) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Workflow not found</div>
        <Button onClick={() => navigate('/workflows')}>Back to Workflows</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/workflows')}
            className="flex items-center space-x-2 border-primary-300 text-primary-600 hover:bg-primary-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Workflows</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
              Execute Workflow: {workflowToDisplay?.name || 'Unnamed Workflow'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {workflowToDisplay?.description || 'No description available'}
            </p>
          </div>
        </div>
        <Button
          onClick={() => handleExecuteWorkflow()}
          disabled={isExecuting}
          className="bg-accent-600 hover:bg-accent-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isExecuting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Executing...
            </div>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Execute Workflow
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow Progress */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary-500">
            <h3 className="text-lg font-semibold text-primary-700 dark:text-white mb-6">
              Workflow Visualization
            </h3>
            <div className="h-96">
              <ReactFlowProvider>
                <WorkflowBuilder
                  initialWorkflow={workflowToDisplay}
                  onSave={() => {}}
                  readOnly={true}
                />
              </ReactFlowProvider>
            </div>
          </Card>
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary-500">
            <h3 className="text-lg font-semibold text-primary-700 dark:text-white mb-6">
              Workflow Progress
            </h3>
            
            <div className="space-y-4">
              {(workflowToDisplay?.stages || []).map((stage: any, index: number) => (
                <div key={stage.id} className="relative">
                  {/* Stage Header */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-primary-200 dark:border-gray-600">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary-700 dark:text-white">
                          {stage.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {stage.activities?.length || 0} activities
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExecuteWorkflow(stage.id)}
                      disabled={isExecuting}
                      className="border-primary-300 text-primary-600 hover:bg-primary-50"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Run from here
                    </Button>
                  </div>

                  {/* Activities */}
                  <div className="ml-4 mt-2 space-y-2">
                    {(stage.activities || []).map((activity: any) => {
                      const IconComponent = getActivityIcon(activity.type);
                      return (
                        <div
                          key={activity.id}
                          className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                        >
                          <IconComponent className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {activity.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {activity.type}
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Connector Line */}
                  {index < (workflowToDisplay?.stages?.length || 0) - 1 && (
                    <div className="flex justify-center my-2">
                      <div className="w-0.5 h-6 bg-primary-300"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
        </div>

        {/* Execution Logs */}
        <div className="space-y-6">
          <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-accent-500">
            <h3 className="text-lg font-semibold text-primary-700 dark:text-white mb-4">
              Execution Logs
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {executionLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No execution logs yet
                </div>
              ) : (
                executionLogs.map((log, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600"
                  >
                    {getStatusIcon(log.status)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.message}
                      </div>
                      {log.details && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {log.details}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default WorkflowExecutePage;