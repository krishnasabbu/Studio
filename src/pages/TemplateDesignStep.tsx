import EmailTemplatePage from "./EmailTemplatePage";
import PushSmsTemplatePage from "./PushSmsTemplatePage";

type TemplateDesignStepProps = {
  isEmailTemplate: boolean;
};

const TemplateDesignStep: React.FC<TemplateDesignStepProps> = ({
  isEmailTemplate
}) => {
  return (
    <div className="space-y-6">
      {isEmailTemplate ? <EmailTemplatePage /> : <PushSmsTemplatePage />}
      {/* <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button variant="outline" onClick={() => setActiveTab('creation')}>
          Back to Template Info
        </Button>
        <Button variant="primary" onClick={handleSaveTemplate}>
          <Save className="h-4 w-4 mr-2" />
          Save Template
        </Button>
      </div> */}
    </div>
  );
};

export default TemplateDesignStep;