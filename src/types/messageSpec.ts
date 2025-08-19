export interface MessageSpec {
  id: string;
  name: string;
  category: string;
  description: string;
  figmaLink: string;
  owningBusinessLine: string;
  nameOfSubBusiness: string;
  businessLineContact: string;
  messagePurpose: string;
  triggerEvent: string;
  volumeEstimate: string;
  regulatory: 'yes' | 'no' | '';
  
  // Details
  tier: string;
  type: 'regular' | 'shell' | '';
  deliveryChannels: string[];
  language: string;
  branding: string;
  brandValue: string;
  coBrandRequirements: string;
  wimSac: 'yes' | 'no' | '';
  cobrandAccounts: 'yes' | 'no' | '';
  smallBusiness: 'yes' | 'no' | '';
  adaTesting: 'yes' | 'no' | '';
  customerServiceInfo: string;
  illustrationImage: string;
  attachment: 'yes' | 'no' | '';
  
  // Delivery
  encryptedEmail: 'yes' | 'no' | '';
  alertSentTo: string;
  relationshipToAccount: string;
  userOrAccountBased: string;
  apsConfigFields: string;
  secureInboxDeliveryChannel: string;
  secureInboxTab: string;
  secureInboxExpirationDays: string;
  secureInboxHighPriority: 'yes' | 'no' | '';
  fromAddressLabel: string;
  smsDeliveryChannel: string;
  smsOptInParameter: string;
  shortCode: string;
  subscription: 'yes' | 'no' | '';
  subscriptionType: 'opt-in' | 'opt-out' | '';
  manageAlertsTab: string;
  subscriptionPageVerbiage: string;
  
  // Processing
  navigationToSubscription: string;
  deliveryOptions: string[];
  parameters: string;
  specialRequirements: string;
  productCodeMapping: string;
  processing: string;
  upstreamSystemsFlow: string;
  upstreamTechnicalContact: string;
  alertsProcessingJourney: string;
  processingSlaQueue: string;
  triggerType: string;
  
  // Monitoring
  process: 'alerts-express' | 'normal' | '';
  bounceBackProcessing: string;
  sorEnhancedBounceback: string;
  feedbackTopicQueue: string;
  zlArchiveRequired: 'yes' | 'no' | '';
  messageRequestExpiration: string;
  safeMode: 'yes' | 'no' | '';
  monitoringRequirements: string;
  errorRemediationPlan: string;
  links: string;
  cta: string;
  uLinks: string;
  samlLinks: string;
  externalLinks: string;
  pushToken: string;
  
  // System fields
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: string;
  status: 'draft' | 'active' | 'inactive' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  analytics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
  };
}

export interface MessageSpecFilters {
  search: string;
  category: string;
  status: string;
  priority: string;
  createdBy: string;
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