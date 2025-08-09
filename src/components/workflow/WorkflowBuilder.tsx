import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
  EdgeTypes,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import StageNode from './StageNode';
import ApprovalEdge from './ApprovalEdge';
import { Save, Play, RotateCcw } from 'lucide-react';
import Button from '../ui/Button';

const nodeTypes: NodeTypes = {
  stage: StageNode,
};

const edgeTypes: EdgeTypes = {
  approval: ApprovalEdge,
};

interface WorkflowBuilderProps {
  initialWorkflow?: any;
  onSave: (workflow: any) => void;
  onExecute?: (workflow: any) => void;
  readOnly?: boolean;
}

const defaultNodes: Node[] = [
  {
    id: 'dev',
    type: 'stage',
    position: { x: 100, y: 100 },
    data: { 
      label: 'DEV', 
      stage: 'development',
      status: 'pending',
      description: 'Development Environment'
    },
  },
  {
    id: 'qa',
    type: 'stage',
    position: { x: 400, y: 100 },
    data: { 
      label: 'QA', 
      stage: 'testing',
      status: 'pending',
      description: 'Quality Assurance Environment'
    },
  },
  {
    id: 'stage',
    type: 'stage',
    position: { x: 700, y: 100 },
    data: { 
      label: 'STAGE', 
      stage: 'staging',
      status: 'pending',
      description: 'Staging Environment'
    },
  },
  {
    id: 'prod',
    type: 'stage',
    position: { x: 1000, y: 100 },
    data: { 
      label: 'PROD', 
      stage: 'production',
      status: 'pending',
      description: 'Production Environment'
    },
  },
];

const defaultEdges: Edge[] = [
  {
    id: 'dev-qa',
    source: 'dev',
    target: 'qa',
    type: 'approval',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    data: {
      approver: 'dev-lead@company.com',
      status: 'pending',
      approvalRequired: true,
    },
  },
  {
    id: 'qa-stage',
    source: 'qa',
    target: 'stage',
    type: 'approval',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    data: {
      approver: 'qa-lead@company.com',
      status: 'pending',
      approvalRequired: true,
    },
  },
  {
    id: 'stage-prod',
    source: 'stage',
    target: 'prod',
    type: 'approval',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    data: {
      approver: 'prod-manager@company.com',
      status: 'pending',
      approvalRequired: true,
    },
  },
];

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  initialWorkflow,
  onSave,
  onExecute,
  readOnly = false,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');

  // Load initial workflow if provided
  useEffect(() => {
    if (initialWorkflow) {
      setWorkflowName(initialWorkflow.name || '');
      setWorkflowDescription(initialWorkflow.description || '');
      if (initialWorkflow.flowData) {
        setNodes(initialWorkflow.flowData.nodes || defaultNodes);
        setEdges(initialWorkflow.flowData.edges || defaultEdges);
      }
    }
  }, [initialWorkflow, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        type: 'approval',
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        data: {
          approver: 'approver@company.com',
          status: 'pending',
          approvalRequired: true,
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const handleSave = () => {
    const workflowData = {
      name: workflowName,
      description: workflowDescription,
      flowData: {
        nodes,
        edges,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(workflowData);
  };

  const handleExecute = () => {
    if (onExecute) {
      const workflowData = {
        name: workflowName,
        description: workflowDescription,
        flowData: {
          nodes,
          edges,
        },
      };
      onExecute(workflowData);
    }
  };

  const handleReset = () => {
    setNodes(defaultNodes);
    setEdges(defaultEdges);
    setWorkflowName('');
    setWorkflowDescription('');
  };

  const addStageNode = (stageType: string) => {
    const newNode: Node = {
      id: `${stageType}-${Date.now()}`,
      type: 'stage',
      position: { x: Math.random() * 500 + 100, y: Math.random() * 300 + 100 },
      data: {
        label: stageType.toUpperCase(),
        stage: stageType.toLowerCase(),
        status: 'pending',
        description: `${stageType} Environment`,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Workflow Info */}
      {!readOnly && (
        <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Workflow Name"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
            />
            <input
              type="text"
              placeholder="Workflow Description"
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addStageNode('dev')}
                className="border-primary-300 text-primary-600 hover:bg-primary-50"
              >
                + DEV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addStageNode('qa')}
                className="border-primary-300 text-primary-600 hover:bg-primary-50"
              >
                + QA
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addStageNode('stage')}
                className="border-primary-300 text-primary-600 hover:bg-primary-50"
              >
                + STAGE
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addStageNode('prod')}
                className="border-primary-300 text-primary-600 hover:bg-primary-50"
              >
                + PROD
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              {onExecute && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleExecute}
                  className="bg-accent-600 hover:bg-accent-700 text-white"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Execute
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                <Save className="h-4 w-4 mr-1" />
                Save Workflow
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* React Flow Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          attributionPosition="bottom-left"
          nodesDraggable={!readOnly}
          nodesConnectable={!readOnly}
          elementsSelectable={!readOnly}
        >
          <Background />
          <Controls />
          <MiniMap 
            nodeColor={(node) => {
              switch (node.data?.status) {
                case 'completed': return '#10b981';
                case 'running': return '#f59e0b';
                case 'failed': return '#ef4444';
                default: return '#6b7280';
              }
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
};

export default WorkflowBuilder;