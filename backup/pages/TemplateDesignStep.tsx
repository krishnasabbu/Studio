import EmailTemplatePage from "./EmailTemplatePage";
import PushSmsTemplatePage from "./PushSmsTemplatePage";

type TemplateDesignStepProps = {
  isEmailTemplate: boolean;
  isViewing?: boolean;
  variables: string[];
  conditions: string[];
};

const TemplateDesignStep: React.FC<TemplateDesignStepProps> = ({
  isEmailTemplate,
  isViewing = false,
  variables,
  conditions
}) => {
  return (
    <div className="space-y-6">
      {isEmailTemplate ? (
        <EmailTemplatePage isViewing={isViewing} variables={variables} conditions={conditions} />
      ) : (
        <PushSmsTemplatePage isViewing={isViewing} />
      )}
    </div>
  );
};

export default TemplateDesignStep;