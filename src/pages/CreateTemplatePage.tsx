import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import {
  useGetTemplateQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
} from '../services/api';
import {
  setCurrentTemplate,
} from '../store/slices/emailEditorSlice';
import Tabs from '../components/ui/Tabs';
import TemplateDesignStep from './TemplateDesignStep';
import TemplateCreationForm from './TemplateCreationForm';
import Button from '../components/ui/Button';
import { Download, Eye, Languages, Save, X } from 'lucide-react';
import DynamicVariablesTab from './DynamicVariablesTab';
import { v4 as uuidv4 } from 'uuid';

const CreateTemplatePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentTemplate } = useAppSelector((state) => state.emailEditor);
  const { permissions } = useAppSelector((state) => state.auth);

  const [templateId, setTemplateId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('creation');
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enabledTabs, setEnabledTabs] = useState<string[]>(['creation']);

  const [formData, setFormData] = useState({
    messageTypeId: '',
    messageName: '',
    channel: '',
    language: '',
  });

  const [dynamicVariables, setDynamicVariables] = useState<
    { id: string; variableName: string; formatter: string }[]
  >([]);

  const { data: existingTemplate, isLoading: isLoadingTemplate } =
    useGetTemplateQuery(templateId!, {
      skip: !templateId,
    });

  const [createTemplate] = useCreateTemplateMutation();
  const [updateTemplate] = useUpdateTemplateMutation();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const isViewMode = window.location.pathname.includes('/view/');
    
    if (id) {
      setTemplateId(id);
      if (isViewMode) {
        setIsViewing(true);
        setIsEditing(false);
      } else {
        setIsEditing(true);
        setIsViewing(false);
      }
    } else if (window.location.pathname.includes('/view/')) {
      const pathParts = window.location.pathname.split('/');
      const viewId = pathParts[pathParts.length - 1];
      if (viewId) {
        setTemplateId(viewId);
        setIsViewing(true);
        setIsEditing(false);
      }
    }
  }, []);

  useEffect(() => {
    if (existingTemplate) {
      setFormData({
        messageTypeId: existingTemplate.messageTypeId,
        messageName: existingTemplate.messageName,
        channel: existingTemplate.channel,
        language: existingTemplate.language,
      });
      setDynamicVariables(existingTemplate.dynamicVariables || []);
      dispatch(setCurrentTemplate(existingTemplate));
      setEnabledTabs(['creation', 'variables', 'design']);
    }
  }, [existingTemplate, dispatch]);

  const validateForm = () => {
    if (isViewing) return true; // Skip validation in view mode
    
    const newErrors: Record<string, string> = {};
    if (!formData.messageTypeId.trim())
      newErrors.messageTypeId = 'Message Type ID is required';
    if (!formData.messageName.trim())
      newErrors.messageName = 'Message Name is required';
    if (!formData.channel) newErrors.channel = 'Channel must be selected';
    if (!formData.language) newErrors.language = 'Language is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextFromCreation = (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewing) return;
    
    if (!validateForm()) return;

    const templateData = {
      id: isEditing ? templateId! : Date.now().toString(),
      messageTypeId: formData.messageTypeId.trim(),
      messageName: formData.messageName.trim(),
      channel: formData.channel,
      language: formData.language,
      status: 'draft' as const,
      content: '',
      createdAt: existingTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: formData.channel.includes('External Email') ||
        formData.channel.includes('Secure Inbox')
        ? 'Email'
        : 'Push',
      widgets: existingTemplate?.widgets || [],
      dynamicVariables,
    };

    dispatch(setCurrentTemplate(templateData));
    setEnabledTabs(['creation', 'variables']);
    setActiveTab('variables');
  };

  const handleNextFromVariables = () => {
    if (isViewing) return;
    
    dispatch(
      setCurrentTemplate({
        ...currentTemplate!,
        dynamicVariables,
      })
    );
    setEnabledTabs(['creation', 'variables', 'design']);
    setActiveTab('design');
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleSaveTemplate = async () => {
    if (isViewing) return;
    
    if (currentTemplate) {
      try {
        const updatedTemplate = {
          ...currentTemplate,
          dynamicVariables,
        };

        if (isEditing) {
          await updateTemplate(updatedTemplate).unwrap();
        } else {
          await createTemplate(updatedTemplate).unwrap();
        }

        navigate('/dashboard');
      } catch (error) {
        console.error('Failed to save template:', error);
        alert('Failed to save template. Please try again.');
      }
    }
  };

  const handleAddVariable = () => {
    if (isViewing) return;
    
    setDynamicVariables((prev) => [
      ...prev,
      { id: uuidv4(), variableName: '', formatter: '' },
    ]);
  };

  const handleRemoveVariable = (id: string) => {
    if (isViewing) return;
    
    setDynamicVariables((prev) => prev.filter((v) => v.id !== id));
  };

  const handleVariableChange = (
    id: string,
    field: 'variableName' | 'formatter',
    value: string
  ) => {
    if (isViewing) return;
    
    setDynamicVariables((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const hasPermission = (permission: string) =>
    permissions.includes(permission as any);

  const isEmailTemplate =
    formData.channel === 'External Email' ||
    formData.channel?.includes('Secure Inbox');

  const tabs = [
    {
      id: 'creation',
      label: 'Template Creation',
      content: (
        <TemplateCreationForm
          formData={formData}
          errors={errors}
          isSubmitting={isSubmitting}
          isViewing={isViewing}
          setFormData={setFormData}
          handleCancel={handleCancel}
          handleNext={handleNextFromCreation}
        />
      ),
    },
    {
      id: 'variables',
      label: 'Dynamic Variables',
      content: (
        <div className="space-y-4">
          <DynamicVariablesTab
            dynamicVariables={dynamicVariables}
            isViewing={isViewing}
            onAddVariable={handleAddVariable}
            onRemoveVariable={handleRemoveVariable}
            onChangeVariable={handleVariableChange}
          />
          {!isViewing && (
            <div className="flex justify-end">
              <Button onClick={handleNextFromVariables} variant="primary">
                Next
              </Button>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'design',
      label: !formData.channel
        ? 'Template Design'
        : isEmailTemplate
        ? 'Email Template Design'
        : 'Push/SMS Template Design',
      content: <TemplateDesignStep isEmailTemplate={isEmailTemplate} isViewing={isViewing} />,
    },
  ];

  const filteredTabs = tabs.map((tab) => ({
    ...tab,
    disabled: !enabledTabs.includes(tab.id),
  }));

  if (isLoadingTemplate) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
            {isViewing 
              ? `View Template: ${formData.messageName || 'Template'}`
              : formData.messageName
              ? formData.messageName
              : 'Create New Template'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isViewing
              ? 'Read-only view of template configuration'
              : activeTab === 'creation'
              ? 'Set up template metadata'
              : 'Design your template layout'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 ml-4">
          {!isViewing && (hasPermission('create') || hasPermission('update')) && (
            <Button variant="primary" onClick={handleSaveTemplate}>
              <Save className="h-4 w-4 mr-2" />
              Save as Draft
            </Button>
          )}

          {!isViewing && activeTab === 'design' && (
            <>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline">
                <Languages className="h-4 w-4 mr-2" />
                Translate to Spanish
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Format Requirements
              </Button>
            </>
          )}
          
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <X className="h-4 w-4 mr-2" />
            {isViewing ? 'Close' : 'Cancel'}
          </Button>
        </div>
      </div>
      <Tabs
        tabs={filteredTabs}
        activeTab={activeTab}
        onTabChange={(id) => {
          if (isViewing || enabledTabs.includes(id)) setActiveTab(id);
        }}
      />
    </div>
  );
};

export default CreateTemplatePage;
