import React, { useState, useEffect, useCallback } from 'react';
import { Dialog } from '@headlessui/react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  AlertTriangle,
  MessageSquare,
  X,
  GitBranch,
  Calendar,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Define TypeScript interface
interface Approval {
  id: string;
  workflowName: string;
  priority: string | null | undefined;
  requiredRole: string;
  requestedAt: string;
  requestedBy: string;
  stageName: string;
  reason?: string;
  viewURL: string;
  serviceName: string;
  viewWorkflowURL: string;
}

interface ApprovalsListProps {
  full: boolean;
}

const ApprovalsPage: React.FC<ApprovalsListProps> = ({
    full,
  }) => {
  const [pendingApprovals, setPendingApprovals] = useState<Approval[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [reason, setReason] = useState('');

  // Safely format priority with fallback
  const formatPriority = (priority: string | null | undefined): 'Low' | 'Medium' | 'High' => {
    const p = typeof priority === 'string' ? priority.trim().toLowerCase() : '';
    switch (p) {
      case 'low':
        return 'Low';
      case 'high':
        return 'High';
      case 'medium':
      default:
        return 'Medium';
    }
  };

  const getPriorityColor = (priority: string | null | undefined) => {
    const p = formatPriority(priority);
    switch (p) {
      case 'High':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityIcon = (priority: string | null | undefined) => {
    const p = formatPriority(priority);
    switch (p) {
      case 'High':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'Medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const fetchPendingApprovals = useCallback(async () => {
    try {
      setIsLoading(true);
      const baseUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080/api';
      const response = await fetch(`${baseUrl}/workflow-executors/pending-approvals`);

      if (response.ok) {
        const approvals = await response.json();
        setPendingApprovals(Array.isArray(approvals) ? approvals : []);
      } else {
        setPendingApprovals([]);
      }
    } catch (err) {
      console.error('Failed to fetch approvals:', err);
      setError('Failed to load pending approvals.');
      setPendingApprovals([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitApproval = async (approvalData: {
    approvalId: string;
    action: 'approve' | 'reject';
    reason?: string;
  }) => {
    try {
      const baseUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080/api';
      const response = await fetch(`${baseUrl}/approvals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approvalData),
      });

      if (!response.ok) throw new Error('Failed to submit approval');
    } catch (err) {
      console.error('Failed to submit approval:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
    const interval = setInterval(fetchPendingApprovals, 30000);
    return () => clearInterval(interval);
  }, [fetchPendingApprovals]);

  const handleApprovalAction = (approval: Approval, action: 'approve' | 'reject') => {
    setSelectedApproval(approval);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const handleSubmitApproval = async () => {
    if (!selectedApproval) return;

    if (approvalAction === 'reject' && !reason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    try {
      await submitApproval({
        approvalId: selectedApproval.id,
        action: approvalAction,
        reason: reason.trim() || undefined,
      });

      setShowApprovalModal(false);
      setSelectedApproval(null);
      setReason('');
      alert(`Approval ${approvalAction}d successfully!`);
    } catch {
      alert('Failed to submit approval. Please try again.');
    }
  };

  // Skeleton loader
  const SkeletonCard = () => (
    <Card className="p-6 bg-white animate-pulse border-l-4 border-l-yellow-500">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
              ))}
            </div>
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex space-x-2 ml-4">
          <div className="w-20 h-10 bg-gray-200 rounded"></div>
          <div className="w-20 h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </Card>
  );

  if (isLoading && pendingApprovals.length === 0 && full) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
              Pending Approvals
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Review and approve workflow steps
            </p>
          </div>
          <Button
            variant="outline"
            onClick={fetchPendingApprovals}
            disabled={isLoading}
            className="border-primary-300 text-primary-600 hover:bg-primary-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error && !isLoading) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={fetchPendingApprovals}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      { full && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
              Pending Approvals
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Review and approve workflow steps
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {pendingApprovals.length} pending approval(s)
            </span>
            <Button
              variant="outline"
              onClick={fetchPendingApprovals}
              disabled={isLoading}
              className="border-primary-300 text-primary-600 hover:bg-primary-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      )}
      
      {pendingApprovals.length === 0 ? (
        <Card className="p-12 text-center bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-yellow-500">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Pending Approvals
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            All workflow steps are up to date. Great job!
          </p>
          <Button
            onClick={fetchPendingApprovals}
            variant="outline"
            className="border-primary-300 text-primary-600 hover:bg-primary-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingApprovals.map((approval) => (
            <Card
              key={approval.id}
              className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-yellow-500"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <GitBranch className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    <h3 className="font-semibold text-primary-700 dark:text-white">
                      {approval.serviceName}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {getPriorityIcon(approval.priority)}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                          approval.priority
                        )}`}
                      >
                        {formatPriority(approval.priority)} Priority
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">Required Role:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {approval.requiredRole}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">Requested:</span>
                        <span className="text-gray-900 dark:text-white">
                          {new Date(approval.requestedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">Requested By:</span>
                        <span className="text-gray-900 dark:text-white">
                          {approval.requestedBy}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <GitBranch className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">Node:</span>
                        <span className="text-gray-900 dark:text-white">{approval.stageName}</span>
                      </div>
                    </div>
                  </div>

                  {approval.reason && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            Request Details:
                          </div>
                          <div className="text-sm text-blue-600 dark:text-blue-400">
                            {approval.reason}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {full ? (
                    <div className="flex space-x-2 ml-4">
                      <Link
                        to={approval.viewWorkflowURL}
                        className="flex items-center justify-center h-10 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <GitBranch className="h-4 w-4 mr-2" />
                        Workflow
                      </Link>
                      <Link
                        to={approval.viewURL}
                        className="flex items-center justify-center h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Link>
                      <Button
                        variant="primary"
                        onClick={() => handleApprovalAction(approval, 'approve')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleApprovalAction(approval, 'reject')}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                    ) : (
                        <div className="flex space-x-2 ml-4">
                        <Link
                          to={approval.viewWorkflowURL}
                          className="flex items-center justify-center h-10 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <GitBranch className="h-4 w-4" />
                        </Link>
                        <Link
                          to={approval.viewURL}
                          className="flex items-center justify-center h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Button
                          variant="primary"
                          onClick={() => handleApprovalAction(approval, 'approve')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleApprovalAction(approval, 'reject')}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                  )}
                
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Approval Modal */}
      <Dialog
        open={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          setSelectedApproval(null);
          setReason('');
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                {approvalAction === 'approve' ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
                <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                  {approvalAction === 'approve' ? 'Approve' : 'Reject'} Workflow Step
                </Dialog.Title>
              </div>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedApproval(null);
                  setReason('');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {selectedApproval && (
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <div>
                      <strong>Workflow:</strong> {selectedApproval.workflowName}
                    </div>
                    <div>
                      <strong>Stage:</strong> {selectedApproval.stageName}
                    </div>
                    <div>
                      <strong>Requested By:</strong> {selectedApproval.requestedBy}
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="approval-reason"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    {approvalAction === 'reject'
                      ? 'Reason for Rejection (Required)'
                      : 'Comments (Optional)'}
                  </label>
                  <textarea
                    id="approval-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                    placeholder={`Enter your ${
                      approvalAction === 'approve' ? 'approval comments' : 'rejection reason'
                    }...`}
                  />
                </div>
              </div>
            )}

            <div className="flex space-x-3 mt-6">
              <Button
                variant={approvalAction === 'approve' ? 'primary' : 'danger'}
                onClick={handleSubmitApproval}
                disabled={approvalAction === 'reject' && !reason.trim()}
                className={`flex-1 ${
                  approvalAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                } ${
                  approvalAction === 'reject' && !reason.trim()
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {approvalAction === 'approve' ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                {approvalAction === 'approve' ? 'Approve' : 'Reject'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedApproval(null);
                  setReason('');
                }}
                className="flex-1 border-primary-300 text-primary-600 hover:bg-primary-50"
              >
                Cancel
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default ApprovalsPage;