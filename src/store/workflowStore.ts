import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  Workflow, 
  WorkflowNode, 
  WorkflowEdge, 
  Role, 
  Stage, 
  Activity, 
  WorkflowMapping, 
  WorkflowInstance, 
  ExecutionLog, 
  PendingApproval 
} from '../types/workflow';
import { workflowApi } from '../services/workflowApi';

interface WorkflowState {
  // Data
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  nodes: WorkflowNode[];
  roles: Role[];
  stages: Stage[];
  activities: Activity[];
  mappings: WorkflowMapping[];
  workflowInstances: WorkflowInstance[];
  pendingApprovals: PendingApproval[];
  executionLogs: ExecutionLog[];

  // UI State
  isLoading: boolean;
  error: string | null;
  selectedNodeId: string | null;
  showNodeConfig: boolean;
  showActivityConfig: boolean;
  selectedStageId: string | null;

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Node actions
  fetchNodes: () => Promise<void>;
  selectNode: (nodeId: string | null) => void;
  setShowNodeConfig: (show: boolean) => void;
  
  // Role actions
  fetchRoles: () => Promise<void>;
  
  // Stage actions
  fetchStages: () => Promise<void>;
  fetchActivities: (stageId?: string) => Promise<void>;
  setShowActivityConfig: (show: boolean) => void;
  setSelectedStageId: (stageId: string | null) => void;
  
