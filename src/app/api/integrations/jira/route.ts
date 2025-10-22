import { NextRequest, NextResponse } from 'next/server';
import { JiraClient } from '@/integrations/jira/jiraClient';

export async function POST(request: NextRequest) {
  try {
    const { action, projectId, updates, issue } = await request.json();

    const jiraClient = new JiraClient(
      process.env.JIRA_BASE_URL!,
      process.env.JIRA_USERNAME!,
      process.env.JIRA_API_TOKEN!
    );

    let result;

    switch (action) {
      case 'getProject':
        if (!projectId) {
          return NextResponse.json(
            { error: 'Project ID is required' },
            { status: 400 }
          );
        }
        result = await jiraClient.getProject(projectId);
        break;

      case 'updateProject':
        if (!projectId || !updates) {
          return NextResponse.json(
            { error: 'Project ID and updates are required' },
            { status: 400 }
          );
        }
        await jiraClient.updateProject(projectId, updates);
        result = { success: true };
        break;

      case 'createIssue':
        if (!issue) {
          return NextResponse.json(
            { error: 'Issue data is required' },
            { status: 400 }
          );
        }
        result = await jiraClient.createIssue(issue);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Jira integration error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Jira integration failed',
        message: error.message
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const jiraClient = new JiraClient(
      process.env.JIRA_BASE_URL!,
      process.env.JIRA_USERNAME!,
      process.env.JIRA_API_TOKEN!
    );

    const project = await jiraClient.getProject(projectId);

    return NextResponse.json({
      success: true,
      data: project
    });

  } catch (error) {
    console.error('Jira get project error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve project',
        message: error.message
      },
      { status: 500 }
    );
  }
}