export interface WorkflowNode {
  id: string;
  name: string;
  type: 'start' | 'dev' | 'qa' | 'stage' | 'prod' | 'end' | 'approval';
  position: { x: number; y: number };
  data: {
    label: string;
    nodeType: string;
    status?: 'not_started' | 'running' | 'awaiting_approval' | 'completed' | 'failed';
    activities?: Activity[];
    role?: string;
    roleId?: string;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: {
    role?: string;
    roleId?: string;
    status?: 'pending' | 'approved' | 'rejected';
  };
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'draft' | 'active' | 'inactive';
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface Stage {
  id: string;
  name: string;
  type: 'DB' | 'Service' | 'Webhook';
  description: string;
}

export interface Activity {
  id: string;
  name: string;
  type: string;
  stageId: string;
  config: Record<string, any>;
  order: number;
}

export interface WorkflowMapping {
  id: string;
  workflowId: string;
  functionalityId: string;
  functionalityName: string;
  functionalityType: string;
  createdAt: string;
}

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  itemId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  currentNodeId: string;
  startedAt: string;
  completedAt?: string;
  startedBy: string;
  logs: ExecutionLog[];
}

export interface ExecutionLog {
  id: string;
  timestamp: string;
  nodeId: string;
  message: string;
  level: 'info' | 'warning' | 'error' | 'success';
  details?: Record<string, any>;
}

export interface PendingApproval {
  id: string;
  workflowInstanceId: string;
  nodeId: string;
  workflowName: string;
  requiredRole: string;
  requestedBy: string;
  requestedAt: string;
  reason?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ApprovalAction {
  approvalId: string;
  action: 'approve' | 'reject';
  reason?: string;
  approvedBy: string;
}