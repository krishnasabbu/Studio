import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflowStore } from '../store/workflowStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  GitBranch, 
  Calendar, 
  User, 
  Eye,
  Search,
  Filter,
  Grid,
  List
} from 'lucide-react';

const WorkflowListPage: React.FC = () => {
  const navigate = useNavigate();
  
  const {
    workflows,
    isLoading,
    error,
    fetchWorkflows,
    deleteWorkflow,
  } = useWorkflowStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchWorkflows();
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

  const handleExecute = async (workflowId: string) => {
    // Navigate to execution page for demo purposes
    navigate(`/workflows/execution/${workflowId}`);
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
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => fetchWorkflows()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
            Workflow Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create, manage, and execute your workflows
          </p>
        </div>
        <Button 
          onClick={() => navigate('/workflows/builder')}
          className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Workflow
        </Button>
      </div>

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
              className="p-6 hover:shadow-xl transition-all duration-300 bg-white hover:bg-gradient-to-br hover:from-white hover:to-gray-50 border-l-4 border-l-primary-500"
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
                  <span className="text-gray-500 dark:text-gray-400">Nodes:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {workflow.nodes?.length || 0}
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

              <div className="flex space-x-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/workflows/preview/${workflow.id}`)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/workflows/builder/${workflow.id}`)}
                  className="flex-1 border-primary-300 text-primary-600 hover:bg-primary-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleExecute(workflow.id)}
                  className="flex-1 bg-accent-600 hover:bg-accent-700 text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Execute
                </Button>
                
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(workflow.id)}
                  className="px-3"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
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
                    Nodes
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
                      {workflow.nodes?.length || 0}
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
                          onClick={() => navigate(`/workflows/preview/${workflow.id}`)}
                          className="border-primary-300 text-primary-600 hover:bg-primary-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/workflows/builder/${workflow.id}`)}
                          className="border-primary-300 text-primary-600 hover:bg-primary-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleExecute(workflow.id)}
                          className="bg-accent-600 hover:bg-accent-700 text-white"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(workflow.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

      {/* Empty State */}
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
              : 'Create your first workflow to automate your processes'
            }
          </p>
          {!searchTerm && !statusFilter && (
            <Button 
              onClick={() => navigate('/workflows/builder')}
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

export default WorkflowListPage;