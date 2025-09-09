import React from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import {
  updateComponent,
  removeComponent,
  removeWidget,
  selectComponent,
} from '../../store/slices/emailEditorSlice';
import Button from '../ui/Button';
import { Trash2, Settings, Maximize2, X } from 'lucide-react';
import { ConditionBuilder } from './ConditionBuilder';
import ContentEditor from './ContentEditor';

interface PropertiesPanelProps {
  isViewing?: boolean,
  variables: string[],
  conditions: string[],
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ isViewing = false, variables, conditions }) => {
  const dispatch = useAppDispatch();
  const { selectedComponent } = useAppSelector((state) => state.emailEditor);
  const { currentTemplate } = useAppSelector((state) => state.emailEditor);
  const [showConditionModal, setShowConditionModal] = React.useState(false);
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  console.log("component === "+JSON.stringify(selectComponent))
  console.log("component === "+JSON.stringify(currentTemplate))

  if (!selectedComponent) {
    return (
      <div className="p-6 text-center">
        <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Properties Panel
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {isViewing 
            ? 'Select a widget or component to view its properties'
            : 'Select a widget or component to edit its properties'
          }
        </p>
      </div>
    );
  }

  const isWidget = 'components' in selectedComponent;

  const handleContentChange = (content: string) => {
    if (isViewing) return;
    
    if (!isWidget && selectedComponent?.id) {
      dispatch(updateComponent({
        id: selectedComponent.id,
        changes: { content },
      }));
    }
  };

  const handleDelete = () => {
    if (isViewing) return;
    
    if (isWidget) {
      dispatch(removeWidget(selectedComponent.id));
    } else {
      dispatch(removeComponent(selectedComponent.id));
    }
    dispatch(selectComponent(null));
  };

  const componentType = selectedComponent.type;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {isViewing ? 'Component Properties (Read Only)' : 'Component Properties'}
        </h3>
        {!isViewing && (
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Component Type
          </label>
          <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-white">
            {componentType}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Content
          </label>

          <div className="relative">
            {isFullScreen && !isViewing && (
              <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-end justify-center">
                <div className="bg-white dark:bg-gray-900 w-full max-w-3xl rounded-t-2xl shadow-xl transform transition-all duration-300 animate-slide-up flex flex-col p-4 m-4">
                  {/* Tray Header */}
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Edit Content
                    </h2>
                    <button
                      onClick={() => setIsFullScreen(false)}
                      className="text-gray-500 hover:text-red-500 transition"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Editor */}
                  <div className="flex-1 border rounded-md p-2 bg-white dark:bg-gray-800">
                    <ContentEditor
                      value={selectedComponent.content}
                      onChange={handleContentChange}
                      className="min-h-[60vh]"
                      variables={variables}
                      conditions={conditions}
                    />
                  </div>
                </div>
              </div>
            )}

            {!isFullScreen && (
              <div className="relative border rounded-md pt-10">
                {!isViewing && (
                  <div className="absolute top-2 right-2 z-10">
                    <button
                      onClick={() => setIsFullScreen(true)}
                      className="bg-white dark:bg-gray-800 rounded-full p-1 shadow hover:text-blue-600 text-gray-500"
                      title="Expand Editor"
                    >
                      <Maximize2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <ContentEditor
                  value={selectedComponent.content}
                  onChange={handleContentChange}
                  variables={variables}
                  conditions={conditions}
                />
              </div>
            )}
          </div>
        </div>

        {componentType === 'Conditions' && !isViewing && (
          <>
            <Button onClick={() => setShowConditionModal(true)} variant="outline">
              Add Condition
            </Button>

            {showConditionModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Define Conditions
                  </h3>
                  <ConditionBuilder
                    groups={selectedComponent.properties?.conditionRules || []}
                    onChange={(rules) =>
                      dispatch(updateComponent({
                        id: selectedComponent.id,
                        changes: {
                          properties: {
                            ...selectedComponent.properties,
                            conditionRules: rules,
                          },
                        },
                      }))
                    }
                    fields={(currentTemplate?.dynamicVariables || []).map(dv => ({
                      label: dv.variableName,
                      value: dv.variableName, // using variableName as the internal value too
                    }))}
                  />
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button
                      variant="secondary"
                      onClick={() => setShowConditionModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => setShowConditionModal(false)}>
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        {isViewing && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>View Mode:</strong> This template is in read-only mode. Use the Edit button to make changes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;
