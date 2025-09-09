import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, X, Info } from 'lucide-react';
import { ImpactAssessment } from '../types/impactAssessment';
import { mockImpactAssessments, mockProjects, mockReleases, mockTeams } from '../data/mockImpactAssessments';

const ImpactAssessmentForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = Boolean(id);
  const releaseId = searchParams.get('releaseId');
  const scrumTeam = searchParams.get('scrumTeam');
  const selectedRelease = mockReleases.find(r => r.id === releaseId);
  const selectedTeam = mockTeams.find(t => t.releaseId === releaseId && t.scrumTeam === scrumTeam);

  const [formData, setFormData] = useState<Partial<ImpactAssessment>>({
    scrum: scrumTeam as any || 'SDC-11',
    project: '',
    jiraLink: '',
    summary: '',
    component: 'alertWebservices',
    technicalComment: '',
    contentChanges: '',
    backwardCompatibility: '',
    createdBy: 'Current User',
    teamId: selectedTeam?.id || 'team-1',
    releaseId: releaseId || 'release-1',
    projectId: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing data if editing
  useEffect(() => {
    if (isEditing && id) {
      const existingAssessment = mockImpactAssessments.find(a => a.id === id);
      if (existingAssessment) {
        setFormData(existingAssessment);
      }
    }
  }, [isEditing, id]);

  // Field descriptions for tooltips
  const fieldDescriptions = {
    scrum: 'Select the scrum team responsible for this project. Each team has specific expertise and responsibilities.',
    project: 'Project name is pre-filled based on your selection. This identifies the initiative or feature being developed.',
    jiraLink: 'Provide the JIRA ticket URL for tracking and reference. Must be a valid URL format (https://...).',
    summary: 'Provide a comprehensive overview of your team\'s contribution to this project, including objectives, scope, and expected outcomes.',
    component: 'Select the primary system component that will be affected by this project.',
    technicalComment: 'Detail the technical implementation approach, architecture changes, dependencies, and any technical considerations.',
    contentChanges: 'Describe any changes to user-facing content, templates, messages, or documentation.',
    backwardCompatibility: 'Analyze the impact on existing functionality and describe compatibility considerations, migration requirements, or breaking changes.'
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required field validation
    if (!formData.project?.trim()) {
      newErrors.project = 'Project name is required';
    }

    if (!formData.jiraLink?.trim()) {
      newErrors.jiraLink = 'JIRA link is required';
    } else {
      // URL validation
      try {
        new URL(formData.jiraLink);
      } catch {
        newErrors.jiraLink = 'Please enter a valid URL';
      }
    }

    if (!formData.summary?.trim()) {
      newErrors.summary = 'Summary is required';
    }

    if (!formData.technicalComment?.trim()) {
      newErrors.technicalComment = 'Technical comment is required';
    }

    if (!formData.contentChanges?.trim()) {
      newErrors.contentChanges = 'Content changes description is required';
    }

    if (!formData.backwardCompatibility?.trim()) {
      newErrors.backwardCompatibility = 'Backward compatibility analysis is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create new assessment data
      const newAssessment: ImpactAssessment = {
        id: isEditing ? id! : `assessment-${Date.now()}`,
        scrum: formData.scrum as any,
        project: formData.project || '',
        jiraLink: formData.jiraLink || '',
        summary: formData.summary || '',
        component: formData.component as any,
        technicalComment: formData.technicalComment || '',
        contentChanges: formData.contentChanges || '',
        backwardCompatibility: formData.backwardCompatibility || '',
        createdAt: isEditing ? formData.createdAt! : new Date(),
        updatedAt: new Date(),
        createdBy: formData.createdBy || 'Current User',
        teamId: formData.teamId || 'team-1',
        releaseId: formData.releaseId || 'release-1',
        projectId: formData.projectId || ''
      };

      console.log('Saving assessment:', newAssessment);
      
      // In a real app, this would save to API
      // For demo, we'll add to mock data
      if (!isEditing) {
        // Add to mock data (in real app, this would be API call)
        mockImpactAssessments.push(newAssessment);
      }
      
      // Navigate back to teams page
      navigate(`/impact-assessments/release/${formData.releaseId}/teams`);
    } catch (error) {
      console.error('Error saving assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/impact-assessments');
  };

  const updateField = (field: keyof ImpactAssessment, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderFormField = (
    field: keyof ImpactAssessment,
    label: string,
    type: 'text' | 'textarea' | 'select' | 'url' = 'text',
    options?: string[]
  ) => {
    const value = formData[field] || '';
    const error = errors[field];
    const description = fieldDescriptions[field as keyof typeof fieldDescriptions];

    return (
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          <span className="text-red-500 ml-1">*</span>
          {description && (
            <div className="relative ml-2 group">
              <Info className="w-4 h-4 text-blue-500 hover:text-blue-600 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 w-80 text-center">
                {description}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          )}
        </label>
        
        {type === 'select' ? (
          <select
            value={value as string}
            onChange={(e) => updateField(field, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
              error
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
          >
            {options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            value={value as string}
            onChange={(e) => updateField(field, e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-vertical ${
              error
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
        ) : (
          <input
            type={type === 'url' ? 'url' : 'text'}
            value={value as string}
            onChange={(e) => updateField(field, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
              error
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
        )}
        
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
              {isEditing ? 'Edit Impact Assessment' : `Add Assessment - ${selectedRelease?.name} - ${selectedTeam?.name}`}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isEditing ? 'Update the impact assessment details' : 'Document your team\'s impact for this release'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            form="assessment-form"
            disabled={isSubmitting}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-6 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save Assessment'}</span>
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <form id="assessment-form" onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderFormField('scrum', 'Scrum Team', 'select', ['SDC-11', 'CSBB1', 'Dreamers', 'Optimizers'])}
              {renderFormField('project', 'Project Name', 'text')}
            </div>

            <div className="grid grid-cols-1 gap-6">
              {renderFormField('jiraLink', 'JIRA Link', 'url')}
              {renderFormField('summary', 'Project Summary', 'textarea')}
            </div>
          </div>

          {/* Technical Details */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Technical Details
            </h2>
            
            <div className="grid grid-cols-1 gap-6">
              {renderFormField('component', 'Component', 'select', ['alertWebservices', 'Notifier', 'Database', 'Other'])}
              {renderFormField('technicalComment', 'Technical Comment', 'textarea')}
              {renderFormField('contentChanges', 'Content Changes', 'textarea')}
              {renderFormField('backwardCompatibility', 'Backward Compatibility and Impact', 'textarea')}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImpactAssessmentForm;