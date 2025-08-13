import { ArrowLeft } from 'lucide-react';
import Button from './Button';

const BackButton = () => {
  return (
    <Button
      variant="outline"
      onClick={() => window.history.back()}
      className="flex items-center space-x-2 border-primary-300 text-primary-600 hover:bg-primary-50"
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
};

export default BackButton;