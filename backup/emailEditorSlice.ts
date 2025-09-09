import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

export interface Widget {
  id: string;
  type: 'HeaderWidget' | 'BodyWidget' | 'FooterWidget';
  components: EmailComponent[];
  order: number;
}

export interface EmailComponent {
  id: string;
  type: 'Subject' | 'PageHeader' | 'IllustrationImage' | 'SubHeader' | 'SubHeader2' | 
        'OrderedBullet' | 'UnorderedBullet' | 'CTA' | 'Links' | 'TwoColumnTable' | 
        'DynamicTable' | 'BodyText' | 'Divider' | 'Conditions' | 'PhoneNumber' |
        'FooterText' | 'FooterIcons' | 'ContactDetails';
  content: string;
  widgetId?: string;
  properties: {
    color?: string;
    alignment?: 'left' | 'center' | 'right';
    fontSize?: string;
    fontWeight?: string;
    spacing?: string;
    backgroundColor?: string;
    borderColor?: string;
    [key: string]: any;
  };
  order: number;
}

export interface EmailTemplate {
  id: string;
  messageTypeId: string;
  messageName: string;
  channel: string,
  language: string,
  type: string,
  content: string,
  dynamicVariables?: Array<{
    id: string;
    variableName: string;
    formatter: string;
  }>;
  conditionGroups?: Array<{
    id: string; // unique ID for each condition group
    name: string; // a reference name for the group
    logic: 'AND' | 'OR';
    conditions: Array<{
      field: string; // reference to a dynamic variable or field
      operator: string;
      value: string;
    }>;
    displayValue: string; // optional text if matched
  }>;
  widgets: Widget[];
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published';
}

interface EmailEditorState {
  currentTemplate: EmailTemplate | null;
  widgets: Widget[];
  selectedComponent: EmailComponent | Widget | null;
  draggedComponent: EmailComponent | null;
  templates: EmailTemplate[];
  loading: boolean;
  error: string | null;
}

const initialState: EmailEditorState = {
  currentTemplate: null,
  widgets: [],
  selectedComponent: null,
  draggedComponent: null,
  templates: [],
  loading: false,
  error: null,
};

