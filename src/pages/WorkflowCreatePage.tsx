import React, { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useGetWorkflowQuery, useCreateWorkflowMutation, useUpdateWorkflowMutation, useGetActivityTemplatesQuery } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import Dropdown from '../components/ui/Dropdown';
import { Plus, Trash2, GripVertical, Settings, Database, Mail, Webhook, UserCheck, Copy } from 'lucide-react';

const WorkflowCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workflowId = searchParams.get('id');
  const isEditing = Boolean(workflowId);
  
  const { data: existingWorkflow, isLoading: isLoadingWorkflow } = useGetWorkflowQuery(workflowId!, {
    skip: !workflowId,
  });
  const { data: activityTemplates = [] } = useGetActivityTemplatesQuery();
  const [createWorkflow, { isLoading: isCreating }] = useCreateWorkflowMutation();
  const [updateWorkflow, { isLoading: isUpdating }] = useUpdateWorkflowMutation();
  
  const [workflowData, setWorkflowData] = useState({
    name: '',
    description: '',
    version: '1.0',
    status: 'draft' as const,
  });
  
  const [stages, setStages] = useState<any[]>([
    { id: 'stage-1', name: 'Dev', order: 0, activities: [] },
    { id: 'stage-2', name: 'RQA', order: 1, activities: [] },
    { id: 'stage-3', name: 'Stage', order: 2, activities: [] },
    { id: 'stage-4', name: 'Prod', order: 3, activities: [] },
  ]);
  
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [activityForm, setActivityForm] = useState({
    type: '',
    name: '',
    config: {},
  });

  // Load existing workflow data
  React.useEffect(() => {
    if (existingWorkflow) {
      setWorkflowData({
        name: existingWorkflow.name,
        description: existingWorkflow.description,
        version: existingWorkflow.version,
        status: existingWorkflow.status,
      });
      setStages(existingWorkflow.stages || []);
    }
  }, [existingWorkflow]);

  const activityTypes = [
    { value: 'Execute DB Query', label: 'Execute DB Query', icon: Database },
    { value: 'Email Alert', label: 'Email Alert', icon: Mail },
    { value: 'Webhook Trigger', label: 'Webhook Trigger', icon: Webhook },
    { value: 'Manual Approval', label: 'Manual Approval', icon: UserCheck },
  ];

  const handleWorkflowDataChange = useCallback((field: string, value: string) => {
    setWorkflowData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleAddStage = useCallback(() => {
    const newStage = {
      id: `stage-${Date.now()}`,
      name: `Stage ${stages.length + 1}`,
      order: stages.length,
      activities: [],
    };
    setStages(prev => [...prev, newStage]);
  }, [stages.length]);

  const handleRemoveStage = useCallback((stageId: string) => {
    setStages(prev => prev.filter(stage => stage.id !== stageId));
  }, []);

  const handleStageNameChange = useCallback((stageId: string, name: string) => {
    setStages(prev => prev.map(stage => 
      stage.id === stageId ? { ...stage, name } : stage
    ));
  }, []);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(stages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order
    const updatedStages = items.map((stage, index) => ({
      ...stage,
      order: index,
    }));

    setStages(updatedStages);
  };

  const handleAddActivity = (stageId: string) => {
    setSelectedStage(stageId);
    setEditingActivity(null);
    setActivityForm({ type: '', name: '', config: {} });
    setShowActivityModal(true);
  };

  const handleEditActivity = (stageId: string, activity: any) => {
    setSelectedStage(stageId);
    setEditingActivity(activity);
    setActivityForm({
      type: activity.type,
      name: activity.name,
      config: activity.config,
    });
    setShowActivityModal(true);
  };

  const handleSaveActivity = () => {
    if (!selectedStage || !activityForm.type || !activityForm.name) return;

    const newActivity = {
      id: editingActivity?.id || `activity-${Date.now()}`,
      type: activityForm.type,
      name: activityForm.name,
      order: editingActivity?.order ?? 0,
      status: 'pending',
      config: activityForm.config,
    };

    setStages(prev => prev.map(stage => {
      if (stage.id === selectedStage) {
        if (editingActivity) {
          return {
            ...stage,
            activities: stage.activities.map((act: any) => 
              act.id === editingActivity.id ? newActivity : act
            ),
          };
        } else {
          return {
            ...stage,
            activities: [...stage.activities, { ...newActivity, order: stage.activities.length }],
          };
        }
      }
      return stage;
    }));

    setShowActivityModal(false);
    setSelectedStage(null);
    setEditingActivity(null);
  };

  const handleRemoveActivity = (stageId: string, activityId: string) => {
    setStages(prev => prev.map(stage => 
      stage.id === stageId 
        ? { ...stage, activities: stage.activities.filter((act: any) => act.id !== activityId) }
        : stage
    ));
  };

  const handleCloneFromTemplate = (template: any) => {
    setActivityForm({
      type: template.type,
      name: template.name,
      config: template.config,
    });
  };

  const handleSaveWorkflow = async () => {
    if (!workflowData.name.trim()) {
      alert('Please enter a workflow name');
      return;
    }

    try {
      const workflowPayload = {
        ...workflowData,
        stages,
        createdBy: 'current.user@company.com',
      };

      if (isEditing) {
        await updateWorkflow({ ...workflowPayload, id: workflowId }).unwrap();
      } else {
        await createWorkflow(workflowPayload).unwrap();
      }

      navigate('/workflows');
    } catch (error) {
      console.error('Failed to save workflow:', error);
      alert('Failed to save workflow. Please try again.');
    }
  };

  const getActivityIcon = (type: string) => {
    const activityType = activityTypes.find(t => t.value === type);
    return activityType?.icon || Settings;
  };

  if (isLoadingWorkflow) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
            {isEditing ? 'Edit Workflow' : 'Create New Workflow'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Design multi-stage workflows with automated activities
          </p>
        </div>
      </div>

      {/* Workflow Basic Info */}
      <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary-500">
        <h3 className="text-lg font-semibold text-primary-700 dark:text-white mb-4">
          Workflow Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Workflow Name"
            value={workflowData.name}
            onChange={(value) => handleWorkflowDataChange('name', value)}
            placeholder="Enter workflow name"
            required
          />
          <InputField
            label="Version"
            value={workflowData.version}
            onChange={(value) => handleWorkflowDataChange('version', value)}
            placeholder="1.0"
          />
        </div>
        <div className="mt-4">
          <InputField
            label="Description"
            value={workflowData.description}
            onChange={(value) => handleWorkflowDataChange('description', value)}
            placeholder="Describe the workflow purpose"
          />
        </div>
      </Card>

      {/* Workflow Stages */}
      <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-accent-500">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-primary-700 dark:text-white">
            Workflow Stages
          </h3>
          <Button
            onClick={handleAddStage}
            className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Stage
          </Button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="stages">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {stages.map((stage, index) => (
                  <Draggable key={stage.id} draggableId={stage.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-primary-200 dark:border-gray-600 p-4"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                            </div>
                            <div className="flex-1">
                              <InputField
                                label=""
                                value={stage.name}
                                onChange={(value) => handleStageNameChange(stage.id, value)}
                                placeholder="Stage name"
                              />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddActivity(stage.id)}
                              className="border-primary-300 text-primary-600 hover:bg-primary-50"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Activity
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRemoveStage(stage.id)}
                              className="px-3"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Activities */}
                        <div className="space-y-2">
                          {stage.activities.map((activity: any) => {
                            const IconComponent = getActivityIcon(activity.type);
                            return (
                              <div
                                key={activity.id}
                                className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                              >
                                <div className="flex items-center space-x-3">
                                  <IconComponent className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {activity.name}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {activity.type}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditActivity(stage.id, activity)}
                                    className="border-primary-300 text-primary-600 hover:bg-primary-50"
                                  >
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleRemoveActivity(stage.id, activity.id)}
                                    className="px-2"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                          {stage.activities.length === 0 && (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                              No activities added yet
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Card>

      {/* Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-primary-700 dark:text-white">
                {editingActivity ? 'Edit Activity' : 'Add New Activity'}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowActivityModal(false)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <Dropdown
                label="Activity Type"
                value={activityForm.type}
                onChange={(value) => setActivityForm(prev => ({ ...prev, type: value }))}
                options={activityTypes.map(t => ({ value: t.value, label: t.label }))}
                placeholder="Select activity type"
                required
              />

              <InputField
                label="Activity Name"
                value={activityForm.name}
                onChange={(value) => setActivityForm(prev => ({ ...prev, name: value }))}
                placeholder="Enter activity name"
                required
              />

              {/* Activity Templates */}
              {activityTemplates.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Clone from Template
                  </label>
                  <div className="space-y-2">
                    {activityTemplates
                      .filter(template => !activityForm.type || template.type === activityForm.type)
                      .map((template) => (
                        <div
                          key={template.id}
                          className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                        >
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {template.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {template.description}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCloneFromTemplate(template)}
                            className="border-primary-300 text-primary-600 hover:bg-primary-50"
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Clone
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Activity Configuration */}
              {activityForm.type === 'Execute DB Query' && (
                <div className="space-y-4">
                  <InputField
                    label="Database"
                    value={(activityForm.config as any).database || ''}
                    onChange={(value) => setActivityForm(prev => ({
                      ...prev,
                      config: { ...prev.config, database: value }
                    }))}
                    placeholder="dev_db"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SQL Query
                    </label>
                    <textarea
                      value={(activityForm.config as any).query || ''}
                      onChange={(e) => setActivityForm(prev => ({
                        ...prev,
                        config: { ...prev.config, query: e.target.value }
                      }))}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 dark:text-white font-mono"
                      placeholder="SELECT * FROM users WHERE active = 1;"
                    />
                  </div>
                </div>
              )}

              {activityForm.type === 'Email Alert' && (
                <div className="space-y-4">
                  <InputField
                    label="Template ID"
                    value={(activityForm.config as any).templateId || ''}
                    onChange={(value) => setActivityForm(prev => ({
                      ...prev,
                      config: { ...prev.config, templateId: value }
                    }))}
                    placeholder="1"
                  />
                  <InputField
                    label="Recipients (comma-separated)"
                    value={(activityForm.config as any).recipients?.join(', ') || ''}
                    onChange={(value) => setActivityForm(prev => ({
                      ...prev,
                      config: { ...prev.config, recipients: value.split(',').map(r => r.trim()) }
                    }))}
                    placeholder="user1@company.com, user2@company.com"
                  />
                  <InputField
                    label="Subject"
                    value={(activityForm.config as any).subject || ''}
                    onChange={(value) => setActivityForm(prev => ({
                      ...prev,
                      config: { ...prev.config, subject: value }
                    }))}
                    placeholder="Email subject"
                  />
                </div>
              )}

              {activityForm.type === 'Webhook Trigger' && (
                <div className="space-y-4">
                  <InputField
                    label="URL"
                    value={(activityForm.config as any).url || ''}
                    onChange={(value) => setActivityForm(prev => ({
                      ...prev,
                      config: { ...prev.config, url: value }
                    }))}
                    placeholder="https://api.example.com/webhook"
                  />
                  <Dropdown
                    label="Method"
                    value={(activityForm.config as any).method || 'POST'}
                    onChange={(value) => setActivityForm(prev => ({
                      ...prev,
                      config: { ...prev.config, method: value }
                    }))}
                    options={[
                      { value: 'GET', label: 'GET' },
                      { value: 'POST', label: 'POST' },
                      { value: 'PUT', label: 'PUT' },
                      { value: 'DELETE', label: 'DELETE' },
                    ]}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Headers (JSON)
                    </label>
                    <textarea
                      value={JSON.stringify((activityForm.config as any).headers || {}, null, 2)}
                      onChange={(e) => {
                        try {
                          const headers = JSON.parse(e.target.value);
                          setActivityForm(prev => ({
                            ...prev,
                            config: { ...prev.config, headers }
                          }));
                        } catch (error) {
                          // Invalid JSON, ignore
                        }
                      }}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 dark:text-white font-mono"
                      placeholder='{"Authorization": "Bearer token"}'
                    />
                  </div>
                </div>
              )}

              {activityForm.type === 'Manual Approval' && (
                <div className="space-y-4">
                  <InputField
                    label="Approvers (comma-separated)"
                    value={(activityForm.config as any).approvers?.join(', ') || ''}
                    onChange={(value) => setActivityForm(prev => ({
                      ...prev,
                      config: { ...prev.config, approvers: value.split(',').map(r => r.trim()) }
                    }))}
                    placeholder="manager@company.com, lead@company.com"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Instructions
                    </label>
                    <textarea
                      value={(activityForm.config as any).instructions || ''}
                      onChange={(e) => setActivityForm(prev => ({
                        ...prev,
                        config: { ...prev.config, instructions: e.target.value }
                      }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                      placeholder="Please review and approve this step"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowActivityModal(false)}
                className="border-primary-300 text-primary-600 hover:bg-primary-50"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveActivity}
                disabled={!activityForm.type || !activityForm.name}
                className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {editingActivity ? 'Update Activity' : 'Add Activity'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Save Workflow */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          onClick={() => navigate('/workflows')}
          className="border-primary-300 text-primary-600 hover:bg-primary-50"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSaveWorkflow}
          disabled={isCreating || isUpdating}
          className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {(isCreating || isUpdating) ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </div>
          ) : (
            `${isEditing ? 'Update' : 'Create'} Workflow`
          )}
        </Button>
      </div>
    </div>
  );
};

export default WorkflowCreatePage;