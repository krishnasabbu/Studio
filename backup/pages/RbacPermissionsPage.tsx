import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { setRoles, updateRole } from '../store/slices/rbacSlice';
import Card from '../components/ui/Card';
import { Key, Check, X } from 'lucide-react';
import rolesData from '../data/roles.json';

const RbacPermissionsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { roles } = useAppSelector(state => state.rbac);
  const { permissions } = useAppSelector(state => state.auth);

  useEffect(() => {
    dispatch(setRoles(rolesData));
  }, [dispatch]);

  const hasPermission = (permission: string) => {
    return permissions.includes(permission as any);
  };

  const allPermissions = ['create', 'read', 'update', 'delete'];

  const togglePermission = (roleId: string, permission: string) => {
    if (!hasPermission('update')) return;
    
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    const updatedPermissions = role.permissions.includes(permission as any)
      ? role.permissions.filter(p => p !== permission)
      : [...role.permissions, permission as any];

    dispatch(updateRole({
      ...role,
      permissions: updatedPermissions,
      updatedAt: new Date().toISOString(),
    }));
  };

  const getPermissionIcon = (hasPermission: boolean) => {
    return hasPermission ? (
      <Check className="h-5 w-5 text-green-500" />
    ) : (
      <X className="h-5 w-5 text-red-500" />
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
            Permissions Matrix
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage role-based permissions across the system
          </p>
        </div>
      </div>

      <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary-500">
        <div className="flex items-center space-x-3 mb-6">
          <Key className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-semibold text-primary-700 dark:text-white">
            Role Permissions Matrix
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">
                  Role
                </th>
                {allPermissions.map((permission) => (
                  <th
                    key={permission}
                    className="text-center py-4 px-6 font-medium text-gray-900 dark:text-white"
                  >
                    {permission.charAt(0).toUpperCase() + permission.slice(1)}
                  </th>
                ))}
                <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr
                  key={role.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-primary-50 dark:hover:bg-gray-800/50 transition-all duration-200"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                          {role.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {role.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  {allPermissions.map((permission) => {
                    const hasRolePermission = role.permissions.includes(permission as any);
                    return (
                      <td key={permission} className="py-4 px-6 text-center">
                        <button
                          onClick={() => togglePermission(role.id, permission)}
                          disabled={!hasPermission('update')}
                          className={`p-2 rounded-lg transition-colors ${
                            hasRolePermission
                              ? 'bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/40'
                              : 'bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40'
                          } ${
                            !hasPermission('update') ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                          }`}
                        >
                          {getPermissionIcon(hasRolePermission)}
                        </button>
                      </td>
                    );
                  })}
                  <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                    {role.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <h3 className="font-medium text-primary-900 dark:text-primary-100 mb-2">
            Permission Definitions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-green-700 dark:text-green-300">Create:</span>
              <span className="text-primary-700 dark:text-primary-300 ml-2">
                Add new templates and resources
              </span>
            </div>
            <div>
              <span className="font-medium text-primary-700 dark:text-primary-300">Read:</span>
              <span className="text-primary-700 dark:text-primary-300 ml-2">
                View templates and reports
              </span>
            </div>
            <div>
              <span className="font-medium text-yellow-700 dark:text-yellow-300">Update:</span>
              <span className="text-primary-700 dark:text-primary-300 ml-2">
                Modify existing templates
              </span>
            </div>
            <div>
              <span className="font-medium text-red-700 dark:text-red-300">Delete:</span>
              <span className="text-primary-700 dark:text-primary-300 ml-2">
                Remove templates and data
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RbacPermissionsPage;