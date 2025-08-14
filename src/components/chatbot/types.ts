export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'action-buttons';
  attachments?: FileAttachment[];
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface ChatbotProps {
  className?: string;
  onTemplateOnboard?: () => void;
  onAlertOnboard?: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
  messages: Message[];
  version: number; // Schema version for migrations
}

export interface ActionButtonsProps {
  onTemplateOnboard: () => void;
  onAlertOnboard: () => void;
}

export type ChatPanelState = 'closed' | 'opening' | 'open' | 'closing';

export interface VoiceRecognitionState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
}

export interface MessageActionsProps {
  message: Message;
  onCopy: (content: string) => void;
  onDownload: (content: string) => void;
  onThumbsUp: (messageId: string) => void;
  onThumbsDown: (messageId: string) => void;
  onSpeak: (content: string) => void;
}

export interface Intent {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
  endpoint: string;
  initialResposne: string;
}