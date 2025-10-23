# 🚀 New Features Guide

## Overview
This guide covers the latest features added to the Communication Broker Tool to enhance productivity, insights, and user experience.

---

## 📊 Feature 1: Advanced Search with Filters

### Description
Powerful search functionality that allows users to find documents, tasks, and messages with advanced filtering options.

### Key Features
- **Multi-Type Search**: Search across documents, tasks, and messages simultaneously or individually
- **Smart Filters**: 
  - Date range filtering (from/to)
  - Tag-based filtering
  - Category filtering
  - Priority filtering (for tasks)
  - Status filtering (for tasks)
- **Real-time Results**: Debounced search with instant feedback
- **Relevance Scoring**: Results sorted by relevance percentage
- **Export Results**: Export search results to JSON format

### Usage
```tsx
import { AdvancedSearch } from '@/components/search/AdvancedSearch'

function MyComponent() {
  const handleSearch = async (filters) => {
    const response = await fetch('/api/search/advanced', {
      method: 'POST',
      body: JSON.stringify(filters),
    })
    const data = await response.json()
    return data.results
  }

  return <AdvancedSearch onSearch={handleSearch} />
}
```

### API Endpoint
**POST** `/api/search/advanced`

**Request Body:**
```json
{
  "query": "project planning",
  "type": "all",
  "dateFrom": "2024-01-01",
  "dateTo": "2024-12-31",
  "tags": ["work", "important"],
  "priority": "high",
  "status": "pending"
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "123",
      "title": "Project Planning Document",
      "content": "...",
      "type": "document",
      "date": "2024-10-15",
      "tags": ["work", "planning"],
      "relevance": 0.95
    }
  ],
  "total": 15,
  "query": "project planning"
}
```

---

## 📈 Feature 2: Task Analytics Dashboard

### Description
Comprehensive analytics dashboard providing insights into task management, productivity metrics, and trends.

### Key Metrics
- **Total Tasks**: Overall task count
- **Completion Rate**: Percentage of completed tasks
- **Average Completion Time**: Days to complete tasks
- **Overdue Tasks**: Count of tasks past due date
- **Priority Distribution**: Breakdown by priority level
- **Daily Completion Chart**: Visual 7-day completion trend
- **AI Generated Tasks**: Tracking of AI-created tasks

### Features
- **Time Range Selection**: View stats for week, month, or year
- **Interactive Charts**: Hover for detailed information
- **Priority Breakdown**: Visual representation of task priorities
- **Weekly Trends**: 4-week comparison of task creation vs completion

### Usage
```tsx
import { TaskAnalytics } from '@/components/analytics/TaskAnalytics'

function MyDashboard() {
  const [tasks, setTasks] = useState([])

  return <TaskAnalytics tasks={tasks} />
}
```

### API Endpoint
**GET** `/api/analytics/tasks?range=month`

**Response:**
```json
{
  "analytics": {
    "total": 45,
    "completed": 32,
    "pending": 10,
    "inProgress": 3,
    "completionRate": 71.11,
    "avgCompletionTime": 3.5,
    "overdueTasks": 2,
    "aiGeneratedTasks": 15,
    "priorityDistribution": {
      "low": 12,
      "medium": 20,
      "high": 13
    },
    "dailyCompletion": [...]
  }
}
```

---

## ⚡ Feature 3: Task Templates & Quick Actions

### Description
Pre-built task templates for common workflows, enabling rapid task creation with best practices.

### Built-in Templates
1. **Project Kickoff** - Project initiation workflow
2. **Weekly Review** - Personal productivity review
3. **Code Review** - Development code review checklist
4. **Sprint Planning** - Agile sprint planning workflow
5. **Onboarding** - Team member onboarding process
6. **Bug Fix** - Bug fixing workflow

### Template Structure
```typescript
interface Template {
  id: string
  name: string
  description: string
  category: string
  icon: string
  tasks: [{
    title: string
    description?: string
    priority: 'low' | 'medium' | 'high'
    estimatedDays?: number
  }]
}
```

### Usage
```tsx
import { TaskTemplates } from '@/components/tasks/TaskTemplates'

function MyComponent() {
  const handleApplyTemplate = (template) => {
    // Create tasks from template
    template.tasks.forEach(task => {
      createTask(task)
    })
  }

  return <TaskTemplates onApplyTemplate={handleApplyTemplate} />
}
```

### Features
- **Category Filtering**: Filter templates by category
- **Estimated Duration**: See total estimated time
- **Custom Templates**: Create and save your own templates
- **One-Click Apply**: Instantly create all template tasks

---

## 💾 Feature 4: Export / Import Functionality

### Description
Export tasks to multiple formats and import from external sources for backup and data portability.

### Supported Formats

#### Export Formats
1. **JSON** - Full fidelity, best for backup and re-import
2. **CSV** - Excel/Google Sheets compatible
3. **Markdown** - Human-readable, documentation-friendly

