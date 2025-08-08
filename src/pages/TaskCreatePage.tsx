import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGetTaskQuery, useCreateTaskMutation, useUpdateTaskMutation, useGetWorkflowsQuery } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import Dropdown from '../components/ui/Dropdown';
import { ArrowLeft, Save, Code } from 'lucide-react';

const TaskCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('id');
  const isEditing = Boolean(taskId);
  
  const { data: existingTask, isLoading: isLoadingTask } = useGetTaskQuery(taskId!, {
    skip: !taskId,
  });
  const { data: workflows = [] } = useGetWorkflowsQuery();
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  
  const [formData, setFormData] = useState({
    releaseNumber: '',
    title: '',
    description: '',
    sqlQuery: '',
    assignedWorkflow: '',
    status: 'pending' as const,
  });

  const sqlEditorRef = useRef<HTMLTextAreaElement>(null);

  // Load existing task data
  React.useEffect(() => {
    if (existingTask) {
      setFormData({
        releaseNumber: existingTask.releaseNumber,
        title: existingTask.title,
        description: existingTask.description,
        sqlQuery: existingTask.sqlQuery,
        assignedWorkflow: existingTask.assignedWorkflow,
        status: existingTask.status,
      });
    }
  }, [existingTask]);

  const handleFormDataChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSqlQueryChange = (value: string) => {
    setFormData(prev => ({ ...prev, sqlQuery: value }));
  };

  const handleSave = async () => {
    if (!formData.releaseNumber.trim() || !formData.title.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const taskData = {
        ...formData,
        createdBy: 'current.user@company.com',
      };

      if (isEditing) {
        await updateTask({ ...taskData, id: taskId }).unwrap();
      } else {
        await createTask(taskData).unwrap();
      }

      navigate('/tasks');
    } catch (error) {
      console.error('Failed to save task:', error);
      alert('Failed to save task. Please try again.');
    }
  };

  const workflowOptions = workflows.map(workflow => ({
    value: workflow.id,
    label: workflow.name,
  }));

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
  ];

  // SQL syntax highlighting helper (basic)
  const formatSqlQuery = () => {
    if (sqlEditorRef.current) {
      const textarea = sqlEditorRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Basic SQL formatting
      let formatted = formData.sqlQuery
        .replace(/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|INDEX|TABLE)\b/gi, '\n$1')
        .replace(/;/g, ';\n')
        .trim();
      
      setFormData(prev => ({ ...prev, sqlQuery: formatted }));
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, end);
      }, 0);
    }
  };

  if (isLoadingTask) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/tasks')}
            className="flex items-center space-x-2 border-primary-300 text-primary-600 hover:bg-primary-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Tasks</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Define SQL release updates and operational tasks
            </p>
          </div>
        </div>
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
                />
                <Dropdown
                  label="Status"
                  value={formData.status}
                  onChange={(value) => handleFormDataChange('status', value)}
                  options={statusOptions}
                  required
                />
              </div>
              <InputField
                label="Task Title"
                value={formData.title}
                onChange={(value) => handleFormDataChange('title', value)}
                placeholder="User Authentication Enhancement"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFormDataChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="Describe the task and its objectives..."
                />
              </div>
              <Dropdown
                label="Assigned Workflow"
                value={formData.assignedWorkflow}
                onChange={(value) => handleFormDataChange('assignedWorkflow', value)}
                options={workflowOptions}
                placeholder="Select a workflow"
              />
            </div>
          </Card>

          <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-accent-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary-700 dark:text-white">
                SQL Query Editor
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={formatSqlQuery}
                className="flex items-center space-x-2 border-primary-300 text-primary-600 hover:bg-primary-50"
              >
                <Code className="h-4 w-4" />
                <span>Format SQL</span>
              </Button>
            </div>
            <div className="relative">
              <textarea
                ref={sqlEditorRef}
                value={formData.sqlQuery}
                onChange={(e) => handleSqlQueryChange(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 dark:bg-gray-800 dark:text-white font-mono text-sm"
                placeholder="-- Enter your SQL query here
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, email) VALUES ('admin', 'admin@company.com');"
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
                Lines: {formData.sqlQuery.split('\n').length} | Characters: {formData.sqlQuery.length}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
            <h3 className="text-lg font-semibold text-primary-700 dark:text-white mb-4">
              Task Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Release:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {formData.releaseNumber || 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {formData.status.replace('_', ' ').charAt(0).toUpperCase() + formData.status.replace('_', ' ').slice(1)}
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
            <h3 className="text-lg font-semibold text-primary-700 dark:text-white mb-4">
              SQL Query Tips
            </h3>
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

      {/* Save Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          onClick={() => navigate('/tasks')}
          className="border-primary-300 text-primary-600 hover:bg-primary-50"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isCreating || isUpdating}
          className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {(isCreating || isUpdating) ? (
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
      </div>
    </div>
  );
};

export default TaskCreatePage;