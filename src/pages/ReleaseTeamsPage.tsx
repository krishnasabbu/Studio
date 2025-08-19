import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Users, FileText, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { ImpactAssessment, Release, Team } from '../types/impactAssessment';
import { mockImpactAssessments, mockReleases, mockTeams } from '../data/mockImpactAssessments';

const ReleaseTeamsPage: React.FC = () => {
  const navigate = useNavigate();
  const { releaseId } = useParams();
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  // Get current release
  const currentRelease = mockReleases.find(r => r.id === releaseId);
  
  // Get teams for this release
  const releaseTeams = mockTeams.filter(t => t.releaseId === releaseId);
  
  // Get assessments for this release
  const releaseAssessments = mockImpactAssessments.filter(a => a.releaseId === releaseId);

  const toggleTeamExpansion = (teamId: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  const handleAddAssessment = (releaseId: string, scrumTeam: string) => {
    // Navigate to create form with proper context
    navigate(`/impact-assessments/create?releaseId=${releaseId}&scrumTeam=${scrumTeam}`, {
      state: { returnTo: `/impact-assessments/release/${releaseId}/teams` }
    });
  };

  const handleEditAssessment = (assessmentId: string) => {
    navigate(`/impact-assessments/${assessmentId}/edit`);
  };

  const handleDeleteAssessment = (assessmentId: string) => {
    console.log('Delete assessment:', assessmentId);
    // In real app, this would call API to delete
  };

  const handleBack = () => {
    navigate('/impact-assessments');
  };

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

  if (!currentRelease) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Release not found
        </h3>
        <button
          onClick={handleBack}
          className="text-primary-600 hover:text-primary-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

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
              {currentRelease.name} - Scrum Teams
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage impact assessments for {currentRelease.month} {currentRelease.year} release
            </p>
          </div>
        </div>
        
        {currentRelease.isFrozen && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
            <span className="text-sm font-medium text-red-800 dark:text-red-300">
              🔒 Release Frozen
            </span>
          </div>
        )}
      </div>

      {/* Teams List */}
      <div className="space-y-4">
        {releaseTeams.map((team) => {
          const teamAssessments = releaseAssessments.filter(a => a.scrum === team.scrumTeam);
          const isExpanded = expandedTeams.has(team.id);

          return (
            <div
              key={team.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              {/* Team Header */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => toggleTeamExpansion(team.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                    
                    <div className="flex items-center space-x-3">
                      <Users className="w-6 h-6 text-primary-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {team.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScrumColor(team.scrumTeam)}`}>
                            {team.scrumTeam}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {teamAssessments.length} assessments
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!currentRelease.isFrozen && (
                    <button
                      onClick={() => handleAddAssessment(currentRelease.id, team.scrumTeam)}
                      className="flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Assessment</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Team Assessments */}
              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  {teamAssessments.length === 0 ? (
                    <div className="p-6 text-center">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        No impact assessments yet
                      </p>
                      {!currentRelease.isFrozen && (
                        <button
                          onClick={() => handleAddAssessment(currentRelease.id, team.scrumTeam)}
                          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          Add First Assessment
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 space-y-4">
                      {teamAssessments.map((assessment) => (
                        <div
                          key={assessment.id}
                          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {assessment.project}
                                </h4>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getComponentColor(assessment.component)}`}>
                                  {assessment.component}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                {assessment.summary}
                              </p>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Created by {assessment.createdBy} • {new Date(assessment.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => handleEditAssessment(assessment.id)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAssessment(assessment.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {releaseTeams.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No teams found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No scrum teams are assigned to this release yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReleaseTeamsPage;