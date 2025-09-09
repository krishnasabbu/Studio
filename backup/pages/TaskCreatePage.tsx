import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGetWorkflowsQuery } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import Dropdown from '../components/ui/Dropdown';
import { ArrowLeft, Save, Code } from 'lucide-react';
import BackButton from '../components/ui/BackButton';

interface Task {
  id: string;
  releaseNumber: string;
  title: string;
  description: string;
  sqlQuery: string;
  assignedWorkflow: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

const TaskCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pathname = window.location.pathname;

  // ✅ Extract ID from path if /view/:id, else from ?id= query param
  const match = pathname.match(/\/view\/([^/]+)/);
  const viewId = match ? match[1] : null;
  const createId = searchParams.get('id');

  // ✅ Determine mode and ID
  const isViewing = Boolean(viewId);
  const isEditing = !isViewing && Boolean(createId);
  const taskId = isViewing ? viewId : createId;

  const { data: workflows = [] } = useGetWorkflowsQuery();

  const [formData, setFormData] = useState<Omit<Task, 'id' | 'createdBy'> & { createdBy?: string }>({
    releaseNumber: '',
    title: '',
    description: '',
    sqlQuery: '',
    assignedWorkflow: '',
    status: 'pending',
  });

  // ✅ Only show loader if we are fetching data (i.e. in view or edit mode)
  const [isLoading, setIsLoading] = useState<boolean>(!!taskId);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const sqlEditorRef = useRef<HTMLTextAreaElement>(null);

  // ✅ Load task if we have an ID (viewing or editing)
  useEffect(() => {
    if (!taskId) return; // No ID → not editing/viewing → skip

    const fetchTask = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:8080/api/tasks/${taskId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch task: ${response.status}`);
        }

        const task = await response.json();
        setFormData({
          releaseNumber: task.releaseNumber,
          title: task.title,
          description: task.description,
          sqlQuery: task.sqlQuery,
          assignedWorkflow: task.assignedWorkflow,
          status: task.status,
          createdBy: task.createdBy,
        });
      } catch (error) {
        console.error('Error loading task:', error);
        alert('Failed to load task. Please try again.');
        navigate('/tasks');
      } finally {
        setIsLoading(false); // ✅ Always stop loading
      }
    };

    fetchTask(); // ✅ Fetch task when taskId changes
  }, [taskId, navigate]); // ✅ Only re-run when ID changes

  const handleFormDataChange = (field: string, value: string) => {
    if (isViewing) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSqlQueryChange = (value: string) => {
    if (isViewing) return;
    setFormData((prev) => ({ ...prev, sqlQuery: value }));
  };

  const handleSave = async () => {
    if (isViewing) return;

    if (!formData.releaseNumber.trim() || !formData.title.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const taskData = {
        ...formData,
        createdBy: formData.createdBy || 'current.user@company.com',
      };

      let response;
      if (isEditing && taskId) {
        response = await fetch(`http://localhost:8080/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        });
      } else {
        response = await fetch('http://localhost:8080/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        });
      }

      if (!response.ok) throw new Error(`Failed to ${isEditing ? 'update' : 'create'} task`);

      const savedTask = await response.json();
      console.log('Saved task:', savedTask);
      navigate('/tasks');
    } catch (error) {
      console.error('Failed to save task:', error);
      alert(`Failed to ${isEditing ? 'update' : 'create'} task. Please try again.`);
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const workflowOptions = workflows.map((workflow) => ({
    value: workflow.id,
    label: workflow.name,
  }));

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
  ];

  const formatSqlQuery = () => {
    if (isViewing || !sqlEditorRef.current) return;

    const textarea = sqlEditorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const formatted = formData.sqlQuery
      .replace(/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|INDEX|TABLE)\b/gi, '\n$1')
      .replace(/;/g, ';\n')
      .trim();

    setFormData((prev) => ({ ...prev, sqlQuery: formatted }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, end);
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-lg text-gray-700 dark:text-gray-300">Loading task...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
              {isViewing ? 'View Task' : isEditing ? 'Edit Task' : 'Create New Task'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Define SQL release updates and operational tasks
            </p>
          </div>
        </div>
        <BackButton></BackButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary-500">
            <h3 className="text-lg font-semibold text-primary-700 dark:text-white mb-4">
              Task Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Release Number"
                  value={formData.releaseNumber}
                  onChange={(value) => handleFormDataChange('releaseNumber', value)}
                  placeholder="R2024.01.001"
                  required
                  disabled={isViewing}
                />
                <Dropdown
                  label="Status"
                  value={formData.status}
                  onChange={(value) => handleFormDataChange('status', value)}
                  options={statusOptions}
                  required
                  disabled={isViewing}
                />
              </div>
              <InputField
                label="Task Title"
                value={formData.title}
                onChange={(value) => handleFormDataChange('title', value)}
                placeholder="User Authentication Enhancement"
                required
                disabled={isViewing}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFormDataChange('description', e.target.value)}
                  rows={3}
                  disabled={isViewing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  placeholder="Describe the task and its objectives..."
                />
              </div>
              <Dropdown
                label="Assigned Workflow"
                value={formData.assignedWorkflow}
                onChange={(value) => handleFormDataChange('assignedWorkflow', value)}
                options={workflowOptions}
                placeholder="Select a workflow"
                disabled={isViewing}
              />
            </div>
          </Card>

          <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-accent-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary-700 dark:text-white">
                SQL Query Editor
              </h3>
              {!isViewing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={formatSqlQuery}
                  className="flex items-center space-x-2 border-primary-300 text-primary-600 hover:bg-primary-50"
                >
                  <Code className="h-4 w-4" />
                  <span>Format SQL</span>
                </Button>
              )}
            </div>
            <div className="relative">
              <textarea
                ref={sqlEditorRef}
                value={formData.sqlQuery}
                onChange={(e) => handleSqlQueryChange(e.target.value)}
                rows={12}
                disabled={isViewing}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 dark:bg-gray-800 dark:text-white font-mono text-sm disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
                placeholder={`-- Enter your SQL query here...`}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
                Lines: {formData.sqlQuery.split('\n').length} | Chars: {formData.sqlQuery.length}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
            <h3 className="text-lg font-semibold text-primary-700 dark:text-white mb-4">Task Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Release:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {formData.releaseNumber || 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Title:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {formData.title || 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {formData.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Workflow:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {workflows.find(w => w.id === formData.assignedWorkflow)?.name || 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">SQL Lines:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {formData.sqlQuery.split('\n').length}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500">
            <h3 className="text-lg font-semibold text-primary-700 dark:text-white mb-4">SQL Query Tips</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>• Use proper SQL syntax and formatting</p>
              <p>• Include comments for complex queries</p>
              <p>• Test queries in development first</p>
              <p>• Use transactions for multiple operations</p>
              <p>• Consider rollback strategies</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          onClick={() => navigate('/tasks')}
          className="border-primary-300 text-primary-600 hover:bg-primary-50"
        >
          {isViewing ? 'Close' : 'Cancel'}
        </Button>
        {!isViewing && (
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSubmitting}
            className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Task' : 'Create Task'}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TaskCreatePage;