/* eslint-disable react-hooks/exhaustive-deps */
// ChatInput.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Mic, MicOff, Plus, X, Code, Camera, MapPin, Calendar, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileAttachment, VoiceRecognitionState, Intent } from './types';



interface ChatInputProps {
  onSendMessage: (message: string, attachments?: FileAttachment[], intent?: Intent) => void;
  onClearChat: () => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const AVAILABLE_INTENTS: Intent[] = [
  {
    id: 'voice-recording',
    name: 'Voice Recording',
    icon: Mic,
    description: 'Record voice messages',
    color: 'text-red-600',
    endpoint: '/api/voice-chat',
    initialResposne: 'Hey whats upp',
  },
  {
    id: 'code-snippet',
    name: 'Code Assistant',
    icon: Code,
    description: 'Get coding help and snippets',
    color: 'text-purple-600',
    endpoint: '/api/code-chat',
    initialResposne: 'Hey whats upp',
  },
  {
    id: 'camera',
    name: 'Visual Analysis',
    icon: Camera,
    description: 'Analyze images and visuals',
    color: 'text-orange-600',
    endpoint: '/api/vision-chat',
    initialResposne: 'Hey whats upp',
  },
  {
    id: 'location',
    name: 'Location Services',
    icon: MapPin,
    description: 'Location-based assistance',
    color: 'text-pink-600',
    endpoint: '/api/location-chat',
    initialResposne: 'Hey whats upp',
  },
  {
    id: 'schedule',
    name: 'Schedule Assistant',
    icon: Calendar,
    description: 'Schedule and calendar help',
    color: 'text-indigo-600',
    endpoint: '/api/schedule-chat',
    initialResposne: 'Hey whats upp',
  }
];

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false, onClearChat }) => {
  const [message, setMessage] = useState('');
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);
  const [showIntentPopup, setShowIntentPopup] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [voiceState, setVoiceState] = useState<VoiceRecognitionState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    error: null
  });

  const recognitionRef = useRef<any>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const plusButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceState(prev => ({ ...prev, isSupported: true }));
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setVoiceState(prev => ({ ...prev, isListening: true, error: null }));
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setVoiceState(prev => ({ ...prev, transcript }));
        setMessage(transcript);
      };
      recognition.onerror = (event: any) => setVoiceState(prev => ({ ...prev, isListening: false, error: event.error }));
      recognition.onend = () => setVoiceState(prev => ({ ...prev, isListening: false }));
      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        plusButtonRef.current &&
        !plusButtonRef.current.contains(e.target as Node)
      ) {
        setShowIntentPopup(false);
      }
    };

    if (showIntentPopup) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showIntentPopup]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSend = useCallback(() => {
    if (message.trim()) {
      onSendMessage(message.trim(), attachments, selectedIntent || undefined);
      setMessage('');
      setAttachments([]);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  }, [message, attachments, selectedIntent, onSendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const toggleIntentPopup = useCallback(() => {
    setShowIntentPopup(prev => !prev);
  }, []);

  const handleIntentSelect = useCallback((intent: Intent) => {
    if (intent.id === 'voice-recording') {
      toggleVoiceRecognition();
    }
    setSelectedIntent(intent);
    setShowIntentPopup(false);
    textareaRef.current?.focus();
    onClearChat();
    onSendMessage('', [], intent);
  }, [onSendMessage, onClearChat]);

  const handleIntentDeselect = useCallback(() => {
    if (voiceState.isListening) recognitionRef.current?.stop();
    setSelectedIntent(null);
    textareaRef.current?.focus();
  }, [voiceState.isListening]);

  const toggleVoiceRecognition = useCallback(() => {
    if (!voiceState.isSupported) {
      setVoiceState(prev => ({ ...prev, error: 'Speech recognition not supported' }));
      return;
    }

    if (voiceState.isListening) {
      recognitionRef.current?.stop();
    } else {
      setMessage('');
      setVoiceState(prev => ({ ...prev, error: null, transcript: '' }));
      recognitionRef.current?.start();
    }
  }, [voiceState.isListening, voiceState.isSupported]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: FileAttachment[] = Array.from(files).map(file => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
    if (e.target) e.target.value = '';
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment?.url) URL.revokeObjectURL(attachment.url);
      return prev.filter(a => a.id !== id);
    });
  }, []);

  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const isExpanded = !!selectedIntent;

  return (
    <div className="relative">
      {/* Intent Popup */}
      <AnimatePresence>
        {showIntentPopup && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2 min-w-[320px] z-50"
          >
            <div className="space-y-1">
              {AVAILABLE_INTENTS.map((intent) => {
                const Icon = intent.icon;
                const isSelected = selectedIntent?.id === intent.id;
                return (
                  <button
                    key={intent.id}
                    onClick={() => handleIntentSelect(intent)}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 text-left w-full ${
                      isSelected
                        ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${intent.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{intent.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{intent.description}</div>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6">
        {/* Error Banner */}
        {voiceState.error && (
          <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-lg text-sm text-red-600 dark:text-red-300">
            {voiceState.error}
          </div>
        )}

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachments.map((a) => (
              <div
                key={a.id}
                className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700/70 rounded-lg px-3 py-1.5 text-sm"
              >
                <Paperclip className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300 truncate max-w-32">{a.name}</span>
                <button
                  onClick={() => removeAttachment(a.id)}
                  className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition"
                  aria-label="Remove attachment"
                >
                  <X className="w-3 h-3 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main Input Container */}
        <motion.div
          animate={{ minHeight: isExpanded ? '68px' : '52px' }}
          className="relative bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700/60 rounded-2xl transition-all duration-200"
        >
          {/* Intent Tag */}
          <AnimatePresence>
            {selectedIntent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between px-4 pt-2 pb-1"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-primary-100 dark:border-primary-900/40 rounded-xl px-3 py-1.5 text-sm shadow-sm"
                >
                  <selectedIntent.icon className={`w-4 h-4 ${selectedIntent.color}`} />
                  <span className="text-primary-700 dark:text-primary-300 font-medium">{selectedIntent.name}</span>
                  <button
                    onClick={handleIntentDeselect}
                    className="p-0.5 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded transition"
                  >
                    <X className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                  </button>
                </motion.div>

                {selectedIntent.id === 'voice-recording' && voiceState.isListening && (
                  <div className="flex items-center space-x-1 text-xs text-red-600 dark:text-red-400 font-medium">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span>Recording</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Row */}
          <div className="flex items-end px-3 py-2.5 space-x-2">
            <button
              ref={plusButtonRef}
              onClick={toggleIntentPopup}
              disabled={disabled}
              className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
                showIntentPopup ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300' : ''
              }`}
            >
              <motion.div animate={{ rotate: showIntentPopup ? 45 : 0 }} transition={{ duration: 0.2 }}>
                <Plus className="w-4 h-4" />
              </motion.div>
            </button>

            <button
              onClick={toggleVoiceRecognition}
              disabled={disabled}
              className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200 ${
                voiceState.isListening
                  ? 'bg-red-500 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {voiceState.isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              onClick={triggerFileSelect}
              disabled={disabled}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="*/*"
            />

            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={voiceState.isListening ? 'Listening...' : 'Type a message...'}
                disabled={disabled || voiceState.isListening}
                className={`w-full px-3 py-2 bg-transparent border-none resize-none focus:outline-none rounded-xl text-base placeholder:text-gray-500 dark:placeholder:text-gray-400 text-gray-900 dark:text-white ${
                  voiceState.isListening ? 'bg-red-50 dark:bg-red-900/10 text-red-900 dark:text-red-200' : ''
                }`}
                rows={1}
                style={{ minHeight: '32px', maxHeight: '120px', height: 'auto' }}
              />
            </div>

            <button
              onClick={handleSend}
              disabled={disabled || !message.trim()}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatInput;