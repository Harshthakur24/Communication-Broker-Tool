import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const { searchParams } = new URL(request.url)
      const limit = parseInt(searchParams.get('limit') || '50')
      const offset = parseInt(searchParams.get('offset') || '0')

      // Mock chat messages (replace with real database queries)
      const messages = [
        {
          id: '1',
          type: 'user',
          content: 'What are the current project priorities for this quarter?',
          timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
          userId: user.id,
          userName: user.name,
          userAvatar: null,
        },
        {
          id: '2',
          type: 'assistant',
          content: 'Based on the latest project updates, here are the current Q4 priorities:\n\n1. **API Integration** - Complete the third-party service integrations (Priority: High)\n2. **User Authentication** - Implement the new security features (Priority: High)\n3. **Performance Optimization** - Improve response times by 30% (Priority: Medium)\n4. **Documentation** - Update API documentation (Priority: Medium)\n\nWould you like me to provide more details about any specific priority?',
          timestamp: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
          sources: [
            { title: 'Q4 Project Plan', url: '/docs/q4-plan' },
            { title: 'Team Meeting Notes', url: '/docs/team-meeting-2024-01-15' },
          ],
        },
        {
          id: '3',
          type: 'user',
          content: 'Can you show me the team meeting notes from last week?',
          timestamp: new Date(Date.now() - 30 * 1000), // 30 seconds ago
          userId: user.id,
          userName: user.name,
          userAvatar: null,
        },
        {
          id: '4',
          type: 'assistant',
          content: 'I found the team meeting notes from January 15th, 2024. Here are the key highlights:\n\n**Meeting Summary:**\n- Discussed Q4 project timeline adjustments\n- Reviewed API integration progress (75% complete)\n- Planned user authentication security enhancements\n- Set performance optimization goals\n\n**Action Items:**\n- Sarah: Complete API documentation by Friday\n- Mike: Review security requirements\n- Team: Prepare for client demo next week\n\n**Next Meeting:** January 22nd, 2024 at 2:00 PM',
          timestamp: new Date(Date.now() - 10 * 1000), // 10 seconds ago
          sources: [
            { title: 'Team Meeting Notes - Jan 15, 2024', url: '/docs/team-meeting-2024-01-15' },
            { title: 'Project Timeline', url: '/docs/project-timeline' },
          ],
        },
      ].slice(offset, offset + limit)

      return NextResponse.json({ 
        messages,
        hasMore: messages.length === limit,
        total: 4 // Mock total
      }, { status: 200 })
    } catch (error) {
      console.error('Get messages error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const { message } = await request.json()

      if (!message || !message.trim()) {
        return NextResponse.json(
          { error: 'Message content is required' },
          { status: 400 }
        )
      }

      // Mock AI response (replace with real AI integration)
      const aiResponse = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `I understand you're asking about "${message}". Let me search through our company knowledge base to provide you with the most accurate and up-to-date information.\n\nBased on the available data, here's what I found:\n\n- This appears to be related to our current project initiatives\n- I can help you find specific documentation or team updates\n- Would you like me to search for more specific information?`,
        timestamp: new Date(),
        sources: [
          { title: 'Company Knowledge Base', url: '/docs/knowledge-base' },
          { title: 'Project Documentation', url: '/docs/projects' },
        ],
      }

      // In a real implementation, you would:
      // 1. Save the user message to database
      // 2. Process with AI/RAG system
      // 3. Save the AI response
      // 4. Return the response

      return NextResponse.json({ 
        message: aiResponse,
        success: true 
      }, { status: 201 })
    } catch (error) {
      console.error('Send message error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}
