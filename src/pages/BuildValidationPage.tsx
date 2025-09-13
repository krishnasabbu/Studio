import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GitBranch, AlertTriangle, CheckCircle, RefreshCw, Calendar, User, Play, Search } from 'lucide-react';
import { Microservice, ValidationResult } from '../types/buildSimulation';
import { mockMicroservices, validateGitCommits } from '../data/mockBuildData';

const BuildValidationPage: React.FC = () => {
  const navigate = useNavigate();
  const [microservices, setMicroservices] = useState<Microservice[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});
  const [releaseNumber, setReleaseNumber] = useState('');
  const [hasStartedValidation, setHasStartedValidation] = useState(false);

  const handleValidation = async () => {
    if (!releaseNumber.trim()) {
      alert('Please enter a release number');
      return;
    }

    setIsValidating(true);
    setValidationResult(null);
    setHasStartedValidation(true);
    
    try {
      // Set microservices data when validation starts
      setMicroservices(mockMicroservices);
      
      const result = await validateGitCommits(mockMicroservices);
      setValidationResult(result);
      setMicroservices(result.validatedMicroservices);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleProceed = () => {
    if (validationResult?.isValid) {
      navigate('/build-simulation', { 
        state: { microservices: validationResult.validatedMicroservices } 
      });
    }
  };

  const toggleDetails = (microserviceId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [microserviceId]: !prev[microserviceId]
    }));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/impact-assessments')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-primary-700 dark:text-white font-wells-fargo">
                Git Validation & Impact Assessment
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Enter release number to validate microservices against Git repository commits
              </p>
            </div>
          </div>
        </div>

        {/* Release Number Input Section */}
        {!hasStartedValidation && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center max-w-2xl mx-auto">
              <div className="mb-6">
                <Search className="w-16 h-16 mx-auto text-primary-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-wells-fargo mb-2">
                  Release Validation
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter the release number to validate impacted microservices against Git repository commits
                </p>
              </div>

              <div className="space-y-6">
                <div className="max-w-md mx-auto">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Release Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={releaseNumber}
                    onChange={(e) => setReleaseNumber(e.target.value)}
                    placeholder="e.g., R2024.01, v1.2.3, Release-Jan-2024"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-lg"
                    onKeyPress={(e) => e.key === 'Enter' && handleValidation()}
                  />
                </div>

                <button
                  onClick={handleValidation}
                  disabled={isValidating || !releaseNumber.trim()}
                  className="flex items-center space-x-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg mx-auto"
                >
                  <GitBranch className="w-6 h-6" />
                  <span>Validate Release</span>
                </button>
              </div>

              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                      What happens during validation?
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                      <li>• System retrieves impacted microservices for the release</li>
                      <li>• Cross-checks Git commits against backend data</li>
                      <li>• Identifies any discrepancies or missing commits</li>
                      <li>• Provides detailed validation report</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Validation Status */}
        {validationResult && (
          <div className={`mb-8 p-6 rounded-lg border-2 ${
            validationResult.isValid 
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
              : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
          }`}>
            <div className="flex items-start space-x-4">
              {validationResult.isValid ? (
                <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <h3 className={`text-lg font-semibold mb-2 font-wells-fargo ${
                  validationResult.isValid ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                }`}>
                  {validationResult.isValid ? `✅ Validation Successful for Release: ${releaseNumber}` : '❌ Validation Failed - Discrepancies Found'}
                </h3>
                
                {!validationResult.isValid && (
                  <div className="space-y-2">
                    <p className="text-red-700 dark:text-red-300 font-medium">
                      The following discrepancies were found:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-red-600 dark:text-red-400">
                      {validationResult.discrepancies.map((discrepancy, index) => (
                        <li key={index} className="text-sm">{discrepancy}</li>
                      ))}
                    </ul>
                    <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <p className="text-red-800 dark:text-red-300 font-medium text-sm">
                        ⚠️ You must resolve these discrepancies before proceeding to the build simulation.
                      </p>
                    </div>
                  </div>
                )}
                
                {validationResult.isValid && (
                  <div className="space-y-2">
                    <p className="text-green-700 dark:text-green-300 font-medium">
                      🎉 All microservices are synchronized with Git repository!
                    </p>
                    <p className="text-green-600 dark:text-green-400 text-sm">
                      • {microservices.length} microservices validated for release {releaseNumber}
                      • All Git commits match backend data
                      • Ready to proceed with build simulation
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isValidating && (
          <div className="mb-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center space-x-4">
              <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-wells-fargo">
                  🔍 Validating Release {releaseNumber}...
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Checking for discrepancies between backend data and Git repository
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Microservices List */}
        {microservices.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white font-wells-fargo">
                📦 Impacted Microservices for Release {releaseNumber} ({microservices.length})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {microservices.map((microservice) => (
                <div key={microservice.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                        <GitBranch className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-wells-fargo">
                          {microservice.name}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Last Change: {formatDate(microservice.lastChangeDate)}</span>
                          </div>
                          {microservice.gitCommits && microservice.gitCommits.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <GitBranch className="w-4 h-4" />
                              <span className="text-green-600 font-medium">✅ {microservice.gitCommits.length} commits validated</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {microservice.gitCommits && microservice.gitCommits.length > 0 && (
                      <button
                        onClick={() => toggleDetails(microservice.id)}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm bg-primary-50 hover:bg-primary-100 px-3 py-1 rounded-lg transition-colors"
                      >
                        {showDetails[microservice.id] ? 'Hide Details' : 'Show Git Commits'}
                      </button>
                    )}
                  </div>
                  
                  {/* Git Commits Details */}
                  {showDetails[microservice.id] && microservice.gitCommits && (
                    <div className="mt-4 pl-14">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3 font-wells-fargo">📝 Recent Git Commits</h4>
                        <div className="space-y-3">
                          {microservice.gitCommits.map((commit) => (
                            <div key={commit.id} className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                    {commit.hash}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDate(commit.date)}
                                  </span>
                                </div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                  {commit.message}
                                </p>
                                <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
                                  <User className="w-3 h-3" />
                                  <span>{commit.author}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {hasStartedValidation && (
          <div className="mt-8 flex items-center justify-end space-x-4">
            <button
              onClick={() => navigate('/impact-assessments')}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleProceed}
              disabled={!validationResult?.isValid}
              className="flex items-center space-x-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <Play className="w-5 h-5" />
              <span>{validationResult?.isValid ? '🚀 Proceed to Build Simulation' : 'Resolve Discrepancies First'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildValidationPage;