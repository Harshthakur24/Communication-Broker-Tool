'use client';

import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  MessageSquare, 
  FileText, 
  Users, 
  Settings, 
  Search,
  BookOpen,
  Bell,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LeftSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  badge?: string;
  children?: NavItem[];
}

export function LeftSidebar({ collapsed, onToggle }: LeftSidebarProps) {
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
      href: '/dashboard'
    },
    {
      id: 'chat',
      label: 'AI Chat',
      icon: <MessageSquare className="w-5 h-5" />,
      href: '/chat',
      badge: 'New'
    },
    {
      id: 'knowledge',
      label: 'Knowledge Base',
      icon: <BookOpen className="w-5 h-5" />,
      href: '/knowledge-base'
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: <FileText className="w-5 h-5" />,
      href: '/documents'
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: <BarChart3 className="w-5 h-5" />,
      children: [
        { id: 'active', label: 'Active Projects', icon: <div className="w-2 h-2 bg-green-500 rounded-full" /> },
        { id: 'planning', label: 'Planning', icon: <div className="w-2 h-2 bg-yellow-500 rounded-full" /> },
        { id: 'completed', label: 'Completed', icon: <div className="w-2 h-2 bg-gray-500 rounded-full" /> }
      ]
    },
    {
      id: 'team',
      label: 'Team',
      icon: <Users className="w-5 h-5" />,
      href: '/team'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      href: '/notifications',
      badge: '3'
    },
    {
      id: 'search',
      label: 'Search',
      icon: <Search className="w-5 h-5" />,
      href: '/search'
    }
  ];

  const quickActions = [
    { label: 'New Project', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Upload Doc', icon: <FileText className="w-4 h-4" /> },
    { label: 'Ask AI', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">AI Hub</h1>
                  <p className="text-xs text-gray-500">Internal Communication</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-gray-400 hover:text-gray-600"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <div key={item.id}>
              <Button
                variant="ghost"
                className={`w-full justify-start text-left h-10 ${
                  collapsed ? 'px-2' : 'px-3'
                }`}
              >
                <div className="flex items-center space-x-3 w-full">
                  <div className="flex-shrink-0">
                    {item.icon}
                  </div>
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-sm font-medium text-gray-700">
                        {item.label}
                      </span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </Button>
              
              {/* Sub-items */}
              {!collapsed && item.children && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Button
                      key={child.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left h-8 text-xs text-gray-600 hover:text-gray-900"
                    >
                      <div className="flex items-center space-x-2 w-full">
                        <div className="flex-shrink-0">
                          {child.icon}
                        </div>
                        <span className="flex-1">{child.label}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Quick Actions */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-8 text-xs"
                >
                  <div className="flex items-center space-x-2 w-full">
                    <div className="flex-shrink-0">
                      {action.icon}
                    </div>
                    <span className="flex-1">{action.label}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className={`flex items-center space-x-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-purple-600">JD</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
                <p className="text-xs text-gray-500 truncate">john.doe@company.com</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}