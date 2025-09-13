import { Microservice, GitCommit, LogEntry } from '../types/buildSimulation';

export const mockMicroservices: Microservice[] = [
  {
    id: 'ms-1',
    name: 'alert-webservices',
    lastChangeDate: new Date('2024-01-15T10:30:00Z'),
    status: 'pending',
    buildLogs: []
  },
  {
    id: 'ms-2',
    name: 'notification-service',
    lastChangeDate: new Date('2024-01-14T14:20:00Z'),
    status: 'pending',
    buildLogs: []
  },
  {
    id: 'ms-3',
    name: 'user-management',
    lastChangeDate: new Date('2024-01-13T09:15:00Z'),
    status: 'pending',
    buildLogs: []
  },
  {
    id: 'ms-4',
    name: 'payment-gateway',
    lastChangeDate: new Date('2024-01-12T16:45:00Z'),
    status: 'pending',
    buildLogs: []
  },
  {
    id: 'ms-5',
    name: 'audit-service',
    lastChangeDate: new Date('2024-01-11T11:30:00Z'),
    status: 'pending',
    buildLogs: []
  }
];

export const mockGitCommits: { [key: string]: GitCommit[] } = {
  'ms-1': [
    {
      id: 'commit-1',
      message: 'Fix alert processing bug',
      author: 'John Smith',
      date: new Date('2024-01-15T10:30:00Z'),
      hash: 'a1b2c3d4'
    },
    {
      id: 'commit-2',
      message: 'Update API documentation',
      author: 'Jane Doe',
      date: new Date('2024-01-14T15:20:00Z'),
      hash: 'e5f6g7h8'
    }
  ],
  'ms-2': [
    {
      id: 'commit-3',
      message: 'Enhance notification templates',
      author: 'Mike Johnson',
      date: new Date('2024-01-14T14:20:00Z'),
      hash: 'i9j0k1l2'
    }
  ],
  'ms-3': [
    {
      id: 'commit-4',
      message: 'Add user validation',
      author: 'Sarah Wilson',
      date: new Date('2024-01-13T09:15:00Z'),
      hash: 'm3n4o5p6'
    }
  ],
  'ms-4': [
    {
      id: 'commit-5',
      message: 'Update payment processing',
      author: 'David Brown',
      date: new Date('2024-01-12T16:45:00Z'),
      hash: 'q7r8s9t0'
    }
  ],
  'ms-5': [
    {
      id: 'commit-6',
      message: 'Improve audit logging',
      author: 'Lisa Chen',
      date: new Date('2024-01-11T11:30:00Z'),
      hash: 'u1v2w3x4'
    }
  ]
};

// Mock function to simulate Git API validation - ALWAYS SUCCESS
export const validateGitCommits = async (microservices: Microservice[]): Promise<{
  isValid: boolean;
  discrepancies: string[];
  validatedMicroservices: Microservice[];
}> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Always return success for end-to-end flow
  const validatedMicroservices = microservices.map(ms => ({
    ...ms,
    gitCommits: mockGitCommits[ms.id] || []
  }));
  
  return {
    isValid: true, // Always true for demo
    discrepancies: [], // No discrepancies
    validatedMicroservices
  };
};

// Mock build logs generation
export const generateBuildLogs = (microserviceName: string, status: string): LogEntry[] => {
  const baseTime = new Date();
  const logs: LogEntry[] = [];
  
  switch (status) {
    case 'started':
      logs.push({
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date(baseTime.getTime() - 1000),
        level: 'info',
        message: `🚀 Starting build pipeline for ${microserviceName}`,
        microservice: microserviceName
      });
      break;
      
    case 'in-progress':
      logs.push(
        {
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp: new Date(baseTime.getTime() - 500),
          level: 'info',
          message: `📦 Downloading dependencies for ${microserviceName}...`,
          microservice: microserviceName
        },
        {
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp: baseTime,
          level: 'info',
          message: `⚙️ Compiling source code for ${microserviceName}...`,
          microservice: microserviceName
        }
      );
      break;
      
    case 'success':
      logs.push({
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: baseTime,
        level: 'success',
        message: `✅ Build completed successfully for ${microserviceName} - All tests passed!`,
        microservice: microserviceName
      });
      break;
      
    case 'fail':
      // For demo, we won't use fail - but keeping it for completeness
      logs.push({
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: baseTime,
        level: 'error',
        message: `❌ Build failed for ${microserviceName}: Compilation error in main.java:45`,
        microservice: microserviceName
      });
      break;
  }
  
  return logs;
};

// Simulate build process - ALWAYS SUCCESS
export const simulateBuildProcess = async (
  microservices: Microservice[],
  onStatusUpdate: (microservices: Microservice[]) => void,
  onLogsUpdate: (logs: LogEntry[]) => void,
  isPaused: () => boolean
): Promise<void> => {
  const allLogs: LogEntry[] = [];
  const statuses = ['started', 'in-progress', 'success']; // Removed 'fail' for demo
  
  // Process all microservices concurrently
  const buildPromises = microservices.map(async (microservice, index) => {
    // Stagger the start times
    await new Promise(resolve => setTimeout(resolve, index * 800));
    
    for (let i = 0; i < statuses.length; i++) {
      if (isPaused()) break;
      
      const status = statuses[i];
      
      // Update microservice status
      const updatedMicroservices = microservices.map(ms => 
        ms.id === microservice.id ? { ...ms, status: status as any } : ms
      );
      onStatusUpdate(updatedMicroservices);
      
      // Generate and add logs
      const newLogs = generateBuildLogs(microservice.name, status);
      allLogs.push(...newLogs);
      onLogsUpdate([...allLogs]);
      
      // Delay between status changes (1-2 seconds)
      const delay = Math.random() * 1000 + 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  });
  
  await Promise.all(buildPromises);
};