'use client';

import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  TrendingUp, 
  Clock, 
  Users, 
  FileText,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RightPanelProps {
  onClose: () => void;
}

export function RightPanel({ onClose }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<'notifications' | 'insights' | 'activity'>('notifications');

  const notifications = [
    {
      id: '1',
      type: 'project_update',
      title: 'Project Alpha Status Changed',
      description: 'Status updated to "In Progress"',
      time: '2 minutes ago',
      unread: true,
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      id: '2',
      type: 'policy_change',
      title: 'New HR Policy Published',
      description: 'Remote work policy has been updated',
      time: '1 hour ago',
      unread: true,
      icon: <FileText className="w-4 h-4" />
    },
    {
      id: '3',
      type: 'meeting_reminder',
      title: 'Team Meeting in 30 minutes',
      description: 'Weekly standup meeting',
      time: '3 hours ago',
      unread: false,
      icon: <Clock className="w-4 h-4" />
    }
  ];

  const insights = [
    {
      title: 'Active Projects',
      value: '12',
      change: '+2',
      changeType: 'positive' as const,
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      title: 'Documents Updated',
      value: '8',
      change: '+3',
      changeType: 'positive' as const,
      icon: <FileText className="w-4 h-4" />
    },
    {
      title: 'Team Members',
      value: '45',
      change: '0',
      changeType: 'neutral' as const,
      icon: <Users className="w-4 h-4" />
    }
  ];

  const recentActivity = [
    {
      id: '1',
      action: 'Updated project status',
      project: 'Project Alpha',
      user: 'John Doe',
      time: '2m ago',
      type: 'update'
    },
    {
      id: '2',
      action: 'Uploaded document',
      project: 'HR Policies',
      user: 'Jane Smith',
      time: '15m ago',
      type: 'upload'
    },
    {
      id: '3',
      action: 'Created new task',
      project: 'Project Beta',
      user: 'Bob Johnson',
      time: '1h ago',
      type: 'create'
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'project_update':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'policy_change':
        return <FileText className="w-4 h-4 text-purple-600" />;
      case 'meeting_reminder':
        return <Clock className="w-4 h-4 text-orange-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'update':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'upload':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'create':
        return <AlertCircle className="w-4 h-4 text-purple-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Right Panel</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-1 mt-3">
          {[
            { id: 'notifications', label: 'Notifications', count: notifications.filter(n => n.unread).length },
            { id: 'insights', label: 'Insights', count: null },
            { id: 'activity', label: 'Activity', count: null }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
              className={`text-xs ${
                activeTab === tab.id 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {tab.count && tab.count > 0 && (
                <Badge className="ml-1 text-xs">
                  {tab.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'notifications' && (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                  notification.unread ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      {notification.unread && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {notification.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      {insight.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {insight.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {insight.value}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      insight.changeType === 'positive' ? 'text-green-600' :
                      insight.changeType === 'negative' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {insight.change}
                    </p>
                    <p className="text-xs text-gray-500">vs last week</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <Card key={activity.id} className="p-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {activity.project}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}