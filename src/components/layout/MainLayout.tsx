'use client';

import React, { useState } from 'react';
import { LeftSidebar } from './LeftSidebar';
import { TopNavbar } from './TopNavbar';
import { RightPanel } from './RightPanel';
import { EnhancedChatInterface } from '@/components/chat/EnhancedChatInterface';

interface MainLayoutProps {
  children?: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const handleSendMessage = async (message: string) => {
    // This would typically call the chat API
    console.log('Sending message:', message);
  };

  const handleFileUpload = async (file: File) => {
    // This would typically handle file upload
    console.log('Uploading file:', file.name);
  };

  const handleVoiceInput = async (audio: Blob) => {
    // This would typically handle voice input
    console.log('Voice input received');
  };

  const handleSuggestionClick = (suggestion: string) => {
    // This would typically set the input value
    console.log('Suggestion clicked:', suggestion);
  };

  // Mock data for demonstration
  const messages = [
    {
      id: '1',
      type: 'assistant' as const,
      content: 'Hello! I\'m your AI assistant. I can help you with projects, policies, and procedures. What would you like to know?',
      timestamp: new Date(),
      sources: []
    }
  ];

  const suggestions = [
    'What\'s the status of project Alpha?',
    'Show me the remote work policy',
    'Notify the team about the meeting',
    'Search for HR documents'
  ];

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <TopNavbar 
        onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNotificationsClick={() => setRightPanelOpen(!rightPanelOpen)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {children || (
            <div className="flex-1 flex">
              {/* Chat Interface */}
              <div className="flex-1">
                <EnhancedChatInterface
                  onSendMessage={handleSendMessage}
                  messages={messages}
                  isLoading={false}
                  onFileUpload={handleFileUpload}
                  onVoiceInput={handleVoiceInput}
                  suggestions={suggestions}
                  onSuggestionClick={handleSuggestionClick}
                />
              </div>

              {/* Right Panel */}
              {rightPanelOpen && (
                <RightPanel onClose={() => setRightPanelOpen(false)} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}