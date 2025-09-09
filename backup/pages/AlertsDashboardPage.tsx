import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAlertsQuery, useDeleteAlertMutation } from '../services/api';
import { usePermissions } from '../hooks/useRedux';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Plus, Edit, Trash2, AlertTriangle, Calendar, FileText, Search, Filter, Grid, List, Eye } from 'lucide-react';

const AlertsDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  
  const { data: alerts = [], isLoading, error } = useGetAlertsQuery();
  const [deleteAlert] = useDeleteAlertMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const handleDelete = async (alertId: string) => {
    if (confirm('Are you sure you want to delete this alert?')) {
      try {
        await deleteAlert(alertId).unwrap();
      } catch (error) {
        console.error('Failed to delete alert:', error);
        alert('Failed to delete alert. Please try again.');
      }
    }
  };

  const handleEdit = (alertId: string) => {
    navigate(`/alert-onboard?id=${alertId}`);
  };

  const handleView = (alertId: string) => {
    navigate(`/alert-onboard/view/${alertId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Filter and search logic
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = (alert.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (alert.jiraId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || alert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAlerts = filteredAlerts.slice(startIndex, startIndex + itemsPerPage);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Failed to load alerts</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Alerts Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your alert configurations and onboarding
          </p>
        </div>
        {hasPermission('create') && (
          <Button onClick={() => navigate('/alert-onboard')} className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
            <Plus className="h-5 w-5 mr-2" />
            New Alert Onboard
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
                placeholder="Search alerts..."
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
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {paginatedAlerts.map((alert) => (
            <Card 
              key={alert.id} 
              className="p-3 hover:shadow-xl transition-all duration-300 bg-white hover:bg-gradient-to-br hover:from-white hover:to-gray-50 border-l-4 border-l-primary-500"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-xs truncate">
                      {alert.name || 'Unnamed Alert'}
                    </h3>
                    {alert.jiraId && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {alert.jiraId}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                  {alert.status}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Templates:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {alert.selectedTemplates?.length || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Features:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {alert.selectedFeatures?.length || 0}
                  </span>
                </div>
              </div>

              <div className="flex space-x-1 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleView(alert.id)}
                  className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50 text-xs py-1 px-2"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                {hasPermission('update') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(alert.id)}
                    className="flex-1 border-primary-300 text-primary-600 hover:bg-primary-50 text-xs py-1 px-2"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                )}
                {hasPermission('delete') && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(alert.id)}
                    className="px-2 py-1"
                  >
                    <Trash2 className="h-3 w-3" />
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
                    Alert Name
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    JIRA ID
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Templates
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Features
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
                {paginatedAlerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-primary-50 dark:hover:bg-gray-800/50 transition-all duration-200"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                      {alert.name || 'Unnamed Alert'}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {alert.jiraId || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                        {alert.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {alert.selectedTemplates?.length || 0}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {alert.selectedFeatures?.length || 0}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(alert.id)}
                          className="border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {hasPermission('update') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(alert.id)}
                            className="border-primary-300 text-primary-600 hover:bg-primary-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {hasPermission('delete') && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(alert.id)}
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
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAlerts.length)} of {filteredAlerts.length} alerts
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

      {filteredAlerts.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
            <AlertTriangle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm || statusFilter ? 'No alerts found' : 'No alerts configured yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm || statusFilter 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first alert configuration to get started'
            }
          </p>
          {hasPermission('create') && !searchTerm && !statusFilter && (
            <Button onClick={() => navigate('/alert-onboard')}>
              <Plus className="h-5 w-5 mr-2" />
              New Alert Onboard
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default AlertsDashboardPage;