export interface Microservice {
  id: string;
  name: string;
  lastChangeDate: Date;
  status: 'pending' | 'started' | 'in-progress' | 'success' | 'fail';
  gitCommits?: GitCommit[];
  buildLogs?: string[];
}

export interface GitCommit {
  id: string;
  message: string;
  author: string;
  date: Date;
  hash: string;
}

export interface BuildSimulationState {
  microservices: Microservice[];
  isValidated: boolean;
  hasDiscrepancies: boolean;
  discrepancies: string[];
  buildInProgress: boolean;
  logs: LogEntry[];
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  microservice?: string;
}

export interface ValidationResult {
  isValid: boolean;
  discrepancies: string[];
  microservices: Microservice[];
}