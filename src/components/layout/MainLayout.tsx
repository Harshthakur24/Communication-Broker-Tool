'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LeftSidebar from './LeftSidebar';
import TopNavbar from './TopNavbar';
import RightPanel from './RightPanel';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-80 bg-white border-r border-gray-200 flex-shrink-0"
          >
            <LeftSidebar onClose={() => setSidebarOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <TopNavbar 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onNotificationsClick={() => setRightPanelOpen(!rightPanelOpen)}
        />

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Center Content */}
          <main className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 p-6">
              {children}
            </div>
          </main>

          {/* Right Panel */}
          <AnimatePresence>
            {rightPanelOpen && (
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="w-80 bg-white border-l border-gray-200 flex-shrink-0"
              >
                <RightPanel onClose={() => setRightPanelOpen(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {(sidebarOpen || rightPanelOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => {
              setSidebarOpen(false);
              setRightPanelOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainLayout;