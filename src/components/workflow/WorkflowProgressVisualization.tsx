import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle, Play } from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'awaiting_approval';
  type: 'automated' | 'approval' | 'notification';
  startTime?: string;
  endTime?: string;
  approver?: string;
  comments?: string;
}

interface WorkflowProgressVisualizationProps {
  steps: WorkflowStep[];
  currentStepId?: string;
  isExecuting?: boolean;
  onStepClick?: (stepId: string) => void;
}

const WorkflowProgressVisualization: React.FC<WorkflowProgressVisualizationProps> = ({
  steps,
  currentStepId,
  isExecuting = false,
  onStepClick,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'running':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'awaiting_approval':
        return <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string, isCurrentStep: boolean) => {
    const baseClasses = "transition-all duration-500 ease-in-out";
    const scaleClass = isCurrentStep ? "scale-110 shadow-lg" : "";
    
    switch (status) {
      case 'completed':
        return `${baseClasses} ${scaleClass} bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-600`;
      case 'running':
        return `${baseClasses} ${scaleClass} bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-600 animate-pulse`;
      case 'awaiting_approval':
        return `${baseClasses} ${scaleClass} bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-600`;
      case 'failed':
        return `${baseClasses} ${scaleClass} bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-600`;
      default:
        return `${baseClasses} ${scaleClass} bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600`;
    }
  };

  const getConnectorColor = (currentStatus: string, nextStatus: string) => {
    if (currentStatus === 'completed') {
      return 'bg-green-500';
    } else if (currentStatus === 'running' || currentStatus === 'awaiting_approval') {
      return 'bg-blue-500';
    } else if (currentStatus === 'failed') {
      return 'bg-red-500';
    }
    return 'bg-gray-300';
  };

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Workflow Progress
          </h3>
          <div className="flex items-center space-x-2">
            {isExecuting && <Play className="h-4 w-4 text-blue-500 animate-pulse" />}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {completedSteps} of {totalSteps} completed
            </span>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="text-right mt-2">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {Math.round(progressPercentage)}%
          </span>
        </div>
      </div>

      {/* Step Visualization */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Step-by-Step Progress
        </h3>
        
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isCurrentStep = step.id === currentStepId;
            const isLastStep = index === steps.length - 1;
            
            return (
              <div key={step.id} className="relative">
                <div
                  className={`flex items-start space-x-4 p-4 rounded-lg border-2 cursor-pointer ${getStatusColor(step.status, isCurrentStep)}`}
                  onClick={() => onStepClick?.(step.id)}
                >
                  {/* Step Icon */}
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      step.status === 'completed' ? 'bg-green-500 border-green-600' :
                      step.status === 'running' ? 'bg-blue-500 border-blue-600 animate-pulse' :
                      step.status === 'awaiting_approval' ? 'bg-yellow-500 border-yellow-600' :
                      step.status === 'failed' ? 'bg-red-500 border-red-600' :
                      'bg-gray-400 border-gray-500'
                    }`}>
                      {getStatusIcon(step.status)}
                    </div>
                    
                    {/* Connector Line */}
                    {!isLastStep && (
                      <div className={`w-1 h-8 mt-2 transition-all duration-500 ${
                        getConnectorColor(step.status, steps[index + 1]?.status)
                      }`} />
                    )}
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {step.name}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {step.type}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      {step.startTime && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Started: {new Date(step.startTime).toLocaleTimeString()}
                        </div>
                      )}
                      
                      {step.endTime && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Completed: {new Date(step.endTime).toLocaleTimeString()}
                        </div>
                      )}
                      
                      {step.approver && (
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          Approver: <span className="font-medium">{step.approver}</span>
                        </div>
                      )}
                      
                      {step.comments && (
                        <div className="text-sm text-gray-700 dark:text-gray-300 italic">
                          "{step.comments}"
                        </div>
                      )}
                    </div>
                    
                    {/* Progress Bar for Current Step */}
                    {isCurrentStep && step.status === 'running' && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                          <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkflowProgressVisualization;