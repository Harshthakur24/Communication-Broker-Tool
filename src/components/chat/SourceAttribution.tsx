'use client';

import React, { useState } from 'react';
import { ExternalLink, FileText, Database, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Source {
  title: string;
  url?: string;
  type: string;
  confidence: number;
}

interface SourceAttributionProps {
  sources: Source[];
}

export function SourceAttribution({ sources }: SourceAttributionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'document':
      case 'pdf':
      case 'docx':
        return <FileText className="w-4 h-4" />;
      case 'project':
      case 'task':
        return <Database className="w-4 h-4" />;
      case 'web':
      case 'url':
        return <Globe className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'document':
      case 'pdf':
      case 'docx':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'project':
      case 'task':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'policy':
      case 'procedure':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'knowledge':
      case 'wiki':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (sources.length === 0) return null;

  return (
    <div className="ml-12 mr-12 mt-2">
      <Card className="p-3 bg-gray-50 border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Sources:</span>
            <Badge variant="outline" className="text-xs">
              {sources.length} {sources.length === 1 ? 'source' : 'sources'}
            </Badge>
          </div>
          {sources.length > 1 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        <div className={`mt-2 space-y-2 ${isExpanded || sources.length === 1 ? 'block' : 'hidden'}`}>
          {sources.map((source, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {getTypeIcon(source.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <Badge className={getTypeColor(source.type)}>
                      {source.type}
                    </Badge>
                    <span className={`text-xs font-medium ${getConfidenceColor(source.confidence)}`}>
                      {Math.round(source.confidence * 100)}% confidence
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-900 font-medium truncate mt-1">
                    {source.title}
                  </p>
                </div>
              </div>

              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 ml-2 p-1 text-gray-400 hover:text-purple-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}
        </div>

        {sources.length > 1 && !isExpanded && (
          <div className="mt-2 text-xs text-gray-500">
            Click to see all {sources.length} sources
          </div>
        )}
      </Card>
    </div>
  );
}