import Card from "../components/ui/Card";
import { EmailTemplate } from "../store/slices/emailEditorSlice";

type TemplateMappingTabProps = {
  templates: EmailTemplate[];
  selectedTemplates: string[];
  handleTemplateSelect: (templateId: string) => void;
  isViewing?: boolean;
};

const TemplateMappingTab: React.FC<TemplateMappingTabProps> = ({
  templates,
  selectedTemplates,
  handleTemplateSelect,
  isViewing = false,
}) => {
  return (
    <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
      <h3 className="text-lg font-semibold text-primary-700 dark:text-white mb-6">
        Select Templates for Onboarding
        {isViewing && (
          <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 rounded-full text-xs font-medium">
            Read Only
          </span>
        )}
      </h3>
      
      <div className="space-y-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg ${
              isViewing ? 'opacity-75' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedTemplates.includes(template.id)}
              onChange={() => !isViewing && handleTemplateSelect(template.id)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={isViewing}
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-white">
                {template.messageName}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Type: {template.type} | Channels: {template.channel} | Status: {template.status}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
        <p className="text-sm text-primary-700 dark:text-primary-300">
          Selected: {selectedTemplates.length} template(s)
        </p>
      </div>
    </Card>
  );
};

export default TemplateMappingTab;