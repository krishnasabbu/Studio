import { ArrowRight, Plus, X } from "lucide-react";
import Card from "../components/ui/Card";
import InputField from "../components/ui/InputField";
import Dropdown from "../components/ui/Dropdown";
import Button from "../components/ui/Button";

const channelOptions = [
    { value: 'External Email', label: 'External Email' },
    { value: 'Secure Inbox', label: 'Secure Inbox' },
    { value: 'Push', label: 'Push Notification' },
    { value: 'SMS', label: 'SMS' },
  ];

  const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Spanish', label: 'Spanish' },
  ];

type TemplateCreationFormProps = {
  formData: {
    messageTypeId: string;
    messageName: string;
    channel: string;
    language: string;
  };
  errors: Record<string, string>;
  isSubmitting: boolean;
  setFormData: React.Dispatch<React.SetStateAction<{
    messageTypeId: string;
    messageName: string;
    channel: string;
    language: string;
  }>>;
  handleCancel: () => void;
  handleNext: (e: React.FormEvent) => void;
};

const TemplateCreationForm: React.FC<TemplateCreationFormProps> = ({
  formData,
  errors,
  isSubmitting,
  setFormData,
  handleCancel,
  handleNext,
}) => {
  return (
    <Card className="p-8 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary-500">
      <form onSubmit={handleNext} className="space-y-6">
          <InputField
            label="Message Type ID"
            value={formData.messageTypeId}
            onChange={(value) => setFormData(prev => ({ ...prev, messageTypeId: value }))}
            placeholder="e.g., 101, 102"
          />

          <InputField
            label="Message Name"
            value={formData.messageName}
            onChange={(value) => setFormData(prev => ({ ...prev, messageName: value }))}
            placeholder="e.g., Overdraft, Account Update"
            error={errors.messageName}
            required
          />

          <Dropdown
            label="Select Channels"
            value={formData.channel}
            onChange={(value) => setFormData(prev => ({ ...prev, channel: value }))}
            options={channelOptions}
            placeholder="Select delivery channels"
            error={errors.channels}
            required
          />

          <Dropdown
            label="Language"
            value={formData.language}
            onChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
            options={languageOptions}
            placeholder="Select language"
            error={errors.language}
            required
          />

          <div className="flex space-x-4 pt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                <>
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Next: Design Template
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1 border-primary-300 text-primary-600 hover:bg-primary-50"
            >
              <X className="h-5 w-5 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
    </Card>
  );
};

export default TemplateCreationForm;