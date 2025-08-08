import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAlertsQuery, useDeleteAlertMutation } from '../services/api';
import { usePermissions } from '../hooks/useRedux';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Plus, Edit, Trash2, AlertTriangle, Calendar, FileText } from 'lucide-react';

const AlertsDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  
  const { data: alerts = [], isLoading, error } = useGetAlertsQuery();
  const [deleteAlert] = useDeleteAlertMutation();


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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alerts.map((alert) => (
          <Card 
            key={alert.id} 
            className="p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {alert.name || 'Unnamed Alert'}
                  </h3>
                  {alert.jiraId && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      JIRA: {alert.jiraId}
                    </p>
                  )}
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                {alert.status}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Templates:</span>
                <span className="text-gray-900 dark:text-white">
                  {alert.selectedTemplates?.length || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Features:</span>
                <span className="text-gray-900 dark:text-white">
                  {alert.selectedFeatures?.length || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Created:</span>
                <span className="text-gray-900 dark:text-white flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(alert.createdAt).toLocaleDateString()}
                </span>
              </div>

              {alert.fields && (
                <div className="mt-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Configuration:</div>
                  <div className="space-y-1">
                    {Object.entries(alert.fields).slice(0, 2).map(([key, value]) => (
                      <div key={key} className="text-xs text-gray-600 dark:text-gray-300">
                        {String(value)}
                      </div>
                    ))}
                    {Object.keys(alert.fields).length > 2 && (
                      <div className="text-xs text-gray-400">
                        +{Object.keys(alert.fields).length - 2} more fields
                      </div>
                    )}
                  </div>
                </div>
              )}

              {alert.selectedFeatures && alert.selectedFeatures.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {alert.selectedFeatures.slice(0, 2).map((feature: string) => (
                    <span
                      key={feature}
                      className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs"
                    >
                      {feature}
                    </span>
                  ))}
                  {alert.selectedFeatures.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-full text-xs">
                      +{alert.selectedFeatures.length - 2} more
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex space-x-2 mt-6">
              {hasPermission('update') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(alert.id)}
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
                  onClick={() => handleDelete(alert.id)}
                  className="px-3"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {alerts.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
            <AlertTriangle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No alerts configured yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Create your first alert configuration to get started
          </p>
          {hasPermission('create') && (
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