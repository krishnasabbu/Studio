import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { EmailTemplate } from '../store/slices/emailEditorSlice';
import { User, Role } from '../store/slices/authSlice';
import { TestResult } from '../store/slices/testsSlice';

const API_BASE_URL = 'http://localhost:3001';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
  }),
  tagTypes: ['Template', 'User', 'Role', 'Test', 'Onboard'],
  endpoints: (builder) => ({
    // Template endpoints
    getTemplates: builder.query<EmailTemplate[], void>({
      query: () => '/templates',
      providesTags: ['Template'],
    }),
    getTemplate: builder.query<EmailTemplate, string>({
      query: (id) => `/templates/${id}`,
      providesTags: ['Template'],
    }),
    createTemplate: builder.mutation<EmailTemplate, Partial<EmailTemplate>>({
      query: (template) => ({
        url: '/templates',
        method: 'POST',
        body: {
          ...template,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
      invalidatesTags: ['Template'],
    }),
    updateTemplate: builder.mutation<EmailTemplate, EmailTemplate>({
      query: (template) => ({
        url: `/templates/${template.id}`,
        method: 'PUT',
        body: {
          ...template,
          updatedAt: new Date().toISOString(),
        },
      }),
      invalidatesTags: ['Template'],
    }),
    deleteTemplate: builder.mutation<void, string>({
      query: (id) => ({
        url: `/templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Template'],
    }),

    // User endpoints
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: ['User'],
    }),
    createUser: builder.mutation<User, Partial<User>>({
      query: (user) => ({
        url: '/users',
        method: 'POST',
        body: {
          ...user,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        },
      }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation<User, User>({
      query: (user) => ({
        url: `/users/${user.id}`,
        method: 'PUT',
        body: user,
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // Role endpoints
    getRoles: builder.query<Role[], void>({
      query: () => '/roles',
      providesTags: ['Role'],
    }),
    createRole: builder.mutation<Role, Partial<Role>>({
      query: (role) => ({
        url: '/roles',
        method: 'POST',
        body: {
          ...role,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        },
      }),
      invalidatesTags: ['Role'],
    }),
    updateRole: builder.mutation<Role, Role>({
      query: (role) => ({
        url: `/roles/${role.id}`,
        method: 'PUT',
        body: role,
      }),
      invalidatesTags: ['Role'],
    }),
    deleteRole: builder.mutation<void, string>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Role'],
    }),

    // Test endpoints
    getTests: builder.query<TestResult[], void>({
      query: () => '/tests',
      providesTags: ['Test'],
    }),

    // Alert/Onboard endpoints
    getAlerts: builder.query<any[], void>({
      query: () => '/onboard',
      providesTags: ['Onboard'],
    }),
    getAlert: builder.query<any, string>({
      query: (id) => `/onboard/${id}`,
      providesTags: ['Onboard'],
    }),
    createAlert: builder.mutation<any, any>({
      query: (alertData) => ({
        url: '/onboard',
        method: 'POST',
        body: {
          ...alertData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        },
      }),
      invalidatesTags: ['Onboard'],
    }),
    updateAlert: builder.mutation<any, any>({
      query: (alertData) => ({
        url: `/onboard/${alertData.id}`,
        method: 'PUT',
        body: alertData,
      }),
      invalidatesTags: ['Onboard'],
    }),
    deleteAlert: builder.mutation<void, string>({
      query: (id) => ({
        url: `/onboard/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Onboard'],
    }),
    getJiraData: builder.query<any, string>({
      query: (jiraId) => `/jiraData?jiraId=${jiraId}`,
    }),

    // Product endpoints
    getProducts: builder.query<any[], void>({
      query: () => '/products',
      providesTags: ['Product'],
    }),

    // Test execution endpoints
    runTest: builder.mutation<any, any>({
      query: (testData) => ({
        url: '/testRuns',
        method: 'POST',
        body: {
          ...testData,
          id: Date.now().toString(),
          status: 'completed',
          result: 'success',
          executedAt: new Date().toISOString(),
        },
      }),
    }),

    importAlert: builder.mutation<any, any>({
      query: (alertData) => ({
        url: '/test/import',
        method: 'POST',
        body: alertData,
      }),
    }),

    // Test history endpoints
    getTestHistory: builder.query<any[], void>({
      query: () => '/testHistory',
      providesTags: ['TestHistory'],
    }),

    retryTest: builder.mutation<any, { id: string; testData: any }>({
      query: ({ id, testData }) => ({
        url: '/test/retry',
        method: 'POST',
        body: {
          originalTestId: id,
          ...testData,
          id: Date.now().toString(),
          run: `#${String(Date.now()).slice(-3)}`,
          status: Math.random() > 0.3 ? 'Passed' : 'Failed',
          lastRunDate: new Date().toISOString(),
          initiatedBy: 'current.user@company.com',
        },
      }),
      invalidatesTags: ['TestHistory'],
    }),

    // Workflow endpoints
    getWorkflows: builder.query<any[], void>({
      query: () => {
        // Use Spring Boot API
        const baseUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080/api';
        return {
          url: `${baseUrl}/workflows`,
          method: 'GET',
        };
      },
      providesTags: ['Workflow'],
    }),
    getWorkflow: builder.query<any, string>({
      query: (id) => {
        const baseUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080/api';
        return {
          url: `${baseUrl}/workflows/${id}`,
          method: 'GET',
        };
      },
      providesTags: ['Workflow'],
    }),
    createWorkflow: builder.mutation<any, any>({
      query: (workflow) => {
        const baseUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080/api';
        return {
          url: `${baseUrl}/workflows`,
          method: 'POST',
          body: workflow,
        };
      },
      invalidatesTags: ['Workflow'],
    }),
    updateWorkflow: builder.mutation<any, any>({
      query: (workflow) => {
        const baseUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080/api';
        return {
          url: `${baseUrl}/workflows/${workflow.id}`,
          method: 'PUT',
          body: workflow,
        };
      },
      invalidatesTags: ['Workflow'],
    }),
    deleteWorkflow: builder.mutation<void, string>({
      query: (id) => {
        const baseUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080/api';
        return {
          url: `${baseUrl}/workflows/${id}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['Workflow'],
    }),
    getActivities: builder.query<any[], string>({
      query: (workflowId) => workflowId === 'all' ? '/activities' : `/activities?workflowId=${workflowId}`,
      providesTags: ['Activity'],
    }),
    createActivity: builder.mutation<any, any>({
      query: (activity) => ({
        url: '/activities',
        method: 'POST',
        body: {
          ...activity,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        },
      }),
      invalidatesTags: ['Activity'],
    }),
    updateActivity: builder.mutation<any, any>({
      query: (activity) => ({
        url: `/activities/${activity.id}`,
        method: 'PUT',
        body: {
          ...activity,
          updatedAt: new Date().toISOString(),
        },
      }),
      invalidatesTags: ['Activity'],
    }),
    deleteActivity: builder.mutation<void, string>({
      query: (id) => ({
        url: `/activities/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Activity'],
    }),
    assignWorkflowToFunctionality: builder.mutation<any, { workflowId: string; functionalityId: string; functionalityType: string }>({
      query: ({ workflowId, functionalityId, functionalityType }) => ({
        url: '/workflow-assignments',
        method: 'POST',
        body: {
          workflowId,
          functionalityId,
          functionalityType,
          assignedAt: new Date().toISOString(),
        },
      }),
    }),
    executeWorkflow: builder.mutation<any, { workflowId: string; startFromStage?: string }>({
      query: ({ workflowId, startFromStage }) => ({
        url: '/workflows/execute',
        method: 'POST',
        body: {
          workflowId,
          startFromStage,
          executedBy: 'current.user@company.com',
          executedAt: new Date().toISOString(),
        },
      }),
      invalidatesTags: ['WorkflowExecution'],
    }),
    getWorkflowExecutions: builder.query<any[], string>({
      query: (workflowId) => `/workflowExecutions?workflowId=${workflowId}`,
      providesTags: ['WorkflowExecution'],
    }),
    getActivityTemplates: builder.query<any[], void>({
      query: () => '/activityTemplates',
      providesTags: ['ActivityTemplate'],
    }),

    // Task endpoints
    getTasks: builder.query<any[], void>({
      query: () => '/tasks',
      providesTags: ['Task'],
    }),
    getTask: builder.query<any, string>({
      query: (id) => `/tasks/${id}`,
      providesTags: ['Task'],
    }),
    createTask: builder.mutation<any, any>({
      query: (task) => ({
        url: '/tasks',
        method: 'POST',
        body: {
          ...task,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
      invalidatesTags: ['Task'],
    }),
    updateTask: builder.mutation<any, any>({
      query: (task) => ({
        url: `/tasks/${task.id}`,
        method: 'PUT',
        body: {
          ...task,
          updatedAt: new Date().toISOString(),
        },
      }),
      invalidatesTags: ['Task'],
    }),
    deleteTask: builder.mutation<void, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Task'],
    }),

    // Workflow instance endpoints
    getWorkflowInstances: builder.query<any[], void>({
      query: () => '/workflowInstances',
      providesTags: ['WorkflowInstance'],
    }),
    createWorkflowInstance: builder.mutation<any, any>({
      query: (instance) => ({
        url: '/workflowInstances',
        method: 'POST',
        body: {
          ...instance,
          id: Date.now().toString(),
          startedAt: new Date().toISOString(),
        },
      }),
      invalidatesTags: ['WorkflowInstance'],
    }),
    updateWorkflowInstance: builder.mutation<any, any>({
      query: (instance) => ({
        url: `/workflowInstances/${instance.id}`,
        method: 'PUT',
        body: instance,
      }),
      invalidatesTags: ['WorkflowInstance'],
    }),

    // Workflow actions
    approveWorkflowStep: builder.mutation<any, { instanceId: string; comments?: string }>({
      query: ({ instanceId, comments }) => ({
        url: `/workflowInstances/${instanceId}/approve`,
        method: 'POST',
        body: { comments, timestamp: new Date().toISOString() },
      }),
      invalidatesTags: ['WorkflowInstance'],
    }),
    rejectWorkflowStep: builder.mutation<any, { instanceId: string; comments?: string }>({
      query: ({ instanceId, comments }) => ({
        url: `/workflowInstances/${instanceId}/reject`,
        method: 'POST',
        body: { comments, timestamp: new Date().toISOString() },
      }),
      invalidatesTags: ['WorkflowInstance'],
    }),

    // Alert workflow endpoints
    getWorkflowMappings: builder.query<any[], void>({
      query: () => '/workflowMappings',
      providesTags: ['WorkflowMapping'],
    }),
    createWorkflowMapping: builder.mutation<any, any>({
      query: (mapping) => ({
        url: '/workflowMappings',
        method: 'POST',
        body: {
          ...mapping,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        },
      }),
      invalidatesTags: ['WorkflowMapping'],
    }),
    deleteWorkflowMapping: builder.mutation<void, string>({
      query: (id) => ({
        url: `/workflowMappings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WorkflowMapping'],
    }),

    // Alert execution endpoints
    getAlertExecutions: builder.query<any[], void>({
      query: () => '/alertExecutions',
      providesTags: ['AlertExecution'],
    }),
    createAlertExecution: builder.mutation<any, any>({
      query: (execution) => ({
        url: '/alertExecutions',
        method: 'POST',
        body: {
          ...execution,
          id: Date.now().toString(),
          startedAt: new Date().toISOString(),
        },
      }),
      invalidatesTags: ['AlertExecution'],
    }),
    approveAlertStep: builder.mutation<any, { executionId: string; stepId: string; comments?: string }>({
      query: ({ executionId, stepId, comments }) => ({
        url: `/alertExecutions/${executionId}/approve`,
        method: 'POST',
        body: { 
          stepId, 
          comments, 
          timestamp: new Date().toISOString(),
          approvedBy: 'current.user@company.com'
        },
      }),
      invalidatesTags: ['AlertExecution'],
    }),
    rejectAlertStep: builder.mutation<any, { executionId: string; stepId: string; comments?: string }>({
      query: ({ executionId, stepId, comments }) => ({
        url: `/alertExecutions/${executionId}/reject`,
        method: 'POST',
        body: { 
          stepId, 
          comments, 
          timestamp: new Date().toISOString(),
          rejectedBy: 'current.user@company.com'
        },
      }),
      invalidatesTags: ['AlertExecution'],
    }),
  }),
});

export const {
  useGetNodesQuery,
  useCreateNodeMutation,
  useGetTemplatesQuery,
  useGetTemplateQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetTestsQuery,
  useGetAlertsQuery,
  useGetAlertQuery,
  useCreateAlertMutation,
  useUpdateAlertMutation,
  useDeleteAlertMutation,
  useGetJiraDataQuery,
  useGetProductsQuery,
  useRunTestMutation,
  useImportAlertMutation,
  useGetTestHistoryQuery,
  useRetryTestMutation,
  useGetWorkflowsQuery,
  useGetWorkflowQuery,
  useCreateWorkflowMutation,
  useUpdateWorkflowMutation,
  useDeleteWorkflowMutation,
  useGetActivitiesQuery,
  useCreateActivityMutation,
  useUpdateActivityMutation,
  useDeleteActivityMutation,
  useAssignWorkflowToFunctionalityMutation,
  useExecuteWorkflowMutation,
  useGetWorkflowExecutionsQuery,
  useGetActivityTemplatesQuery,
  useGetTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetWorkflowInstancesQuery,
  useCreateWorkflowInstanceMutation,
  useUpdateWorkflowInstanceMutation,
  useApproveWorkflowStepMutation,
  useRejectWorkflowStepMutation,
  useGetWorkflowMappingsQuery,
  useCreateWorkflowMappingMutation,
  useDeleteWorkflowMappingMutation,
  useGetAlertExecutionsQuery,
  useCreateAlertExecutionMutation,
  useApproveAlertStepMutation,
  useRejectAlertStepMutation,
} = api;