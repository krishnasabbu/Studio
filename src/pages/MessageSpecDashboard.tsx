import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Grid, List, Eye, Edit, Trash2, Download, Calendar, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { MessageSpec, MessageSpecFilters, PaginationState } from '../types/messageSpec';
import { mockMessageSpecs } from '../data/mockMessageSpecs';
import MessageSpecCard from '../components/messageSpec/MessageSpecCard';
import MessageSpecTable from '../components/messageSpec/MessageSpecTable';
import MessageSpecFiltersPanel from '../components/messageSpec/MessageSpecFilters';
import Pagination from '../components/ui/Pagination';
import { useNavigate } from 'react-router-dom';

const MessageSpecDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [showFilters, setShowFilters] = useState(false);
  const [messageSpecs] = useState<MessageSpec[]>(mockMessageSpecs);
  
  const [filters, setFilters] = useState<MessageSpecFilters>({
    search: '',
    category: '',
    status: '',
    priority: '',
    createdBy: '',
    dateRange: {
      start: null,
      end: null
    }
  });

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 12,
    total: 0
  });

  // Filter and search logic
  const filteredSpecs = useMemo(() => {
    let filtered = messageSpecs.filter(spec => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          spec.name.toLowerCase().includes(searchLower) ||
          spec.description.toLowerCase().includes(searchLower) ||
          spec.tags.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category && spec.category !== filters.category) return false;

      // Status filter
      if (filters.status && spec.status !== filters.status) return false;

      // Priority filter
      if (filters.priority && spec.priority !== filters.priority) return false;

      // Created by filter
      if (filters.createdBy && !spec.createdBy.toLowerCase().includes(filters.createdBy.toLowerCase())) return false;

      // Date range filter
      if (filters.dateRange.start && spec.createdAt < filters.dateRange.start) return false;
      if (filters.dateRange.end && spec.createdAt > filters.dateRange.end) return false;

      return true;
    });

    return filtered;
  }, [messageSpecs, filters]);

  // Pagination logic
  const paginatedSpecs = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredSpecs.slice(startIndex, endIndex);
  }, [filteredSpecs, pagination.page, pagination.pageSize]);

  // Update total when filtered specs change
  React.useEffect(() => {
    setPagination(prev => ({
      ...prev,
      total: filteredSpecs.length,
      page: 1 // Reset to first page when filters change
    }));
  }, [filteredSpecs.length]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  };

  const handleCreateNew = () => {
    navigate('/message-specs/create');
  };

  const handleView = (id: string) => {
    navigate(`/message-specs/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/message-specs/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    // In a real app, this would call an API
    console.log('Delete message spec:', id);
  };

  const handleDownload = (id: string) => {
    const spec = messageSpecs.find(s => s.id === id);
    if (!spec) return;

    // Create Word document content
    const createWordDocument = (spec: MessageSpec) => {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Message Specification - ${spec.name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #b31b1b; padding-bottom: 20px; }
            .header h1 { color: #b31b1b; margin: 0; font-size: 24px; }
            .header p { color: #666; margin: 5px 0 0 0; }
            .section { margin: 30px 0; }
            .section-title { background-color: #b31b1b; color: white; padding: 10px 15px; margin: 0 0 15px 0; font-weight: bold; font-size: 16px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; vertical-align: top; }
            th { background-color: #f8f9fa; font-weight: bold; width: 30%; }
            td { background-color: white; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .badge-tier { background-color: #dc3545; color: white; }
            .badge-type { background-color: #28a745; color: white; }
            .badge-category { background-color: #007bff; color: white; }
            .badge-regulatory { background-color: #ffc107; color: black; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Message Specification Document</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="section">
            <h2 class="section-title">Basic Information</h2>
            <table>
              <tr><th>Message ID</th><td>${spec.name || 'N/A'}</td></tr>
              <tr><th>Description</th><td>${spec.description || 'N/A'}</td></tr>
              <tr><th>Category<div style="font-size: 10px; color: #666; margin-top: 4px; line-height: 1.2;">• Email<br>• SMS<br>• Push<br>• In-App</div></th><td><span class="badge badge-category">${spec.category?.toUpperCase() || 'N/A'}</span></td></tr>
              <tr><th>Figma Link</th><td>${spec.figmaLink || 'N/A'}</td></tr>
              <tr><th>Owning Business Line</th><td>${spec.owningBusinessLine || 'N/A'}</td></tr>
              <tr><th>Sub-Business</th><td>${spec.nameOfSubBusiness || 'N/A'}</td></tr>
              <tr><th>Business Line Contact</th><td>${spec.businessLineContact || 'N/A'}</td></tr>
              <tr><th>Message Purpose</th><td>${spec.messagePurpose || 'N/A'}</td></tr>
              <tr><th>Trigger Event</th><td>${spec.triggerEvent || 'N/A'}</td></tr>
              <tr><th>Volume Estimate</th><td>${spec.volumeEstimate || 'N/A'}</td></tr>
              <tr><th>${renderFieldWithOptions('regulatory', 'Regulatory')}</th><td>${spec.regulatory === 'yes' ? '<span class="badge badge-regulatory">YES</span>' : 'No'}</td></tr>
            </table>
          </div>

          <div class="section">
            <h2 class="section-title">Classification & Details</h2>
            <table>
              <tr><th>${renderFieldWithOptions('tier', 'Tier')}</th><td><span class="badge badge-tier">${spec.tier || 'N/A'}</span></td></tr>
              <tr><th>${renderFieldWithOptions('type', 'Type')}</th><td><span class="badge badge-type">${spec.type?.toUpperCase() || 'N/A'}</span></td></tr>
              <tr><th>${renderFieldWithOptions('deliveryChannels', 'Delivery Channels')}</th><td>${spec.deliveryChannels?.join(', ') || 'N/A'}</td></tr>
              <tr><th>${renderFieldWithOptions('language', 'Language')}</th><td>${spec.language || 'N/A'}</td></tr>
              <tr><th>${renderFieldWithOptions('branding', 'Branding')}</th><td>${spec.branding || 'N/A'}</td></tr>
              <tr><th>${renderFieldWithOptions('brandValue', 'Brand Value')}</th><td>${spec.brandValue || 'N/A'}</td></tr>
              <tr><th>Co-Brand Requirements</th><td>${spec.coBrandRequirements || 'N/A'}</td></tr>
              <tr><th>${renderFieldWithOptions('wimSac', 'WIM SAC')}</th><td>${spec.wimSac || 'N/A'}</td></tr>
              <tr><th>${renderFieldWithOptions('cobrandAccounts', 'Cobrand Accounts')}</th><td>${spec.cobrandAccounts || 'N/A'}</td></tr>
              <tr><th>${renderFieldWithOptions('smallBusiness', 'Small Business')}</th><td>${spec.smallBusiness || 'N/A'}</td></tr>
              <tr><th>${renderFieldWithOptions('adaTesting', 'ADA Testing')}</th><td>${spec.adaTesting || 'N/A'}</td></tr>
              <tr><th>Customer Service Info</th><td>${spec.customerServiceInfo || 'N/A'}</td></tr>
              <tr><th>Illustration Image</th><td>${spec.illustrationImage || 'N/A'}</td></tr>
              <tr><th>${renderFieldWithOptions('attachment', 'Attachment')}</th><td>${spec.attachment || 'N/A'}</td></tr>
            </table>
          </div>

          <div class="section">
            <h2 class="section-title">Delivery Configuration</h2>
            <table>
              <tr><th>${renderFieldWithOptions('encryptedEmail', 'Encrypted Email')}</th><td>${spec.encryptedEmail || 'N/A'}</td></tr>
              <tr><th>${renderFieldWithOptions('alertSentTo', 'Alert Sent To')}</th><td>${spec.alertSentTo || 'N/A'}</td></tr>
              <tr><th>${renderFieldWithOptions('relationshipToAccount', 'Relationship to Account')}</th><td>${spec.relationshipToAccount || 'N/A'}</td></tr>
              <tr><th>${renderFieldWithOptions('userOrAccountBased', 'User/Account Based')}</th><td>${spec.userOrAccountBased || 'N/A'}</td></tr>
              <tr><th>APS Config Fields</th><td>${spec.apsConfigFields || 'N/A'}</td></tr>
              <tr><th>Secure Inbox Delivery Channel</th><td>${spec.secureInboxDeliveryChannel || 'N/A'}</td></tr>
              <tr><th>${renderFieldWithOptions('secureInboxTab', 'Secure Inbox Tab')}</th><td>${spec.secureInboxTab || 'N/A'}</td></tr>
              <tr><th>Secure Inbox Expiration Days</th><td>${spec.secureInboxExpirationDays || 'N/A'}</td></tr>
              <tr><th>${renderFieldWithOptions('secureInboxHighPriority', 'Secure Inbox High Priority')}</th><td>${spec.secureInboxHighPriority || 'N/A'}</td></tr>
              <tr><th>From Address Label</th><td>${spec.fromAddressLabel || 'N/A'}</td></tr>
              <tr><th>SMS Delivery Channel</th><td>${spec.smsDeliveryChannel || 'N/A'}</td></tr>
              <tr><th>SMS Opt-In Parameter</th><td>${spec.smsOptInParameter || 'N/A'}</td></tr>
              <tr><th>Short Code</th><td>${spec.shortCode || 'N/A'}</td></tr>
              <tr><th>${renderFieldWithOptions('subscription', 'Subscription')}</th><td>${spec.subscription || 'N/A'}</td></tr>
              <tr><th>${renderFieldWithOptions('subscriptionType', 'Subscription Type')}</th><td>${spec.subscriptionType || 'N/A'}</td></tr>
              <tr><th>Manage Alerts Tab</th><td>${spec.manageAlertsTab || 'N/A'}</td></tr>
              <tr><th>Subscription Page Verbiage</th><td>${spec.subscriptionPageVerbiage || 'N/A'}</td></tr>
            </table>
          </div>

          <div class="section">
            <h2 class="section-title">Processing Configuration</h2>
            <table>
              <tr><th>Navigation to Subscription</th><td>${spec.navigationToSubscription || 'N/A'}</td></tr>
              <tr><th>${renderFieldWithOptions('deliveryOptions', 'Delivery Options')}</th><td>${spec.deliveryOptions?.join(', ') || 'N/A'}</td></tr>
              <tr><th>Parameters</th><td>${spec.parameters || 'N/A'}</td></tr>
              <tr><th>Special Requirements</th><td>${spec.specialRequirements || 'N/A'}</td></tr>
              <tr><th>Product Code Mapping</th><td>${spec.productCodeMapping || 'N/A'}</td></tr>
              <tr><th>Processing</th><td>${spec.processing || 'N/A'}</td></tr>
              <tr><th>Upstream Systems Flow</th><td>${spec.upstreamSystemsFlow || 'N/A'}</td></tr>
              <tr><th>Upstream Technical Contact</th><td>${spec.upstreamTechnicalContact || 'N/A'}</td></tr>
              <tr><th>Alerts Processing Journey</th><td>${spec.alertsProcessingJourney || 'N/A'}</td></tr>
              <tr><th>Processing SLA Queue</th><td>${spec.processingSlaQueue || 'N/A'}</td></tr>
              <tr><th>${renderFieldWithOptions('triggerType', 'Trigger Type')}</th><td>${spec.triggerType || 'N/A'}</td></tr>
            </table>
          </div>

          <div class="section">
            <h2 class="section-title">Monitoring & Links</h2>
            <table>
              <tr><th>${renderFieldWithOptions('process', 'Process')}</th><td>${spec.process || 'N/A'}</td></tr>
              <tr><th>${renderFieldWithOptions('bounceBackProcessing', 'Bounce Back Processing')}</th><td>${spec.bounceBackProcessing || 'N/A'}</td></tr>
              <tr><th>SOR Enhanced Bounceback</th><td>${spec.sorEnhancedBounceback || 'N/A'}</td></tr>
              <tr><th>Feedback Topic Queue</th><td>${spec.feedbackTopicQueue || 'N/A'}</td></tr>
              <tr><th>${renderFieldWithOptions('zlArchiveRequired', 'ZL Archive Required')}</th><td>${spec.zlArchiveRequired || 'N/A'}</td></tr>
              <tr><th>Message Request Expiration</th><td>${spec.messageRequestExpiration || 'N/A'}</td></tr>
              <tr><th>${renderFieldWithOptions('safeMode', 'Safe Mode')}</th><td>${spec.safeMode || 'N/A'}</td></tr>
              <tr><th>Monitoring Requirements</th><td>${spec.monitoringRequirements || 'N/A'}</td></tr>
              <tr><th>Error Remediation Plan</th><td>${spec.errorRemediationPlan || 'N/A'}</td></tr>
              <tr><th>Links</th><td>${spec.links || 'N/A'}</td></tr>
              <tr><th>CTA</th><td>${spec.cta || 'N/A'}</td></tr>
              <tr><th>uLinks</th><td>${spec.uLinks || 'N/A'}</td></tr>
              <tr><th>SAML Links</th><td>${spec.samlLinks || 'N/A'}</td></tr>
              <tr><th>External Links</th><td>${spec.externalLinks || 'N/A'}</td></tr>
              <tr><th>Push Token</th><td>${spec.pushToken || 'N/A'}</td></tr>
            </table>
          </div>

          <div class="section">
            <h2 class="section-title">System Information</h2>
            <table>
              <tr><th>Created By</th><td>${spec.createdBy || 'N/A'}</td></tr>
              <tr><th>Created At</th><td>${spec.createdAt ? new Date(spec.createdAt).toLocaleDateString() : 'N/A'}</td></tr>
              <tr><th>Updated At</th><td>${spec.updatedAt ? new Date(spec.updatedAt).toLocaleDateString() : 'N/A'}</td></tr>
              <tr><th>Version</th><td>${spec.version || 'N/A'}</td></tr>
              <tr><th>${renderFieldWithOptions('status', 'Status')}</th><td>${spec.status?.toUpperCase() || 'N/A'}</td></tr>
              <tr><th>${renderFieldWithOptions('priority', 'Priority')}</th><td>${spec.priority?.toUpperCase() || 'N/A'}</td></tr>
              <tr><th>Tags</th><td>${spec.tags?.join(', ') || 'N/A'}</td></tr>
            </table>
          </div>

          <div class="footer">
            <p>This document was automatically generated from the Wells Fargo Message Specification System.</p>
            <p>© ${new Date().getFullYear()} Wells Fargo & Company. All rights reserved.</p>
          </div>
        </body>
        </html>
      `;

      return htmlContent;
    };

    // Generate and download the document
    const htmlContent = createWordDocument(spec);
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MessageSpec_${spec.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  // Calculate summary stats
  // Field options for multi-value fields
  const getFieldOptions = (fieldName: string): string[] => {
    const fieldOptionsMap: { [key: string]: string[] } = {
      'tier': [
        'Urgent',
        'Regulatory with Financial Impact', 
        'Regulatory with no Financial Impact',
        'Fraud',
        'Contractual',
        'High Business Importance',
        'Other'
      ],
      'type': [
        'Regular',
        'Shell'
      ],
      'deliveryChannels': [
        'Email (HTML)',
        'Email (Text)',
        'SMS',
        'Push',
        'Secure Inbox',
        'In-App'
      ],
      'language': [
        'English',
        'Spanish',
        'Both'
      ],
      'branding': [
        'Regular (Retail)',
        'Private Bank',
        'Wealth Management',
        'Commercial',
        'Corporate'
      ],
      'brandValue': [
        'Database Setting',
        'Rules Based',
        'Custom'
      ],
      'regulatory': [
        'Yes',
        'No'
      ],
      'wimSac': [
        'Yes',
        'No'
      ],
      'cobrandAccounts': [
        'Yes',
        'No'
      ],
      'smallBusiness': [
        'Yes',
        'No'
      ],
      'adaTesting': [
        'Yes',
        'No'
      ],
      'attachment': [
        'Yes',
        'No'
      ],
      'encryptedEmail': [
        'Yes',
        'No'
      ],
      'alertSentTo': [
        'OLB',
        'Non-OLB',
        'Both OLB & Non-OLB or Prospect'
      ],
      'relationshipToAccount': [
        'Owner',
        'Joint Owner',
        'Authorized User',
        'Power of Attorney'
      ],
      'userOrAccountBased': [
        'User Based',
        'Account Based'
      ],
      'secureInboxTab': [
        'Inbox',
        'Alerts',
        'Statements',
        'Tax Documents'
      ],
      'secureInboxHighPriority': [
        'Yes',
        'No'
      ],
      'subscription': [
        'Yes',
        'No'
      ],
      'subscriptionType': [
        'Opt-in',
        'Opt-out'
      ],
      'deliveryOptions': [
        'Email',
        'SMS',
        'Push',
        'Secure Inbox'
      ],
      'triggerType': [
        'Kafka',
        'API',
        'Batch',
        'Real-time'
      ],
      'process': [
        'Alerts-express',
        'Normal'
      ],
      'bounceBackProcessing': [
        'Standard',
        'SOR',
        'Enhanced'
      ],
      'zlArchiveRequired': [
        'Yes',
        'No'
      ],
      'safeMode': [
        'Yes',
        'No'
      ],
      'status': [
        'Draft',
        'Active',
        'Inactive',
        'Archived'
      ],
      'priority': [
        'Low',
        'Medium',
        'High',
        'Critical'
      ]
    };
    
    return fieldOptionsMap[fieldName] || [];
  };

  // Enhanced field rendering with options
  const renderFieldWithOptions = (fieldName: string, displayName: string): string => {
    const options = getFieldOptions(fieldName);
    const optionsHtml = options.length > 0 
      ? `<div style="font-size: 10px; color: #666; margin-top: 4px; line-height: 1.2;">${options.map(option => `• ${option}`).join('<br>')}</div>`
      : '';
    
    return `${displayName}${optionsHtml}`;
  };
  const stats = useMemo(() => {
    const total = messageSpecs.length;
    const urgent = messageSpecs.filter(spec => spec.tier === 'Urgent').length;
    const regulatory = messageSpecs.filter(spec => spec.regulatory === 'yes').length;
    const fraud = messageSpecs.filter(spec => spec.tier === 'Fraud').length;

    return { total, urgent, regulatory, fraud };
  }, [messageSpecs]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
            Message Specifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your notification message templates and specifications
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <Plus className="w-5 h-5" />
          <span>Create New</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <Grid className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Specs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Urgent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.urgent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Regulatory</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.regulatory}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fraud Alerts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.fraud}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search message specs..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters
                ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-300'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'card'
                ? 'bg-white dark:bg-gray-600 text-primary-600 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'table'
                ? 'bg-white dark:bg-gray-600 text-primary-600 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <MessageSpecFiltersPanel
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={() => setFilters({
            search: '',
            category: '',
            status: '',
            priority: '',
            createdBy: '',
            dateRange: { start: null, end: null }
          })}
        />
      )}

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>
          Showing {paginatedSpecs.length} of {filteredSpecs.length} message specifications
        </span>
        <span>
          Page {pagination.page} of {Math.ceil(filteredSpecs.length / pagination.pageSize)}
        </span>
      </div>

      {/* Content */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedSpecs.map((spec) => (
            <MessageSpecCard
              key={spec.id}
              spec={spec}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDownload={handleDownload}
            />
          ))}
        </div>
      ) : (
        <MessageSpecTable
          specs={paginatedSpecs}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />
      )}

      {/* Empty State */}
      {filteredSpecs.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No message specifications found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Try adjusting your search criteria or create a new message specification.
          </p>
          <button
            onClick={handleCreateNew}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Create New Message Spec
          </button>
        </div>
      )}

      {/* Pagination */}
      {filteredSpecs.length > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={Math.ceil(filteredSpecs.length / pagination.pageSize)}
          pageSize={pagination.pageSize}
          totalItems={filteredSpecs.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
};

export default MessageSpecDashboard;