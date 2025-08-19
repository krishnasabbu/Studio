import { Release, Team, ImpactAssessment, Project } from '../types/impactAssessment';

export const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Alert Enhancement Phase 2',
    description: 'Implementation of enhanced alert processing capabilities with improved performance and reliability features.',
    releaseId: 'release-1',
    status: 'active',
    assessmentCount: 2,
    teamCount: 2,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-20'),
    createdBy: 'Project Manager'
  },
  {
    id: 'project-2',
    name: 'Customer Service Bot Integration',
    description: 'Integration of AI-powered customer service bot with existing notification system for automated responses.',
    releaseId: 'release-1',
    status: 'active',
    assessmentCount: 1,
    teamCount: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-18'),
    createdBy: 'Project Manager'
  },
  {
    id: 'project-3',
    name: 'Mobile Push Notification Redesign',
    description: 'Complete redesign of mobile push notification system with rich media support and interactive elements.',
    releaseId: 'release-1',
    status: 'active',
    assessmentCount: 1,
    teamCount: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-22'),
    createdBy: 'Project Manager'
  },
  {
    id: 'project-4',
    name: 'Database Performance Optimization',
    description: 'Comprehensive database optimization including indexing, query optimization, and archival strategies.',
    releaseId: 'release-1',
    status: 'active',
    assessmentCount: 1,
    teamCount: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-25'),
    createdBy: 'Project Manager'
  },
  {
    id: 'project-5',
    name: 'Security Enhancement Package',
    description: 'Implementation of advanced security features including encryption at rest and enhanced authentication.',
    releaseId: 'release-2',
    status: 'active',
    assessmentCount: 1,
    teamCount: 1,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    createdBy: 'Project Manager'
  }
];

export const mockImpactAssessments: ImpactAssessment[] = [
  {
    id: '1',
    scrum: 'SDC-11',
    project: 'Alert Enhancement Phase 2',
    jiraLink: 'https://jira.company.com/browse/SDC-1234',
    summary: 'Implementation of enhanced alert processing capabilities with improved performance and reliability features.',
    component: 'alertWebservices',
    technicalComment: 'Requires database schema updates and API versioning. New endpoints will be backward compatible.',
    contentChanges: 'Updated alert templates and notification formats. New email templates for enhanced alerts.',
    backwardCompatibility: 'Fully backward compatible. Legacy API endpoints will continue to work with deprecation notices.',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    createdBy: 'John Smith',
    teamId: 'team-1',
    releaseId: 'release-1',
    projectId: 'project-1'
  },
  {
    id: '2',
    scrum: 'CSBB1',
    project: 'Customer Service Bot Integration',
    jiraLink: 'https://jira.company.com/browse/CSBB-5678',
    summary: 'Integration of AI-powered customer service bot with existing notification system for automated responses.',
    component: 'Notifier',
    technicalComment: 'New microservice deployment required. Redis cache implementation for session management.',
    contentChanges: 'New bot response templates and conversation flows. Updated customer interaction scripts.',
    backwardCompatibility: 'No breaking changes. New functionality is additive and can be enabled per customer segment.',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-18'),
    createdBy: 'Sarah Johnson',
    teamId: 'team-2',
    releaseId: 'release-1',
    projectId: 'project-2'
  },
  {
    id: '3',
    scrum: 'Dreamers',
    project: 'Mobile Push Notification Redesign',
    jiraLink: 'https://jira.company.com/browse/DRM-9012',
    summary: 'Complete redesign of mobile push notification system with rich media support and interactive elements.',
    component: 'Notifier',
    technicalComment: 'iOS and Android SDK updates required. New push notification service with Firebase integration.',
    contentChanges: 'Rich media templates, interactive buttons, and deep linking capabilities added to notifications.',
    backwardCompatibility: 'Requires mobile app updates. Legacy notifications will continue to work but with limited features.',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-22'),
    createdBy: 'Mike Chen',
    teamId: 'team-3',
    releaseId: 'release-1',
    projectId: 'project-3'
  },
  {
    id: '4',
    scrum: 'Optimizers',
    project: 'Database Performance Optimization',
    jiraLink: 'https://jira.company.com/browse/OPT-3456',
    summary: 'Comprehensive database optimization including indexing, query optimization, and archival strategies.',
    component: 'Database',
    technicalComment: 'Database migration scripts required. Estimated 2-hour maintenance window for index creation.',
    contentChanges: 'No content changes. This is purely a performance optimization initiative.',
    backwardCompatibility: 'Fully compatible. Performance improvements will be transparent to end users.',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-25'),
    createdBy: 'Lisa Wang',
    teamId: 'team-4',
    releaseId: 'release-1',
    projectId: 'project-4'
  },
  {
    id: '5',
    scrum: 'SDC-11',
    project: 'Security Enhancement Package',
    jiraLink: 'https://jira.company.com/browse/SDC-7890',
    summary: 'Implementation of advanced security features including encryption at rest and enhanced authentication.',
    component: 'alertWebservices',
    technicalComment: 'New security libraries and certificate management. OAuth 2.0 implementation required.',
    contentChanges: 'Updated security notices and privacy policy notifications.',
    backwardCompatibility: 'Breaking changes for API authentication. Migration guide and 6-month deprecation period provided.',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-28'),
    createdBy: 'David Brown',
    teamId: 'team-1',
    releaseId: 'release-2',
    projectId: 'project-5'
  },
  {
    id: '6',
    scrum: 'Dreamers',
    project: 'Alert Enhancement Phase 2',
    jiraLink: 'https://jira.company.com/browse/DRM-1111',
    summary: 'Mobile app integration for enhanced alert processing with push notification support.',
    component: 'Notifier',
    technicalComment: 'Mobile SDK integration required. Push notification service updates needed.',
    contentChanges: 'New mobile alert templates and push notification formats.',
    backwardCompatibility: 'Backward compatible with existing mobile app versions.',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-21'),
    createdBy: 'Alex Rodriguez',
    teamId: 'team-3',
    releaseId: 'release-1',
    projectId: 'project-1'
  }
];

