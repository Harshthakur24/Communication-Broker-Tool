import { NextRequest, NextResponse } from 'next/server';
import { JiraClient } from '@/integrations/jira/jiraClient';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const source = request.headers.get('x-webhook-source') || 'unknown';

    console.log(`Webhook received from ${source}:`, payload);

    switch (source) {
      case 'jira':
        await handleJiraWebhook(payload);
        break;
      case 'notion':
        await handleNotionWebhook(payload);
        break;
      case 'slack':
        await handleSlackWebhook(payload);
        break;
      default:
        console.log(`Unhandled webhook source: ${source}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Webhook processing failed',
        message: error.message
      },
      { status: 500 }
    );
  }
}

async function handleJiraWebhook(payload: any) {
  try {
    const jiraClient = new JiraClient(
      process.env.JIRA_BASE_URL!,
      process.env.JIRA_USERNAME!,
      process.env.JIRA_API_TOKEN!
    );

    await jiraClient.handleWebhook(payload);
    
    // Update knowledge base with the webhook data
    await updateKnowledgeBase('jira', payload);
    
  } catch (error) {
    console.error('Jira webhook handling error:', error);
    throw error;
  }
}

async function handleNotionWebhook(payload: any) {
  try {
    console.log('Processing Notion webhook:', payload);
    
    // Update knowledge base with Notion changes
    await updateKnowledgeBase('notion', payload);
    
  } catch (error) {
    console.error('Notion webhook handling error:', error);
    throw error;
  }
}

async function handleSlackWebhook(payload: any) {
  try {
    console.log('Processing Slack webhook:', payload);
    
    // Process Slack message for knowledge extraction
    await processSlackMessage(payload);
    
  } catch (error) {
    console.error('Slack webhook handling error:', error);
    throw error;
  }
}

async function updateKnowledgeBase(source: string, data: any) {
  try {
    // This would typically update the vector database and knowledge base
    console.log(`Updating knowledge base with ${source} data:`, data);
    
    // Simulate knowledge base update
    await new Promise(resolve => setTimeout(resolve, 100));
    
  } catch (error) {
    console.error('Knowledge base update error:', error);
    throw error;
  }
}

async function processSlackMessage(payload: any) {
  try {
    // This would typically extract knowledge from Slack messages
    console.log('Processing Slack message for knowledge extraction:', payload);
    
    // Simulate message processing
    await new Promise(resolve => setTimeout(resolve, 100));
    
  } catch (error) {
    console.error('Slack message processing error:', error);
    throw error;
  }
}