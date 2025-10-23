import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { prisma } from '@/lib/database'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// AI Task Analysis Function using Gemini
async function analyzeTaskWithAI(text: string) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    })

    const prompt = `You are an intelligent AI Task Agent. Analyze the text and detect ANY actionable tasks - no matter how casually written.

TEXT: "${text}"

Return ONLY valid JSON (no markdown/code blocks):
{
  "isTask": boolean,
  "tasks": [{
    "title": "clear action",
    "description": "context",
    "priority": "low"|"medium"|"high",
    "tags": ["tags"],
    "dueDate": "YYYY-MM-DD" or null
  }],
  "agentAnalysis": "what I detected"
}

CORE PRINCIPLE: If it mentions ANY future action, it's a task!

DETECTION:
1. CASUAL PHRASES: "add a task", "remind me", "I should", "need to", "have to", "want to", "plan to", "gonna", "will", "gotta"
2. DIRECT COMMANDS: "complete project", "fix bug", "call John", "send email", "write report"
3. INDIRECT: "the meeting tomorrow" → Task: "Attend meeting"
4. URGENCY:
   - HIGH: URGENT, ASAP, NOW, TODAY, CRITICAL, EMERGENCY
   - MEDIUM: IMPORTANT, SOON, TOMORROW, THIS WEEK
   - LOW: LATER, MAYBE, SOMETIME, EVENTUALLY
5. TIME: "tomorrow", "next week", "Friday", "by Monday", "in 3 days", "end of month"
6. MULTIPLE: Lists, "and", commas with actions

EXAMPLES:
✓ "add a task of completing project tomorrow" → Task: "Complete project", dueDate: tomorrow
✓ "completing project tomorrow" → Task: "Complete project", dueDate: tomorrow  
✓ "I need to call John" → Task: "Call John"
✓ "URGENT fix the bug" → Task: "Fix bug", priority: high
✓ "email Sarah and book room for Friday" → 2 tasks
✓ "just thinking about the presentation" → Task: "Prepare presentation"
✗ "Just had lunch" → Not a task
✗ "I love pizza" → Not a task

BE EXTREMELY LENIENT: Convert any hint of future action into a task!`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const content = response.text()

    // Clean up the response using regex to remove all markdown formatting
    let cleanContent = content.trim()
    
    // Remove markdown code blocks (```json, ```, etc.)
    cleanContent = cleanContent.replace(/```json\s*/g, '')
    cleanContent = cleanContent.replace(/```\s*/g, '')
    
    // Remove asterisks used for bold/italic (**text**, *text*)
    cleanContent = cleanContent.replace(/\*\*/g, '')
    cleanContent = cleanContent.replace(/\*/g, '')
    
    // Remove hashtags used for headers (# Header, ## Header, etc.)
    cleanContent = cleanContent.replace(/^#{1,6}\s+/gm, '')
    
    // Remove underscores used for emphasis (__text__, _text_)
    cleanContent = cleanContent.replace(/__/g, '')
    cleanContent = cleanContent.replace(/_/g, '')
    
    // Remove any leading/trailing whitespace and newlines
    cleanContent = cleanContent.trim()

    return JSON.parse(cleanContent)
  } catch (error) {
    console.error('AI task analysis error:', error)
    return { isTask: false, tasks: [] }
  }
}

// Update Knowledge Base Function
async function updateKnowledgeBase(userId: string, taskData: any) {
  try {
    // Create a document in the knowledge base for this task
    const taskDocument = await prisma.document.create({
      data: {
        title: `Task: ${taskData.title}`,
        content: `Task Title: ${taskData.title}\nDescription: ${taskData.description || 'No description'}\nPriority: ${taskData.priority}\nStatus: ${taskData.status}\nCreated: ${new Date().toISOString()}`,
        type: 'task',
        category: 'tasks',
        tags: taskData.tags || [],
        uploadedBy: userId,
      },
    })

    return taskDocument
  } catch (error) {
    console.error('Knowledge base update error:', error)
    return null
  }
}

