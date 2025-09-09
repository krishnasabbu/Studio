import React, { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import WorkflowCanvas from '../components/workflow/WorkflowCanvas';
import { useParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  Square, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Database,
  Mail,
  UserCheck,
  Activity,
  GitBranch
} from 'lucide-react';

interface ExecutionStep {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'awaiting_approval';
  startTime?: string;
  endTime?: string;
  duration?: number;
  approver?: string;
  comments?: string;
  errorMessage?: string;
}

interface ExecutionLog {
  id: string;
  timestamp: string;
  stepId: string;
  stepName: string;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  details?: string;
  performedBy?: string;
}


const WorkflowDemoPage: React.FC = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [executionSpeed, setExecutionSpeed] = useState(2000);
  const [autoScroll, setAutoScroll] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Initialize with fallback
  const [demoWorkflow, setDemoWorkflow] = useState({
    id: 'loading',
    name: 'Loading Workflow...',
    description: 'Fetching from server...',
    nodes: [],
    edges: []
  });

  const { id } = useParams<{ id: string }>();
  const serviceId = id || null;

  if (!serviceId) {
    console.error('No service ID provided in URL');
    // Optionally set error state or redirect
  }

  useEffect(() => {
    if (!serviceId) {
      addToast('Service ID is missing from URL', 'error');
      navigate('/workflows'); // or wherever appropriate
      return;
    }
    const fetchWorkflow = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/workflow-executors/details-by-service/${serviceId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const  ApiResponse = await response.json();

        // Map API response to internal workflow structure
        const mappedNodes = ApiResponse.workflow.nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            status: node.data.status || 'pending',
            label: node.data.stageName || node.data.label || 'Unnamed'
          }
        }));

        const mappedEdges = ApiResponse.workflow.edges.map(edge => ({
          ...edge,
          data: edge.data || {}
        }));

        // Map executionSteps: convert status to lowercase and normalize
        const mappedExecutionSteps: ExecutionStep[] = ApiResponse.executionSteps.map(step => {
          const statusMap: Record<string, ExecutionStep['status']> = {
            'COMPLETED': 'completed',
            'PENDING': 'pending',
            'RUNNING': 'running',
            'FAILED': 'failed',
            'AWAITING_APPROVAL': 'awaiting_approval'
          };
          const mappedStatus = statusMap[step.status.toUpperCase()] || 'pending';

          return {
            id: step.id,
            name: step.name,
            type: step.type === 'NODE' ? 'automated' : step.type.toLowerCase(),
            status: mappedStatus,
            ...(mappedStatus === 'completed' && { endTime: new Date().toISOString() }),
          };
        });

        // Update state
        setDemoWorkflow({
          id: ApiResponse.workflow.id,
          name: ApiResponse.workflow.name,
          description: ApiResponse.workflow.description,
          nodes: mappedNodes,
          edges: mappedEdges
        });

        setExecutionSteps(mappedExecutionSteps);
      } catch (error) {
        console.error('Error loading workflow:', error);
        // Fallback to minimal state
        setDemoWorkflow(prev => ({ ...prev, name: 'Failed to load workflow' }));
      }
    };

    fetchWorkflow();
  }, [serviceId]);

  // === Keep ALL your existing logic below ===
  const addLog = (stepId: string, stepName: string, level: ExecutionLog['level'], message: string, details?: string, performedBy?: string) => {
    const newLog: ExecutionLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      stepId,
      stepName,
      level,
      message,
      details,
      performedBy
    };
    setExecutionLogs(prev => [...prev, newLog]);
  };

  const updateStepStatus = (stepId: string, status: ExecutionStep['status'], additionalData?: Partial<ExecutionStep>) => {
    setExecutionSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { 
            ...step, 
            status, 
            ...(status === 'running' && { startTime: new Date().toISOString() }),
            ...(status === 'completed' && { endTime: new Date().toISOString() }),
            ...additionalData
          }
        : step
    ));

    setDemoWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === stepId 
          ? { ...node, data: { ...node.data, status } }
          : node
      )
    }));
  };

  const executeStep = async (stepIndex: number): Promise<boolean> => {
    if (stepIndex >= executionSteps.length) return true;
    
    const step = executionSteps[stepIndex];
    updateStepStatus(step.id, 'running');
    addLog(step.id, step.name, 'info', `Starting ${step.name}...`);
    
    await new Promise(resolve => setTimeout(resolve, executionSpeed));
    
    switch (step.type) {
      case 'automated':
        const success = Math.random() > 0.1;
        if (success) {
          updateStepStatus(step.id, 'completed');
          addLog(step.id, step.name, 'success', `${step.name} completed successfully`, getStepDetails(step));
          return true;
        } else {
          updateStepStatus(step.id, 'failed', { errorMessage: 'Execution failed' });
          addLog(step.id, step.name, 'error', `${step.name} failed`, 'System error occurred');
          return false;
        }
        
      case 'approval':
        updateStepStatus(step.id, 'awaiting_approval');
        addLog(step.id, step.name, 'warning', `${step.name} requires approval`);
        await new Promise(resolve => setTimeout(resolve, executionSpeed * 1.5));
        const approved = Math.random() > 0.2;
        if (approved) {
          updateStepStatus(step.id, 'completed', { approver: 'john.manager@company.com' });
          addLog(step.id, step.name, 'success', `${step.name} approved`);
          return true;
        } else {
          updateStepStatus(step.id, 'failed', { approver: 'john.manager@company.com' });
          addLog(step.id, step.name, 'error', `${step.name} rejected`);
          return false;
        }
        
      case 'notification':
        updateStepStatus(step.id, 'completed');
        addLog(step.id, step.name, 'success', `${step.name} sent`);
        return true;
        
      default:
        updateStepStatus(step.id, 'completed');
        addLog(step.id, step.name, 'success', `${step.name} completed`);
        return true;
    }
  };

  const getStepDetails = (step: ExecutionStep) => {
    return step.id.startsWith('stage') 
      ? `Environment: ${step.id.includes('1754976954015') ? 'Staging' : 'Production'}`
      : 'Approval required';
  };

  const startExecution = async () => {
    if (isPaused) {
      setIsPaused(false);
      setIsExecuting(true);
      for (let i = currentStepIndex + 1; i < executionSteps.length; i++) {
        if (isPaused) break;
        setCurrentStepIndex(i);
        const success = await executeStep(i);
        if (!success) break;
      }
      setIsExecuting(false);
      return;
    }

    setExecutionSteps(prev => prev.map(s => ({ ...s, status: 'pending', startTime: undefined, endTime: undefined })));
    setExecutionLogs([]);
    setCurrentStepIndex(-1);
    setIsExecuting(true);
    setIsPaused(false);

    setDemoWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => ({
        ...node,
        data: { ...node.data, status: 'pending' }
      }))
    }));

    addLog('workflow', 'Workflow Execution', 'info', 'Starting workflow execution', 'Initiated by user');

    for (let i = 0; i < executionSteps.length; i++) {
      if (isPaused) break;
      setCurrentStepIndex(i);
      const success = await executeStep(i);
      if (!success) break;
    }
    
    if (!isPaused) {
      addLog('workflow', 'Workflow Execution', 'success', 'Execution completed');
    }
    
    setIsExecuting(false);
  };

  const pauseExecution = () => {
    setIsPaused(true);
    setIsExecuting(false);
    addLog('workflow', 'Workflow Execution', 'warning', 'Paused by user');
  };

  const stopExecution = () => {
    setIsExecuting(false);
    setIsPaused(false);
    setCurrentStepIndex(-1);
    setExecutionSteps(prev => prev.map(s => ({ ...s, status: 'pending' })));
    setDemoWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => ({ ...n, data: { ...n.data, status: 'pending' } }))
    }));
    addLog('workflow', 'Workflow Execution', 'warning', 'Stopped by user');
  };

  const resetDemo = () => {
    setIsExecuting(false);
    setIsPaused(false);
    setCurrentStepIndex(-1);
    setExecutionLogs([]);
    setExecutionSteps(prev => prev.map(s => ({ ...s, status: 'pending' })));
    setDemoWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => ({ ...n, data: { ...n.data, status: 'pending' } }))
    }));
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'automated': return Database;
      case 'approval': return UserCheck;
      case 'notification': return Mail;
      default: return Activity;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'awaiting_approval': return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200';
      case 'running': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 animate-pulse';
      case 'awaiting_approval': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200';
    }
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'success': return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700';
      case 'error': return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700';
      case 'warning': return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700';
      default: return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700';
    }
  };

  useEffect(() => {
    if (autoScroll) {
      const logsContainer = document.getElementById('execution-logs');
      if (logsContainer) {
        logsContainer.scrollTop = logsContainer.scrollHeight;
      }
    }
  }, [executionLogs, autoScroll]);

  const completedSteps = executionSteps.filter(s => s.status === 'completed').length;
  const totalSteps = executionSteps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
            {demoWorkflow.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {demoWorkflow.description}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Speed:</label>
            <select
              value={executionSpeed}
              onChange={(e) => setExecutionSpeed(Number(e.target.value))}
              disabled={isExecuting}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 dark:text-white"
            >
              <option value={1000}>Fast (1s)</option>
              <option value={2000}>Normal (2s)</option>
              <option value={3000}>Slow (3s)</option>
            </select>
          </div>
          
          {!isExecuting && !isPaused && (
            <Button
              onClick={startExecution}
              className="bg-accent-600 hover:bg-accent-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Demo
            </Button>
          )}
          
          {isExecuting && (
            <Button
              onClick={pauseExecution}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
          
          {isPaused && (
            <Button
              onClick={startExecution}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          )}
          
          {(isExecuting || isPaused) && (
            <Button
              onClick={stopExecution}
              variant="danger"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>
          )}
          
          <Button
            onClick={resetDemo}
            variant="outline"
            disabled={isExecuting}
            className="border-primary-300 text-primary-600 hover:bg-primary-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <GitBranch className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            <div>
              <h3 className="text-lg font-semibold text-primary-700 dark:text-white">
                Execution Progress
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {completedSteps} of {totalSteps} steps completed ({Math.round(progressPercentage)}%)
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-700 dark:text-white">
              {Math.round(progressPercentage)}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Complete
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-primary-500 to-accent-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {executionSteps.map((step, index) => {
            const IconComponent = getStepIcon(step.type);
            const isCurrentStep = index === currentStepIndex;
            return (
              <div
                key={step.id}
                className={`p-3 rounded-lg border transition-all duration-300 ${getStatusColor(step.status)} ${isCurrentStep ? 'ring-2 ring-primary-500 scale-105' : ''}`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <IconComponent className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  {getStatusIcon(step.status)}
                </div>
                <div className="text-xs font-medium text-gray-900 dark:text-white">
                  {step.name}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {step.type === 'automated' ? 'Automated' : step.type.charAt(0).toUpperCase() + step.type.slice(1)}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
          <h3 className="text-lg font-semibold text-primary-700 dark:text-white mb-6">
            Workflow Visualization
          </h3>
          <div className="h-96 border border-gray-200 dark:border-gray-600 rounded-lg">
            <ReactFlowProvider>
              <WorkflowCanvas
                workflow={demoWorkflow}
                readOnly={true}
                showExecutionStatus={true}
                executionSteps={executionSteps}
                currentExecutionStep={currentStepIndex >= 0 ? executionSteps[currentStepIndex]?.id : undefined}
                isExecuting={isExecuting}
              />
            </ReactFlowProvider>
          </div>
        </Card>

        <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary-700 dark:text-white">
              Execution Logs
            </h3>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Auto-scroll</span>
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {executionLogs.length} entries
              </span>
            </div>
          </div>
          <div 
            id="execution-logs"
            className="space-y-2 max-h-80 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
          >
            {executionLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No execution logs yet</p>
                <p className="text-xs">Start the demo to see real-time logs</p>
              </div>
            ) : (
              executionLogs.map((log, index) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg border transition-all duration-300 ${getLogColor(log.level)} animate-fade-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start space-x-3">
                    {getLogIcon(log.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {log.message}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Step: {log.stepName}
                      </div>
                      {log.details && (
                        <div className="text-xs text-gray-700 dark:text-gray-300 mt-2 p-2 bg-white dark:bg-gray-700 rounded border">
                          {log.details}
                        </div>
                      )}
                      {log.performedBy && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          By: {log.performedBy}
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

      <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500">
        <h3 className="text-lg font-semibold text-primary-700 dark:text-white mb-6">
          Step Details & Timeline
        </h3>
        <div className="space-y-4">
          {executionSteps.map((step, index) => {
            const IconComponent = getStepIcon(step.type);
            const isCompleted = step.status === 'completed';
            const isFailed = step.status === 'failed';
            return (
              <div
                key={step.id}
                className={`relative p-4 rounded-lg border ${
                  isCompleted 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                    : isFailed
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-green-500' : isFailed ? 'bg-red-500' : 'bg-gray-400'
                    }`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    {index < executionSteps.length - 1 && (
                      <div className={`w-0.5 h-8 mt-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{step.name}</h4>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(step.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(step.status)}`}>
                          {step.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Type: {step.type === 'automated' ? 'Automated' : step.type.charAt(0).toUpperCase() + step.type.slice(1)}
                    </div>
                    {step.startTime && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Started: {new Date(step.startTime).toLocaleTimeString()}
                      </div>
                    )}
                    {step.endTime && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Completed: {new Date(step.endTime).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-gray-800 dark:to-gray-700 border-l-4 border-l-accent-500">
        <h3 className="text-lg font-semibold text-primary-700 dark:text-white mb-4">
          Demo Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-primary-600 dark:text-primary-400 mb-2">Features Demonstrated</h4>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• Visual workflow</li>
              <li>• Real-time progress</li>
              <li>• Execution logs</li>
              <li>• Step-by-step simulation</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WorkflowDemoPage;