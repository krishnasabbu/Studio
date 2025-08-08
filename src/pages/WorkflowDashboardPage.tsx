import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetWorkflowsQuery, useDeleteWorkflowMutation, useGetWorkflowInstancesQuery, useGetTasksQuery } from '../services/api';
import { usePermissions } from '../hooks/useRedux';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Plus, Edit, Trash2, Play, GitBranch, Calendar, User, Eye, Activity, CheckCircle, Clock, XCircle, Search, Filter, Grid, List } from 'lucide-react';

const WorkflowDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  
  const { data: workflows = [], isLoading, error } = useGetWorkflowsQuery();
  const [deleteWorkflow] = useDeleteWorkflowMutation();
  const { data: workflowInstances = [] } = useGetWorkflowInstancesQuery();
  const { data: tasks = [] } = useGetTasksQuery();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const handleDelete = async (workflowId: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      try {
        await deleteWorkflow(workflowId).unwrap();
      } catch (error) {
        console.error('Failed to delete workflow:', error);
        alert('Failed to delete workflow. Please try again.');
      }
    }
  };

  const handleEdit = (workflowId: string) => {
    navigate(`/workflows/create?id=${workflowId}`);
  };

  const handleExecute = (workflowId: string) => {
    navigate(`/workflows/execute/${workflowId}`);
  };

  const handleView = (workflowId: string) => {
    navigate(`/workflows/view/${workflowId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Filter and search logic
  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || workflow.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredWorkflows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedWorkflows = filteredWorkflows.slice(startIndex, startIndex + itemsPerPage);

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
        <div className="text-red-500 mb-4">Failed to load workflows</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
            Workflow Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage workflows, view execution status, and map tasks to workflows
          </p>
        </div>
        {hasPermission('create') && (
          <Button 
            onClick={() => navigate('/workflows/create')}
            className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Workflow
          </Button>
        )}
      </div>

      {/* Workflow Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Workflows</p>
              <p className="text-2xl font-bold text-primary-700 dark:text-white">{workflows.length}</p>
            </div>
            <GitBranch className="h-8 w-8 text-primary-500" />
          </div>
        </Card>
        
        <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-accent-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Instances</p>
              <p className="text-2xl font-bold text-accent-700 dark:text-accent-300">
                {workflowInstances.filter(i => i.status === 'running').length}
              </p>
            </div>
            <Activity className="h-8 w-8 text-accent-500" />
          </div>
        </Card>
        
        <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {workflowInstances.filter(i => i.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Linked Tasks</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {tasks.filter(t => t.assignedWorkflow).length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Active Workflow Instances */}
      {workflowInstances.filter(i => i.status === 'running').length > 0 && (
        <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-yellow-500">
          <h3 className="text-lg font-semibold text-primary-700 dark:text-white mb-4">
            Active Workflow Instances
          </h3>
          <div className="space-y-3">
            {workflowInstances
              .filter(i => i.status === 'running')
              .slice(0, 3)
              .map((instance) => {
                const workflow = workflows.find(w => w.id === instance.workflowId);
                const task = tasks.find(t => t.id === instance.taskId);
                return (
                  <div key={instance.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-yellow-500 animate-spin" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {workflow?.name || 'Unknown Workflow'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Task: {task?.title || 'Unknown Task'} | Stage: {instance.currentStage}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/workflows/execute/${instance.workflowId}`)}
                      className="border-primary-300 text-primary-600 hover:bg-primary-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                );
              })}
          </div>
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
                placeholder="Search workflows..."
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
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive</option>
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
          {paginatedWorkflows.map((workflow) => (
            <Card 
              key={workflow.id} 
              className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer bg-white hover:bg-gradient-to-br hover:from-white hover:to-gray-50 border-l-4 border-l-primary-500"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <GitBranch className="h-6 w-6 text-primary-500" />
                  <div>
                    <h3 className="font-semibold text-primary-700 dark:text-white">
                      {workflow.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      v{workflow.version}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                  {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {workflow.description}
                </p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Stages:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {workflow.stages?.length || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Activities:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {workflow.stages?.reduce((total: number, stage: any) => total + (stage.activities?.length || 0), 0) || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Linked Tasks:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {tasks.filter(t => t.assignedWorkflow === workflow.id).length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Created:</span>
                  <span className="text-gray-900 dark:text-white flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(workflow.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Created By:</span>
                  <span className="text-gray-900 dark:text-white flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {workflow.createdBy.split('@')[0]}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2 mt-6" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleView(workflow.id)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                
                {hasPermission('update') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(workflow.id)}
                    className="flex-1 border-primary-300 text-primary-600 hover:bg-primary-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleExecute(workflow.id)}
                  className="flex-1 bg-accent-600 hover:bg-accent-700 text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Execute
                </Button>
                
                {hasPermission('delete') && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(workflow.id)}
                    className="px-3"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Workflow Name
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Version
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Stages
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Activities
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Created By
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
                {paginatedWorkflows.map((workflow) => (
                  <tr
                    key={workflow.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-primary-50 dark:hover:bg-gray-800/50 transition-all duration-200"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                      {workflow.name}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      v{workflow.version}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                        {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {workflow.stages?.length || 0}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {workflow.stages?.reduce((total: number, stage: any) => total + (stage.activities?.length || 0), 0) || 0}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {workflow.createdBy.split('@')[0]}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {new Date(workflow.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(workflow.id)}
                          className="border-primary-300 text-primary-600 hover:bg-primary-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {hasPermission('update') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(workflow.id)}
                            className="border-primary-300 text-primary-600 hover:bg-primary-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleExecute(workflow.id)}
                          className="bg-accent-600 hover:bg-accent-700 text-white"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        
                        {hasPermission('delete') && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(workflow.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredWorkflows.length)} of {filteredWorkflows.length} workflows
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

      {filteredWorkflows.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full mb-4">
            <GitBranch className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm || statusFilter ? 'No workflows found' : 'No workflows yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm || statusFilter 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first dynamic workflow to automate your processes'
            }
          </p>
          {hasPermission('create') && !searchTerm && !statusFilter && (
            <Button 
              onClick={() => navigate('/workflows/create')}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Workflow
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkflowDashboardPage;