import React, { useEffect, useState } from 'react';
import { usePermissions } from '../hooks/useRedux';
import { useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import Dropdown from '../components/ui/Dropdown';
import { Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react';

const RbacUsersPage: React.FC = () => {
  const { hasPermission } = usePermissions();
  
  const { data: users = [], isLoading, error } = useGetUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'Viewer' as const,
    status: 'active' as const,
  });



  const roleOptions = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Editor', label: 'Editor' },
    { value: 'Viewer', label: 'Viewer' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        await updateUser({
          ...editingUser,
          ...formData,
        }).unwrap();
        setEditingUser(null);
      } else {
        await createUser(formData).unwrap();
      }
      
      setFormData({
        username: '',
        email: '',
        role: 'Viewer',
        status: 'active',
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('Failed to save user. Please try again.');
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId).unwrap();
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'active' ? (
      <UserCheck className="h-5 w-5 text-green-500" />
    ) : (
      <UserX className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Editor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Viewer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
        <div className="text-red-500 mb-4">Failed to load users</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage users and their access levels
          </p>
        </div>
        {hasPermission('create') && (
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add User
          </Button>
        )}
      </div>

      {showAddForm && (
        <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary-500">
          <h2 className="text-xl font-semibold text-primary-700 dark:text-white mb-4">
            {editingUser ? 'Edit User' : 'Add New User'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Username"
              value={formData.username}
              onChange={(value) => setFormData(prev => ({ ...prev, username: value }))}
              required
            />
            <InputField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
              required
            />
            <Dropdown
              label="Role"
              value={formData.role}
              onChange={(value) => setFormData(prev => ({ ...prev, role: value as any }))}
              options={roleOptions}
              required
            />
            <Dropdown
              label="Status"
              value={formData.status}
              onChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
              options={statusOptions}
              required
            />
            <div className="md:col-span-2 flex space-x-3">
              <Button 
                type="submit" 
                variant="primary"
                className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {editingUser ? 'Update User' : 'Add User'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-primary-300 text-primary-600 hover:bg-primary-50"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingUser(null);
                  setFormData({
                    username: '',
                    email: '',
                    role: 'Viewer',
                    status: 'active',
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Username
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Email
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Role
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Created
                </th>
                {(hasPermission('update') || hasPermission('delete')) && (
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-primary-50 dark:hover:bg-gray-800/50 transition-all duration-200"
                >
                  <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                    {user.username}
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {user.email}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(user.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  {(hasPermission('update') || hasPermission('delete')) && (
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        {hasPermission('update') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            className="border-primary-300 text-primary-600 hover:bg-primary-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {hasPermission('delete') && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                           disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default RbacUsersPage;