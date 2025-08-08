import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Tabs from '../components/ui/Tabs';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import Card from '../components/ui/Card';
import { Save, Eye, Download, X, Languages, Image, Type, Settings, Mail } from 'lucide-react';

const EmailDesignPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('template');
  const [emailData, setEmailData] = useState({
    subject: 'Welcome to Our Platform!',
    pageHeader: 'Welcome to Our Community',
    subHeader: 'We\'re excited to have you on board',
    bodyText: 'Thank you for joining our platform. Get started by exploring our features and setting up your profile.',
    primaryCTA: 'Get Started',
    secondaryCTA: 'Learn More',
  });
  const [properties, setProperties] = useState({
    prop1: 'Brand Color: #3B82F6',
    prop2: 'Font: Inter',
    prop3: 'Layout: Modern',
  });

  const DetailedTemplate = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Email Content
            </h3>
            <div className="space-y-4">
              <InputField
                label="Subject Line"
                value={emailData.subject}
                onChange={(value) => setEmailData(prev => ({ ...prev, subject: value }))}
                placeholder="Enter email subject"
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Image className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Header Widget
              </h3>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Logo + Illustration section will appear here
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Type className="h-6 w-6 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Body Widget
              </h3>
            </div>
            <div className="space-y-4">
              <InputField
                label="Page Header"
                value={emailData.pageHeader}
                onChange={(value) => setEmailData(prev => ({ ...prev, pageHeader: value }))}
                placeholder="Main page header"
              />
              <InputField
                label="Subheader"
                value={emailData.subHeader}
                onChange={(value) => setEmailData(prev => ({ ...prev, subHeader: value }))}
                placeholder="Supporting subheader"
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Body Text
                </label>
                <textarea
                  value={emailData.bodyText}
                  onChange={(e) => setEmailData(prev => ({ ...prev, bodyText: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="Main body content..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Primary CTA Button"
                  value={emailData.primaryCTA}
                  onChange={(value) => setEmailData(prev => ({ ...prev, primaryCTA: value }))}
                  placeholder="Primary action"
                />
                <InputField
                  label="Secondary CTA Button"
                  value={emailData.secondaryCTA}
                  onChange={(value) => setEmailData(prev => ({ ...prev, secondaryCTA: value }))}
                  placeholder="Secondary action"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Mail className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Footer Widget
              </h3>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Footer with branded icons and links will appear here
              </p>
            </div>
          </Card>
        </div>
        
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Settings className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Properties Panel
              </h3>
            </div>
            <div className="space-y-4">
              <InputField
                label="Property 1"
                value={properties.prop1}
                onChange={(value) => setProperties(prev => ({ ...prev, prop1: value }))}
              />
              <InputField
                label="Property 2"
                value={properties.prop2}
                onChange={(value) => setProperties(prev => ({ ...prev, prop2: value }))}
              />
              <InputField
                label="Property 3"
                value={properties.prop3}
                onChange={(value) => setProperties(prev => ({ ...prev, prop3: value }))}
              />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Email Preview
            </h3>
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Subject: {emailData.subject}
                </div>
                <div className="h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                  <span className="text-xs text-blue-700 dark:text-blue-300">Header Widget</span>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {emailData.pageHeader}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {emailData.subHeader}
                  </div>
                  <div className="text-xs text-gray-700 dark:text-gray-300">
                    {emailData.bodyText.substring(0, 100)}...
                  </div>
                  <div className="flex space-x-2">
                    <div className="px-2 py-1 bg-blue-500 text-white text-xs rounded">
                      {emailData.primaryCTA}
                    </div>
                    <div className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded">
                      {emailData.secondaryCTA}
                    </div>
                  </div>
                </div>
                <div className="h-6 bg-purple-100 dark:bg-purple-900 rounded flex items-center justify-center">
                  <span className="text-xs text-purple-700 dark:text-purple-300">Footer Widget</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'template', label: 'Notification Template', content: <DetailedTemplate /> },
    { id: 'onboarding', label: 'Notification Onboarding', content: <div className="p-4">Onboarding content</div> },
    { id: 'info', label: 'Notification Info', content: <div className="p-4">Info content</div> },
    { id: 'test', label: 'Notification Test', content: <div className="p-4">Test content</div> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Detailed Email Template Design
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create comprehensive email layouts with sections and widgets
          </p>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button variant="primary">
          <Save className="h-4 w-4 mr-2" />
          Save Draft
        </Button>
        
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
        
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default EmailDesignPage;