// GET - Fetch all tasks
export async function GET(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const { searchParams } = new URL(request.url)
      const status = searchParams.get('status')
      const priority = searchParams.get('priority')

      const where: any = {
        userId: user.id,
      }

      if (status) {
        where.status = status
      }

      if (priority) {
        where.priority = priority
      }

      const tasks = await prisma.task.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
      })

      return NextResponse.json({ tasks }, { status: 200 })
    } catch (error) {
      console.error('Get tasks error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}

// POST - Create new task or analyze text
export async function POST(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const body = await request.json()
      const { text, autoAnalyze = true } = body

      if (!text || typeof text !== 'string') {
        return NextResponse.json(
          { error: 'Text is required' },
          { status: 400 }
        )
      }

      let tasksCreated = []

      if (autoAnalyze) {
        // Use AI to analyze the text
        const analysis = await analyzeTaskWithAI(text)

        if (analysis.isTask && analysis.tasks.length > 0) {
          // Create tasks from AI analysis
          for (const taskData of analysis.tasks) {
            const task = await prisma.task.create({
              data: {
                userId: user.id,
                title: taskData.title,
                description: taskData.description,
                priority: taskData.priority || 'medium',
                status: 'pending',
                tags: taskData.tags || [],
                dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
                aiAnalyzed: true,
                metadata: {
                  originalText: text,
                  aiAnalysis: analysis.agentAnalysis || 'Auto-detected by AI',
                },
              },
            })

            // Update knowledge base
            await updateKnowledgeBase(user.id, task)

            tasksCreated.push(task)
          }

          return NextResponse.json(
            {
              success: true,
              message: `AI Agent detected ${tasksCreated.length} task(s)`,
              tasks: tasksCreated,
              analysis,
              agentMessage: analysis.agentAnalysis || `Automatically created ${tasksCreated.length} task(s) from your input`,
            },
            { status: 201 }
          )
        } else {
          return NextResponse.json(
            {
              success: false,
              message: 'No actionable tasks detected',
              analysis,
              agentMessage: analysis.agentAnalysis || 'This doesn\'t seem to be a task. Try phrases like "I need to..." or "Remember to..."',
            },
            { status: 200 }
          )
        }
      } else {
        // Manual task creation
        const { title, description, priority, tags, dueDate } = body

        if (!title) {
          return NextResponse.json(
            { error: 'Title is required' },
            { status: 400 }
          )
        }

        const task = await prisma.task.create({
          data: {
            userId: user.id,
            title,
            description,
            priority: priority || 'medium',
            status: 'pending',
            tags: tags || [],
            dueDate: dueDate ? new Date(dueDate) : null,
            aiAnalyzed: false,
          },
        })

        // Update knowledge base
        await updateKnowledgeBase(user.id, task)

        return NextResponse.json(
          {
            success: true,
            message: 'Task created successfully',
            task,
          },
          { status: 201 }
        )
      }
    } catch (error) {
      console.error('Create task error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}

// PUT - Update task
export async function PUT(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const body = await request.json()
      const { taskId, ...updateData } = body

      if (!taskId) {
        return NextResponse.json(
          { error: 'Task ID is required' },
          { status: 400 }
        )
      }

      // Check if task exists and belongs to user
      const existingTask = await prisma.task.findFirst({
        where: {
          id: taskId,
          userId: user.id,
        },
      })

      if (!existingTask) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        )
      }

      const updatedTask = await prisma.task.update({
        where: {
          id: taskId,
        },
        data: updateData,
      })

      // Update knowledge base if task is completed
      if (updateData.status === 'completed') {
        await updateKnowledgeBase(user.id, updatedTask)
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Task updated successfully',
          task: updatedTask,
        },
        { status: 200 }
      )
    } catch (error) {
      console.error('Update task error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}

// DELETE - Delete task
export async function DELETE(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const { searchParams } = new URL(request.url)
      const taskId = searchParams.get('taskId')

      if (!taskId) {
        return NextResponse.json(
          { error: 'Task ID is required' },
          { status: 400 }
        )
      }

      // Check if task exists and belongs to user
      const existingTask = await prisma.task.findFirst({
        where: {
          id: taskId,
          userId: user.id,
        },
      })

      if (!existingTask) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        )
      }

      await prisma.task.delete({
        where: {
          id: taskId,
        },
      })

      return NextResponse.json(
        {
          success: true,
          message: 'Task deleted successfully',
        },
        { status: 200 }
      )
    } catch (error) {
      console.error('Delete task error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}

