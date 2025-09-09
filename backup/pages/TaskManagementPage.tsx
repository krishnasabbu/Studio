import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetWorkflowsQuery } from '../services/api'; // Keep this if still using RTK for workflows
import { usePermissions } from '../hooks/useRedux';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Plus, Edit, Trash2, FileText, Calendar, User, Eye, Search, Filter, Grid, List } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  releaseNumber: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedWorkflow: string;
  createdBy: string;
  createdAt: string;
}

const TaskManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  // Replace RTK Query with local state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Keep using RTK Query for workflows (or update similarly if needed)
  const { data: workflows = [] } = useGetWorkflowsQuery();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Fetch tasks from third-party API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('http://localhost:8080/api/tasks', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add auth token if required, e.g.:
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch tasks: ${response.status}`);
        }

        const data: Task[] = await response.json();
        setTasks(data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError((err as Error).message || 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Delete task (assuming backend supports DELETE)
  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`http://localhost:8080/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      // Update local state
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      alert('Task deleted successfully!');
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const handleEdit = (taskId: string) => {
    navigate(`/tasks/create?id=${taskId}`);
  };

  const handleView = (taskId: string) => {
    navigate(`/tasks/view/${taskId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getWorkflowName = (workflowId: string) => {
    const workflow = workflows.find((w) => w.id === workflowId);
    return workflow?.name || 'No Workflow';
  };

  // Filter and search logic
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.releaseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + itemsPerPage);

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
        <div className="text-red-500 mb-4">Failed to load tasks: {error}</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const TaskCard = ({ task }: { task: Task }) => (
    <Card
      className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer bg-white hover:bg-gradient-to-br hover:from-white hover:to-gray-50 border-l-4 border-l-primary-500"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-primary-500" />
          <div>
            <h3 className="font-semibold text-primary-700 dark:text-white">{task.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{task.releaseNumber}</p>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
        >
          {task.status.replace('_', ' ').charAt(0).toUpperCase() +
            task.status.replace('_', ' ').slice(1)}
        </span>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Workflow:</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {getWorkflowName(task.assignedWorkflow)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Created:</span>
          <span className="text-gray-900 dark:text-white flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {new Date(task.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Created By:</span>
          <span className="text-gray-900 dark:text-white flex items-center">
            <User className="h-4 w-4 mr-1" />
            {task.createdBy.split('@')[0]}
          </span>
        </div>
      </div>

      <div className="flex space-x-2 mt-6" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleView(task.id)}
          className="flex-1"
        >
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>

        {hasPermission('update') && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(task.id)}
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
            onClick={() => handleDelete(task.id)}
            className="px-3"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );

  const TaskTable = () => (
    <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                Release Number
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                Title
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                Status
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                Workflow
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                Created By
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                Created Date
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedTasks.map((task) => (
              <tr
                key={task.id}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-primary-50 dark:hover:bg-gray-800/50 transition-all duration-200"
              >
                <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                  {task.releaseNumber}
                </td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{task.title}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status.replace('_', ' ').charAt(0).toUpperCase() +
                      task.status.replace('_', ' ').slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                  {getWorkflowName(task.assignedWorkflow)}
                </td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                  {task.createdBy.split('@')[0]}
                </td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                  {new Date(task.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(task.id)}
                      className="border-primary-300 text-primary-600 hover:bg-primary-50"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {hasPermission('update') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(task.id)}
                        className="border-primary-300 text-primary-600 hover:bg-primary-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {hasPermission('delete') && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(task.id)}
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
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
            Task Management Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage SQL release updates and operational tasks
          </p>
        </div>
        {hasPermission('create') && (
          <Button
            onClick={() => navigate('/tasks/create')}
            className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Task
          </Button>
        )}
      </div>

      {/* Search and Filter Bar */}
      <Card className="p-4 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-accent-500">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
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
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'card' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('card')}
              className={
                viewMode === 'card'
                  ? 'bg-primary-600 text-white'
                  : 'border-primary-300 text-primary-600 hover:bg-primary-50'
              }
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
              className={
                viewMode === 'table'
                  ? 'bg-primary-600 text-white'
                  : 'border-primary-300 text-primary-600 hover:bg-primary-50'
              }
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Content */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <TaskTable />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="p-4 bg-white hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTasks.length)} of{' '}
              {filteredTasks.length} tasks
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border-primary-300 text-primary-600 hover:bg-primary-50"
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={
                    currentPage === page
                      ? 'bg-primary-600 text-white'
                      : 'border-primary-300 text-primary-600 hover:bg-primary-50'
                  }
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="border-primary-300 text-primary-600 hover:bg-primary-50"
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full mb-4">
            <FileText className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm || statusFilter ? 'No tasks found' : 'No tasks yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm || statusFilter
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first task to get started'}
          </p>
          {hasPermission('create') && !searchTerm && !statusFilter && (
            <Button
              onClick={() => navigate('/tasks/create')}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Task
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskManagementPage;