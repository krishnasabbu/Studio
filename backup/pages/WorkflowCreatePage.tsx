import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import WorkflowBuilder from '../components/workflow/WorkflowBuilder';
import { ArrowLeft } from 'lucide-react';
import { ReactFlowProvider } from 'reactflow';

const API_BASE = 'http://localhost:8080/api/workflows';

const WorkflowCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workflowId = searchParams.get('id');
  const isEditing = Boolean(workflowId);

  const [existingWorkflow, setExistingWorkflow] = React.useState<any>(null);
  const [isLoadingWorkflow, setIsLoadingWorkflow] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (workflowId) {
      setIsLoadingWorkflow(true);
      fetch(`${API_BASE}/${workflowId}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch workflow');
          return res.json();
        })
        .then((data) => setExistingWorkflow(data))
        .catch((err) => {
          console.error(err);
          alert('Failed to load workflow.');
        })
        .finally(() => setIsLoadingWorkflow(false));
    }
  }, [workflowId]);

  const handleSaveWorkflow = async (workflowData: any) => {
    setIsSaving(true);
    try {
      const workflowPayload = {
        ...workflowData,
        version: '1.0',
        status: 'draft',
        createdBy: 'current.user@company.com',
      };

      let response;
      if (isEditing) {
        response = await fetch(`${API_BASE}/${workflowId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(workflowPayload),
        });
      } else {
        response = await fetch(API_BASE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(workflowPayload),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to save workflow');
      }

      alert(isEditing ? 'Workflow updated successfully!' : 'Workflow created successfully!');
      navigate('/workflows/admin');
    } catch (error) {
      console.error('Failed to save workflow:', error);
      alert('Failed to save workflow. Please try again.');
    } finally {
      setIsSaving(false);
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
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 border-primary-300 text-primary-600 hover:bg-primary-50"
            disabled={isSaving}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
          <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
            {isEditing ? 'Edit Workflow' : 'Create New Workflow'}
          </h1>
        </div>
      </div>

      <div className="flex-1">
        <Card className="h-full bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary-500 rounded-none">
          <ReactFlowProvider>
            <WorkflowBuilder
              initialWorkflow={existingWorkflow}
              onSave={handleSaveWorkflow}
              isSaving={isSaving}
            />
          </ReactFlowProvider>
        </Card>
      </div>
    </div>
  );
};

export default WorkflowCreatePage;