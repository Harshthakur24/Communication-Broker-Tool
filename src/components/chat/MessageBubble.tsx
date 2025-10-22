'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Info,
  MoreVertical,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sources?: Array<{
    title: string;
    url: string;
    relevance: number;
  }>;
  metadata?: {
    intent?: string;
    confidence?: number;
    processingTime?: number;
  };
}

interface MessageBubbleProps {
  message: Message;
  onAction: (messageId: string, action: string) => void;
  isSelected: boolean;
  onSelect: () => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  onAction, 
  isSelected, 
  onSelect 
}) => {
  const [showSources, setShowSources] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageIcon = () => {
    switch (message.type) {
      case 'assistant':
        return <CheckCircle className="w-4 h-4 text-purple-600" />;
      case 'system':
        return <Info className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-500';
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 0.9) return 'bg-green-100 text-green-800';
    if (relevance >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <motion.div
      className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      {message.type !== 'user' && (
        <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
          {getMessageIcon()}
        </div>
      )}

      <div className={`max-w-3xl ${message.type === 'user' ? 'order-first' : ''}`}>
        {/* Message Content */}
        <div
          className={`relative group ${
            message.type === 'user'
              ? 'bg-purple-600 text-white'
              : 'bg-white border border-gray-200'
          } rounded-2xl px-4 py-3 shadow-sm`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
              
              {/* Metadata */}
              {message.metadata && (
                <div className="mt-2 flex items-center gap-2 text-xs opacity-75">
                  {message.metadata.intent && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {message.metadata.intent.replace('_', ' ')}
                    </span>
                  )}
                  {message.metadata.confidence && (
                    <span className={getConfidenceColor(message.metadata.confidence)}>
                      {Math.round(message.metadata.confidence * 100)}% confident
                    </span>
                  )}
                  {message.metadata.processingTime && (
                    <span className="text-gray-500">
                      {message.metadata.processingTime}s
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onAction(message.id, 'copy')}
                className="p-1 hover:bg-gray-100 rounded"
                title="Copy message"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 hover:bg-gray-100 rounded"
                title="More actions"
              >
                <MoreVertical className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Sources */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button
                onClick={() => setShowSources(!showSources)}
                className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-800"
              >
                <span>{message.sources.length} source{message.sources.length !== 1 ? 's' : ''}</span>
                {showSources ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              
              {showSources && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 space-y-2"
                >
                  {message.sources.map((source, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {source.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {source.url}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getRelevanceColor(source.relevance)}`}>
                          {Math.round(source.relevance * 100)}%
                        </span>
                        <button
                          onClick={() => window.open(source.url, '_blank')}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Open source"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Timestamp and Actions */}
        <div className={`flex items-center gap-2 mt-1 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-500">
            {formatTime(message.timestamp)}
          </span>
          
          {message.type === 'assistant' && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onAction(message.id, 'like')}
                className="p-1 hover:bg-gray-100 rounded"
                title="Helpful"
              >
                <ThumbsUp className="w-3 h-3 text-gray-400" />
              </button>
              <button
                onClick={() => onAction(message.id, 'dislike')}
                className="p-1 hover:bg-gray-100 rounded"
                title="Not helpful"
              >
                <ThumbsDown className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          )}
        </div>

        {/* Action Menu */}
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
          >
            <div className="p-1">
              <button
                onClick={() => {
                  onAction(message.id, 'copy');
                  setShowActions(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
              >
                <Copy className="w-4 h-4" />
                Copy message
              </button>
              <button
                onClick={() => {
                  onAction(message.id, 'like');
                  setShowActions(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
              >
                <ThumbsUp className="w-4 h-4" />
                Mark as helpful
              </button>
              <button
                onClick={() => {
                  onAction(message.id, 'dislike');
                  setShowActions(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
              >
                <ThumbsDown className="w-4 h-4" />
                Mark as not helpful
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {message.type === 'user' && (
        <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-purple-600">JD</span>
        </div>
      )}
    </motion.div>
  );
};

export default MessageBubble;