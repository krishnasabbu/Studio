import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflowStore } from '../store/workflowStore';
import { usePermissions } from '../hooks/useRedux';
import WorkflowList from '../components/workflow/WorkflowList';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Plus, GitBranch, Activity, CheckCircle, Clock, XCircle } from 'lucide-react';
import ApprovalsPage from './ApprovalsPage';

// Define types for clarity
interface WorkflowSummary {
  total: number;
  running: number;
  completed: number;
  pendingApproval: number;
}

interface PendingApproval {
  id: string;
  workflowId: string;
  workflowName: string | null;
  instanceId: number;
  stageId: string;
  stageName: string;
  activityId: string;
  activityName: string;
  requestedBy: string;
  requestedAt: string; // ISO date string
  approver: string;
  status: string;
  priority: string | null;
  description: string | null;
  viewURL: string;
}

const WorkflowDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const {
    workflows,
    isLoading,
    error,
    fetchWorkflows,
    deleteWorkflow,
  } = useWorkflowStore();

  const [summary, setSummary] = useState<WorkflowSummary>({
    total: 0,
    running: 0,
    completed: 0,
    pendingApproval: 0,
  });

  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);

  useEffect(() => {
    fetchWorkflows();
    
    const fetchData = async () => {
      try {
        const baseUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';

        // Fetch summary
        const summaryRes = await fetch(`${baseUrl}/api/workflow-executors/workflow-summary`);
        if (summaryRes.ok) {
          const data: WorkflowSummary = await summaryRes.json();
          setSummary(data);
        }

        // Fetch pending approvals
        const approvalsRes = await fetch(`${baseUrl}/api/workflow-executors/pending-approvals`);
        if (approvalsRes.ok) {
          const data: PendingApproval[] = await approvalsRes.json();
          setPendingApprovals(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch workflow data:', error);
      }
    };

    fetchData();
  }, [fetchWorkflows]);

  const handleDelete = async (workflowId: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      try {
        await deleteWorkflow(workflowId);
        alert('Workflow deleted successfully!');
      } catch (error) {
        console.error('Failed to delete workflow:', error);
        alert('Failed to delete workflow. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
            Workflow Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of workflows, executions, and pending approvals
          </p>
        </div>
        {hasPermission('create') && (
          <Button 
            onClick={() => navigate('/workflows/builder')}
            className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Workflow
          </Button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Workflows */}
        <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Workflows</p>
              <p className="text-2xl font-bold text-primary-700 dark:text-white">{summary.total}</p>
            </div>
            <GitBranch className="h-8 w-8 text-primary-500" />
          </div>
        </Card>

        {/* Running Instances */}
        <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-accent-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Running Instances</p>
              <p className="text-2xl font-bold text-accent-700 dark:text-accent-300">{summary.running}</p>
            </div>
            <Activity className="h-8 w-8 text-accent-500" />
          </div>
        </Card>

        {/* Completed */}
        <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{summary.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        {/* Pending Approvals */}
        <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approvals</p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{summary.pendingApproval}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Workflows */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-primary-700 dark:text-white">
              Recent Workflows
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/workflows')}
              className="border-primary-300 text-primary-600 hover:bg-primary-50"
            >
              View All
            </Button>
          </div>
          <WorkflowList 
            workflows={workflows} 
            onDelete={hasPermission('delete') ? handleDelete : undefined}
            compact={true}
          />
        </div>

        {/* Pending Approvals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-primary-700 dark:text-white">
              Pending Approvals
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/approvals')}
              className="border-primary-300 text-primary-600 hover:bg-primary-50"
            >
              View All
            </Button>
          </div>
          <ApprovalsPage full={false} />
        </div>
      </div>
    </div>
  );
};

export default WorkflowDashboardPage;