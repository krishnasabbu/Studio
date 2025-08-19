export interface ImpactAssessment {
  id: string;
  scrum: 'SDC-11' | 'CSBB1' | 'Dreamers' | 'Optimizers';
  project: string;
  jiraLink: string;
  summary: string;
  component: 'alertWebservices' | 'Notifier' | 'Database' | 'Other';
  technicalComment: string;
  contentChanges: string;
  backwardCompatibility: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  teamId: string;
  releaseId: string;
  projectId: string;
}

export interface Team {
  id: string;
  name: string;
  scrumTeam: string;
  releaseId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Release {
  id: string;
  name: string;
  month: string;
  year: number;
  status: 'planning' | 'in-progress' | 'completed' | 'archived';
  isFrozen: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  releaseId: string;
  status: 'active' | 'completed' | 'on-hold';
  assessmentCount: number;
  teamCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ImpactAssessmentFilters {
  search: string;
  scrum: string;
  component: string;
  releaseMonth: string;
  project: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface ExportOptions {
  format: 'excel' | 'csv';
  includeFilters: boolean;
  selectedFields: string[];
}