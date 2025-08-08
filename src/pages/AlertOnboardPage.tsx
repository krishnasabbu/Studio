import React, { useState } from 'react';
import Button from '../components/ui/Button';
import Tabs from '../components/ui/Tabs';
import { useAppSelector } from '../hooks/useRedux';
import { Download } from 'lucide-react';
import OnboardTab from './OnboardTab';
import TemplateMappingTab from './TemplateMappingTab';
import FeaturesMappingTab from './FeaturesMappingTab';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGetTemplatesQuery, useGetJiraDataQuery, useCreateAlertMutation, useUpdateAlertMutation, useGetAlertQuery } from '../services/api';

const AlertOnboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const alertId = searchParams.get('id');
  const isEditing = Boolean(alertId);
  
  const { data: templates = [], isLoading: isLoadingTemplates } = useGetTemplatesQuery();
  const { data: existingAlert, isLoading: isLoadingAlert } = useGetAlertQuery(alertId!, {
    skip: !alertId,
  });
  const [createAlert, { isLoading: isCreatingAlert }] = useCreateAlertMutation();
  const [updateAlert, { isLoading: isUpdatingAlert }] = useUpdateAlertMutation();
  
  const [activeTab, setActiveTab] = useState('onboard');
  
  // Alert name
  const [alertName, setAlertName] = useState('');
  
  // Onboard tab state
  const [jiraId, setJiraId] = useState('');
  const [isLoadingJira, setIsLoadingJira] = useState(false);
  const [onboardFields, setOnboardFields] = useState({
    field1: '',
    field2: '',
    field3: '',
    field4: '',
    field5: '',
    field6: '',
    field7: '',
    field8: '',
    field9: '',
    field10: '',
  });

  // Template Mapping state
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

  // Features Mapping state
  const [availableFeatures] = useState([
    'Email Notifications',
    'Push Notifications',
    'SMS Alerts',
    'In-App Messages',
    'Webhook Integration',
    'Scheduled Delivery',
    'A/B Testing',
    'Analytics Tracking',
    'Multi-language Support',
    'Template Versioning',
    'Dynamic Content',
    'Personalization',
  ]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  // Load existing alert data when editing
  React.useEffect(() => {
    if (existingAlert) {
      setAlertName(existingAlert.name || '');
      setJiraId(existingAlert.jiraId || '');
      setOnboardFields(existingAlert.fields || {
        field1: '', field2: '', field3: '', field4: '', field5: '',
        field6: '', field7: '', field8: '', field9: '', field10: '',
      });
      setSelectedTemplates(existingAlert.selectedTemplates || []);
      setSelectedFeatures(existingAlert.selectedFeatures || []);
    }
  }, [existingAlert]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleAlertNameChange = React.useCallback((value: string) => {
    setAlertName(value);
  }, []);

  const handleJiraIdChange = React.useCallback((value: string) => {
    setJiraId(value);
  }, []);

  const handleOnboardFieldChange = React.useCallback((field: string, value: string) => {
    setOnboardFields(prev => ({ ...prev, [field]: value }));
  }, []);
  const tabOrder = ['onboard', 'template-mapping', 'features-mapping'];
  const currentTabIndex = tabOrder.indexOf(activeTab);

  const handleNext = () => {
    if (currentTabIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentTabIndex + 1]);
    }
  };

  const handleBack = () => {
    if (currentTabIndex > 0) {
      setActiveTab(tabOrder[currentTabIndex - 1]);
    }
  };
  const handleLoadJira = async () => {
    if (!jiraId.trim()) return;
    
    setIsLoadingJira(true);
    try {
      const response = await fetch(`http://localhost:3001/jiraData?jiraId=${jiraId.trim()}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        setOnboardFields(data[0].data);
      } else {
        // Fallback to mock data if JIRA ID not found
        setOnboardFields({
          field1: 'Alert Type: Security',
          field2: 'Priority: High',
          field3: 'Category: Authentication',
          field4: 'Severity: Critical',
          field5: 'Department: IT Security',
          field6: 'Escalation Level: 2',
          field7: 'Response Time: 15 minutes',
          field8: 'Notification Frequency: Immediate',
          field9: 'Target Audience: All Users',
          field10: 'Compliance Required: Yes',
        });
      }
    } catch (error) {
      console.error('Failed to load JIRA data:', error);
      alert('Failed to load JIRA data. Please try again.');
    } finally {
      setIsLoadingJira(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleOnboard = async () => {
    try {
      const alertData = {
        ...(isEditing && { id: alertId }),
        name: alertName,
        jiraId,
        status: 'Draft',
        fields: onboardFields,
        selectedTemplates,
        selectedFeatures,
      };
      
      if (isEditing) {
        await updateAlert(alertData).unwrap();
        //alert('Alert updated successfully!');
      } else {
        await createAlert(alertData).unwrap();
        //alert('Alert onboarded successfully!');
      }
      
      console.log('Alert Data:', JSON.stringify(alertData, null, 2));
      
      // Reset form
      setAlertName('');
      setJiraId('');
      setOnboardFields({
        field1: '', field2: '', field3: '', field4: '', field5: '',
        field6: '', field7: '', field8: '', field9: '', field10: '',
      });
      setSelectedTemplates([]);
      setSelectedFeatures([]);
      setActiveTab('onboard');
      navigate('/alerts-dashboard');
    } catch (error) {
      console.error('Failed to create onboard:', error);
      //alert('Failed to complete onboard. Please try again.');
    }
  };

  const tabs = [
    { 
      id: 'onboard', 
      label: 'Onboard', 
      content: (
        <div className="space-y-6">
          <OnboardTab
            alertName={alertName}
            handleAlertNameChange={handleAlertNameChange}
            isLoadingJira={isLoadingJira}
            jiraId={jiraId}
            handleJiraIdChange={handleJiraIdChange}
            handleLoadJira={handleLoadJira}
            onboardFields={onboardFields}
            handleOnboardFieldChange={handleOnboardFieldChange}
          />
          <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={handleNext} disabled={currentTabIndex >= tabOrder.length - 1}>
              Next
            </Button>
          </div>
        </div>
      )
    },
    { 
      id: 'template-mapping', 
      label: 'Template Mapping', 
      content: (
        <div className="space-y-6">
          <TemplateMappingTab
            templates={templates}
            selectedTemplates={selectedTemplates}
            handleTemplateSelect={handleTemplateSelect}
          />
          <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={handleBack} disabled={currentTabIndex <= 0}>
              Back
            </Button>
            <Button onClick={handleNext} disabled={currentTabIndex >= tabOrder.length - 1}>
              Next
            </Button>
          </div>
        </div>
      )
    },
    { 
      id: 'features-mapping', 
      label: 'Features Mapping', 
      content: (
        <div className="space-y-6">
          <FeaturesMappingTab
            allFeatures={availableFeatures}
            selectedFeatures={selectedFeatures}
            setSelectedFeatures={setSelectedFeatures}
          />
          <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={handleBack} disabled={currentTabIndex <= 0}>
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleOnboard}
              className="px-8"
            >
              <Download className="h-4 w-4 mr-2" />
              Onboard
            </Button>
          </div>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Alert Onboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure alert onboarding with JIRA integration, template mapping, and feature selection
          </p>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

    </div>
  );
};

export default AlertOnboardPage;