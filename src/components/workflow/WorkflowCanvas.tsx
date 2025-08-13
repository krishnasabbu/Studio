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
import DynamicStageNode from './DynamicStageNode';
import ApprovalEdge from './ApprovalEdge';
import StageConfigPanel from './StageConfigPanel';
import EdgeConfigPanel from './EdgeConfigPanel';
import { Plus, Save, Trash2, Undo, Database, Globe, UserCheck, Webhook, Mail, Activity } from 'lucide-react';
import Button from '../ui/Button';

const nodeTypes: NodeTypes = {
  stageNode: DynamicStageNode,
};

const edgeTypes: EdgeTypes = {
  approval: ApprovalEdge,
};

interface WorkflowCanvasProps {
  workflow?: any;
  onSave?: (workflowData: any) => void;
  readOnly?: boolean;
  showExecutionStatus?: boolean;
  executionSteps?: any[];
  currentExecutionStep?: string;
  isExecuting?: boolean;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ 
  workflow, 
  onSave, 
  readOnly = false, 
  showExecutionStatus = false,
  executionSteps = [],
  currentExecutionStep,
  isExecuting = false
}) => {
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  
  // UI State
  const [showStageConfig, setShowStageConfig] = useState(false);
  const [showEdgeConfig, setShowEdgeConfig] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  // Load workflow data
  useEffect(() => {
    if (workflow) {
      const nodes = workflow.nodes || workflow.flowData?.nodes || [];
      const edges = workflow.edges || workflow.flowData?.edges || [];
      setNodes(nodes);
      setEdges(edges);
      
      // Fit view after loading
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.1 });
      }, 100);
    }
  }, [workflow, setNodes, setEdges, reactFlowInstance]);

  const saveToHistory = useCallback(() => {
    setHistory(prev => [...prev, { nodes: [...nodes], edges: [...edges] }]);
  }, [nodes, edges]);

  // Add stage node to canvas
  const addStageNode = useCallback((stageName: string) => {
    if (readOnly) return;
    
    saveToHistory();
    const newNode: Node = {
      id: `stage-${Date.now()}`,
      type: 'stageNode',
      position: { 
        x: Math.random() * 300 + 100, 
        y: Math.random() * 200 + 100 
      },
      data: {
        stageName: stageName,
        environment: stageName.toLowerCase(),
        parameters: getDefaultParameters(stageName),
        status: showExecutionStatus ? 'not_started' : 'pending',
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [readOnly, saveToHistory, showExecutionStatus, setNodes]);

  const getDefaultParameters = useCallback((stageName: string) => {
    switch (stageName.toLowerCase()) {
      case 'dev':
        return {
          dbName: 'dev_database',
          serviceUrl: 'https://dev.api.example.com',
          environment: 'development'
        };
      case 'qa':
        return {
          dbName: 'qa_database',
          serviceUrl: 'https://qa.api.example.com',
          environment: 'testing'
        };
      case 'stage':
        return {
          dbName: 'stage_database',
          serviceUrl: 'https://stage.api.example.com',
          environment: 'staging'
        };
      case 'prod':
        return {
          dbName: 'prod_database',
          serviceUrl: 'https://api.example.com',
          environment: 'production'
        };
      default:
        return {
          environment: stageName.toLowerCase(),
          parameters: {}
        };
    }
  }, []);

  // Handle node click - open configuration panel
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    console.log('Node clicked:', node.id, node.data);
    if (readOnly) return;
    
    setSelectedNode(node);
    setShowStageConfig(true);
  }, [readOnly]);

  // Handle edge connection
  const onConnect = useCallback(
    (params: Connection) => {
      if (readOnly) return;
      saveToHistory();
      const newEdge: Edge = {
        ...params,
        id: `edge-${Date.now()}`,
        type: 'approval',
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        data: {
          requiresApproval: false,
          approverRole: '',
          status: 'pending',
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [readOnly, saveToHistory, setEdges]
  );

  // Handle edge click - open approval configuration
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    if (readOnly) return;
    event.stopPropagation();
    setSelectedEdge(edge);
    setShowEdgeConfig(true);
  }, [readOnly]);

  // Save stage configuration
  const handleSaveStageConfig = useCallback((stageData: any) => {
    if (!selectedNode) return;
    
    const updatedNode = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        ...stageData,
      },
    };

    setNodes((nds) => nds.map(n => n.id === selectedNode.id ? updatedNode : n));
    setShowStageConfig(false);
    setSelectedNode(null);
  }, [selectedNode, setNodes]);

  // Save edge configuration
  const handleSaveEdgeConfig = useCallback((edgeData: any) => {
    if (!selectedEdge) return;
    
    const updatedEdge = {
      ...selectedEdge,
      data: {
        ...selectedEdge.data,
        ...edgeData,
      },
    };

    setEdges((eds) => eds.map(e => e.id === selectedEdge.id ? updatedEdge : e));
    setShowEdgeConfig(false);
    setSelectedEdge(null);
  }, [selectedEdge, setEdges]);

  const deleteNode = useCallback((nodeId: string) => {
    if (readOnly) return;
    
    saveToHistory();
    setNodes((nds) => nds.filter(n => n.id !== nodeId));
    setEdges((eds) => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
  }, [readOnly, saveToHistory, setNodes, setEdges]);

  const deleteEdge = useCallback((edgeId: string) => {
    if (readOnly) return;
    
    saveToHistory();
    setEdges((eds) => eds.filter(e => e.id !== edgeId));
  }, [readOnly, saveToHistory, setEdges]);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    
    const lastState = history[history.length - 1];
    setNodes(lastState.nodes);
    setEdges(lastState.edges);
    setHistory(prev => prev.slice(0, -1));
  }, [history, setNodes, setEdges]);

  const clearCanvas = useCallback(() => {
    if (readOnly || !confirm('Clear entire canvas?')) return;
    
    saveToHistory();
    setNodes([]);
    setEdges([]);
  }, [readOnly, saveToHistory, setNodes, setEdges]);

  const handleSave = useCallback(() => {
    if (!onSave) return;
    
    const workflowData = {
      nodes,
      edges,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(workflowData);
  }, [onSave, nodes, edges]);

  const getNodeStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'running': return '#3b82f6';
      case 'awaiting_approval': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  }, []);

  // Predefined stage templates
  const stageTemplates = [
    { name: 'Stage', icon: Activity, color: 'bg-blue-100 text-blue-700' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        {!readOnly && (
          <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Workflow Builder
                </h3>
                
                {/* Stage Templates */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Add Stage:</span>
                  {stageTemplates.map((template) => {
                    const IconComponent = template.icon;
                    return (
                      <Button
                        key={template.name}
                        onClick={() => addStageNode(template.name)}
                        size="sm"
                        className={`${template.color} hover:opacity-80 border-0`}
                      >
                        <IconComponent className="h-4 w-4 mr-1" />
                        {template.name}
                      </Button>
                    );
                  })}
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
                  variant="outline"
                  size="sm"
                  onClick={clearCanvas}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
                {onSave && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSave}
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!readOnly && (
          <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-6">
                <span className="text-blue-700 dark:text-blue-300 font-medium">How to use:</span>
                <span className="text-blue-600 dark:text-blue-400">1. Click stage buttons to add nodes</span>
                <span className="text-blue-600 dark:text-blue-400">2. Click nodes to configure parameters</span>
                <span className="text-blue-600 dark:text-blue-400">3. Connect nodes, then click dots to set approvals</span>
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
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeDoubleClick={onNodeClick}
            fitView
            attributionPosition="bottom-left"
            nodesDraggable={!readOnly}
            nodesConnectable={!readOnly}
            elementsSelectable={!readOnly}
            onInit={(instance) => {
              // Store the instance for programmatic control
              setTimeout(() => {
                instance.fitView({ padding: 0.1 });
              }, 100);
            }}
            onNodeContextMenu={(event, node) => {
              if (readOnly) return;
              event.preventDefault();
              if (confirm(`Delete stage "${node.data.stageName}"?`)) {
                deleteNode(node.id);
              }
            }}
            onEdgeContextMenu={(event, edge) => {
              if (readOnly) return;
              event.preventDefault();
              if (confirm('Delete connection?')) {
                deleteEdge(edge.id);
              }
            }}
          >
            <Background />
            <Controls />
            <MiniMap 
              nodeColor={(node) => getNodeStatusColor(node.data?.status || 'not_started')}
              className="bg-white dark:bg-gray-800"
            />
          </ReactFlow>
        </div>
      </div>

      {/* Stage Configuration Panel */}
      <StageConfigPanel
        isOpen={showStageConfig}
        selectedNode={selectedNode}
        onSave={handleSaveStageConfig}
        onClose={() => {
          setShowStageConfig(false);
          setSelectedNode(null);
        }}
      />

      {/* Edge Configuration Panel */}
      <EdgeConfigPanel
        isOpen={showEdgeConfig}
        selectedEdge={selectedEdge}
        onSave={handleSaveEdgeConfig}
        onClose={() => {
          setShowEdgeConfig(false);
          setSelectedEdge(null);
        }}
      />
    </div>
  );
};

export default WorkflowCanvas;