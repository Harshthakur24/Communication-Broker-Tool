'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Paperclip, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { CommandHistory } from './CommandHistory';
import { SourceAttribution } from './SourceAttribution';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'notification';
  content: string;
  timestamp: Date;
  sources?: Array<{
    title: string;
    url?: string;
    type: string;
    confidence: number;
  }>;
  metadata?: Record<string, any>;
}

interface EnhancedChatInterfaceProps {
  onSendMessage: (message: string) => Promise<void>;
  messages: Message[];
  isLoading: boolean;
  onFileUpload?: (file: File) => Promise<void>;
  onVoiceInput?: (audio: Blob) => Promise<void>;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}

export function EnhancedChatInterface({
  onSendMessage,
  messages,
  isLoading,
  onFileUpload,
  onVoiceInput,
  suggestions = [],
  onSuggestionClick
}: EnhancedChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    await onSendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        if (onVoiceInput) {
          await onVoiceInput(audioBlob);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
            <p className="text-sm text-gray-500">Internal Communication Hub</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="text-purple-600 border-purple-200 hover:bg-purple-50"
          >
            History
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col">
            <MessageBubble message={message} />
            {message.sources && message.sources.length > 0 && (
              <SourceAttribution sources={message.sources} />
            )}
          </div>
        ))}
        
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-purple-100 text-purple-700 border-purple-200"
                onClick={() => onSuggestionClick?.(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about projects, policies, or procedures..."
              className="pr-20 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
              disabled={isLoading}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 w-8 p-0 text-gray-400 hover:text-purple-600"
                disabled={isLoading}
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleRecording}
                className={`h-8 w-8 p-0 ${
                  isRecording 
                    ? 'text-red-600 hover:text-red-700' 
                    : 'text-gray-400 hover:text-purple-600'
                }`}
                disabled={isLoading}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          accept=".pdf,.docx,.txt,.md"
        />
      </div>

      {/* Command History Sidebar */}
      {showHistory && (
        <CommandHistory
          onClose={() => setShowHistory(false)}
          onCommandSelect={(command) => {
            setInput(command);
            setShowHistory(false);
          }}
        />
      )}
    </div>
  );
}