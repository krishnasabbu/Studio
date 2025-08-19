import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Users, FileText, Calendar, AlertCircle } from 'lucide-react';
import { Project, Release } from '../types/impactAssessment';
import { mockProjects, mockReleases, mockImpactAssessments } from '../data/mockImpactAssessments';

const ProjectSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRelease, setSelectedRelease] = useState('release-1');

  // Get current release
  const currentRelease = mockReleases.find(r => r.id === selectedRelease);
  
  // Filter projects by release and search term
  const filteredProjects = useMemo(() => {
    return mockProjects
      .filter(project => project.releaseId === selectedRelease)
      .filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [selectedRelease, searchTerm]);

  // Get assessment count for each project
  const getProjectAssessmentCount = (projectId: string) => {
    return mockImpactAssessments.filter(a => a.projectId === projectId).length;
  };

  // Get unique teams count for each project
  const getProjectTeamCount = (projectId: string) => {
    const assessments = mockImpactAssessments.filter(a => a.projectId === projectId);
    const uniqueTeams = new Set(assessments.map(a => a.scrum));
    return uniqueTeams.size;
  };

  const handleProjectSelect = (projectId: string) => {
    navigate(`/impact-assessments/create?projectId=${projectId}`);
  };

  const handleBack = () => {
    navigate('/impact-assessments');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
              Select Project
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Choose a project to add your impact assessment
            </p>
          </div>
        </div>
      </div>

      {/* Release Selection and Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Calendar className="w-6 h-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {currentRelease?.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentRelease?.month} {currentRelease?.year} Release Cycle
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {currentRelease?.isFrozen ? (
              <div className="flex items-center space-x-2 px-3 py-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800 dark:text-red-300">
                  Release Frozen
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Plus className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800 dark:text-green-300">
                  Open for Submissions
                </span>
              </div>
            )}
            <select
              value={selectedRelease}
              onChange={(e) => setSelectedRelease(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {mockReleases.map(release => (
                <option key={release.id} value={release.id}>
                  {release.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {currentRelease?.isFrozen ? (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Release is Frozen
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            This release has been frozen and no new impact assessments can be added.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const assessmentCount = getProjectAssessmentCount(project.id);
            const teamCount = getProjectTeamCount(project.id);

            return (
              <div
                key={project.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer group"
                onClick={() => handleProjectSelect(project.id)}
              >
                <div className="p-6">
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                      {project.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Project Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {assessmentCount}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Assessments
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {teamCount}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Teams
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                    <button className="w-full flex items-center justify-center space-x-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 py-2 px-4 rounded-lg group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                      <Plus className="w-4 h-4" />
                      <span className="font-medium">Add Assessment</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredProjects.length === 0 && !currentRelease?.isFrozen && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No projects found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search criteria or select a different release.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectSelectionPage;