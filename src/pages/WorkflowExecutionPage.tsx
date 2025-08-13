import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import { useWorkflowStore } from '../store/workflowStore';
import { useGetWorkflowQuery } from '../services/api';
import WorkflowCanvas from '../components/workflow/WorkflowCanvas';
import WorkflowProgressVisualization from '../components/workflow/WorkflowProgressVisualization';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Database,
  Mail,
  Webhook,
  UserCheck
} from 'lucide-react';

const WorkflowExecutionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    isLoading,
    error,
    setCurrentWorkflow,
  } = useWorkflowStore();

  // Fetch workflow data from API
  const { data: workflow, isLoading: isLoadingWorkflow } = useGetWorkflowQuery(id!);

  const [selectedInstance, setSelectedInstance] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [executionSteps, setExecutionSteps] = useState<any[]>([]);
  const [executionLogs, setExecutionLogs] = useState<any[]>([]);
  const [currentExecutionStep, setCurrentExecutionStep] = useState<string>();
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    if (workflow) {
      setCurrentWorkflow(workflow);
      
      // Generate execution steps from workflow nodes
      if (workflow.nodes) {
        const steps = workflow.nodes
          .filter((node: any) => node.data?.nodeType !== 'start' && node.data?.nodeType !== 'end')
          .map((node: any) => ({
            id: node.id,
            name: node.data?.label || node.id,
            status: node.data?.status || 'pending',
            description: node.data?.description,
          }));
        setExecutionSteps(steps);
      }
    }
  }, [workflow, setCurrentWorkflow]);

  useEffect(() => {
    if (id) {
      // Initialize execution state for demo
      setExecutionLogs([]);
      setCurrentExecutionStep(undefined);
    }
  }, [id]);

  // Auto-refresh execution status
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Refresh execution status from Spring Boot API
      console.log('Auto-refreshing execution status...');
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700';
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Execute DB Query': return Database;
      case 'Deploy Service': return Database;
      case 'Call Webhook': return Webhook;
      case 'Send Notification': return Mail;
      case 'Manual Approval': return UserCheck;
      default: return AlertCircle;
    }
  };

  const handleStartExecution = async () => {
    if (!workflow) return;
    
    setIsExecuting(true);
    
    // Reset all steps to pending
    const steps = workflow.nodes
      ?.filter((node: any) => node.data?.nodeType !== 'start' && node.data?.nodeType !== 'end')
      ?.map((node: any) => ({
        id: node.id,
        name: node.data?.label || node.id,
        status: 'pending',
        description: node.data?.description,
      })) || [];
    
    setExecutionSteps(steps);
    
    // Simulate step-by-step execution
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setCurrentExecutionStep(step.id);
      
      // Update step to running
      setExecutionSteps(prev => prev.map(s => 
        s.id === step.id 
          ? { ...s, status: 'running', startTime: new Date().toISOString() }
          : s
      ));
      
      // Simulate execution time
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1500));
      
      // Randomly determine success/failure (85% success rate)
      const success = Math.random() > 0.15;
      const endTime = new Date().toISOString();
      
      setExecutionSteps(prev => prev.map(s => 
        s.id === step.id 
          ? { 
              ...s, 
              status: success ? 'completed' : 'failed',
              endTime,
              duration: Math.floor((new Date(endTime).getTime() - new Date(s.startTime!).getTime()) / 1000),
              errorMessage: success ? undefined : 'Step execution failed'
            }
          : s
      ));
      
      // If step failed, stop execution
      if (!success) {
        setIsExecuting(false);
        setCurrentExecutionStep(undefined);
        return;
      }
    }
    
    setIsExecuting(false);
    setCurrentExecutionStep(undefined);
    alert('Workflow execution completed successfully!');
  };

  if (isLoading || isLoadingWorkflow) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
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
              Workflow Execution Monitor
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Real-time workflow execution status and logs
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Auto-refresh</span>
          </label>
          <Button
            variant="primary"
            onClick={handleStartExecution}
            disabled={isExecuting}
            className="bg-accent-600 hover:bg-accent-700 text-white"
          >
            {isExecuting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Executing...
              </div>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Execution
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => selectedInstance && fetchExecutionLogs(selectedInstance.id)}
            className="border-primary-300 text-primary-600 hover:bg-primary-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow Visualization */}
        <div className="lg:col-span-2">
          <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary-500">
            <h3 className="text-lg font-semibold text-primary-700 dark:text-white mb-6">
              Workflow Execution Status
            </h3>
            <div className="h-96">
              <ReactFlowProvider>
                <WorkflowCanvas
                  workflow={workflow}
                  readOnly={true}
                  showExecutionStatus={true}
                  executionSteps={executionSteps}
                  currentExecutionStep={currentExecutionStep}
                  isExecuting={isExecuting}
                />
              </ReactFlowProvider>
            </div>
          </Card>
        </div>

        {/* Execution Details */}
        <div className="space-y-6">
          {/* Instance Info */}
          {selectedInstance && (
            <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-accent-500">
              <h3 className="text-lg font-semibold text-primary-700 dark:text-white mb-4">
                Execution Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Instance ID:</span>
                  <span className="text-gray-900 dark:text-white font-mono text-sm">
                    {selectedInstance.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedInstance.status === 'running' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : selectedInstance.status === 'completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {selectedInstance.status.charAt(0).toUpperCase() + selectedInstance.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Started:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(selectedInstance.startedAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Started By:</span>
                  <span className="text-gray-900 dark:text-white">
                    {selectedInstance.startedBy}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Current Node:</span>
                  <span className="text-gray-900 dark:text-white">
                    {selectedInstance.currentNodeId}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Execution Logs */}
          <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500">
            <h3 className="text-lg font-semibold text-primary-700 dark:text-white mb-4">
              Execution Logs
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {executionLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No execution logs available
                </div>
              ) : (
                executionLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-lg border ${getLogColor(log.level)}`}
                  >
                    <div className="flex items-start space-x-3">
                      {getLogIcon(log.level)}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {log.message}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Node: {log.nodeId} | {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                        {log.details && (
                          <div className="text-xs text-gray-600 dark:text-gray-300 mt-2 p-2 bg-white dark:bg-gray-800 rounded">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        )}
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

export default WorkflowExecutionPage;