'use client';

import React, { useState } from 'react';
import { 
  Menu, 
  Bell, 
  Search, 
  Settings, 
  User, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface TopNavbarProps {
  onMenuClick: () => void;
  onNotificationsClick: () => void;
}

export function TopNavbar({ onMenuClick, onNotificationsClick }: TopNavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = [
    { id: '1', title: 'Project Alpha updated', time: '2m ago', unread: true },
    { id: '2', title: 'New policy published', time: '1h ago', unread: true },
    { id: '3', title: 'Team meeting reminder', time: '3h ago', unread: false }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="text-gray-500 hover:text-gray-700"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search projects, documents, or ask AI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
              />
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={onNotificationsClick}
              className="text-gray-500 hover:text-gray-700 relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs bg-red-500 text-white">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <Settings className="w-5 h-5" />
          </Button>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
            >
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-purple-600" />
              </div>
              <span className="hidden md:block text-sm font-medium">John Doe</span>
              <ChevronDown className="w-4 h-4" />
            </Button>

            {/* User Dropdown */}
            {showUserMenu && (
              <Card className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg z-50">
                <div className="p-2">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">John Doe</p>
                    <p className="text-xs text-gray-500">john.doe@company.com</p>
                  </div>
                  
                  <div className="py-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden mt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full border-purple-200 focus:border-purple-400 focus:ring-purple-400"
          />
        </div>
      </div>
    </header>
  );
}