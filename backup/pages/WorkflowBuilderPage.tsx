import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import {
  useGetWorkflowQuery,
  useCreateWorkflowMutation,
  useUpdateWorkflowMutation
} from '../services/api';
import WorkflowCanvas from '../components/workflow/WorkflowCanvas';
import InputField from '../components/ui/InputField';
import { ArrowLeft, Save, Play, Eye } from 'lucide-react';
import { usePageInfo } from '../hooks/usePageInfo';

const WorkflowBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  usePageInfo('Manage Workflow', 'Design your workflow with drag-and-drop nodes');

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
      setCurrentWorkflow(existingWorkflow);
      setWorkflowInfo({
        name: existingWorkflow.name,
        description: existingWorkflow.description,
        version: existingWorkflow.version,
      });
    } else {
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
        ...workflowInfo,
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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flow-height flex flex-row animate-fade-in overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-80 p-6 bg-white/90 dark:bg-gray-800/90 border-r border-gray-200 dark:border-gray-700 shadow-xl backdrop-blur-sm flex flex-col rounded-tr-xl rounded-br-xl">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Workflow Details</h2>
        <div className="space-y-5 flex-grow overflow-y-auto pr-1">
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

      {/* Main Canvas */}
      <div className="flex-1 relative">
        <ReactFlowProvider>
          <div className="absolute inset-0 bg-[radial-gradient(circle,_#f0f0f0_1px,_transparent_1px)] dark:bg-[radial-gradient(circle,_#1f2937_1px,_transparent_1px)] [background-size:20px_20px]">
            <WorkflowCanvas
              workflow={currentWorkflow}
              onSave={handleSave}
              readOnly={false}
            />
          </div>
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default WorkflowBuilderPage;