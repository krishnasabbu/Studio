export interface BroadcastAlert {
  id: string;
  timestamp: Date;
  fileName: string;
  filePath: string;
  fileSize: number;
  destinationIP: string;
  transferStatus: 'pending' | 'in-progress' | 'success' | 'failed' | 'cancelled';
  transferProgress: number;
  errorMessage?: string;
  transferStartTime?: Date;
  transferEndTime?: Date;
  transferSpeed?: string;
  createdBy: string;
  metadata?: {
    fileType: string;
    checksum?: string;
    retryCount: number;
  };
}

export interface BroadcastAlertFilters {
  search: string;
  status: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  destinationIP: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface FTPTransferRequest {
  destinationIP: string;
  filePath: string;
  file: File;
  credentials?: {
    username: string;
    password: string;
  };
}

export interface FTPTransferResponse {
  success: boolean;
  transferId: string;
  message: string;
  error?: string;
}

export interface TransferProgress {
  transferId: string;
  progress: number;
  speed: string;
  status: 'pending' | 'in-progress' | 'success' | 'failed' | 'cancelled';
  error?: string;
}