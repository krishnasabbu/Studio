import React from 'react';
import { useDrop } from 'react-dnd';
import { v4 as uuidv4 } from 'uuid';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import {
  addComponentToWidget,
  selectComponent,
  moveComponent, // assumes you have this action created in your slice
} from '../../store/slices/emailEditorSlice';
import { Widget } from '../../store/slices/emailEditorSlice';
import EmailComponentRenderer from './EmailComponentRenderer';
import { ComponentType } from './DraggableComponent';
import { GripVertical } from 'lucide-react';

interface WidgetRendererProps {
  widget: Widget;
}

const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget }) => {
  const dispatch = useAppDispatch();
  const { selectedComponent } = useAppSelector(state => state.emailEditor);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'component',
    drop: (item: ComponentType) => {
      if (item.allowedWidgets.includes(widget.type)) {
        const newComponent = {
          id: uuidv4(),
          type: item.type,
          content: item.defaultContent,
          properties: item.defaultProperties,
          order: widget.components.length,
          widgetId: widget.id,
        };
        dispatch(addComponentToWidget({ widgetId: widget.id, component: newComponent }));
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const handleComponentClick = (component: any, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(selectComponent(component));
  };

  const getWidgetTitle = (type: string) => {
    switch (type) {
      case 'HeaderWidget': return 'Header Widget';
      case 'BodyWidget': return 'Body Widget';
      case 'FooterWidget': return 'Footer Widget';
      default: return 'Widget';
    }
  };

  const getWidgetColor = (type: string) => {
    switch (type) {
      case 'HeaderWidget': return 'border-blue-300 bg-blue-50 dark:bg-blue-900/20';
      case 'BodyWidget': return 'border-green-300 bg-green-50 dark:bg-green-900/20';
      case 'FooterWidget': return 'border-purple-300 bg-purple-50 dark:bg-purple-900/20';
      default: return 'border-gray-300 bg-gray-50 dark:bg-gray-800';
    }
  };

  const sortedComponents = [...widget.components].sort((a, b) => a.order - b.order);

  return (
    <div
      className={`border-2 rounded-lg p-4 transition-all duration-200 ${
        selectedComponent?.id === widget.id ? 'ring-2 ring-blue-500' : ''
      } ${getWidgetColor(widget.type)} ${
        isOver ? 'border-dashed border-blue-400' : 'border-solid'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {getWidgetTitle(widget.type)}
          </h3>
        </div>
      </div>

      <div
        ref={drop}
        className={`min-h-24 rounded border-2 border-dashed transition-all duration-200 ${
          isOver ? 'border-blue-400 bg-blue-100 dark:bg-blue-800/30' : 'border-gray-300 dark:border-gray-600'
        }`}
      >
        {sortedComponents.length === 0 ? (
          <div className="flex items-center justify-center h-24">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Drop components here
            </p>
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {sortedComponents.map((component, index) => (
              <div
                key={component.id}
                onClick={(e) => handleComponentClick(component, e)}
                className={`cursor-pointer rounded transition-all duration-200 ${
                  selectedComponent?.id === component.id
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:bg-white dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <EmailComponentRenderer component={component} />
                  <div className="flex flex-col ml-2 space-y-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(moveComponent({
                          widgetId: widget.id,
                          componentId: component.id,
                          direction: 'up',
                        }));
                      }}
                      disabled={index === 0}
                      className="text-xs text-gray-500 hover:text-blue-600 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(moveComponent({
                          widgetId: widget.id,
                          componentId: component.id,
                          direction: 'down',
                        }));
                      }}
                      disabled={index === sortedComponents.length - 1}
                      className="text-xs text-gray-500 hover:text-blue-600 disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WidgetRenderer;