const emailEditorSlice = createSlice({
  name: 'emailEditor',
  initialState,
  reducers: {
    setCurrentTemplate: (state, action: PayloadAction<EmailTemplate | null>) => {
      state.currentTemplate = action.payload;
      state.widgets = action.payload?.widgets || [];
    },
    addWidget: (state, action: PayloadAction<Widget>) => {
      const newWidget = {
        ...action.payload,
        id: uuidv4(),
        order: state.widgets.length,
        components: []
      };
      state.widgets.push(newWidget);
      if (state.currentTemplate) {
        state.currentTemplate.widgets = state.widgets;
      }
    },
    addComponentToWidget: (state, action: PayloadAction<{ widgetId: string; component: EmailComponent }>) => {
      const widget = state.widgets.find(w => w.id === action.payload.widgetId);
      if (widget) {
        const componentWithWidget = {
          ...action.payload.component,
          id: uuidv4(),
          widgetId: action.payload.widgetId,
          order: widget.components.length,
        };
        widget.components.push(componentWithWidget);
        if (state.currentTemplate) {
          state.currentTemplate.widgets = state.widgets;
        }
      }
    },
    moveComponent: (state, action: PayloadAction<{ widgetId: string; componentId: string; direction: 'up' | 'down' }>) => {
      const widget = state.widgets.find(w => w.id === action.payload.widgetId);
      if (widget) {
        const idx = widget.components.findIndex(c => c.id === action.payload.componentId);
        if (idx === -1) return;

        const swapWith = action.payload.direction === 'up' ? idx - 1 : idx + 1;
        if (swapWith < 0 || swapWith >= widget.components.length) return;

        const temp = widget.components[idx];
        widget.components[idx] = widget.components[swapWith];
        widget.components[swapWith] = temp;

        // Update order values if needed
        widget.components[idx].order = idx;
        widget.components[swapWith].order = swapWith;
      }
    },
    moveWidget: (
      state,
      action: PayloadAction<{ widgetId: string; direction: 'up' | 'down' }>
    ) => {
      const { widgetId, direction } = action.payload;
      const index = state.widgets.findIndex((w) => w.id === widgetId);
      if (index === -1) return;

      const swapWith = direction === 'up' ? index - 1 : index + 1;
      if (swapWith < 0 || swapWith >= state.widgets.length) return;

      // Swap widgets
      const widgets = [...state.widgets];
      [widgets[index], widgets[swapWith]] = [widgets[swapWith], widgets[index]];

      // ✅ Reassign order based on new position
      widgets.forEach((w, i) => {
        w.order = i;
      });

      // ✅ Save updated widgets back to state
      state.widgets = widgets;
    },
    moveComponentUp: (state, action: PayloadAction<{ widgetId: string; componentId: string }>) => {
      const widget = state.widgets.find(w => w.id === action.payload.widgetId);
      if (widget) {
        const idx = widget.components.findIndex(c => c.id === action.payload.componentId);
        if (idx > 0) {
          [widget.components[idx - 1], widget.components[idx]] = [widget.components[idx], widget.components[idx - 1]];
          widget.components[idx - 1].order = idx - 1;
          widget.components[idx].order = idx;
        }
      }
    },
    moveComponentDown: (state, action: PayloadAction<{ widgetId: string; componentId: string }>) => {
      const widget = state.widgets.find(w => w.id === action.payload.widgetId);
      if (widget) {
        const idx = widget.components.findIndex(c => c.id === action.payload.componentId);
        if (idx < widget.components.length - 1) {
          [widget.components[idx + 1], widget.components[idx]] = [widget.components[idx], widget.components[idx + 1]];
          widget.components[idx + 1].order = idx + 1;
          widget.components[idx].order = idx;
        }
      }
    },
    updateComponent: (
      state,
      action: PayloadAction<{ id: string; changes: Partial<EmailComponent> }>
    ) => {
      const { id, changes } = action.payload;

      for (const widget of state.widgets) {
        const componentIndex = widget.components.findIndex(c => c.id === id);
        if (componentIndex !== -1) {
          // Replace the specific component immutably
          const updatedComponent = {
            ...widget.components[componentIndex],
            ...changes,
          };

          // Update in widget
          widget.components = [
            ...widget.components.slice(0, componentIndex),
            updatedComponent,
            ...widget.components.slice(componentIndex + 1),
          ];

          // Also update selectedComponent if it's the one being edited
          if (state.selectedComponent?.id === id) {
            state.selectedComponent = { ...updatedComponent };
          }

          // If currentTemplate exists, update its widgets
          if (state.currentTemplate) {
            state.currentTemplate.widgets = [...state.widgets];
          }

          break;
        }
      }
    },
    updateWidget: (state, action: PayloadAction<Widget>) => {
      const index = state.widgets.findIndex(w => w.id === action.payload.id);
      if (index !== -1) {
        state.widgets[index] = { ...action.payload };
        if (state.currentTemplate) {
          state.currentTemplate.widgets = state.widgets;
        }
      }
    },
    removeComponent: (state, action: PayloadAction<string>) => {
      for (const widget of state.widgets) {
        widget.components = widget.components.filter(c => c.id !== action.payload);
      }
      if (state.currentTemplate) {
        state.currentTemplate.widgets = state.widgets;
      }
    },
    removeWidget: (state, action: PayloadAction<string>) => {
      state.widgets = state.widgets.filter(w => w.id !== action.payload);
      if (state.currentTemplate) {
        state.currentTemplate.widgets = state.widgets;
      }
    },
    reorderWidgets: (state, action: PayloadAction<Widget[]>) => {
      state.widgets = action.payload.map((widget, index) => ({
        ...widget,
        order: index
      }));
      if (state.currentTemplate) {
        state.currentTemplate.widgets = state.widgets;
      }
    },
    reorderComponentsInWidget: (state, action: PayloadAction<{ widgetId: string; components: EmailComponent[] }>) => {
      const widget = state.widgets.find(w => w.id === action.payload.widgetId);
      if (widget) {
        widget.components = action.payload.components.map((component, index) => ({
          ...component,
          order: index
        }));
      }
    },
    selectComponent: (
      state,
      action: PayloadAction<EmailComponent | Widget | null>
    ) => {
      const payload = action.payload;

      if (payload) {
        // Clone to prevent shared references
        state.selectedComponent = JSON.parse(JSON.stringify(payload));
      } else {
        state.selectedComponent = null;
      }
    },
    setDraggedComponent: (state, action: PayloadAction<EmailComponent | null>) => {
      state.draggedComponent = action.payload;
    },
    setTemplates: (state, action: PayloadAction<EmailTemplate[]>) => {
      state.templates = action.payload;
    },
    saveTemplate: (state, action: PayloadAction<EmailTemplate>) => {
      const index = state.templates.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.templates[index] = action.payload;
      } else {
        state.templates.push(action.payload);
      }
      state.currentTemplate = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCurrentTemplate,
  addWidget,
  moveWidget,
  moveComponent,
  moveComponentUp,
  moveComponentDown,
  addComponentToWidget,
  updateComponent,
  updateWidget,
  removeComponent,
  removeWidget,
  reorderWidgets,
  reorderComponentsInWidget,
  selectComponent,
  setDraggedComponent,
  setTemplates,
  saveTemplate,
  setLoading,
  setError,
} = emailEditorSlice.actions;

export default emailEditorSlice.reducer;