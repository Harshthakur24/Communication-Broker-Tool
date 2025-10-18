# UI Design Specification - White & Purple Theme

## Design System Overview

### Color Palette
```css
:root {
  /* Primary Purple Shades */
  --purple-50: #faf5ff;
  --purple-100: #f3e8ff;
  --purple-200: #e9d5ff;
  --purple-300: #d8b4fe;
  --purple-400: #c084fc;
  --purple-500: #a855f7;
  --purple-600: #9333ea;
  --purple-700: #7c3aed;
  --purple-800: #6b21a8;
  --purple-900: #581c87;

  /* Neutral White/Gray Shades */
  --white: #ffffff;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;

  /* Semantic Colors */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
}
```

### Typography
```css
/* Font Stack */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

## Layout Structure

### Main Layout Components

```typescript
// src/components/layout/MainLayout.tsx
export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Sidebar */}
      <LeftSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <TopNavbar />
        
        {/* Content */}
        <main className="flex-1 flex">
          {/* Center Panel - Chat Interface */}
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          
          {/* Right Panel - Insights */}
          <RightPanel />
        </main>
      </div>
      
      {/* Notification Drawer */}
      <NotificationDrawer />
    </div>
  );
}
```

### Left Sidebar Component

```typescript
// src/components/layout/LeftSidebar.tsx
export function LeftSidebar() {
  const { user, projects, teams } = useAppState();
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <UserAvatar user={user} size="md" />
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.department}</p>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200">
        <Button 
          variant="primary" 
          size="sm" 
          className="w-full"
          onClick={() => {/* Start new chat */}}
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        <NavItem 
          icon={ChatBubbleLeftRightIcon} 
          label="All Chats" 
          active={true}
        />
        <NavItem 
          icon={FolderIcon} 
          label="Projects" 
          count={projects.length}
        />
        <NavItem 
          icon={UsersIcon} 
          label="Teams" 
          count={teams.length}
        />
        <NavItem 
          icon={DocumentTextIcon} 
          label="Knowledge Base" 
        />
        <NavItem 
          icon={CogIcon} 
          label="Settings" 
        />
      </nav>
      
      {/* Recent Chats */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Recent</h3>
        <div className="space-y-1">
          {recentChats.map(chat => (
            <RecentChatItem key={chat.id} chat={chat} />
          ))}
        </div>
      </div>
    </aside>
  );
}
```

### Chat Interface Component

```typescript
// src/components/chat/ChatInterface.tsx
export function ChatInterface() {
  const { messages, isLoading, sendMessage } = useChat();
  const [inputValue, setInputValue] = useState('');
  
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">AI Assistant</h1>
            <p className="text-sm text-gray-500">Always up-to-date company knowledge</p>
          </div>
          <div className="flex items-center space-x-2">
            <StatusIndicator status="online" />
            <Button variant="ghost" size="sm">
              <EllipsisHorizontalIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <MessageBubble 
            key={index} 
            message={message} 
            showAvatar={index === 0 || messages[index - 1].role !== message.role}
          />
        ))}
        
        {/* Typing Indicator */}
        {isLoading && <TypingIndicator />}
        
        {/* Welcome Message */}
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SparklesIcon className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Welcome to your AI Communication Hub
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Ask me anything about projects, policies, or team updates. I'm always up-to-date with the latest information.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestedPrompts.map(prompt => (
                <Button 
                  key={prompt}
                  variant="outline" 
                  size="sm"
                  onClick={() => setInputValue(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <MessageInput 
          value={inputValue}
          onChange={setInputValue}
          onSend={sendMessage}
          disabled={isLoading}
          placeholder="Ask me anything about projects, policies, or team updates..."
        />
      </div>
    </div>
  );
}
```

### Message Bubble Component

```typescript
// src/components/chat/MessageBubble.tsx
export function MessageBubble({ 
  message, 
  showAvatar = false 
}: { 
  message: Message; 
  showAvatar?: boolean;
}) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      <div className={`flex max-w-3xl ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
        {/* Avatar */}
        {showAvatar && !isUser && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <SparklesIcon className="w-4 h-4 text-purple-600" />
            </div>
          </div>
        )}
        
        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`px-4 py-3 rounded-2xl ${
              isUser
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <div className="prose prose-sm max-w-none">
              <MarkdownRenderer content={message.content} />
            </div>
          </div>
          
          {/* Message Metadata */}
          <div className={`flex items-center space-x-2 mt-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-xs text-gray-500">
              {formatTime(message.timestamp)}
            </span>
            {message.sources && message.sources.length > 0 && (
              <SourcesIndicator sources={message.sources} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Right Panel - Insights Component

```typescript
// src/components/layout/RightPanel.tsx
export function RightPanel() {
  const { insights, notifications } = useAppState();
  
  return (
    <aside className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
      {/* Panel Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Insights</h2>
      </div>
      
      {/* Real-time Updates */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Live Updates</h3>
        <div className="space-y-3">
          {insights.liveUpdates.map(update => (
            <LiveUpdateCard key={update.id} update={update} />
          ))}
        </div>
      </div>
      
      {/* Project Status */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Project Status</h3>
        <div className="space-y-2">
          {insights.projects.map(project => (
            <ProjectStatusCard key={project.id} project={project} />
          ))}
        </div>
      </div>
      
      {/* Policy Updates */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Policy Updates</h3>
        <div className="space-y-2">
          {insights.policyUpdates.map(policy => (
            <PolicyUpdateCard key={policy.id} policy={policy} />
          ))}
        </div>
      </div>
      
      {/* Notifications */}
      <div className="flex-1 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Notifications</h3>
        <div className="space-y-2">
          {notifications.map(notification => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
      </div>
    </aside>
  );
}
```

## Component Library

### Base UI Components

```typescript
// src/components/ui/Button.tsx
export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-purple-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Input Components

```typescript
// src/components/chat/MessageInput.tsx
export function MessageInput({ 
  value, 
  onChange, 
  onSend, 
  disabled = false,
  placeholder = "Type your message..."
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSend(value);
        onChange('');
      }
    }
  };
  
  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
        rows={1}
        style={{ minHeight: '48px', maxHeight: '120px' }}
      />
      
      <button
        onClick={() => {
          if (value.trim()) {
            onSend(value);
            onChange('');
          }
        }}
        disabled={disabled || !value.trim()}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-purple-600 hover:text-purple-700 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        <PaperAirplaneIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
```

## Animation Specifications

### Framer Motion Animations

```typescript
// src/components/animations/MessageAnimation.tsx
export const messageVariants = {
  initial: { 
    opacity: 0, 
    y: 20, 
    scale: 0.95 
  },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
};

export const typingVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const dotVariants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};
```

### Loading States

```typescript
// src/components/ui/LoadingSpinner.tsx
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  return (
    <div className={`${sizes[size]} animate-spin`}>
      <svg className="w-full h-full text-purple-600" fill="none" viewBox="0 0 24 24">
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}
```

## Responsive Design

### Breakpoints
```css
/* Tailwind CSS Breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

### Mobile Layout
```typescript
// Mobile-specific layout adjustments
export function MobileLayout() {
  return (
    <div className="lg:hidden">
      {/* Mobile-specific components */}
      <MobileHeader />
      <MobileChatInterface />
      <MobileBottomNav />
    </div>
  );
}
```

## Accessibility Features

### ARIA Labels and Roles
```typescript
// Accessible chat interface
<div 
  role="log" 
  aria-label="Chat messages"
  aria-live="polite"
  className="chat-container"
>
  {messages.map(message => (
    <div
      key={message.id}
      role="article"
      aria-label={`Message from ${message.role}`}
    >
      <MessageBubble message={message} />
    </div>
  ))}
</div>
```

### Keyboard Navigation
```typescript
// Keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'k':
          e.preventDefault();
          // Focus search
          break;
        case 'n':
          e.preventDefault();
          // New chat
          break;
        case '/':
          e.preventDefault();
          // Focus message input
          break;
      }
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

This UI design specification provides:

1. **Clean, Professional Design**: White background with purple accents
2. **Enterprise-Grade UX**: Optimized for internal corporate use
3. **Responsive Layout**: Works on desktop, tablet, and mobile
4. **Accessibility**: WCAG 2.1 AA compliant
5. **Performance**: Optimized animations and loading states
6. **Consistency**: Unified design system across all components
7. **Scalability**: Modular component architecture
