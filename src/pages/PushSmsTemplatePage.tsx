import React, { useState } from 'react';
import InputField from '../components/ui/InputField';
import Card from '../components/ui/Card';
import { Settings, Smartphone } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks/useRedux';
import { setCurrentTemplate } from '../store/slices/emailEditorSlice';

const PushSmsTemplatePage: React.FC = () => {
  
  const { currentTemplate } = useAppSelector(state => state.emailEditor);
  const dispatch = useAppDispatch();

  const [content, setContent] = useState({
    pushSmsContent: currentTemplate?.content || '',
  });
  const [properties, setProperties] = useState({
    prop1: 'Character Limit: 160',
    prop2: 'Delivery: Immediate',
    prop3: 'Priority: High',
  });

  // Memoized handlers to prevent unnecessary re-renders
  const handleContentChange = React.useCallback((value: string) => {
    setContent(prev => ({ ...prev, pushSmsContent: value }));
    if (currentTemplate) {
      dispatch(setCurrentTemplate({ ...currentTemplate, content: value }));
    }
  }, [dispatch, currentTemplate]);

  const handlePropertyChange = React.useCallback((property: string, value: string) => {
    setProperties(prev => ({ ...prev, [property]: value }));
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Smartphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Push/SMS Content
                </h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Message Content
                  </label>
                  <textarea
                    value={content.pushSmsContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your Push/SMS message content here..."
                  />
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Character count: {content.pushSmsContent.length}</span>
                    <span className={content.pushSmsContent.length > 160 ? 'text-red-500' : 'text-green-500'}>
                      {content.pushSmsContent.length > 160 ? 'Over limit' : 'Within limit'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Message Preview
              </h3>
              <div className="space-y-4">
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Smartphone className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Push Notification
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        App Name
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {content.pushSmsContent}
                  </div>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Smartphone className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        SMS Message
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        +1 (555) 123-4567
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {content.pushSmsContent}
                  </div>
                </div>
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
                  onChange={(value) => handlePropertyChange('prop1', value)}
                />
                <InputField
                  label="Property 2"
                  value={properties.prop2}
                  onChange={(value) => handlePropertyChange('prop2', value)}
                />
                <InputField
                  label="Property 3"
                  value={properties.prop3}
                  onChange={(value) => handlePropertyChange('prop3', value)}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Delivery Settings
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Push Notifications</span>
                  <div className="w-10 h-6 bg-blue-500 rounded-full flex items-center justify-end px-1">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">SMS Delivery</span>
                  <div className="w-10 h-6 bg-blue-500 rounded-full flex items-center justify-end px-1">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Immediate Send</span>
                  <div className="w-10 h-6 bg-gray-300 rounded-full flex items-center justify-start px-1">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PushSmsTemplatePage;