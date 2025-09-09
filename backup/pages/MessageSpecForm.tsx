import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Plus, X, Info, Settings, Truck, Cog, Monitor, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { MessageSpec } from '../types/messageSpec';
import { mockMessageSpecs } from '../data/mockMessageSpecs';

const MessageSpecForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const isViewing = location.pathname.includes('/view');

  const [activeTab, setActiveTab] = useState('basic');
  const [completedTabs, setCompletedTabs] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Field descriptions for tooltips
  const fieldDescriptions: Record<string, string> = {
    name: 'Unique identifier for this message specification. Used for tracking and reference across systems.',
    category: 'Select the primary delivery channel category for this message (email, SMS, push notification, or in-app).',
    description: 'Detailed description of the message purpose, business requirements, and functional requirements (FR Name).',
    figmaLink: 'Link to Figma design specifications and mockups for this message template.',
    owningBusinessLine: 'The business unit or division responsible for this message specification.',
    nameOfSubBusiness: 'Specific sub-division, department, or team within the owning business line.',
    businessLineContact: 'Primary contact person or team for business-related questions and approvals.',
    messagePurpose: 'Clear explanation of why this message is sent and the business value it provides to customers.',
    triggerEvent: 'Specific event, condition, or business rule that triggers this message to be sent.',
    volumeEstimate: 'Expected number of messages to be sent per day, week, or month for capacity planning.',
    regulatory: 'Indicates if this message is required for regulatory compliance or legal obligations.',
    tier: 'Priority classification that determines processing order and service level agreements.',
    type: 'Template type - Regular (full template) or Shell (basic template structure).',
    deliveryChannels: 'All available delivery methods for this message (can select multiple channels).',
    language: 'Supported languages for message content and localization requirements.',
    branding: 'Brand theme and visual identity to apply to the message template.',
    brandValue: 'How the brand value is determined - from database, request parameter, or business rules.',
    coBrandRequirements: 'Specific co-branding requirements including logos, colors, and partner branding guidelines.',
    wimSac: 'Eligibility for WIM SAC (Wealth and Investment Management Special Access Customers).',
    cobrandAccounts: 'Whether co-branded accounts (partner bank accounts) are eligible to receive this message.',
    smallBusiness: 'Eligibility for Small Business and Line of Credit account holders.',
    adaTesting: 'Whether accessibility testing is required to comply with ADA (Americans with Disabilities Act).',
    customerServiceInfo: 'Customer support contact information and instructions to include in the message.',
    illustrationImage: 'Whether the message requires images, illustrations, or visual elements.',
    attachment: 'Whether the message includes file attachments like PDFs, statements, or documents.',
    encryptedEmail: 'Use encrypted email delivery through Zix for sensitive or confidential information.',
    alertSentTo: 'Target recipient type - online banking users, non-users, prospects, or mixed audience.',
    relationshipToAccount: 'Required account relationship (Owner, Joint Owner, Primary Borrower, etc.).',
    userOrAccountBased: 'Whether targeting is based on individual users or account-level criteria.',
    apsConfigFields: 'Alert Processing System configuration parameters and behavioral settings.',
    secureInboxDeliveryChannel: 'Delivery channel identifier for secure inbox message routing.',
    secureInboxTab: 'Which tab in the secure inbox interface should display this message.',
    secureInboxExpirationDays: 'Number of days the message remains visible in the secure inbox before expiring.',
    secureInboxHighPriority: 'Whether to mark this message as high priority in the secure inbox.',
    fromAddressLabel: 'Display name that appears as the sender in email messages.',
    smsDeliveryChannel: 'SMS delivery channel configuration and routing information.',
    smsOptInParameter: 'SMS opt-in requirement level - full opt-in, one-time, or conditional.',
    shortCode: 'SMS short code number used for sending text messages.',
    subscription: 'Whether this message requires subscription management and user preferences.',
    subscriptionType: 'Default subscription behavior - opt-in (user must subscribe) or opt-out (user must unsubscribe).',
    manageAlertsTab: 'Tab name in the alert management interface where users can control this message.',
    subscriptionPageVerbiage: 'Text displayed at the top of the subscription management page.',
    navigationToSubscription: 'URL or navigation path to the subscription management page.',
    deliveryOptions: 'Available delivery methods that users can choose from in their preferences.',
    parameters: 'Dynamic parameters and variables used in the message template for personalization.',
    specialRequirements: 'Any special processing, handling, or technical requirements for this message.',
    productCodeMapping: 'Mapping of product codes to different message variants or content.',
    processing: 'Processing method and workflow for handling this message type.',
    upstreamSystemsFlow: 'Description of how data flows from upstream systems to trigger this message.',
    upstreamTechnicalContact: 'Technical contact person for upstream system integration and troubleshooting.',
    alertsProcessingJourney: 'Processing workflow type that determines how the message is handled and routed.',
    processingSlaQueue: 'Service level agreement for message processing time and priority queue.',
    triggerType: 'Technical method used to trigger the message (Kafka, MQ, Web Service, or Batch).',
    process: 'Processing method - Alerts Express (fast processing) or Normal (standard processing).',
    bounceBackProcessing: 'How email bounce backs and delivery failures are handled and processed.',
    sorEnhancedBounceback: 'Enhanced bounce back processing flow using System of Record integration.',
    feedbackTopicQueue: 'Message queue used for processing delivery feedback and status updates.',
    zlArchiveRequired: 'Whether messages must be archived in the ZL (Zero Latency) archive system.',
    messageRequestExpiration: 'How long message requests remain valid before expiring.',
    safeMode: 'Enable safe mode processing with additional validation and error checking.',
    monitoringRequirements: 'Monitoring, alerting, and observability requirements for this message.',
    errorRemediationPlan: 'Plan and procedures for handling errors, failures, and remediation steps.',
    links: 'Links and URLs that will be included in the message content.',
    cta: 'Primary call-to-action button text and behavior for the message.',
    uLinks: 'Universal links for mobile app deep linking and cross-platform navigation.',
    samlLinks: 'Links that require SAML authentication and single sign-on integration.',
    externalLinks: 'Links to external websites outside of Wells Fargo domains.',
    pushToken: 'Push notification token and configuration for mobile app notifications.'
  };

  const [formData, setFormData] = useState<Partial<MessageSpec>>({
    name: '',
    category: '',
    description: '',
    figmaLink: '',
    owningBusinessLine: '',
    nameOfSubBusiness: '',
    businessLineContact: '',
    messagePurpose: '',
    triggerEvent: '',
    volumeEstimate: '',
    regulatory: '',
    tier: '',
    type: '',
    deliveryChannels: [],
    language: '',
    branding: '',
    brandValue: '',
    coBrandRequirements: '',
    wimSac: '',
    cobrandAccounts: '',
    smallBusiness: '',
    adaTesting: '',
    customerServiceInfo: '',
    illustrationImage: '',
    attachment: '',
    encryptedEmail: '',
    alertSentTo: '',
    relationshipToAccount: '',
    userOrAccountBased: '',
    apsConfigFields: '',
    secureInboxDeliveryChannel: '',
    secureInboxTab: '',
    secureInboxExpirationDays: '',
    secureInboxHighPriority: '',
    fromAddressLabel: '',
    smsDeliveryChannel: '',
    smsOptInParameter: '',
    shortCode: '',
    subscription: '',
    subscriptionType: '',
    manageAlertsTab: '',
    subscriptionPageVerbiage: '',
    navigationToSubscription: '',
    deliveryOptions: [],
    parameters: '',
    specialRequirements: '',
    productCodeMapping: '',
    processing: '',
    upstreamSystemsFlow: '',
    upstreamTechnicalContact: '',
    alertsProcessingJourney: '',
    processingSlaQueue: '',
    triggerType: '',
    process: '',
    bounceBackProcessing: '',
    sorEnhancedBounceback: '',
    feedbackTopicQueue: '',
    zlArchiveRequired: '',
    messageRequestExpiration: '',
    safeMode: '',
    monitoringRequirements: '',
    errorRemediationPlan: '',
    links: '',
    cta: '',
    uLinks: '',
    samlLinks: '',
    externalLinks: '',
    pushToken: '',
    status: 'draft',
    priority: 'medium',
    tags: []
  });

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Info, color: 'text-blue-600' },
    { id: 'details', label: 'Details', icon: Settings, color: 'text-purple-600' },
    { id: 'delivery', label: 'Delivery', icon: Truck, color: 'text-green-600' },
    { id: 'processing', label: 'Processing', icon: Cog, color: 'text-orange-600' },
    { id: 'monitoring', label: 'Monitoring', icon: Monitor, color: 'text-red-600' }
  ];

  // Load existing data for editing/viewing
  useEffect(() => {
    if (isEditing && id) {
      const existingSpec = mockMessageSpecs.find(spec => spec.id === id);
      if (existingSpec) {
        setFormData(existingSpec);
      }
    }
  }, [isEditing, id]);

  const handleInputChange = (field: keyof MessageSpec, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleCheckboxChange = (field: keyof MessageSpec, value: string, checked: boolean) => {
    const currentValues = formData[field] as string[];
    if (checked) {
      handleInputChange(field, [...currentValues, value]);
    } else {
      handleInputChange(field, currentValues.filter(v => v !== value));
    }
  };

  const validateTab = (tabId: string): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    switch (tabId) {
      case 'basic':
        if (!formData.name?.trim()) {
          newErrors.name = 'Message ID is required';
          isValid = false;
        }
        if (!formData.description?.trim()) {
          newErrors.description = 'Message Description is required';
          isValid = false;
        }
        if (!formData.owningBusinessLine?.trim()) {
          newErrors.owningBusinessLine = 'Owning Business Line is required';
          isValid = false;
        }
        break;
      case 'details':
        if (!formData.tier) {
          newErrors.tier = 'Tier selection is required';
          isValid = false;
        }
        if (!formData.type) {
          newErrors.type = 'Type selection is required';
          isValid = false;
        }
        break;
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleTabChange = (tabId: string) => {
    if (validateTab(activeTab)) {
      setCompletedTabs(prev => new Set([...prev, activeTab]));
    }
    setActiveTab(tabId);
  };

  const handleNext = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      const nextTab = tabs[currentIndex + 1];
      handleTabChange(nextTab.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateTab(activeTab)) {
      console.log('Form submitted:', formData);
      navigate('/message-specs');
    }
  };

  const handleCancel = () => {
    navigate('/message-specs');
  };

  const getPageTitle = () => {
    if (isViewing) return 'View Message Specification';
    if (isEditing) return 'Edit Message Specification';
    return 'Create Message Specification';
  };

  const renderFormField = (
    label: string,
    field: keyof MessageSpec,
    type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' = 'text',
    options?: string[] | { value: string; label: string }[],
    placeholder?: string,
    required?: boolean,
    description?: string,
    showTooltip: boolean = true
  ) => {
    const hasError = errors[field];
    const tooltipText = fieldDescriptions[field];
    const baseClasses = `w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
      hasError 
        ? 'border-red-500 bg-red-50 dark:bg-red-900/10' 
        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
    } text-gray-900 dark:text-white ${isViewing ? 'bg-gray-50 dark:bg-gray-800 cursor-not-allowed' : ''}`;

    return (
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          {showTooltip && tooltipText && (
            <div className="relative ml-2 group">
              <Info className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-80 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl z-50 border border-gray-700">
                {tooltipText}
                <div className="absolute top-full left-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          )}
        </label>
        
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">{description}</p>
        )}
        
        {type === 'text' && (
          <input
            type="text"
            value={formData[field] as string || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            disabled={isViewing}
            className={baseClasses}
            aria-describedby={hasError ? `${field}-error` : undefined}
          />
        )}
        
        {type === 'textarea' && (
          <textarea
            value={formData[field] as string || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            rows={3}
            disabled={isViewing}
            className={baseClasses}
            aria-describedby={hasError ? `${field}-error` : undefined}
          />
        )}
        
        {type === 'select' && (
          <select
            value={formData[field] as string || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            disabled={isViewing}
            className={baseClasses}
            aria-describedby={hasError ? `${field}-error` : undefined}
          >
            <option value="">Select an option</option>
            {options?.map((option) => (
              <option 
                key={typeof option === 'string' ? option : option.value} 
                value={typeof option === 'string' ? option : option.value}
              >
                {typeof option === 'string' ? option : option.label}
              </option>
            ))}
          </select>
        )}
        
        {type === 'radio' && (
          <div className="flex flex-wrap gap-6 mt-3">
            {options?.map((option) => {
              const optionValue = typeof option === 'string' ? option.toLowerCase() : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              return (
                <label key={optionValue} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name={field}
                    value={optionValue}
                    checked={formData[field] === optionValue}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    disabled={isViewing}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{optionLabel}</span>
                </label>
              );
            })}
          </div>
        )}
        
        {type === 'checkbox' && (
          <div className="grid grid-cols-2 gap-4 mt-3">
            {options?.map((option) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              const isChecked = (formData[field] as string[])?.includes(optionValue) || false;
              return (
                <label key={optionValue} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => handleCheckboxChange(field, optionValue, e.target.checked)}
                    disabled={isViewing}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{optionLabel}</span>
                </label>
              );
            })}
          </div>
        )}
        
        {hasError && (
          <p id={`${field}-error`} className="text-sm text-red-600 flex items-center">
            <XCircle className="w-4 h-4 mr-1" />
            {errors[field]}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <Settings className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
                {getPageTitle()}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {isViewing ? 'View details of the message specification' : 
                 isEditing ? 'Update the message specification details' : 
                 'Configure your message specification settings'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="flex items-center space-x-4">
          {/* Action Buttons */}
          {!isViewing && (
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              
              {/* Next Button */}
              {activeTab !== tabs[tabs.length - 1].id && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              
              {/* Save Button - Only on last tab */}
              {activeTab === tabs[tabs.length - 1].id && (
                <button
                  type="submit"
                  className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? 'Update' : 'Create'} Message Spec</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tab Navigation Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isCompleted = completedTabs.has(tab.id);
              
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex-1 min-w-0 px-6 py-4 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-b-2 border-primary-600'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  aria-selected={isActive}
                  role="tab"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Icon className={`w-5 h-5 ${isActive ? tab.color : ''}`} />
                    <span className="hidden sm:inline truncate">{tab.label}</span>
                    {isCompleted && !isActive && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-8">
                {/* Essential Information Card */}
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-6 flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Essential Information
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {renderFormField('Message ID', 'name', 'text', undefined, 'Enter unique message identifier', true, 'Unique identifier for this message specification')}
                    {renderFormField('Category', 'category', 'select', ['email', 'sms', 'push', 'in-app'], undefined, true, 'Select the message delivery category')}
                  </div>
                  <div className="mt-6">
                    {renderFormField('Message Description / FR Name', 'description', 'textarea', undefined, 'Describe the purpose and functionality of this message', true, 'Detailed description of the message purpose and business requirements')}
                  </div>
                </div>

                {/* Business Information Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                    <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                    Business Information
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {renderFormField('Figma Link', 'figmaLink', 'text', undefined, 'https://figma.com/...', false, 'Link to design specifications')}
                    {renderFormField('Owning Business Line', 'owningBusinessLine', 'text', undefined, 'e.g., Consumer Banking', true, 'Business unit responsible for this message')}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    {renderFormField('Name of Sub-Business', 'nameOfSubBusiness', 'text', undefined, 'e.g., Digital Banking', false, 'Specific sub-division or department')}
                    {renderFormField('Business Line Contact', 'businessLineContact', 'text', undefined, 'Contact person or team', false, 'Primary contact for business questions')}
                  </div>
                </div>

                {/* Message Configuration Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                    <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                    Message Configuration
                  </h3>
                  <div className="space-y-6">
                    {renderFormField('Message Purpose', 'messagePurpose', 'textarea', undefined, 'Explain the business purpose and customer benefit', false, 'Clear explanation of why this message is sent')}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {renderFormField('Trigger Event', 'triggerEvent', 'text', undefined, 'What event triggers this message?', false, 'Specific event or condition that triggers the message')}
                      {renderFormField('Volume Estimate', 'volumeEstimate', 'text', undefined, 'Expected message volume per day/month', false, 'Estimated number of messages sent per time period')}
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                      {renderFormField('Regulatory/Compliance Related', 'regulatory', 'radio', ['Yes', 'No'], undefined, false, 'Is this message required for regulatory compliance?')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-8">
                {/* Classification Card */}
                <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                  <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-6 flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    Message Classification
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {renderFormField('Tier', 'tier', 'select', [
                      'Urgent',
                      'Regulatory with Financial Impact',
                      'Regulatory with no Financial Impact',
                      'Fraud',
                      'Contractual',
                      'High Business Importance',
                      'Other'
                    ], undefined, true, 'Priority tier for message processing')}
                    {renderFormField('Type', 'type', 'radio', ['Regular', 'Shell'], undefined, true, 'Message template type')}
                  </div>
                </div>

                {/* Delivery Configuration Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                    <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                    Delivery Configuration
                  </h3>
                  <div className="space-y-6">
                    {renderFormField('Delivery Channels', 'deliveryChannels', 'checkbox', [
                      'Secure Inbox',
                      'Email (HTML)',
                      'SMS',
                      'Push'
                    ], undefined, false, 'Select all applicable delivery methods')}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {renderFormField('Language', 'language', 'select', ['English', 'Spanish', 'Both'], undefined, false, 'Supported languages')}
                      {renderFormField('Branding', 'branding', 'select', [
                        'Regular (Retail)',
                        'WFA',
                        'TPB',
                        'BIZ (Small Business)',
                        'Other'
                      ], undefined, false, 'Brand theme to apply')}
                      {renderFormField('Brand Value', 'brandValue', 'select', [
                        'Database Setting',
                        'Passed in Request',
                        'Rules Based'
                      ], undefined, false, 'How brand value is determined')}
                    </div>
                  </div>
                </div>

                {/* Requirements Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                    <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                    Requirements & Eligibility
                  </h3>
                  <div className="space-y-6">
                    {renderFormField('Co Brand Requirements', 'coBrandRequirements', 'textarea', undefined, 'Logo, From Address Label, Branding value', false, 'Specific co-branding requirements and guidelines')}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {renderFormField('Will alert be sent to WIM SAC customers?', 'wimSac', 'radio', ['Yes', 'No'], undefined, false, 'WIM SAC customer eligibility')}
                      {renderFormField('Are cobrand accounts eligible?', 'cobrandAccounts', 'radio', ['Yes', 'No'], undefined, false, 'Co-branded account eligibility')}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {renderFormField('Are Small Business/Line of Credit accounts eligible?', 'smallBusiness', 'radio', ['Yes', 'No'], undefined, false, 'Small business account eligibility')}
                      {renderFormField('ADA Testing', 'adaTesting', 'radio', ['Yes', 'No'], undefined, false, 'Accessibility testing requirement')}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {renderFormField('Illustration Image', 'illustrationImage', 'text', undefined, 'Y, N, or description', false, 'Image requirements for the message')}
                      {renderFormField('Attachment', 'attachment', 'radio', ['Yes', 'No'], undefined, false, 'Does message include attachments?')}
                    </div>
                    {renderFormField('Customer Service Info', 'customerServiceInfo', 'textarea', undefined, 'Customer service contact information and instructions', false, 'Support information to include in the message')}
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Tab */}
            {activeTab === 'delivery' && (
              <div className="space-y-8">
                {/* General Delivery Settings Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                    <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                    General Delivery Settings
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {renderFormField('Encrypted (Secure) Email via Zix', 'encryptedEmail', 'radio', ['Yes', 'No'], undefined, false, 'Use encrypted email delivery')}
                      {renderFormField('Who is alert sent to', 'alertSentTo', 'select', [
                        'OLB',
                        'Non-OLB',
                        'Prospect',
                        'Non-Customer',
                        'Both OLB & Non-OLB or Prospect'
                      ], undefined, false, 'Target recipient type')}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {renderFormField('Relationship to Account', 'relationshipToAccount', 'text', undefined, 'Owner, Joint Owner, Primary Borrower etc', false, 'Account relationship requirements')}
                      {renderFormField('User Based or Account Based', 'userOrAccountBased', 'select', ['User Based', 'Account Based'], undefined, false, 'Targeting approach')}
                    </div>
                    {renderFormField('APS Config Fields', 'apsConfigFields', 'textarea', undefined, 'APS_NOTICE_TYPE, APS_BEHAVIOR_VERSION, APS_INCLUDE_NON_OLB, APS_INCLUDE_CLOSED_ACC', false, 'Alert Processing System configuration parameters')}
                  </div>
                </div>

                {/* Secure Inbox Configuration Card */}
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-6 flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Secure Inbox Configuration
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {renderFormField('Secure Inbox Delivery Channel', 'secureInboxDeliveryChannel', 'text', undefined, 'Channel identifier', false, 'Delivery channel for secure inbox')}
                    {renderFormField('Secure Inbox Tab', 'secureInboxTab', 'select', ['Inbox', 'History'], undefined, false, 'Which tab to display message in')}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    {renderFormField('Secure Inbox Expiration Days', 'secureInboxExpirationDays', 'select', ['1', '5', '15', '30', '45', '60', '90'], undefined, false, 'Message retention period')}
                    {renderFormField('Secure Inbox High Priority Marker', 'secureInboxHighPriority', 'radio', ['Yes', 'No'], undefined, false, 'Mark as high priority')}
                  </div>
                </div>

                {/* SMS Configuration Card */}
                <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-6 border border-green-200 dark:border-green-800">
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-6 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    SMS Configuration
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {renderFormField('SMS Delivery Channel', 'smsDeliveryChannel', 'text', undefined, 'SMS channel identifier', false, 'SMS delivery channel configuration')}
                    {renderFormField('SMS Opt-In Parameter', 'smsOptInParameter', 'select', ['OPTIN', 'ONE_TIME_OPTIN', 'OPTIN_IF_NOT_STOPPED'], undefined, false, 'SMS opt-in requirement')}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    {renderFormField('Short Code', 'shortCode', 'text', undefined, 'SMS short code', false, 'Short code for SMS delivery')}
                    {renderFormField('Subscription', 'subscription', 'radio', ['Yes', 'No'], undefined, false, 'Requires subscription management')}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    {renderFormField('Subscription Type', 'subscriptionType', 'radio', ['Opt In', 'Opt Out'], undefined, false, 'Default subscription behavior')}
                    {renderFormField('Manage Alerts Tab', 'manageAlertsTab', 'text', undefined, 'Tab name for alert management', false, 'Tab name in alert management interface')}
                  </div>
                </div>

                {/* Additional Settings Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                    <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                    Additional Settings
                  </h3>
                  <div className="space-y-6">
                    {renderFormField('From Address Label', 'fromAddressLabel', 'text', undefined, 'Display name for sender', false, 'Sender display name for emails')}
                    {renderFormField('Verbiage at top of subscription page', 'subscriptionPageVerbiage', 'textarea', undefined, 'Subscription page header text', false, 'Text displayed at the top of subscription management page')}
                  </div>
                </div>
              </div>
            )}

            {/* Processing Tab */}
            {activeTab === 'processing' && (
              <div className="space-y-8">
                {/* Navigation & Options Card */}
                <div className="bg-orange-50 dark:bg-orange-900/10 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                  <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-6 flex items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    Navigation & Delivery Options
                  </h3>
                  <div className="space-y-6">
                    {renderFormField('Navigation to subscription page', 'navigationToSubscription', 'text', undefined, 'URL or path to subscription page', false, 'Link to subscription management page')}
                    {renderFormField('Delivery Options', 'deliveryOptions', 'checkbox', ['Email', 'Push', 'SMS'], undefined, false, 'Available delivery methods for users')}
                  </div>
                </div>

                {/* Technical Configuration Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                    <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                    Technical Configuration
                  </h3>
                  <div className="space-y-6">
                    {renderFormField('Parameters', 'parameters', 'textarea', undefined, 'List of parameters used in message', false, 'Parameters passed to the message template')}
                    {renderFormField('Special Requirements', 'specialRequirements', 'textarea', undefined, 'Any special processing requirements', false, 'Special handling or processing requirements')}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {renderFormField('Product Code Mapping', 'productCodeMapping', 'text', undefined, 'Product code mappings', false, 'Mapping of product codes to message variants')}
                      {renderFormField('Processing', 'processing', 'text', undefined, 'Processing method', false, 'How the message is processed')}
                    </div>
                  </div>
                </div>

                {/* System Integration Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                    <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                    System Integration
                  </h3>
                  <div className="space-y-6">
                    {renderFormField('Upstream System(s) flow', 'upstreamSystemsFlow', 'textarea', undefined, 'Description of upstream system flow', false, 'Flow of data from upstream systems')}
                    {renderFormField('Upstream Technical Contact', 'upstreamTechnicalContact', 'text', undefined, 'Technical contact for upstream systems', false, 'Contact for technical issues with upstream systems')}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {renderFormField('Alerts Processing Journey', 'alertsProcessingJourney', 'select', [
                        'Prospect Customer',
                        'User Based Non-Subscription',
                        'Account Based Non-Subscription',
                        'User Based Subscription',
                        'Account Based Subscription',
                        'Parameter Based User Subscription',
                        'Parameter Based Account Subscription',
                        'Account Based Default On Subscription'
                      ], undefined, false, 'Processing journey type')}
                      {renderFormField('Processing SLA Queue', 'processingSlaQueue', 'select', ['15 min', '2 hours', '4 hours', '12 hours', '24 hours', '72 hours'], undefined, false, 'Service level agreement for processing')}
                      {renderFormField('Trigger Type', 'triggerType', 'select', ['Kafka', 'MQ', 'WS', 'Batch'], undefined, false, 'How the message is triggered')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Monitoring Tab */}
            {activeTab === 'monitoring' && (
              <div className="space-y-8">
                {/* Process Configuration Card */}
                <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-6 border border-red-200 dark:border-red-800">
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-6 flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Process Configuration
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {renderFormField('Process', 'process', 'radio', ['Alerts Express', 'Normal'], undefined, false, 'Processing method for alerts')}
                    {renderFormField('Bounce Back Processing', 'bounceBackProcessing', 'select', ['Default', 'Standard', 'SOR'], undefined, false, 'How bounce backs are handled')}
                  </div>
                  <div className="mt-6">
                    {renderFormField('SOR / Enhanced Bounceback Flow', 'sorEnhancedBounceback', 'textarea', undefined, 'Description of enhanced bounceback handling', false, 'Enhanced bounce back processing flow')}
                  </div>
                </div>

                {/* System Settings Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                    <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                    System Settings
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {renderFormField('Feedback Topic Queue', 'feedbackTopicQueue', 'text', undefined, 'Queue name for feedback', false, 'Queue for processing feedback')}
                    {renderFormField('Message Request Expiration', 'messageRequestExpiration', 'text', undefined, 'Expiration time for requests', false, 'How long message requests remain valid')}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    {renderFormField('ZL Archive Required', 'zlArchiveRequired', 'radio', ['Yes', 'No'], undefined, false, 'Requires ZL archiving')}
                    {renderFormField('Safe Mode', 'safeMode', 'radio', ['Yes', 'No'], undefined, false, 'Enable safe mode processing')}
                  </div>
                </div>

                {/* Monitoring & Error Handling Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                    <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                    Monitoring & Error Handling
                  </h3>
                  <div className="space-y-6">
                    {renderFormField('Monitoring Requirements', 'monitoringRequirements', 'textarea', undefined, 'Monitoring and alerting requirements', false, 'What monitoring is required for this message')}
                    {renderFormField('Error Remediation Plan', 'errorRemediationPlan', 'textarea', undefined, 'Plan for handling errors', false, 'Steps to take when errors occur')}
                  </div>
                </div>

                {/* Links & Actions Card */}
                <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                  <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-6 flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    Links & Actions
                  </h3>
                  <div className="space-y-6">
                    {renderFormField('Links', 'links', 'textarea', undefined, 'Links included in the message', false, 'Links that will be included in the message')}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {renderFormField('CTA (Call to Action)', 'cta', 'text', undefined, 'Primary call to action', false, 'Main action button text')}
                      {renderFormField('Push Token', 'pushToken', 'text', undefined, 'Push notification token', false, 'Token for push notifications')}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {renderFormField('uLink(s)', 'uLinks', 'text', undefined, 'Universal links', false, 'Universal links for mobile apps')}
                      {renderFormField('SAML Links', 'samlLinks', 'text', undefined, 'SAML authentication links', false, 'Links requiring SAML authentication')}
                    </div>
                    {renderFormField('External Links (Non-Wells Fargo)', 'externalLinks', 'text', undefined, 'External website links', false, 'Links to external websites')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Progress: {completedTabs.size} of {tabs.length} sections completed
              </div>
              <div className="flex space-x-1">
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={`w-2 h-2 rounded-full ${
                      completedTabs.has(tab.id) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {!isViewing && (
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? 'Update' : 'Create'} Message Spec</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default MessageSpecForm;