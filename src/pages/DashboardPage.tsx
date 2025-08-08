import React, { useEffect } from 'react';
import { useAppSelector, usePermissions } from '../hooks/useRedux';
import { useGetTemplatesQuery, useDeleteTemplateMutation } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Plus, Edit, Eye, Mail, Smartphone, Globe, Calendar, Trash2 } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  
  const { data: templates = [], isLoading, error } = useGetTemplatesQuery();
  const [deleteTemplate] = useDeleteTemplateMutation();

  const handleDelete = async (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate(templateId).unwrap();
      } catch (error) {
        console.error('Failed to delete template:', error);
        alert('Failed to delete template. Please try again.');
      }
    }
  };


  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Email':
      return <Mail className="h-5 w-5 text-blue-500" />;
      case 'Push':
      case 'SMS':
      return <Smartphone className="h-5 w-5 text-green-500" />;
      default:
        return <Globe className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleTemplateClick = (template: any) => {
    navigate(`/templates/create?id=${template.id}`);
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
        <div className="text-red-500 mb-4">Failed to load templates</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
            Template Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your notification templates
          </p>
        </div>
        {hasPermission('create') && (
          <Button 
            onClick={() => navigate('/templates/create')}
            className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Template
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card 
            key={template.id} 
            className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer bg-white hover:bg-gradient-to-br hover:from-white hover:to-gray-50 border-l-4 border-l-primary-500"
            onClick={() => handleTemplateClick(template)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getTypeIcon(template.type)}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {template.messageName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {template.messageTypeId}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(template.status)}`}>
                {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Type:</span>
                <span className="text-gray-900 dark:text-white">{template.type}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Language:</span>
                <span className="text-gray-900 dark:text-white">{template.language}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Channel:</span>
                <span className="text-gray-900 dark:text-white">1</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                <span className="text-gray-900 dark:text-white flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(template.updatedAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mt-3">
                <span
                    key={template.channel}
                    className="px-2 py-1 bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-200 rounded-full text-xs"
                  >
                    {template.channel}
                  </span>
              </div>
            </div>

            <div className="flex space-x-2 mt-6" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/templates/view/${template.id}`)}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              {hasPermission('update') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTemplateClick(template)}
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
                  onClick={() => handleDelete(template.id)}
                  className="px-3"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No templates yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Create your first notification template to get started
          </p>
          {hasPermission('create') && (
            <Button 
              onClick={() => navigate('/templates/create')}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Template
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;