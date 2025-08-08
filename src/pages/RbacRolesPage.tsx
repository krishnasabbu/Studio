import React, { useEffect, useState } from 'react';
import { usePermissions } from '../hooks/useRedux';
import { useGetRolesQuery, useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import MultiSelect from '../components/ui/MultiSelect';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';

const RbacRolesPage: React.FC = () => {
  const { hasPermission } = usePermissions();
  
  const { data: roles = [], isLoading, error } = useGetRolesQuery();
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });



  const permissionOptions = [
    { value: 'create', label: 'Create' },
    { value: 'read', label: 'Read' },
    { value: 'update', label: 'Update' },
    { value: 'delete', label: 'Delete' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingRole) {
        await updateRole({
          ...editingRole,
          ...formData,
          name: formData.name as any,
        }).unwrap();
        setEditingRole(null);
      } else {
        await createRole({
          ...formData,
          name: formData.name as any,
        }).unwrap();
      }
      
      setFormData({
        name: '',
        description: '',
        permissions: [],
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to save role:', error);
      alert('Failed to save role. Please try again.');
    }
  };

  const handleEdit = (role: any) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (roleId: string) => {
    if (confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteRole(roleId).unwrap();
      } catch (error) {
        console.error('Failed to delete role:', error);
        alert('Failed to delete role. Please try again.');
      }
    }
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'create':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'read':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'update':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'delete':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
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
        <div className="text-red-500 mb-4">Failed to load roles</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
            Role Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Define roles and their permissions
          </p>
        </div>
        {hasPermission('create') && (
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Role
          </Button>
        )}
      </div>

      {showAddForm && (
        <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary-500">
          <h2 className="text-xl font-semibold text-primary-700 dark:text-white mb-4">
            {editingRole ? 'Edit Role' : 'Add New Role'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Role Name"
              value={formData.name}
              onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
              required
            />
            <InputField
              label="Description"
              value={formData.description}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              required
            />
            <MultiSelect
              label="Permissions"
              value={formData.permissions}
              onChange={(value) => setFormData(prev => ({ ...prev, permissions: value }))}
              options={permissionOptions}
              required
            />
            <div className="flex space-x-3">
              <Button 
                type="submit" 
                variant="primary"
                className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {editingRole ? 'Update Role' : 'Add Role'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-primary-300 text-primary-600 hover:bg-primary-50"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingRole(null);
                  setFormData({
                    name: '',
                    description: '',
                    permissions: [],
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <Card key={role.id} className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-accent-500">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-primary-500" />
                <div>
                  <h3 className="font-semibold text-primary-700 dark:text-white">
                    {role.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {role.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Permissions:</span>
                <div className="flex flex-wrap gap-1 mt-2">
                  {role.permissions.map((permission) => (
                    <span
                      key={permission}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getPermissionColor(permission)}`}
                    >
                      {permission.charAt(0).toUpperCase() + permission.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Created: {new Date(role.createdAt).toLocaleDateString()}
              </div>
            </div>

            {(hasPermission('update') || hasPermission('delete')) && (
              <div className="flex space-x-2 mt-6">
                {hasPermission('update') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(role)}
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
                    onClick={() => handleDelete(role.id)}
                   disabled={isDeleting}
                    className="px-3"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RbacRolesPage;