  // Workflow actions
  fetchWorkflows: () => Promise<void>;
  createWorkflow: (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateWorkflow: (id: string, workflow: Partial<Workflow>) => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  
  // Mapping actions
  fetchMappings: () => Promise<void>;
  createMapping: (mapping: Omit<WorkflowMapping, 'id' | 'createdAt'>) => Promise<void>;
  deleteMapping: (id: string) => Promise<void>;
  
  // Execution actions
  startWorkflow: (workflowId: string, itemId: string) => Promise<void>;
  fetchWorkflowInstances: () => Promise<void>;
  fetchExecutionLogs: (instanceId: string) => Promise<void>;
  
  // Approval actions
  fetchPendingApprovals: () => Promise<void>;
  submitApproval: (approval: { approvalId: string; action: 'approve' | 'reject'; reason?: string }) => Promise<void>;
  
  // Utility actions
  loadDefaultWorkflow: () => void;
  resetStore: () => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  devtools(
    (set, get) => ({
      // Initial state
      workflows: [],
      currentWorkflow: null,
      nodes: [],
      roles: [],
      stages: [],
      activities: [],
      mappings: [],
      workflowInstances: [],
      pendingApprovals: [],
      executionLogs: [],
      isLoading: false,
      error: null,
      selectedNodeId: null,
      showNodeConfig: false,
      showActivityConfig: false,
      selectedStageId: null,

      // Basic actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Node actions
      fetchNodes: async () => {
        try {
          set({ isLoading: true, error: null });
          const nodes = await workflowApi.getNodes();
          set({ nodes });
        } catch (error) {
          set({ error: 'Failed to fetch nodes' });
          console.error('Error fetching nodes:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
      setShowNodeConfig: (show) => set({ showNodeConfig: show }),

      // Role actions
      fetchRoles: async () => {
        try {
          set({ isLoading: true, error: null });
          const roles = await workflowApi.getRoles();
          set({ roles });
        } catch (error) {
          set({ error: 'Failed to fetch roles' });
          console.error('Error fetching roles:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      // Stage actions
      fetchStages: async () => {
        try {
          set({ isLoading: true, error: null });
          const stages = await workflowApi.getStages();
          set({ stages });
        } catch (error) {
          set({ error: 'Failed to fetch stages' });
          console.error('Error fetching stages:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchActivities: async (stageId) => {
        try {
          set({ isLoading: true, error: null });
          const activities = await workflowApi.getActivities(stageId);
          set({ activities });
        } catch (error) {
          set({ error: 'Failed to fetch activities' });
          console.error('Error fetching activities:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      setShowActivityConfig: (show) => set({ showActivityConfig: show }),
      setSelectedStageId: (stageId) => set({ selectedStageId: stageId }),

      // Workflow actions
      fetchWorkflows: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080/api'}/workflows`);
          const workflows = await response.json();
          set({ workflows });
        } catch (error) {
          set({ error: 'Failed to fetch workflows' });
          console.error('Error fetching workflows:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      createWorkflow: async (workflow) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080/api'}/workflows`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workflow),
          });
          const workflowId = await response.text();
          const newWorkflow = { ...workflow, id: workflowId };
          set((state) => ({ 
            workflows: [...state.workflows, newWorkflow],
            currentWorkflow: newWorkflow 
          }));
        } catch (error) {
          set({ error: 'Failed to create workflow' });
          console.error('Error creating workflow:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateWorkflow: async (id, workflow) => {
        try {
          set({ isLoading: true, error: null });
          await fetch(`${import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080/api'}/workflows/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workflow),
          });
          const updatedWorkflow = { ...workflow, id };
          set((state) => ({
            workflows: state.workflows.map(w => w.id === id ? updatedWorkflow : w),
            currentWorkflow: state.currentWorkflow?.id === id ? updatedWorkflow : state.currentWorkflow
          }));
          return updatedWorkflow;
        } catch (error) {
          set({ error: 'Failed to update workflow' });
          console.error('Error updating workflow:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteWorkflow: async (id) => {
        try {
          set({ isLoading: true, error: null });
          await fetch(`${import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080/api'}/workflows/${id}`, {
            method: 'DELETE',
          });
          set((state) => ({
            workflows: state.workflows.filter(w => w.id !== id),
            currentWorkflow: state.currentWorkflow?.id === id ? null : state.currentWorkflow
          }));
        } catch (error) {
          set({ error: 'Failed to delete workflow' });
          console.error('Error deleting workflow:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow }),

      // Mapping actions
      fetchMappings: async () => {
        try {
          set({ isLoading: true, error: null });
          const mappings = await workflowApi.getMappings();
          set({ mappings });
        } catch (error) {
          set({ error: 'Failed to fetch mappings' });
          console.error('Error fetching mappings:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      createMapping: async (mapping) => {
        try {
          set({ isLoading: true, error: null });
          const newMapping = await workflowApi.createMapping(mapping);
          set((state) => ({ mappings: [...state.mappings, newMapping] }));
        } catch (error) {
          set({ error: 'Failed to create mapping' });
          console.error('Error creating mapping:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteMapping: async (id) => {
        try {
          set({ isLoading: true, error: null });
          await workflowApi.deleteMapping(id);
          set((state) => ({ mappings: state.mappings.filter(m => m.id !== id) }));
        } catch (error) {
          set({ error: 'Failed to delete mapping' });
          console.error('Error deleting mapping:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Execution actions
      startWorkflow: async (workflowId, itemId) => {
        try {
          set({ isLoading: true, error: null });
          const instance = await workflowApi.startWorkflow(workflowId, itemId);
          set((state) => ({ workflowInstances: [...state.workflowInstances, instance] }));
        } catch (error) {
          set({ error: 'Failed to start workflow' });
          console.error('Error starting workflow:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      fetchWorkflowInstances: async () => {
        try {
          set({ isLoading: true, error: null });
          const instances = await workflowApi.getWorkflowInstances();
          set({ workflowInstances: instances });
        } catch (error) {
          set({ error: 'Failed to fetch workflow instances' });
          console.error('Error fetching workflow instances:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchExecutionLogs: async (instanceId) => {
        try {
          set({ isLoading: true, error: null });
          const logs = await workflowApi.getWorkflowInstanceLogs(instanceId);
          set({ executionLogs: logs });
        } catch (error) {
          set({ error: 'Failed to fetch execution logs' });
          console.error('Error fetching execution logs:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      // Approval actions
      fetchPendingApprovals: async () => {
        try {
          set({ isLoading: true, error: null });
          const approvals = await workflowApi.getPendingApprovals();
          set({ pendingApprovals: approvals });
        } catch (error) {
          set({ error: 'Failed to fetch pending approvals' });
          console.error('Error fetching pending approvals:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      submitApproval: async (approval) => {
        try {
          set({ isLoading: true, error: null });
          await workflowApi.submitApproval({
            ...approval,
            approvedBy: 'current.user@company.com', // This should come from auth context
          });
          // Refresh pending approvals
          const approvals = await workflowApi.getPendingApprovals();
          set({ pendingApprovals: approvals });
        } catch (error) {
          set({ error: 'Failed to submit approval' });
          console.error('Error submitting approval:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Utility actions
      loadDefaultWorkflow: () => {
        const defaultWorkflow: Workflow = {
          id: 'default',
          name: 'Default Deployment Workflow',
          description: 'Standard deployment workflow with approvals',
          version: '1.0',
          status: 'draft',
          createdBy: 'system',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          nodes: [
            {
              id: 'start',
              name: 'Start',
              type: 'start',
              position: { x: 100, y: 200 },
              data: { label: 'Start', nodeType: 'start', status: 'not_started' }
            },
            {
              id: 'dev-approval',
              name: 'Dev Approval',
              type: 'approval',
              position: { x: 300, y: 200 },
              data: { label: 'Dev Approval', nodeType: 'approval', status: 'not_started' }
            },
            {
              id: 'dev',
              name: 'Development',
              type: 'dev',
              position: { x: 500, y: 200 },
              data: { label: 'DEV', nodeType: 'dev', status: 'not_started', activities: [] }
            },
            {
              id: 'qa-approval',
              name: 'QA Approval',
              type: 'approval',
              position: { x: 700, y: 200 },
              data: { label: 'QA Approval', nodeType: 'approval', status: 'not_started' }
            },
            {
              id: 'qa',
              name: 'Quality Assurance',
              type: 'qa',
              position: { x: 900, y: 200 },
              data: { label: 'QA', nodeType: 'qa', status: 'not_started', activities: [] }
            },
            {
              id: 'stage-approval',
              name: 'Stage Approval',
              type: 'approval',
              position: { x: 1100, y: 200 },
              data: { label: 'Stage Approval', nodeType: 'approval', status: 'not_started' }
            },
            {
              id: 'stage',
              name: 'Staging',
              type: 'stage',
              position: { x: 1300, y: 200 },
              data: { label: 'STAGE', nodeType: 'stage', status: 'not_started', activities: [] }
            },
            {
              id: 'prod-approval',
              name: 'Prod Approval',
              type: 'approval',
              position: { x: 1500, y: 200 },
              data: { label: 'Prod Approval', nodeType: 'approval', status: 'not_started' }
            },
            {
              id: 'prod',
              name: 'Production',
              type: 'prod',
              position: { x: 1700, y: 200 },
              data: { label: 'PROD', nodeType: 'prod', status: 'not_started', activities: [] }
            },
            {
              id: 'end',
              name: 'End',
              type: 'end',
              position: { x: 1900, y: 200 },
              data: { label: 'End', nodeType: 'end', status: 'not_started' }
            }
          ],
          edges: [
            { id: 'start-dev-approval', source: 'start', target: 'dev-approval' },
            { id: 'dev-approval-dev', source: 'dev-approval', target: 'dev' },
            { id: 'dev-qa-approval', source: 'dev', target: 'qa-approval' },
            { id: 'qa-approval-qa', source: 'qa-approval', target: 'qa' },
            { id: 'qa-stage-approval', source: 'qa', target: 'stage-approval' },
            { id: 'stage-approval-stage', source: 'stage-approval', target: 'stage' },
            { id: 'stage-prod-approval', source: 'stage', target: 'prod-approval' },
            { id: 'prod-approval-prod', source: 'prod-approval', target: 'prod' },
            { id: 'prod-end', source: 'prod', target: 'end' }
          ]
        };
        set({ currentWorkflow: defaultWorkflow });
      },

      resetStore: () => set({
        workflows: [],
        currentWorkflow: null,
        nodes: [],
        roles: [],
        stages: [],
        activities: [],
        mappings: [],
        workflowInstances: [],
        pendingApprovals: [],
        executionLogs: [],
        isLoading: false,
        error: null,
        selectedNodeId: null,
        showNodeConfig: false,
        showActivityConfig: false,
        selectedStageId: null,
      }),
    }),
    {
      name: 'workflow-store',
    }
  )
);