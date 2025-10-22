'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Clock, Star, Trash2, Copy } from 'lucide-react';

interface CommandHistoryProps {
  onClose: () => void;
}

interface Command {
  id: string;
  command: string;
  timestamp: Date;
  isFavorite: boolean;
  category: string;
  result: string;
}

const CommandHistory: React.FC<CommandHistoryProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const commands: Command[] = [
    {
      id: '1',
      command: 'Mark Project Alpha as in progress',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      isFavorite: true,
      category: 'project',
      result: 'Project status updated successfully'
    },
    {
      id: '2',
      command: 'What is the new HR policy?',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      isFavorite: false,
      category: 'query',
      result: 'Retrieved HR Policy v3.pdf'
    },
    {
      id: '3',
      command: 'Summarize yesterday\'s team updates',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      isFavorite: true,
      category: 'summary',
      result: 'Generated team activity summary'
    },
    {
      id: '4',
      command: 'Show me project statuses',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      isFavorite: false,
      category: 'query',
      result: 'Displayed all project statuses'
    },
    {
      id: '5',
      command: 'Find documents about remote work',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isFavorite: false,
      category: 'search',
      result: 'Found 5 relevant documents'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Commands', count: commands.length },
    { id: 'project', label: 'Project Updates', count: commands.filter(c => c.category === 'project').length },
    { id: 'query', label: 'Information Queries', count: commands.filter(c => c.category === 'query').length },
    { id: 'summary', label: 'Summaries', count: commands.filter(c => c.category === 'summary').length },
    { id: 'search', label: 'Document Search', count: commands.filter(c => c.category === 'search').length },
    { id: 'favorites', label: 'Favorites', count: commands.filter(c => c.isFavorite).length }
  ];

  const filteredCommands = commands.filter(command => {
    const matchesSearch = command.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         command.result.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           (selectedCategory === 'favorites' ? command.isFavorite : command.category === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleCommandClick = (command: string) => {
    // This would typically trigger the command in the chat interface
    console.log('Executing command:', command);
  };

  const handleCopyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
  };

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-lg z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Command History</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search commands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedCategory === category.id
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Commands List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No commands found</p>
            </div>
          ) : (
            filteredCommands.map((command) => (
              <motion.div
                key={command.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer group"
                onClick={() => handleCommandClick(command.command)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {command.command}
                      </p>
                      {command.isFavorite && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {command.result}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {formatTime(command.timestamp)}
                      <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                        {command.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyCommand(command.command);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Copy command"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Toggle favorite
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                      title={command.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star className={`w-3 h-3 ${command.isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{filteredCommands.length} command{filteredCommands.length !== 1 ? 's' : ''}</span>
          <button className="text-purple-600 hover:text-purple-700">
            Clear History
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CommandHistory;