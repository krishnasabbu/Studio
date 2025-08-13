import React from 'react';
import Card from '../ui/Card';
import { CheckCircle, Clock, XCircle, AlertCircle, Play } from 'lucide-react';

const ExecutionStatusLegend: React.FC = () => {
  const statusItems = [
    {
      status: 'not_started',
      label: 'Not Started',
      icon: AlertCircle,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
    },
    {
      status: 'running',
      label: 'Running',
      icon: Play,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      status: 'awaiting_approval',
      label: 'Awaiting Approval',
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      status: 'completed',
      label: 'Completed',
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      status: 'failed',
      label: 'Failed',
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
    },
  ];

  return (
    <Card className="p-4 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary-500">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Execution Status Legend
      </h3>
      <div className="space-y-2">
        {statusItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <div key={item.status} className="flex items-center space-x-3">
              <div className={`p-1 rounded ${item.bgColor}`}>
                <IconComponent className={`h-4 w-4 ${item.color}`} />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ExecutionStatusLegend;