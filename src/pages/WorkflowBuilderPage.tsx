import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import { useGetWorkflowQuery, useCreateWorkflowMutation, useUpdateWorkflowMutation } from '../services/api';
import WorkflowCanvas from '../components/workflow/WorkflowCanvas';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import { ArrowLeft, Save, Play, Eye } from 'lucide-react';

const WorkflowBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  // Fetch workflow data from API if editing
  const { data: existingWorkflow, isLoading: isLoadingWorkflow } = useGetWorkflowQuery(id!, {
    skip: !id,
  });
  const [createWorkflow] = useCreateWorkflowMutation();
  const [updateWorkflow] = useUpdateWorkflowMutation();

  const [workflowInfo, setWorkflowInfo] = useState({
    name: '',
    description: '',
    version: '1.0',
  });

  const [currentWorkflow, setCurrentWorkflow] = useState<any>(null);

  useEffect(() => {
    if (isEditing && existingWorkflow) {
      // Load existing workflow from API
      setCurrentWorkflow(existingWorkflow);
      setWorkflowInfo({
        name: existingWorkflow.name,
        description: existingWorkflow.description,
        version: existingWorkflow.version,
      });
    } else {
      // Create default workflow for new workflows
      setCurrentWorkflow({
        name: '',
        description: '',
        version: '1.0',
        nodes: [],
        edges: [],
      });
    }
  }, [id, isEditing, existingWorkflow]);

  const handleSave = async (workflowData: any) => {
    try {
      const workflow = {
        name: workflowInfo.name,
        description: workflowInfo.description,
        version: workflowInfo.version,
        status: 'draft' as const,
        nodes: workflowData.nodes,
        edges: workflowData.edges,
        createdBy: 'current.user@company.com',
      };

      if (isEditing) {
        await updateWorkflow({ ...workflow, id }).unwrap();
        alert('Workflow updated successfully!');
      } else {
        await createWorkflow(workflow).unwrap();
        alert('Workflow created successfully!');
      }

      navigate('/workflows');
    } catch (error) {
      console.error('Failed to save workflow:', error);
      alert('Failed to save workflow. Please try again.');
    }
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
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
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
            <h1 className="text-2xl font-bold text-primary-700 dark:text-white">
              {isEditing ? 'Edit Workflow' : 'Create New Workflow'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Design your workflow with drag-and-drop nodes
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          {currentWorkflow && (
            <Button
              variant="primary"
              onClick={() => navigate(`/workflows/execution/${currentWorkflow.id || 'temp'}`, {
                state: { workflowData: currentWorkflow }
              })}
              className="bg-accent-600 hover:bg-accent-700 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              Test Execute
            </Button>
          )}
        </div>
      </div>

      {/* Workflow Info */}
      <div className="p-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="Workflow Name"
            value={workflowInfo.name}
            onChange={(value) => setWorkflowInfo(prev => ({ ...prev, name: value }))}
            placeholder="Enter workflow name"
          />
          <InputField
            label="Description"
            value={workflowInfo.description}
            onChange={(value) => setWorkflowInfo(prev => ({ ...prev, description: value }))}
            placeholder="Enter workflow description"
          />
          <InputField
            label="Version"
            value={workflowInfo.version}
            onChange={(value) => setWorkflowInfo(prev => ({ ...prev, version: value }))}
            placeholder="e.g., 1.0"
          />
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1">
        <ReactFlowProvider>
          <WorkflowCanvas
            workflow={currentWorkflow}
            onSave={handleSave}
            readOnly={false}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default WorkflowBuilderPage;