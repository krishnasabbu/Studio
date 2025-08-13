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
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import RoleEdge from './RoleEdge';
import { useGetNodesQuery, useCreateNodeMutation, useGetRolesQuery, useGetActivitiesQuery, useCreateActivityMutation } from '../../services/api';
import { Save, Plus, Undo, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import Dropdown from '../ui/Dropdown';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const edgeTypes: EdgeTypes = {
  role: RoleEdge,
};

interface WorkflowBuilderProps {
  initialWorkflow?: any;
  onSave: (workflow: any) => void;
  onExecute?: (workflow: any) => void;
  readOnly?: boolean;
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  initialWorkflow,
  onSave,
  onExecute,
  readOnly = false,
}) => {
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  
  // Backend data
  const { data: backendNodes = [], refetch: refetchNodes } = useGetNodesQuery();
  const { data: roles = [] } = useGetRolesQuery();
  
  // UI State
  const [showRolePopup, setShowRolePopup] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  useEffect(() => {
    if (initialWorkflow) {
      if (initialWorkflow.name) {
        setWorkflowName(initialWorkflow.name);
      }
      if (initialWorkflow.description) {
        setWorkflowDescription(initialWorkflow.description);
      }
      if (initialWorkflow.flowData) {
        setNodes(initialWorkflow.flowData.nodes || []);
        setEdges(initialWorkflow.flowData.edges || []);
      }
    }
  }, [initialWorkflow]);

  const saveToHistory = useCallback(() => {
    setHistory(prev => [...prev, { nodes: [...nodes], edges: [...edges] }]);
  }, [nodes, edges]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (readOnly) return;
      saveToHistory();
      const newEdge = {
        ...params,
        id: `edge-${Date.now()}`,
        type: 'role',
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        data: {
          role: '',
          status: 'pending',
          approvalRequired: true,
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [readOnly, saveToHistory, setEdges]
  );

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    if (readOnly) return;
    console.log('Edge clicked:', edge);
    event.stopPropagation();
    setSelectedEdge(edge);
    setShowRolePopup(true);
  }, [readOnly]);
  
  const addNodeToCanvas = (nodeData: any) => {
    if (readOnly) return;
    
    saveToHistory();
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'custom',
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: {
        label: nodeData.name,
        nodeType: nodeData.type,
        status: 'pending',
        description: `${nodeData.name} node`,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const assignRoleToEdge = (roleId: string) => {
    if (!selectedEdge) return;
    
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    console.log('Assigning role to edge:', role.name, selectedEdge.id);
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === selectedEdge.id
          ? {
              ...edge,
              data: {
                ...edge.data,
                role: role.name,
                roleId: roleId,
              },
            }
          : edge
      )
    );
    
    setShowRolePopup(false);
    setSelectedEdge(null);
  };

  const deleteNode = (nodeId: string) => {
    if (readOnly) return;
    
    saveToHistory();
    setNodes((nds) => nds.filter(n => n.id !== nodeId));
    setEdges((eds) => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
  };

  const deleteEdge = (edgeId: string) => {
    if (readOnly) return;
    
    saveToHistory();
    setEdges((eds) => eds.filter(e => e.id !== edgeId));
  };

  const undo = () => {
    if (history.length === 0) return;
    
    const lastState = history[history.length - 1];
    setNodes(lastState.nodes);
    setEdges(lastState.edges);
    setHistory(prev => prev.slice(0, -1));
  };

  const handleSave = () => {
    if (!workflowName.trim()) {
      alert('Please enter a workflow name');
      return;
    }

    const workflowData = {
      name: workflowName,
      description: workflowDescription,
      flowData: {
        nodes,
        edges,
      },
    };
    console.log('Saving workflow:', workflowData);
    onSave(workflowData);
  };

  const closeRolePopup = () => {
    setShowRolePopup(false);
    setSelectedEdge(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Workflow Info & Controls */}
      {!readOnly && (
        <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <InputField
              label="Workflow Name"
              value={workflowName}
              onChange={setWorkflowName}
              placeholder="Enter workflow name"
            />
            <InputField
              label="Description"
              value={workflowDescription}
              onChange={setWorkflowDescription}
              placeholder="Enter workflow description"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              {/* Nodes Section */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Available Nodes</h4>
                <div className="flex flex-wrap gap-2 max-w-md">
                  {backendNodes.map((node) => (
                    <button
                      key={node.id}
                      onClick={() => addNodeToCanvas(node)}
                      className="px-3 py-2 text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                    >
                      {node.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={history.length === 0}
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <Undo className="h-4 w-4 mr-1" />
                Undo
              </Button>
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
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          attributionPosition="bottom-left"
          nodesDraggable={!readOnly}
          nodesConnectable={!readOnly}
          elementsSelectable={!readOnly}
          selectNodesOnDrag={false}
          onNodeContextMenu={(event, node) => {
            if (readOnly) return;
            event.preventDefault();
            if (confirm(`Delete node "${node.data.label}"?`)) {
              deleteNode(node.id);
            }
          }}
          onEdgeContextMenu={(event, edge) => {
            if (readOnly) return;
            event.preventDefault();
            if (confirm(`Delete connection?`)) {
              deleteEdge(edge.id);
            }
          }}
        >
          <Background />
          <Controls />
          <MiniMap 
            nodeColor={(node) => {
              switch (node.data?.status) {
                case 'completed': return '#10b981';
                case 'in_progress': return '#f59e0b';
                case 'rejected': return '#ef4444';
                default: return '#6b7280';
              }
            }}
          />
        </ReactFlow>
      </div>

      {/* Role Assignment Popup */}
      {showRolePopup && selectedEdge && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closeRolePopup}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Assign Role to Connection
            </h3>
            
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Assigning role for connection between nodes
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Edge ID: {selectedEdge.id}
              </p>
            </div>
            
            <div className="space-y-3">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => assignRoleToEdge(role.id)}
                  className="w-full p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {role.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {role.description}
                  </div>
                </button>
              ))}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={closeRolePopup}
                className="flex-1 border-primary-300 text-primary-600 hover:bg-primary-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowBuilder;