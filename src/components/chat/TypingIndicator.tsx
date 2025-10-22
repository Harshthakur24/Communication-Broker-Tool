'use client';

import React from 'react';
import { Bot } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="max-w-2xl mr-12">
        <Card className="p-4 bg-gray-100 text-gray-900">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-purple-600" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm">AI Assistant</span>
                <span className="text-xs text-gray-500">is typing</span>
              </div>
              
              <div className="mt-2 flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}