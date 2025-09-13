import { BroadcastAlert } from '../types/broadcastAlert';

export const mockBroadcastAlerts: BroadcastAlert[] = [
  {
    id: 'alert-1',
    timestamp: new Date('2024-01-28T14:30:00Z'),
    fileName: 'system_update_v2.1.zip',
    filePath: '/uploads/system_update_v2.1.zip',
    fileSize: 15728640, // 15MB
    destinationIP: '192.168.1.100',
    transferStatus: 'success',
    transferProgress: 100,
    transferStartTime: new Date('2024-01-28T14:30:00Z'),
    transferEndTime: new Date('2024-01-28T14:32:15Z'),
    transferSpeed: '7.2 MB/s',
    createdBy: 'John Smith',
    metadata: {
      fileType: 'application/zip',
      checksum: 'sha256:a1b2c3d4e5f6...',
      retryCount: 0
    }
  },
  {
    id: 'alert-2',
    timestamp: new Date('2024-01-28T10:15:00Z'),
    fileName: 'security_patch_jan2024.exe',
    filePath: '/uploads/security_patch_jan2024.exe',
    fileSize: 8388608, // 8MB
    destinationIP: '192.168.1.101',
    transferStatus: 'failed',
    transferProgress: 45,
    errorMessage: 'Connection timeout after 45% transfer',
    transferStartTime: new Date('2024-01-28T10:15:00Z'),
    transferEndTime: new Date('2024-01-28T10:17:30Z'),
    transferSpeed: '2.1 MB/s',
    createdBy: 'Sarah Johnson',
    metadata: {
      fileType: 'application/x-msdownload',
      retryCount: 2
    }
  },
  {
    id: 'alert-3',
    timestamp: new Date('2024-01-27T16:45:00Z'),
    fileName: 'config_backup_20240127.tar.gz',
    filePath: '/uploads/config_backup_20240127.tar.gz',
    fileSize: 5242880, // 5MB
    destinationIP: '192.168.1.102',
    transferStatus: 'success',
    transferProgress: 100,
    transferStartTime: new Date('2024-01-27T16:45:00Z'),
    transferEndTime: new Date('2024-01-27T16:46:20Z'),
    transferSpeed: '6.5 MB/s',
    createdBy: 'Mike Chen',
    metadata: {
      fileType: 'application/gzip',
      checksum: 'sha256:f7e8d9c0b1a2...',
      retryCount: 0
    }
  },
  {
    id: 'alert-4',
    timestamp: new Date('2024-01-27T09:20:00Z'),
    fileName: 'database_migration_script.sql',
    filePath: '/uploads/database_migration_script.sql',
    fileSize: 1048576, // 1MB
    destinationIP: '192.168.1.103',
    transferStatus: 'in-progress',
    transferProgress: 78,
    transferStartTime: new Date('2024-01-27T09:20:00Z'),
    transferSpeed: '1.8 MB/s',
    createdBy: 'Lisa Wang',
    metadata: {
      fileType: 'application/sql',
      retryCount: 0
    }
  },
  {
    id: 'alert-5',
    timestamp: new Date('2024-01-26T13:10:00Z'),
    fileName: 'monitoring_agent_v3.2.msi',
    filePath: '/uploads/monitoring_agent_v3.2.msi',
    fileSize: 12582912, // 12MB
    destinationIP: '192.168.1.104',
    transferStatus: 'cancelled',
    transferProgress: 23,
    errorMessage: 'Transfer cancelled by user',
    transferStartTime: new Date('2024-01-26T13:10:00Z'),
    transferEndTime: new Date('2024-01-26T13:11:45Z'),
    transferSpeed: '3.4 MB/s',
    createdBy: 'David Brown',
    metadata: {
      fileType: 'application/x-msi',
      retryCount: 0
    }
  }
];

// Mock FTP Transfer Service
export const mockFTPTransfer = {
  // Simulate FTP transfer with progress updates
  async startTransfer(request: any): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transferId: `transfer-${Date.now()}`,
          message: 'Transfer started successfully'
        });
      }, 500);
    });
  },

  // Simulate transfer progress updates
  async getTransferProgress(transferId: string): Promise<any> {
    return new Promise((resolve) => {
      const progress = Math.min(100, Math.random() * 100);
      const status = progress === 100 ? 'success' : 'in-progress';
      
      setTimeout(() => {
        resolve({
          transferId,
          progress,
          speed: `${(Math.random() * 10 + 1).toFixed(1)} MB/s`,
          status,
          error: null
        });
      }, 100);
    });
  },

  // Validate IP address format
  validateIP(ip: string): boolean {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  },

  // Validate file format
  validateFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const allowedTypes = [
      'application/zip',
      'application/x-zip-compressed',
      'application/x-msdownload',
      'application/gzip',
      'application/x-tar',
      'application/sql',
      'application/x-msi',
      'text/plain',
      'application/json',
      'application/xml'
    ];

    if (file.size > maxSize) {
      return { isValid: false, error: 'File size exceeds 100MB limit' };
    }

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(zip|exe|tar|gz|sql|msi|txt|json|xml)$/i)) {
      return { isValid: false, error: 'File type not supported' };
    }

    return { isValid: true };
  }
};

// Simulate real-time transfer progress
export const simulateTransferProgress = async (
  transferId: string,
  onProgress: (progress: any) => void,
  onComplete: (result: any) => void
): Promise<void> => {
  let progress = 0;
  const interval = setInterval(async () => {
    progress += Math.random() * 15 + 5; // Random progress increment
    
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      
      const finalResult = {
        transferId,
        progress: 100,
        speed: '0 MB/s',
        status: 'success',
        error: null
      };
      
      onProgress(finalResult);
      onComplete(finalResult);
    } else {
      const progressUpdate = {
        transferId,
        progress: Math.round(progress),
        speed: `${(Math.random() * 8 + 2).toFixed(1)} MB/s`,
        status: 'in-progress',
        error: null
      };
      
      onProgress(progressUpdate);
    }
  }, 1000); // Update every second
};