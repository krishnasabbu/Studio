import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Template {
  id: string;
  messageTypeId: string;
  messageName: string;
  channels: string;
  language: string;
  status: 'draft' | 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  content?: {
    subject?: string;
    header?: string;
    body?: string;
    footer?: string;
    properties?: Record<string, any>;
  };
}

interface TemplatesState {
  templates: Template[];
  loading: boolean;
  error: string | null;
}

const initialState: TemplatesState = {
  templates: [],
  loading: false,
  error: null,
};

const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    setTemplates: (state, action: PayloadAction<Template[]>) => {
      state.templates = action.payload;
    },
    addTemplate: (state, action: PayloadAction<Template>) => {
      state.templates.push(action.payload);
    },
    updateTemplate: (state, action: PayloadAction<Template>) => {
      const index = state.templates.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.templates[index] = action.payload;
      }
    },
    deleteTemplate: (state, action: PayloadAction<string>) => {
      state.templates = state.templates.filter(t => t.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setTemplates, addTemplate, updateTemplate, deleteTemplate, setLoading, setError } = templatesSlice.actions;
export default templatesSlice.reducer;