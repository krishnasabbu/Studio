/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Card from '../components/ui/Card';
import DraggableComponent, { componentTypes, widgetTypes } from '../components/email-editor/DraggableComponent';
import DroppableZone from '../components/email-editor/DroppableZone';
import PropertiesPanel from '../components/email-editor/PropertiesPanel';
import { Package, Layers, ChevronDown, ChevronRight } from 'lucide-react';

interface EmailTemplatePageProps {
  isViewing?: boolean;
}

const EmailTemplatePage: React.FC<EmailTemplatePageProps> = ({ isViewing = false }) => {
  const [showWidgets, setShowWidgets] = useState(false);
  const [showComponents, setShowComponents] = useState(false);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <div className="grid grid-cols-12 gap-6 h-full">
          {/* Left Panel - Draggable Items */}
          {!isViewing && (
            <div className="col-span-2 space-y-4">
              {/* Widgets Panel */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Widgets
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowWidgets(!showWidgets)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    {showWidgets ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                </div>
                {showWidgets && (
                  <div className="space-y-3">
                    {widgetTypes.map((widget) => (
                      <DraggableComponent key={widget.id} item={widget} />
                    ))}
                  </div>
                )}
              </Card>

              {/* Components Panel */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Layers className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Components
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowComponents(!showComponents)}
                    className="text-green-500 hover:text-green-700"
                  >
                    {showComponents ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                </div>
                {showComponents && (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {componentTypes.map((component) => (
                      <DraggableComponent key={component.id} item={component} />
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Center Panel - Droppable Zone */}
          <div className={isViewing ? "col-span-8" : "col-span-6"}>
            <Card className="p-4 h-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {isViewing ? 'Email Template Preview' : 'Email Template Builder'}
              </h3>
              <DroppableZone isViewing={isViewing} />
            </Card>
          </div>

          {/* Right Panel - Properties */}
          <div className={isViewing ? "col-span-4" : "col-span-4"}>
            <Card className="h-full">
              <PropertiesPanel isViewing={isViewing} />
            </Card>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default EmailTemplatePage;