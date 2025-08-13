import axios from 'axios';
import {
  Workflow,
  WorkflowNode,
  Role,
  Stage,
  Activity,
  WorkflowMapping,
  WorkflowInstance,
  ExecutionLog,
  PendingApproval,
  ApprovalAction
} from '../types/workflow';

// The base URL is now aligned with the Spring Boot server running on port 8080.
// We also prepend the /api path segment as defined in your OpenAPI spec.
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const workflowApi = {
  // Node management - These APIs are not in the provided spec, so we will keep them as is
  // and assume they will be implemented on the backend later.
  getNodes: async (): Promise<WorkflowNode[]> => {
    const response = await api.get('/nodes');
    return response.data;
  },

  // Role management - These APIs are not in the provided spec.
  getRoles: async (): Promise<Role[]> => {
    const response = await api.get('/roles');
    return response.data;
  },

  // Stage management - These APIs are not in the provided spec.
  getStages: async (): Promise<Stage[]> => {
    const response = await api.get('/stages');
    return response.data;
  },

  // Activity management - These APIs are not in the provided spec.
  getActivities: async (stageId?: string): Promise<Activity[]> => {
    const response = await api.get('/activities', {
      params: stageId ? { stageId } : {},
    });
    return response.data;
  },

  // Workflow management
  getWorkflows: async (): Promise<Workflow[]> => {
    const response = await api.get('/workflows');
    // The OpenAPI spec shows a single Workflow, but a 'get all'
    // endpoint should return an array. We'll handle this assumption.
    if (Array.isArray(response.data)) {
        return response.data;
    }
    return [response.data];
  },

  getWorkflowById: async (id: string): Promise<Workflow> => {
    const response = await api.get(`/workflows/${id}`);
    return response.data;
  },

  createWorkflow: async (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const response = await api.post('/workflows', workflow);
    // As per the OpenAPI spec, the POST request returns the new workflow's ID as a string.
    return response.data;
  },

  updateWorkflow: async (id: string, workflow: Partial<Workflow>): Promise<string> => {
    const response = await api.put(`/workflows/${id}`, workflow);
    // As per the OpenAPI spec, the PUT request returns a string message.
    return response.data;
  },

  deleteWorkflow: async (id: string): Promise<void> => {
    // The spec indicates a string is returned, but the action doesn't require it.
    await api.delete(`/workflows/${id}`);
  },

  // Workflow mapping - These APIs are not in the provided spec.
  getMappings: async (): Promise<WorkflowMapping[]> => {
    const response = await api.get('/mappings');
    return response.data;
  },

  createMapping: async (mapping: Omit<WorkflowMapping, 'id' | 'createdAt'>): Promise<WorkflowMapping> => {
    const response = await api.post('/mappings', mapping);
    return response.data;
  },

  deleteMapping: async (id: string): Promise<void> => {
    await api.delete(`/mappings/${id}`);
  },

  // Workflow execution - These APIs are not in the provided spec.
  startWorkflow: async (workflowId: string, itemId: string): Promise<WorkflowInstance> => {
    const response = await api.post(`/workflows/${workflowId}/start`, null, {
      params: { itemId },
    });
    return response.data;
  },

  getWorkflowInstances: async (): Promise<WorkflowInstance[]> => {
    const response = await api.get('/workflowInstances');
    return response.data;
  },

  getWorkflowInstanceStatus: async (instanceId: string): Promise<WorkflowInstance> => {
    const response = await api.get(`/workflowInstances/${instanceId}/status`);
    return response.data;
  },

  getWorkflowInstanceLogs: async (instanceId: string): Promise<ExecutionLog[]> => {
    const response = await api.get(`/workflowInstances/${instanceId}/logs`);
    return response.data;
  },

  // Approval management - These APIs are not in the provided spec.
  getPendingApprovals: async (): Promise<PendingApproval[]> => {
    const response = await api.get('/pendingApprovals');
    return response.data;
  },

  submitApproval: async (approval: ApprovalAction): Promise<void> => {
    await api.post('/approvals', approval);
  },
};