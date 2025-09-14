export interface BroadcastConfig {
  id: string;
  hostIP: string;
  hostPort: number;
  username: string;
  password: string; // In production, this should be encrypted
  protocol: 'FTP' | 'SFTP' | 'SCP';
  destinationPath: string;
  maxFileSize: number; // in bytes
  allowedFileTypes: string[];
  retryAttempts: number;
  timeoutSeconds: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastUsed?: Date;
}

export interface BroadcastConfigFilters {
  search: string;
  protocol: string;
  isActive: boolean | null;
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}