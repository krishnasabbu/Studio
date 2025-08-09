import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGetWorkflowQuery, useCreateWorkflowMutation, useUpdateWorkflowMutation } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import WorkflowBuilder from '../components/workflow/WorkflowBuilder';
import { ArrowLeft } from 'lucide-react';

const WorkflowCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workflowId = searchParams.get('id');
  const isEditing = Boolean(workflowId);
  
  const { data: existingWorkflow, isLoading: isLoadingWorkflow } = useGetWorkflowQuery(workflowId!, {
    skip: !workflowId,
  });
  const [createWorkflow, { isLoading: isCreating }] = useCreateWorkflowMutation();
  const [updateWorkflow, { isLoading: isUpdating }] = useUpdateWorkflowMutation();
  
  const handleSaveWorkflow = async (workflowData: any) => {
    if (!workflowData.name?.trim()) {
      alert('Please enter a workflow name');
      return;
    }

    try {
      const workflowPayload = {
        ...workflowData,
        version: '1.0',
        status: 'draft',
        createdBy: 'current.user@company.com',
      };

      if (isEditing) {
        await updateWorkflow({ ...workflowPayload, id: workflowId }).unwrap();
      } else {
        await createWorkflow(workflowPayload).unwrap();
      }

      navigate('/workflows');
    } catch (error) {
      console.error('Failed to save workflow:', error);
      alert('Failed to save workflow. Please try again.');
    }
  };

  const handleExecuteWorkflow = (workflowData: any) => {
    // Navigate to execution page with workflow data
    navigate(`/workflows/execute/temp`, { state: { workflowData } });
  };

  if (isLoadingWorkflow) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col animate-fade-in">
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
          <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
            {isEditing ? 'Edit Workflow' : 'Create New Workflow'}
          </h1>
        </div>
      </div>

      <div className="flex-1 mt-6">
        <Card className="h-full bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary-500">
          <WorkflowBuilder
            initialWorkflow={existingWorkflow}
            onSave={handleSaveWorkflow}
            onExecute={handleExecuteWorkflow}
          />
        </Card>
      </div>
    </div>
  );
};

export default WorkflowCreatePage;