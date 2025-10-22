'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  FileText, 
  Users, 
  Settings, 
  Search,
  Plus,
  Folder,
  Star,
  Clock,
  X,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface LeftSidebarProps {
  onClose: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ onClose }) => {
  const [expandedSections, setExpandedSections] = useState({
    projects: true,
    teams: true,
    recent: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const projects = [
    { id: 1, name: 'Project Alpha', status: 'in-progress', color: 'bg-purple-500' },
    { id: 2, name: 'Project Beta', status: 'planning', color: 'bg-blue-500' },
    { id: 3, name: 'Project Gamma', status: 'completed', color: 'bg-green-500' },
  ];

  const teams = [
    { id: 1, name: 'Engineering', members: 12, color: 'bg-purple-500' },
    { id: 2, name: 'Design', members: 8, color: 'bg-pink-500' },
    { id: 3, name: 'Marketing', members: 6, color: 'bg-blue-500' },
  ];

  const recentChats = [
    { id: 1, title: 'Project Alpha Discussion', lastMessage: '2 min ago' },
    { id: 2, title: 'HR Policy Questions', lastMessage: '1 hour ago' },
    { id: 3, title: 'Q4 Planning', lastMessage: '3 hours ago' },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">AI Hub</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 lg:hidden"
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
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        {/* Quick Actions */}
        <div className="p-4">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Plus className="w-4 h-4" />
            New Conversation
          </button>
        </div>

        {/* Projects Section */}
        <div className="px-4 py-2">
          <button
            onClick={() => toggleSection('projects')}
            className="w-full flex items-center justify-between py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4" />
              Projects
            </div>
            {expandedSections.projects ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          
          {expandedSections.projects && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 space-y-1"
            >
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer group"
                >
                  <div className={`w-3 h-3 rounded-full ${project.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {project.name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {project.status.replace('-', ' ')}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Teams Section */}
        <div className="px-4 py-2">
          <button
            onClick={() => toggleSection('teams')}
            className="w-full flex items-center justify-between py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Teams
            </div>
            {expandedSections.teams ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          
          {expandedSections.teams && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 space-y-1"
            >
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer group"
                >
                  <div className={`w-3 h-3 rounded-full ${team.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {team.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {team.members} members
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Recent Conversations */}
        <div className="px-4 py-2">
          <button
            onClick={() => toggleSection('recent')}
            className="w-full flex items-center justify-between py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent
            </div>
            {expandedSections.recent ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          
          {expandedSections.recent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 space-y-1"
            >
              {recentChats.map((chat) => (
                <div
                  key={chat.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer group"
                >
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {chat.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {chat.lastMessage}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Favorites */}
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 py-2 text-sm font-medium text-gray-700">
            <Star className="w-4 h-4" />
            Favorites
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer group">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Company Policies
                </p>
                <p className="text-xs text-gray-500">
                  Always up to date
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <Settings className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">Settings</p>
            <p className="text-xs text-gray-500">Preferences & account</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;