import { BroadcastConfig } from '../types/broadcastConfig';

export const mockBroadcastConfig: BroadcastConfig = {
  id: 'config-1',
  hostIP: '192.168.1.100',
  hostPort: 21,
  username: 'broadcast_user',
  password: 'secure_password_123', // In production, this would be encrypted
  protocol: 'SFTP',
  destinationPath: '/uploads/broadcast/',
  maxFileSize: 104857600, // 100MB
  allowedFileTypes: ['.zip', '.exe', '.tar', '.gz', '.sql', '.msi', '.txt', '.json', '.xml', '.pdf', '.doc', '.docx'],
  retryAttempts: 3,
  timeoutSeconds: 300,
  isActive: true,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-28T10:30:00Z'),
  createdBy: 'System Administrator',
  lastUsed: new Date('2024-01-28T14:30:00Z')
};

// Mock configuration service
export const mockConfigService = {
  // Get current active configuration
  async getActiveConfig(): Promise<BroadcastConfig | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockBroadcastConfig.isActive ? mockBroadcastConfig : null);
      }, 500);
    });
  },

  // Update configuration
  async updateConfig(config: Partial<BroadcastConfig>): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate validation
        if (!config.hostIP || !config.username) {
          resolve({ success: false, message: 'Host IP and username are required' });
          return;
        }

        // Update mock data
        Object.assign(mockBroadcastConfig, {
          ...config,
          updatedAt: new Date(),
          id: mockBroadcastConfig.id // Preserve ID
        });

        resolve({ success: true, message: 'Configuration updated successfully' });
      }, 1000);
    });
  },

  // Test connection with current config
  async testConnection(config?: Partial<BroadcastConfig>): Promise<{ success: boolean; message: string; latency?: number }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const testConfig = config || mockBroadcastConfig;
        
        // Simulate connection test
        if (!testConfig.hostIP) {
          resolve({ success: false, message: 'Host IP is required for connection test' });
          return;
        }

        // Simulate successful connection (90% success rate for demo)
        const isSuccess = Math.random() > 0.1;
        
        if (isSuccess) {
          resolve({ 
            success: true, 
            message: 'Connection successful', 
            latency: Math.floor(Math.random() * 100) + 50 
          });
        } else {
          resolve({ 
            success: false, 
            message: 'Connection failed: Host unreachable or authentication failed' 
          });
        }
      }, 2000);
    });
  },

  // Validate configuration
  validateConfig(config: Partial<BroadcastConfig>): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!config.hostIP) errors.push('Host IP address is required');
    if (!config.username) errors.push('Username is required');
    if (!config.password) errors.push('Password is required');
    if (!config.destinationPath) errors.push('Destination path is required');

    // IP validation
    if (config.hostIP && !/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(config.hostIP)) {
      errors.push('Invalid IP address format');
    }

    // Port validation
    if (config.hostPort && (config.hostPort < 1 || config.hostPort > 65535)) {
      errors.push('Port must be between 1 and 65535');
    }

    // File size validation
    if (config.maxFileSize && config.maxFileSize > 1073741824) { // 1GB
      warnings.push('Maximum file size is very large (>1GB). Consider reducing for better performance.');
    }

    // Security warnings
    if (config.protocol === 'FTP') {
      warnings.push('FTP protocol is not encrypted. Consider using SFTP for better security.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
};