export const mockTeams: Team[] = [
  {
    id: 'team-1',
    name: 'System Development Core',
    scrumTeam: 'SDC-11',
    releaseId: 'release-1',
    assessments: mockImpactAssessments.filter(a => a.teamId === 'team-1'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-28')
  },
  {
    id: 'team-2',
    name: 'Customer Service Bot Team',
    scrumTeam: 'CSBB1',
    releaseId: 'release-1',
    assessments: mockImpactAssessments.filter(a => a.teamId === 'team-2'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: 'team-3',
    name: 'Innovation Dreamers',
    scrumTeam: 'Dreamers',
    releaseId: 'release-1',
    assessments: mockImpactAssessments.filter(a => a.teamId === 'team-3'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: 'team-4',
    name: 'Performance Optimizers',
    scrumTeam: 'Optimizers',
    releaseId: 'release-1',
    assessments: mockImpactAssessments.filter(a => a.teamId === 'team-4'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-25')
  }
];

export const mockReleases: Release[] = [
  {
    id: 'release-1',
    name: 'January 2024',
    month: 'January',
    year: 2024,
    status: 'in-progress',
    isFrozen: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-28'),
    createdBy: 'Release Manager'
  },
  {
    id: 'release-2',
    name: 'February 2024',
    month: 'February',
    year: 2024,
    status: 'planning',
    isFrozen: false,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    createdBy: 'Release Manager'
  },
  {
    id: 'release-3',
    name: 'March 2024',
    month: 'March',
    year: 2024,
    status: 'planning',
    isFrozen: false,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
    createdBy: 'Release Manager'
  },
  {
    id: 'release-4',
    name: 'April 2024',
    month: 'April',
    year: 2024,
    status: 'planning',
    isFrozen: false,
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-04-01'),
    createdBy: 'Release Manager'
  },
  {
    id: 'release-5',
    name: 'May 2024',
    month: 'May',
    year: 2024,
    status: 'planning',
    isFrozen: false,
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-05-01'),
    createdBy: 'Release Manager'
  },
  {
    id: 'release-6',
    name: 'June 2024',
    month: 'June',
    year: 2024,
    status: 'planning',
    isFrozen: false,
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-01'),
    createdBy: 'Release Manager'
  },
  {
    id: 'release-7',
    name: 'July 2024',
    month: 'July',
    year: 2024,
    status: 'planning',
    isFrozen: false,
    createdAt: new Date('2024-07-01'),
    updatedAt: new Date('2024-07-01'),
    createdBy: 'Release Manager'
  },
  {
    id: 'release-8',
    name: 'August 2024',
    month: 'August',
    year: 2024,
    status: 'planning',
    isFrozen: false,
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2024-08-01'),
    createdBy: 'Release Manager'
  },
  {
    id: 'release-9',
    name: 'September 2024',
    month: 'September',
    year: 2024,
    status: 'planning',
    isFrozen: false,
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-01'),
    createdBy: 'Release Manager'
  },
  {
    id: 'release-10',
    name: 'October 2024',
    month: 'October',
    year: 2024,
    status: 'planning',
    isFrozen: false,
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-01'),
    createdBy: 'Release Manager'
  },
  {
    id: 'release-11',
    name: 'November 2024',
    month: 'November',
    year: 2024,
    status: 'planning',
    isFrozen: false,
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
    createdBy: 'Release Manager'
  },
  {
    id: 'release-12',
    name: 'December 2024',
    month: 'December',
    year: 2024,
    status: 'planning',
    isFrozen: false,
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01'),
    createdBy: 'Release Manager'
  }
];