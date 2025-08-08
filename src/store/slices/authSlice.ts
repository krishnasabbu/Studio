/* eslint-disable no-case-declarations */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'Admin' | 'Editor' | 'Viewer';
export type Permission = 'create' | 'read' | 'update' | 'delete';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  permissions: Permission[];
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  permissions: [],
};

const getRolePermissions = (role: UserRole): Permission[] => {
  console.log('🔐 Getting permissions for role:', role);
  switch (role) {
    case 'Admin':
      const adminPerms = ['create', 'read', 'update', 'delete'] as Permission[];
      console.log('✅ Admin permissions assigned:', adminPerms);
      return adminPerms;
    case 'Editor':
      const editorPerms = ['create', 'read', 'update'] as Permission[];
      console.log('✅ Editor permissions assigned:', editorPerms);
      return editorPerms;
    case 'Viewer':
      const viewerPerms = ['read'] as Permission[];
      console.log('✅ Viewer permissions assigned:', viewerPerms);
      return viewerPerms;
    default:
      console.log('⚠️ Unknown role, defaulting to read-only');
      return ['read'] as Permission[];
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      console.log('🔑 Login action triggered for user:', action.payload);
      state.isAuthenticated = true;
      state.user = action.payload;
      state.permissions = getRolePermissions(action.payload.role);
      console.log('🎯 Final auth state:', {
        user: state.user?.username,
        role: state.user?.role,
        permissions: state.permissions
      });
    },
    logout: (state) => {
      console.log('🚪 User logged out');
      state.isAuthenticated = false;
      state.user = null;
      state.permissions = [];
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;