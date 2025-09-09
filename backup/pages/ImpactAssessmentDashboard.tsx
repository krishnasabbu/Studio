import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Plus, Download, FileSpreadsheet, Calendar, Users, TrendingUp, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { ImpactAssessment, Release, Team } from '../types/impactAssessment';
import { mockImpactAssessments, mockReleases, mockTeams } from '../data/mockImpactAssessments';
import { useNavigate } from 'react-router-dom';

const ImpactAssessmentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [releases] = useState<Release[]>(mockReleases);
  const [teams] = useState<Team[]>(mockTeams);
  const [assessments] = useState<ImpactAssessment[]>(mockImpactAssessments);

  // Get teams for a release
  const getTeamsForRelease = (releaseId: string) => {
    return teams.filter(team => team.releaseId === releaseId);
  };

  // Handle show teams navigation
  const handleShowTeams = (releaseId: string) => {
    navigate(`/impact-assessments/release/${releaseId}/teams`);
  };

  // Handle monthly download
  const handleMonthlyDownload = (releaseId: string) => {
    const release = releases.find(r => r.id === releaseId);
    const releaseAssessments = assessments.filter(a => a.releaseId === releaseId);
    const releaseTeams = teams.filter(t => t.releaseId === releaseId);

    if (!release) return;

    // Create monthly Excel export
    const createMonthlyExcelDocument = (release: Release, assessments: ImpactAssessment[], teams: Team[]) => {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Impact Assessments - ${release.name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #b31b1b; padding-bottom: 20px; }
            .header h1 { color: #b31b1b; margin: 0; font-size: 24px; }
            .header p { color: #666; margin: 5px 0 0 0; }
            .team-section { margin: 30px 0; }
            .team-title { background-color: #b31b1b; color: white; padding: 10px 15px; margin: 0 0 15px 0; font-weight: bold; font-size: 16px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #000; padding: 12px; text-align: left; vertical-align: top; }
            th { background-color: #2196f3; color: white; font-weight: bold; }
            td { background-color: white; }
            tr:nth-child(even) td { background-color: #f8f9fa; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Impact Assessments - ${release.name}</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>

          ${teams.map(team => {
            const teamAssessments = assessments.filter(a => a.scrum === team.scrumTeam);
            
            if (teamAssessments.length === 0) return '';
            
            return `
              <div class="team-section">
                <h2 class="team-title">${team.name} (${team.scrumTeam})</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Component</th>
                      <th>JIRA Link</th>
                      <th>Summary</th>
                      <th>Technical Comment</th>
                      <th>Content Changes</th>
                      <th>Backward Compatibility</th>
                      <th>Created By</th>
                      <th>Created Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${teamAssessments.map(assessment => `
                      <tr>
                        <td>${assessment.project || ''}</td>
                        <td>${assessment.component || ''}</td>
                        <td>${assessment.jiraLink || ''}</td>
                        <td>${assessment.summary || ''}</td>
                        <td>${assessment.technicalComment || ''}</td>
                        <td>${assessment.contentChanges || ''}</td>
                        <td>${assessment.backwardCompatibility || ''}</td>
                        <td>${assessment.createdBy || ''}</td>
                        <td>${assessment.createdAt ? new Date(assessment.createdAt).toLocaleDateString() : ''}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `;
          }).join('')}

          <div class="footer">
            <p>This document was automatically generated from the Impact Assessment Dashboard System.</p>
            <p>© ${new Date().getFullYear()} Wells Fargo & Company. All rights reserved.</p>
          </div>
        </body>
        </html>
      `;

      return htmlContent;
    };

    // Generate and download the document
    const htmlContent = createMonthlyExcelDocument(release, releaseAssessments, releaseTeams);
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Impact_Assessments_${release.name.replace(/\s+/g, '_')}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalAssessments = assessments.length;
    const activeReleases = releases.filter(r => r.status === 'in-progress').length;
    const totalTeams = teams.length;
    const frozenReleases = releases.filter(r => r.isFrozen).length;

    return { totalAssessments, activeReleases, totalTeams, frozenReleases };
  }, [assessments, releases, teams]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
            Impact Assessment Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage impact assessments across all release cycles
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Assessments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAssessments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Releases</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeReleases}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scrum Teams</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTeams}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Frozen Releases</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.frozenReleases}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Release Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {releases.map((release) => {
          const releaseAssessments = assessments.filter(a => a.releaseId === release.id);
          const releaseTeams = getTeamsForRelease(release.id);
          
          return (
            <div
              key={release.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {release.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {release.month} {release.year}
                    </p>
                  </div>
                  {release.isFrozen && (
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 rounded-full">
                      Frozen
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-600">{releaseAssessments.length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Assessments</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{releaseTeams.length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Teams</p>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => handleShowTeams(release.id)}
                    className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <Users className="w-4 h-4" />
                    <span>Show Teams</span>
                  </button>

                  <button
                    onClick={() => handleMonthlyDownload(release.id)}
                    className="w-full flex items-center justify-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Excel</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImpactAssessmentDashboard;