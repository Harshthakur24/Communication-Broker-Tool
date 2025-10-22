'use client';

import React from 'react';
import { Bot, User, Bell, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';
  const isNotification = message.type === 'notification';

  const getIcon = () => {
    switch (message.type) {
      case 'user':
        return <User className="w-4 h-4" />;
      case 'assistant':
        return <Bot className="w-4 h-4" />;
      case 'system':
        return <AlertCircle className="w-4 h-4" />;
      case 'notification':
        return <Bell className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  const getBubbleClasses = () => {
    if (isUser) {
      return 'bg-purple-600 text-white ml-12';
    }
    if (isSystem) {
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    }
    if (isNotification) {
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    }
    return 'bg-gray-100 text-gray-900 mr-12';
  };

  const getContainerClasses = () => {
    if (isUser) {
      return 'flex justify-end';
    }
    if (isSystem || isNotification) {
      return 'flex justify-center';
    }
    return 'flex justify-start';
  };

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-200 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\n/g, '<br />');
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(timestamp);
  };

  return (
    <div className={getContainerClasses()}>
      <div className={`max-w-2xl ${isUser ? 'order-2' : 'order-1'}`}>
        <Card className={`p-4 ${getBubbleClasses()}`}>
          <div className="flex items-start space-x-3">
            {!isUser && (
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                isSystem ? 'bg-yellow-200' : 
                isNotification ? 'bg-blue-200' : 
                'bg-purple-100'
              }`}>
                {getIcon()}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">
                    {isUser ? 'You' : 
                     isSystem ? 'System' : 
                     isNotification ? 'Notification' : 
                     'AI Assistant'}
                  </span>
                  {message.metadata?.intent && (
                    <Badge 
                      variant="outline" 
                      className="text-xs px-2 py-1"
                    >
                      {message.metadata.intent}
                    </Badge>
                  )}
                </div>
                <span className="text-xs opacity-70">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
              
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: formatContent(message.content) 
                }}
              />
              
              {message.metadata?.confidence && (
                <div className="mt-2 flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${message.metadata.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {Math.round(message.metadata.confidence * 100)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}