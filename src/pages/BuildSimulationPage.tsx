import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Square, Copy, Download, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Microservice, LogEntry } from '../types/buildSimulation';
import { simulateBuildProcess } from '../data/mockBuildData';

const BuildSimulationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  
  const [microservices, setMicroservices] = useState<Microservice[]>(
    location.state?.microservices || []
  );
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [buildInProgress, setBuildInProgress] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [buildCompleted, setBuildCompleted] = useState(false);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Handle manual scroll to detect if user scrolled up
  const handleScroll = () => {
    if (logsContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = logsContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setAutoScroll(isAtBottom);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'started': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'fail': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-progress': return <RefreshCw className="w-4 h-4 animate-spin text-yellow-600" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'fail': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'started': return <RefreshCw className="w-4 h-4 text-blue-600" />;
      default: return <span className="text-gray-400">⏳</span>;
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'text-blue-600 dark:text-blue-400';
      case 'warn': return 'text-yellow-600 dark:text-yellow-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      case 'success': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const handleStartBuild = async () => {
    setBuildInProgress(true);
    setBuildCompleted(false);
    setIsPaused(false);
    setLogs([]);
    
    // Reset all microservices to pending
    const resetMicroservices = microservices.map(ms => ({ ...ms, status: 'pending' as any }));
    setMicroservices(resetMicroservices);
    
    try {
      await simulateBuildProcess(
        resetMicroservices,
        setMicroservices,
        setLogs,
        () => isPaused
      );
      setBuildCompleted(true);
    } catch (error) {
      console.error('Build simulation failed:', error);
    } finally {
      setBuildInProgress(false);
    }
  };

  const handlePauseBuild = () => {
    setIsPaused(true);
    setBuildInProgress(false);
  };

  const handleStopBuild = () => {
    setIsPaused(false);
    setBuildInProgress(false);
    setBuildCompleted(false);
    setMicroservices(prev => prev.map(ms => ({ ...ms, status: 'pending' as any })));
    setLogs([]);
  };

  const copyLogs = () => {
    const logsText = logs.map(log => 
      `[${log.timestamp.toISOString()}] ${log.level.toUpperCase()}: ${log.message}`
    ).join('\n');
    
    navigator.clipboard.writeText(logsText);
  };

  const downloadLogs = () => {
    const logsText = logs.map(log => 
      `[${log.timestamp.toISOString()}] ${log.level.toUpperCase()}: ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `build-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getCompletionStats = () => {
    const completed = microservices.filter(ms => ms.status === 'success' || ms.status === 'fail').length;
    const total = microservices.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  if (microservices.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-wells-fargo">
            No Microservices Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please go back to validation page first.
          </p>
          <button
            onClick={() => navigate('/build-validation')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Go to Validation
          </button>
        </div>
      </div>
    );
  }

  const stats = getCompletionStats();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/build-validation')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-wells-fargo">
                🚀 Build Simulation Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Monitor microservices build status and real-time logs
              </p>
            </div>
          </div>
          
          {/* Build Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleStartBuild}
              disabled={buildInProgress}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <Play className="w-5 h-5" />
              <span>Start Build Pipeline</span>
            </button>
            
            {buildInProgress && (
              <button
                onClick={handlePauseBuild}
                className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </button>
            )}
            
            <button
              onClick={handleStopBuild}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
            >
              <Square className="w-5 h-5" />
              <span>Stop</span>
            </button>
          </div>
        </div>

        {/* Progress Summary */}
        {(buildInProgress || buildCompleted) && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-wells-fargo">
                📊 Build Progress
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stats.completed} of {stats.total} completed ({stats.percentage}%)
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              ></div>
            </div>
            {buildCompleted && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 dark:text-green-300 font-medium">
                    🎉 All builds completed successfully! Ready for deployment.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section A: Microservices Build Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white font-wells-fargo">
                🏗️ Microservices Build Status
              </h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {microservices.map((microservice) => (
                  <div
                    key={microservice.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8">
                        {getStatusIcon(microservice.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white font-wells-fargo">
                          {microservice.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Last change: {microservice.lastChangeDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(microservice.status)}`}>
                      {microservice.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section B: Real-Time Logs Viewer */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white font-wells-fargo">
                📝 Real-Time Build Logs
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={copyLogs}
                  disabled={logs.length === 0}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Copy logs"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={downloadLogs}
                  disabled={logs.length === 0}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Download logs"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div 
              ref={logsContainerRef}
              onScroll={handleScroll}
              className="h-96 overflow-y-auto p-4 bg-gray-900 dark:bg-gray-950 font-mono text-sm"
            >
              {logs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <p>🚀 No logs yet. Start the build pipeline to see real-time logs.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-3">
                      <span className="text-gray-400 dark:text-gray-500 text-xs mt-0.5 w-20 flex-shrink-0">
                        {formatTime(log.timestamp)}
                      </span>
                      <span className={`text-xs font-medium w-16 flex-shrink-0 ${getLogLevelColor(log.level)}`}>
                        [{log.level.toUpperCase()}]
                      </span>
                      <span className="text-gray-300 dark:text-gray-200 flex-1">
                        {log.message}
                      </span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>
            
            {/* Auto-scroll indicator */}
            {!autoScroll && logs.length > 0 && (
              <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800">
                <button
                  onClick={() => {
                    setAutoScroll(true);
                    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-sm text-yellow-800 dark:text-yellow-300 hover:underline"
                >
                  📜 Auto-scroll disabled. Click to scroll to bottom.
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildSimulationPage;