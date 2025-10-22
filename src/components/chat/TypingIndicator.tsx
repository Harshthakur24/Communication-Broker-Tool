'use client';

import React from 'react';
import { motion } from 'framer-motion';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
          <div className="w-4 h-4 text-purple-600">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="4" cy="12" r="3">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="1.4s" repeatCount="indefinite" />
              </circle>
              <circle cx="12" cy="12" r="3">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="1.4s" begin="0.2s" repeatCount="indefinite" />
              </circle>
              <circle cx="20" cy="12" r="3">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="1.4s" begin="0.4s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-500">AI is thinking</span>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-purple-400 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;