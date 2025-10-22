'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Mic, MicOff, MoreVertical, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import CommandHistory from './CommandHistory';

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

interface EnhancedChatInterfaceProps {
  className?: string;
}

const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI Communication Hub assistant. I can help you with project updates, company policies, team communications, and more. What would you like to know?',
      timestamp: new Date(),
      sources: []
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showCommandHistory, setShowCommandHistory] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I understand you're asking about "${inputValue}". Let me help you with that. Based on the available information, here's what I found...`,
        timestamp: new Date(),
        sources: [
          {
            title: 'Company Policy Document v3',
            url: '/documents/policy-v3.pdf',
            relevance: 0.95
          },
          {
            title: 'Project Alpha Status Report',
            url: '/projects/alpha/status',
            relevance: 0.87
          }
        ],
        metadata: {
          intent: 'information_query',
          confidence: 0.92,
          processingTime: 1.2
        }
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    // Voice recording logic would go here
  };

  const handleMessageAction = (messageId: string, action: string) => {
    switch (action) {
      case 'copy':
        const message = messages.find(m => m.id === messageId);
        if (message) {
          navigator.clipboard.writeText(message.content);
        }
        break;
      case 'like':
        // Handle like action
        break;
      case 'dislike':
        // Handle dislike action
        break;
      default:
        break;
    }
  };

  const suggestedCommands = [
    'Mark Project Alpha as in progress',
    'What is the new HR policy?',
    'Summarize yesterday\'s team updates',
    'Show me project statuses',
    'Find documents about remote work'
  ];

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
            <p className="text-sm text-gray-500">Always up to date with company information</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCommandHistory(!showCommandHistory)}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MessageBubble
                message={message}
                onAction={handleMessageAction}
                isSelected={selectedMessage === message.id}
                onSelect={() => setSelectedMessage(selectedMessage === message.id ? null : message.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <TypingIndicator />
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Commands */}
      {messages.length === 1 && (
        <div className="px-4 py-2">
          <p className="text-sm text-gray-500 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedCommands.map((command, index) => (
              <button
                key={index}
                onClick={() => setInputValue(command)}
                className="px-3 py-1 text-sm bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-colors"
              >
                {command}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything about your company..."
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button
              onClick={() => {/* File upload logic */}}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
            >
              <Paperclip className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          <button
            onClick={handleVoiceToggle}
            className={`p-3 rounded-lg transition-colors ${
              isRecording 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Command History Sidebar */}
      <AnimatePresence>
        {showCommandHistory && (
          <CommandHistory onClose={() => setShowCommandHistory(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedChatInterface;