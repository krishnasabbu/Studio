import { FileText } from "lucide-react";
import Card from "../components/ui/Card";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";

type OnboardTabProps = {
  alertName: string,
  handleAlertNameChange: (value: string) => void;
  isLoadingJira: boolean;
  jiraId: string;
  handleJiraIdChange: (value: string) => void;
  handleLoadJira: () => void;
  onboardFields: Record<string, string>;
  handleOnboardFieldChange: (key: string, value: string) => void;
  isViewing?: boolean;
};

const OnboardTab: React.FC<OnboardTabProps> = ({
  alertName,
  handleAlertNameChange,
  isLoadingJira,
  jiraId,
  handleJiraIdChange,
  handleLoadJira,
  onboardFields,
  handleOnboardFieldChange,
  isViewing = false,
}) => (
  <div className="space-y-6">
      <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary-500">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Alert Information
          {isViewing && (
            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 rounded-full text-xs font-medium">
              Read Only
            </span>
          )}
        </h3>
        <InputField
          label="Alert Name"
          value={alertName}
          onChange={handleAlertNameChange}
          placeholder="Enter alert name (e.g., High CPU Alert)"
          disabled={isViewing}
          required
        />
      </Card>
      
      <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary-500">
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            JIRA Integration
            {isViewing && (
              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 rounded-full text-xs font-medium">
                Read Only
              </span>
            )}
          </h3>
        </div>
        
        <div className="flex space-x-4 mb-6">
          <div className="flex-1">
            <InputField
              label="JIRA ID"
              value={jiraId}
              onChange={handleJiraIdChange}
              placeholder="Enter JIRA ticket ID (e.g., PROJ-1234)"
              disabled={isViewing}
            />
          </div>
          {!isViewing && (
            <div className="flex items-end">
              <Button onClick={handleLoadJira} disabled={!jiraId.trim()}>
                {isLoadingJira ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Loading...
                  </div>
                ) : (
                  'Load'
                )}
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary-500">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Onboard Configuration Fields
          {isViewing && (
            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 rounded-full text-xs font-medium">
              Read Only
            </span>
          )}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(onboardFields).map(([key, value], index) => (
            <InputField
              key={key}
              label={`Field ${index + 1}`}
              value={value}
              onChange={(newValue) => handleOnboardFieldChange(key, newValue)}
              placeholder={`Enter value for field ${index + 1}`}
              disabled={isViewing}
            />
          ))}
        </div>
      </Card>
    </div>
);

export default OnboardTab;