'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, Search, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CommandHistoryProps {
  onClose: () => void;
  onCommandSelect: (command: string) => void;
}

interface CommandHistoryItem {
  id: string;
  command: string;
  timestamp: Date;
  type: 'update' | 'query' | 'notify' | 'search' | 'help';
  success: boolean;
}

export function CommandHistory({ onClose, onCommandSelect }: CommandHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [history, setHistory] = useState<CommandHistoryItem[]>([]);

  useEffect(() => {
    // Load command history from localStorage or API
    const savedHistory = localStorage.getItem('commandHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.command.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'update': return 'bg-green-100 text-green-800 border-green-200';
      case 'query': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'notify': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'search': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'help': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] bg-white">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Command History</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search commands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <div className="flex space-x-2">
                {['all', 'update', 'query', 'notify', 'search', 'help'].map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType(type)}
                    className={filterType === type ? 'bg-purple-600 hover:bg-purple-700' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* History List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No commands found</p>
                <p className="text-sm">Your command history will appear here</p>
              </div>
            ) : (
              filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onCommandSelect(item.command)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge className={getTypeColor(item.type)}>
                          {item.type}
                        </Badge>
                        {item.success ? (
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        ) : (
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-gray-900 font-medium truncate">
                        {item.command}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      {formatTimestamp(item.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}