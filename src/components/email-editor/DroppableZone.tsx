import React from 'react';
import { useDrop } from 'react-dnd';
import { v4 as uuidv4 } from 'uuid';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import {
  addWidget,
  moveWidget,
  selectComponent,
} from '../../store/slices/emailEditorSlice';
import WidgetRenderer from './WidgetRenderer';
import { WidgetType } from './DraggableComponent';

interface DroppableZoneProps {
  isViewing?: boolean;
}

const DroppableZone: React.FC<DroppableZoneProps> = ({ isViewing = false }) => {
  const dispatch = useAppDispatch();
  const { widgets } = useAppSelector((state) => state.emailEditor);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'widget',
    drop: (item: WidgetType) => {
      if (isViewing) return;
      
      const newWidget = {
        id: uuidv4(),
        type: item.type,
        components: [],
        order: widgets.length,
      };
      dispatch(addWidget(newWidget));
    },
    collect: (monitor) => ({
      isOver: !isViewing && monitor.isOver(),
    }),
  }));

  const handleWidgetClick = (widget: any) => {
    if (isViewing) return;
    dispatch(selectComponent(widget));
  };

  const handleMove = (
    e: React.MouseEvent<HTMLButtonElement>,
    widgetId: string,
    direction: 'up' | 'down'
  ) => {
    if (isViewing) return;
    e.stopPropagation(); // Prevent triggering widget click
    dispatch(moveWidget({ widgetId, direction }));
  };

  return (
    <div
      ref={drop}
      className={`min-h-96 p-6 border-2 ${isViewing ? 'border-solid' : 'border-dashed'} rounded-lg transition-all duration-200 ${
        isOver
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
          : isViewing
          ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
          : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
      }`}
    >
      {widgets.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {isViewing 
              ? 'No widgets configured for this template'
              : 'Drag widgets here to build your email template'
            }
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {[...widgets]
            .sort((a, b) => a.order - b.order)
            .map((widget, index) => (
              <div key={widget.id} className="space-y-1 border rounded-lg p-2">
                {/* Move buttons */}
                {!isViewing && (
                  <div className="flex justify-end space-x-2 text-xs text-gray-500">
                    <button
                      onClick={(e) => handleMove(e, widget.id, 'up')}
                      disabled={index === 0}
                      className="hover:text-blue-600 disabled:opacity-30"
                    >
                      ↑ Move Up
                    </button>
                    <button
                      onClick={(e) => handleMove(e, widget.id, 'down')}
                      disabled={index === widgets.length - 1}
                      className="hover:text-blue-600 disabled:opacity-30"
                    >
                      ↓ Move Down
                    </button>
                  </div>
                )}

                {/* Widget content */}
                <div
                  onClick={() => handleWidgetClick(widget)}
                  className={isViewing ? "cursor-default" : "cursor-pointer"}
                >
                  <WidgetRenderer widget={widget} isViewing={isViewing} />
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default DroppableZone;