#### Import Formats
- JSON
- CSV

### Export Examples

**JSON Format:**
```json
[
  {
    "id": "task123",
    "title": "Complete project",
    "description": "Finish the main feature",
    "status": "pending",
    "priority": "high",
    "tags": ["work", "important"],
    "dueDate": "2024-11-01",
    "createdAt": "2024-10-20"
  }
]
```

**CSV Format:**
```csv
Title,Description,Status,Priority,Tags,Due Date,Created At
"Complete project","Finish the main feature","pending","high","work;important","2024-11-01","2024-10-20"
```

**Markdown Format:**
```markdown
# Tasks Export

## [ ] Complete project

> Finish the main feature

**Status:** pending
**Priority:** high
**Tags:** work, important
**Due Date:** 11/1/2024
**Created:** 10/20/2024
```

### Usage
```tsx
import { TaskExportImport } from '@/components/tasks/TaskExportImport'

function MyComponent() {
  const handleImport = async (importedTasks) => {
    // Process and create tasks
    for (const task of importedTasks) {
      await createTask(task)
    }
  }

  return (
    <TaskExportImport 
      tasks={tasks}
      onImport={handleImport}
    />
  )
}
```

---

## 🎯 Integration Guide

### Adding Features to Dashboard

```tsx
// src/app/dashboard/page.tsx
import { AdvancedSearch } from '@/components/search/AdvancedSearch'
import { TaskAnalytics } from '@/components/analytics/TaskAnalytics'
import { TaskTemplates } from '@/components/tasks/TaskTemplates'
import { TaskExportImport } from '@/components/tasks/TaskExportImport'

export default function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [searchResults, setSearchResults] = useState([])

  const handleSearch = async (filters) => {
    const response = await fetch('/api/search/advanced', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(filters),
    })
    const data = await response.json()
    setSearchResults(data.results)
  }

  const handleApplyTemplate = (template) => {
    // Create tasks from template
    template.tasks.forEach(async (taskData) => {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          autoAnalyze: false,
        }),
      })
      if (response.ok) {
        const { task } = await response.json()
        setTasks(prev => [...prev, task])
      }
    })
  }

  const handleImportTasks = async (importedTasks) => {
    for (const taskData of importedTasks) {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...taskData,
          autoAnalyze: false,
        }),
      })
      if (response.ok) {
        const { task } = await response.json()
        setTasks(prev => [...prev, task])
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Search Section */}
      <section>
        <AdvancedSearch 
          onSearch={handleSearch}
          results={searchResults}
        />
      </section>

      {/* Quick Actions */}
      <section className="flex gap-4">
        <TaskTemplates onApplyTemplate={handleApplyTemplate} />
        <TaskExportImport 
          tasks={tasks}
          onImport={handleImportTasks}
        />
      </section>

      {/* Analytics Dashboard */}
      <section>
        <TaskAnalytics tasks={tasks} />
      </section>
    </div>
  )
}
```

---

## 🔒 Security Considerations

All new features include:
- **Authentication**: All API endpoints require valid JWT tokens
- **Authorization**: Users can only access their own data
- **Input Validation**: All inputs are validated and sanitized
- **Rate Limiting**: API calls are rate-limited to prevent abuse
- **SQL Injection Protection**: Using Prisma ORM with parameterized queries

---

## 🚀 Performance Optimizations

1. **Search**:
   - Debounced queries (500ms)
   - Result pagination (max 50 results)
   - Indexed database queries

2. **Analytics**:
   - Computed on-demand
   - Cacheable responses
   - Efficient date range queries

3. **Export/Import**:
   - Chunked processing for large datasets
   - Async operations
   - Memory-efficient streaming

---

## 📝 Future Enhancements

### Planned Features
- [ ] Real-time collaboration (WebSocket-based)
- [ ] Task comments and attachments
- [ ] Email notifications
- [ ] Mobile app integration
- [ ] Custom dashboard widgets
- [ ] Advanced task dependencies
- [ ] Team workspace features
- [ ] Calendar view for tasks
- [ ] Automated task scheduling
- [ ] Integration with external tools (Slack, JIRA, etc.)

---

## 🐛 Troubleshooting

### Common Issues

**Q: Search not returning results**
- Check query length (minimum 3 characters)
- Verify authentication token
- Check filter combinations

**Q: Analytics not loading**
- Ensure tasks exist in database
- Check date range selection
- Verify API endpoint accessibility

**Q: Template application fails**
- Check task creation permissions
- Verify template structure
- Review API error logs

**Q: Import fails**
- Validate file format (JSON/CSV)
- Check required fields
- Ensure proper encoding (UTF-8)

---

## 📧 Support

For issues or feature requests:
- GitHub Issues: [Repository URL]
- Documentation: [Docs URL]
- Email: support@example.com

---

## 📜 License

Copyright © 2024 Communication Broker Tool
All rights reserved.

