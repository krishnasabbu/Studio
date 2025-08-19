import React from 'react';
import { Eye, Edit, Trash2, Download, ExternalLink } from 'lucide-react';
import { ImpactAssessment } from '../../types/impactAssessment';

interface ImpactAssessmentCardProps {
  assessment: ImpactAssessment;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
}

const ImpactAssessmentCard: React.FC<ImpactAssessmentCardProps> = ({
  assessment,
  onView,
  onEdit,
  onDelete,
  onDownload
}) => {
  const getScrumColor = (scrum: string) => {
    switch (scrum) {
      case 'SDC-11': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'CSBB1': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'Dreamers': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'Optimizers': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getComponentColor = (component: string) => {
    switch (component) {
      case 'alertWebservices': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'Notifier': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Database': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300';
      case 'Other': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
              {assessment.project}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {assessment.summary}
            </p>
          </div>
          <div className="flex items-center space-x-1 ml-4">
            <button
              onClick={() => onView(assessment.id)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(assessment.id)}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDownload(assessment.id)}
              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(assessment.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScrumColor(assessment.scrum)}`}>
            {assessment.scrum}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getComponentColor(assessment.component)}`}>
            {assessment.component}
          </span>
        </div>

        {/* Key Information */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium mr-2">JIRA:</span>
            {isValidUrl(assessment.jiraLink) ? (
              <a
                href={assessment.jiraLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
              >
                <span className="truncate max-w-48">{assessment.jiraLink}</span>
                <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
              </a>
            ) : (
              <span className="truncate">{assessment.jiraLink}</span>
            )}
          </div>
          <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium mr-2 flex-shrink-0">Technical:</span>
            <span className="line-clamp-2">{assessment.technicalComment}</span>
          </div>
          <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium mr-2 flex-shrink-0">Compatibility:</span>
            <span className="line-clamp-2">{assessment.backwardCompatibility}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>By {assessment.createdBy}</span>
          <span>{formatDate(assessment.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default ImpactAssessmentCard;