'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Bell, 
  TrendingUp, 
  FileText, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronRight
} from 'lucide-react';

interface RightPanelProps {
  onClose: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'insights' | 'notifications' | 'activity'>('insights');

  const insights = [
    {
      id: 1,
      type: 'project_update',
      title: 'Project Alpha Status Update',
      description: 'Status changed to In Progress',
      time: '2 minutes ago',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 2,
      type: 'document_upload',
      title: 'New Policy Document',
      description: 'HR Policy v3.pdf uploaded',
      time: '1 hour ago',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 3,
      type: 'team_activity',
      title: 'Team Meeting Scheduled',
      description: 'Q4 Planning - Tomorrow 2 PM',
      time: '3 hours ago',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const notifications = [
    {
      id: 1,
      title: 'Project Alpha updated',
      message: 'Status changed to In Progress',
      time: '2 min ago',
      unread: true,
      type: 'success'
    },
    {
      id: 2,
      title: 'New document uploaded',
      message: 'HR Policy v3.pdf',
      time: '1 hour ago',
      unread: true,
      type: 'info'
    },
    {
      id: 3,
      title: 'Team meeting scheduled',
      message: 'Q4 Planning - Tomorrow 2 PM',
      time: '3 hours ago',
      unread: false,
      type: 'info'
    },
    {
      id: 4,
      title: 'Integration sync failed',
      message: 'Jira sync encountered an error',
      time: '5 hours ago',
      unread: false,
      type: 'warning'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'Updated project status',
      details: 'Project Alpha → In Progress',
      user: 'John Doe',
      time: '2 min ago',
      type: 'update'
    },
    {
      id: 2,
      action: 'Uploaded document',
      details: 'HR_Policy_v3.pdf',
      user: 'Jane Smith',
      time: '1 hour ago',
      type: 'upload'
    },
    {
      id: 3,
      action: 'Scheduled meeting',
      details: 'Q4 Planning - Tomorrow 2 PM',
      user: 'Mike Johnson',
      time: '3 hours ago',
      type: 'schedule'
    },
    {
      id: 4,
      action: 'Asked question',
      details: 'What is the new remote work policy?',
      user: 'Sarah Wilson',
      time: '4 hours ago',
      type: 'query'
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'update':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'upload':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'schedule':
        return <Clock className="w-4 h-4 text-purple-600" />;
      case 'query':
        return <Users className="w-4 h-4 text-gray-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Insights</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 lg:hidden"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2 border-b border-gray-200">
        <div className="flex space-x-1">
          {[
            { id: 'insights', label: 'Insights', icon: TrendingUp },
            { id: 'notifications', label: 'Alerts', icon: Bell },
            { id: 'activity', label: 'Activity', icon: Clock }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'insights' && (
          <div className="p-4 space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">12</div>
                <div className="text-sm text-purple-700">Active Projects</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">48</div>
                <div className="text-sm text-blue-700">Documents</div>
              </div>
            </div>

            {/* Recent Insights */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Updates</h3>
              <div className="space-y-3">
                {insights.map((insight) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer group"
                  >
                    <div className={`p-2 rounded-lg ${insight.bgColor}`}>
                      <insight.icon className={`w-4 h-4 ${insight.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{insight.title}</p>
                      <p className="text-xs text-gray-500">{insight.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{insight.time}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="p-4 space-y-3">
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer ${
                  notification.unread ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                  <p className="text-xs text-gray-500">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                </div>
                {notification.unread && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="p-4 space-y-3">
            {recentActivity.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer group"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.details}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{activity.user}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{activity.time}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RightPanel;