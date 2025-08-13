import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetActivitiesQuery, useCreateActivityMutation, useUpdateActivityMutation, useDeleteActivityMutation, useGetWorkflowsQuery } from '../services/api';
import { usePermissions } from '../hooks/useRedux';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import Dropdown from '../components/ui/Dropdown';
import WorkflowBuilder from '../components/workflow/WorkflowBuilder';
import { Plus, Edit, Trash2, Activity, Search, Filter, Grid, List, Eye, GitBranch } from 'lucide-react';
import { ReactFlowProvider } from 'reactflow';

const ActivitiesDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  
  const { data: activities = [], isLoading, error } = useGetActivitiesQuery('all');
  const { data: workflows = [] } = useGetWorkflowsQuery();
  const [createActivity, { isLoading: isCreating }] = useCreateActivityMutation();
  const [updateActivity, { isLoading: isUpdating }] = useUpdateActivityMutation();
  const [deleteActivity, { isLoading: isDeleting }] = useDeleteActivityMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [showWorkflowPreview, setShowWorkflowPreview] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Execute DB Query',
    stage: 'development',
    description: '',
    workflowId: '',
    status: 'pending',
    config: {},
  });

  const activityTypeOptions = [
    { value: 'Execute DB Query', label: 'Execute DB Query' },
    { value: 'Email Alert', label: 'Email Alert' },
    { value: 'Webhook Trigger', label: 'Webhook Trigger' },
    { value: 'Manual Approval', label: 'Manual Approval' },
    { value: 'Data Processing', label: 'Data Processing' },
    { value: 'File Transfer', label: 'File Transfer' },
    { value: 'API Call', label: 'API Call' },
    { value: 'Notification', label: 'Notification' },
  ];

  const stageOptions = [
    { value: 'development', label: 'Development' },
    { value: 'testing', label: 'Testing' },
    { value: 'staging', label: 'Staging' },
    { value: 'production', label: 'Production' },
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
  ];

  const workflowOptions = workflows.map(workflow => ({
    value: workflow.id,
    label: workflow.name,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Activity name is required');
      return;
    }

    try {
      const activityData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
      };

      if (editingActivity) {
        await updateActivity({ ...editingActivity, ...activityData }).unwrap();
        alert('Activity updated successfully!');
        setEditingActivity(null);
      } else {
        await createActivity(activityData).unwrap();
        alert('Activity created successfully!');
      }
      
      setFormData({
        name: '',
        type: 'Execute DB Query',
        stage: 'development',
        description: '',
        workflowId: '',
        status: 'pending',
        config: {},
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to save activity:', error);
      alert('Failed to save activity. Please try again.');
    }
  };

  const handleEdit = (activity: any) => {
    setEditingActivity(activity);
    setFormData({
      name: activity.name,
      type: activity.type,
      stage: activity.stage,
      description: activity.description || '',
      workflowId: activity.workflowId || '',
      status: activity.status,
      config: activity.config || {},
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (activityId: string) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      try {
        await deleteActivity(activityId).unwrap();
        alert('Activity deleted successfully!');
      } catch (error) {
        console.error('Failed to delete activity:', error);
        alert('Failed to delete activity. Please try again.');
      }
    }
  };

  const handleWorkflowPreview = (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (workflow) {
      setSelectedWorkflow(workflow);
      setShowWorkflowPreview(true);
    }
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'Execute DB Query':
        return '🗄️';
      case 'Email Alert':
        return '📧';
      case 'Webhook Trigger':
        return '🔗';
      case 'Manual Approval':
        return '✋';
      case 'Data Processing':
        return '⚙️';
      case 'File Transfer':
        return '📁';
      case 'API Call':
        return '🌐';
      case 'Notification':
        return '🔔';
      default:
        return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'development':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'testing':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'staging':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'production':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Filter and search logic
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || activity.status === statusFilter;
    const matchesType = !typeFilter || activity.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Failed to load activities</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
            Activities Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage workflow activities independently
          </p>
        </div>
        {hasPermission('create') && (
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Activity
          </Button>
        )}
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary-500">
          <h2 className="text-xl font-semibold text-primary-700 dark:text-white mb-4">
            {editingActivity ? 'Edit Activity' : 'Create New Activity'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Activity Name"
                value={formData.name}
                onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                placeholder="Enter activity name"
                required
              />
              <Dropdown
                label="Activity Type"
                value={formData.type}
                onChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                options={activityTypeOptions}
                required
              />
              <Dropdown
                label="Stage"
                value={formData.stage}
                onChange={(value) => setFormData(prev => ({ ...prev, stage: value }))}
                options={stageOptions}
                required
              />
              <Dropdown
                label="Status"
                value={formData.status}
                onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                options={statusOptions}
                required
              />
            </div>
            
            <InputField
              label="Description"
              value={formData.description}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              placeholder="Enter activity description"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Dropdown
                  label="Assign to Workflow (Optional)"
                  value={formData.workflowId}
                  onChange={(value) => setFormData(prev => ({ ...prev, workflowId: value }))}
                  options={[{ value: '', label: 'No Workflow' }, ...workflowOptions]}
                  placeholder="Select workflow"
                />
              </div>
              {formData.workflowId && (
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleWorkflowPreview(formData.workflowId)}
                    className="border-primary-300 text-primary-600 hover:bg-primary-50"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Workflow
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button 
                type="submit" 
                variant="primary"
                disabled={isCreating || isUpdating}
                className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {editingActivity ? 'Update Activity' : 'Create Activity'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-primary-300 text-primary-600 hover:bg-primary-50"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingActivity(null);
                  setFormData({
                    name: '',
                    type: 'Execute DB Query',
                    stage: 'development',
                    description: '',
                    workflowId: '',
                    status: 'pending',
                    config: {},
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Search and Filter Bar */}
      <Card className="p-4 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-accent-500">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="pl-4 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Types</option>
                {activityTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'card' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('card')}
              className={viewMode === 'card' ? 'bg-primary-600 text-white' : 'border-primary-300 text-primary-600 hover:bg-primary-50'}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
              className={viewMode === 'table' ? 'bg-primary-600 text-white' : 'border-primary-300 text-primary-600 hover:bg-primary-50'}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Content */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedActivities.map((activity) => {
            const assignedWorkflow = workflows.find(w => w.id === activity.workflowId);
            
            return (
              <Card 
                key={activity.id} 
                className="p-6 hover:shadow-xl transition-all duration-300 bg-white hover:bg-gradient-to-br hover:from-white hover:to-gray-50 border-l-4 border-l-primary-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getActivityTypeIcon(activity.type)}</div>
                    <div>
                      <h3 className="font-semibold text-primary-700 dark:text-white">
                        {activity.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {activity.type}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                    {(activity.status || '').charAt(0).toUpperCase() + (activity.status || '').slice(1).replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-3">
                  {activity.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {activity.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Stage:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(activity.stage || '')}`}>
                      {(activity.stage || '').charAt(0).toUpperCase() + (activity.stage || '').slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Workflow:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-900 dark:text-white">
                        {assignedWorkflow ? assignedWorkflow.name : 'Not Assigned'}
                      </span>
                      {assignedWorkflow && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleWorkflowPreview(activity.workflowId)}
                          className="px-2 py-1 border-primary-300 text-primary-600 hover:bg-primary-50"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Created:</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2 mt-6">
                  {hasPermission('update') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(activity)}
                      className="flex-1 border-primary-300 text-primary-600 hover:bg-primary-50"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  {hasPermission('delete') && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(activity.id)}
                      disabled={isDeleting}
                      className="px-3"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Activity Name
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Stage
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Workflow
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Created
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedActivities.map((activity) => {
                  const assignedWorkflow = workflows.find(w => w.id === activity.workflowId);
                  
                  return (
                    <tr
                      key={activity.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-primary-50 dark:hover:bg-gray-800/50 transition-all duration-200"
                    >
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getActivityTypeIcon(activity.type)}</span>
                          <span>{activity.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {activity.type}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(activity.stage || '')}`}>
                          {(activity.stage || '').charAt(0).toUpperCase() + (activity.stage || '').slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status || '')}`}>
                          {(activity.status || '').charAt(0).toUpperCase() + (activity.status || '').slice(1).replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-700 dark:text-gray-300">
                            {assignedWorkflow ? assignedWorkflow.name : 'Not Assigned'}
                          </span>
                          {assignedWorkflow && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleWorkflowPreview(activity.workflowId)}
                              className="px-2 py-1 border-primary-300 text-primary-600 hover:bg-primary-50"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          {hasPermission('update') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(activity)}
                              className="border-primary-300 text-primary-600 hover:bg-primary-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {hasPermission('delete') && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(activity.id)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="p-4 bg-white hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredActivities.length)} of {filteredActivities.length} activities
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border-primary-300 text-primary-600 hover:bg-primary-50"
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? 'bg-primary-600 text-white' : 'border-primary-300 text-primary-600 hover:bg-primary-50'}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="border-primary-300 text-primary-600 hover:bg-primary-50"
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {filteredActivities.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full mb-4">
            <Activity className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm || statusFilter || typeFilter ? 'No activities found' : 'No activities yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm || statusFilter || typeFilter 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first activity to get started'
            }
          </p>
          {hasPermission('create') && !searchTerm && !statusFilter && !typeFilter && (
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Activity
            </Button>
          )}
        </div>
      )}

      {/* Workflow Preview Modal */}
      {showWorkflowPreview && selectedWorkflow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl h-3/4 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <GitBranch className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Workflow Preview: {selectedWorkflow.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedWorkflow.description}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setShowWorkflowPreview(false);
                  setSelectedWorkflow(null);
                }}
                className="border-primary-300 text-primary-600 hover:bg-primary-50"
              >
                Close
              </Button>
            </div>
            
            <div className="h-full border border-gray-200 dark:border-gray-600 rounded-lg">
              <ReactFlowProvider>
                <WorkflowBuilder
                  initialWorkflow={selectedWorkflow}
                  onSave={() => {}}
                  readOnly={true}
                />
              </ReactFlowProvider>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitiesDashboardPage;