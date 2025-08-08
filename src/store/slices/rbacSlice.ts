import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserRole, Permission } from './authSlice';

export interface Role {
  id: string;
  name: UserRole;
  description: string;
  permissions: Permission[];
  createdAt: string;
}

export interface RolePermission {
  roleId: string;
  permission: Permission;
  granted: boolean;
}

interface RbacState {
  users: User[];
  roles: Role[];
  loading: boolean;
  error: string | null;
}

const initialState: RbacState = {
  users: [],
  roles: [],
  loading: false,
  error: null,
};

const rbacSlice = createSlice({
  name: 'rbac',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(u => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    deleteUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(u => u.id !== action.payload);
    },
    setRoles: (state, action: PayloadAction<Role[]>) => {
      state.roles = action.payload;
    },
    addRole: (state, action: PayloadAction<Role>) => {
      state.roles.push(action.payload);
    },
    updateRole: (state, action: PayloadAction<Role>) => {
      const index = state.roles.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.roles[index] = action.payload;
      }
    },
    deleteRole: (state, action: PayloadAction<string>) => {
      state.roles = state.roles.filter(r => r.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setUsers,
  addUser,
  updateUser,
  deleteUser,
  setRoles,
  addRole,
  updateRole,
  deleteRole,
  setLoading,
  setError,
} = rbacSlice.actions;

export default rbacSlice.reducer;