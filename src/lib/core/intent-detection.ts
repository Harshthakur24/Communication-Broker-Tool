export interface IntentDetectionResult {
  intent: string;
  confidence: number;
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
  action: string;
  parameters: Record<string, any>;
}

export interface IntentPattern {
  intent: string;
  patterns: string[];
  entities: Array<{
    type: string;
    pattern: RegExp;
    required: boolean;
  }>;
  action: string;
  priority: number;
}

export class IntentDetector {
  private patterns: IntentPattern[] = [
    // Project Management Intents
    {
      intent: 'update_project_status',
      patterns: [
        'mark.*project.*as',
        'update.*project.*status',
        'change.*project.*to',
        'set.*project.*status'
      ],
      entities: [
        { type: 'project_name', pattern: /(?:project\s+)?([a-zA-Z0-9\s]+?)(?:\s+as|\s+status|\s+to)/i, required: true },
        { type: 'status', pattern: /(?:as|to|status)\s+([a-zA-Z0-9\s]+)/i, required: true }
      ],
      action: 'UPDATE_PROJECT_STATUS',
      priority: 1
    },
    {
      intent: 'create_project',
      patterns: [
        'create.*project',
        'new.*project',
        'start.*project',
        'add.*project'
      ],
      entities: [
        { type: 'project_name', pattern: /(?:project|new|start|add)\s+([a-zA-Z0-9\s]+)/i, required: true },
        { type: 'description', pattern: /(?:description|desc|about)[\s:]+([^.!?]+)/i, required: false }
      ],
      action: 'CREATE_PROJECT',
      priority: 1
    },
    {
      intent: 'get_project_status',
      patterns: [
        'project.*status',
        'status.*project',
        'how.*project.*going',
        'project.*progress'
      ],
      entities: [
        { type: 'project_name', pattern: /(?:project\s+)?([a-zA-Z0-9\s]+?)(?:\s+status|\s+progress|\s+going)/i, required: false }
      ],
      action: 'GET_PROJECT_STATUS',
      priority: 2
    },

    // Document Management Intents
    {
      intent: 'search_documents',
      patterns: [
        'find.*document',
        'search.*document',
        'look.*for.*document',
        'show.*document'
      ],
      entities: [
        { type: 'query', pattern: /(?:find|search|look for|show)\s+(?:document[s]?\s+)?(?:about\s+)?([^.!?]+)/i, required: true },
        { type: 'category', pattern: /(?:in|category|type)\s+([a-zA-Z0-9\s]+)/i, required: false }
      ],
      action: 'SEARCH_DOCUMENTS',
      priority: 2
    },
    {
      intent: 'upload_document',
      patterns: [
        'upload.*document',
        'add.*document',
        'share.*document',
        'attach.*document'
      ],
      entities: [
        { type: 'document_name', pattern: /(?:document|file)\s+([a-zA-Z0-9\s.]+)/i, required: false },
        { type: 'category', pattern: /(?:category|type)\s+([a-zA-Z0-9\s]+)/i, required: false }
      ],
      action: 'UPLOAD_DOCUMENT',
      priority: 1
    },

    // Information Query Intents
    {
      intent: 'ask_question',
      patterns: [
        'what.*is',
        'how.*does',
        'when.*is',
        'where.*is',
        'who.*is',
        'why.*is',
        'can.*you.*tell.*me',
        'do.*you.*know'
      ],
      entities: [
        { type: 'question', pattern: /(?:what|how|when|where|who|why|can you tell me|do you know)\s+([^.!?]+)/i, required: true },
        { type: 'topic', pattern: /(?:about|regarding)\s+([a-zA-Z0-9\s]+)/i, required: false }
      ],
      action: 'ANSWER_QUESTION',
      priority: 3
    },
    {
      intent: 'get_policy_info',
      patterns: [
        'policy.*about',
        'what.*policy',
        'policy.*for',
        'company.*policy'
      ],
      entities: [
        { type: 'policy_topic', pattern: /(?:policy|company policy)\s+(?:about|for|regarding)?\s*([a-zA-Z0-9\s]+)/i, required: true }
      ],
      action: 'GET_POLICY_INFO',
      priority: 2
    },

    // Summary and Report Intents
    {
      intent: 'summarize',
      patterns: [
        'summarize',
        'summary',
        'give.*me.*summary',
        'brief.*me'
      ],
      entities: [
        { type: 'topic', pattern: /(?:summarize|summary|brief)\s+(?:me\s+)?(?:about\s+)?([^.!?]+)/i, required: false },
        { type: 'timeframe', pattern: /(?:from|since|in)\s+([a-zA-Z0-9\s]+)/i, required: false }
      ],
      action: 'GENERATE_SUMMARY',
      priority: 2
    },
    {
      intent: 'get_report',
      patterns: [
        'report.*on',
        'show.*report',
        'generate.*report',
        'create.*report'
      ],
      entities: [
        { type: 'report_type', pattern: /(?:report|show|generate|create)\s+(?:a\s+)?(?:report\s+on\s+)?([a-zA-Z0-9\s]+)/i, required: true },
        { type: 'timeframe', pattern: /(?:for|from|since)\s+([a-zA-Z0-9\s]+)/i, required: false }
      ],
      action: 'GENERATE_REPORT',
      priority: 2
    },

    // Team and Communication Intents
    {
      intent: 'get_team_info',
      patterns: [
        'team.*members',
        'who.*in.*team',
        'team.*info',
        'show.*team'
      ],
      entities: [
        { type: 'team_name', pattern: /(?:team|members)\s+([a-zA-Z0-9\s]+)/i, required: false }
      ],
      action: 'GET_TEAM_INFO',
      priority: 2
    },
    {
      intent: 'send_notification',
      patterns: [
        'notify.*team',
        'send.*message',
        'alert.*team',
        'inform.*team'
      ],
      entities: [
        { type: 'message', pattern: /(?:notify|send|alert|inform)\s+(?:team\s+)?(?:about\s+)?([^.!?]+)/i, required: true },
        { type: 'recipient', pattern: /(?:to|for)\s+([a-zA-Z0-9\s@]+)/i, required: false }
      ],
      action: 'SEND_NOTIFICATION',
      priority: 1
    },

    // Meeting and Schedule Intents
    {
      intent: 'schedule_meeting',
      patterns: [
        'schedule.*meeting',
        'book.*meeting',
        'arrange.*meeting',
        'set.*up.*meeting'
      ],
      entities: [
        { type: 'meeting_topic', pattern: /(?:meeting|book|arrange|set up)\s+(?:about\s+)?([a-zA-Z0-9\s]+)/i, required: false },
        { type: 'time', pattern: /(?:at|on|for)\s+([a-zA-Z0-9\s:]+)/i, required: false },
        { type: 'participants', pattern: /(?:with|for)\s+([a-zA-Z0-9\s,@]+)/i, required: false }
      ],
      action: 'SCHEDULE_MEETING',
      priority: 1
    },
    {
      intent: 'get_meeting_info',
      patterns: [
        'meeting.*today',
        'meetings.*this.*week',
        'upcoming.*meetings',
        'my.*schedule'
      ],
      entities: [
        { type: 'timeframe', pattern: /(?:today|this week|upcoming|schedule)/i, required: false }
      ],
      action: 'GET_MEETING_INFO',
      priority: 2
    }
  ];

  /**
   * Detect intent from user input
   */
  async detectIntent(input: string): Promise<IntentDetectionResult> {
    const normalizedInput = input.toLowerCase().trim();
    
    // Find matching patterns
    const matches = this.findMatchingPatterns(normalizedInput);
    
    if (matches.length === 0) {
      return {
        intent: 'unknown',
        confidence: 0,
        entities: [],
        action: 'GENERAL_QUERY',
        parameters: {}
      };
    }

    // Sort by priority and confidence
    matches.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return b.confidence - a.confidence;
    });

    const bestMatch = matches[0];
    
    // Extract entities
    const entities = this.extractEntities(normalizedInput, bestMatch.pattern);
    
    // Extract parameters
    const parameters = this.extractParameters(entities);

    return {
      intent: bestMatch.pattern.intent,
      confidence: bestMatch.confidence,
      entities,
      action: bestMatch.pattern.action,
      parameters
    };
  }

  /**
   * Find patterns that match the input
   */
  private findMatchingPatterns(input: string): Array<{
    pattern: IntentPattern;
    confidence: number;
  }> {
    const matches: Array<{
      pattern: IntentPattern;
      confidence: number;
    }> = [];

    for (const pattern of this.patterns) {
      for (const patternStr of pattern.patterns) {
        const regex = new RegExp(patternStr, 'i');
        if (regex.test(input)) {
          const confidence = this.calculatePatternConfidence(input, patternStr);
          matches.push({
            pattern,
            confidence
          });
          break; // Only match the first pattern for each intent
        }
      }
    }

    return matches;
  }

  /**
   * Calculate confidence score for pattern match
   */
  private calculatePatternConfidence(input: string, pattern: string): number {
    // Simple confidence calculation based on pattern complexity and match quality
    const patternWords = pattern.split(/\s+/).length;
    const inputWords = input.split(/\s+/).length;
    
    // Base confidence on pattern specificity
    let confidence = Math.min(patternWords / inputWords, 1);
    
    // Boost confidence for exact matches
    if (input.includes(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
      confidence = Math.min(confidence + 0.2, 1);
    }
    
    // Boost confidence for required entities
    const requiredEntities = this.patterns.find(p => p.patterns.includes(pattern))?.entities.filter(e => e.required) || [];
    if (requiredEntities.length > 0) {
      confidence = Math.min(confidence + 0.1, 1);
    }
    
    return Math.round(confidence * 100) / 100;
  }

  /**
   * Extract entities from input using pattern
   */
  private extractEntities(input: string, pattern: IntentPattern): Array<{
    type: string;
    value: string;
    confidence: number;
  }> {
    const entities: Array<{
      type: string;
      value: string;
      confidence: number;
    }> = [];

    for (const entity of pattern.entities) {
      const match = input.match(entity.pattern);
      if (match) {
        entities.push({
          type: entity.type,
          value: match[1]?.trim() || '',
          confidence: 0.8 // Default confidence for regex matches
        });
      }
    }

    return entities;
  }

  /**
   * Extract parameters from entities
   */
  private extractParameters(entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>): Record<string, any> {
    const parameters: Record<string, any> = {};

    entities.forEach(entity => {
      parameters[entity.type] = entity.value;
    });

    return parameters;
  }

  /**
   * Add custom intent pattern
   */
  addIntentPattern(pattern: IntentPattern): void {
    this.patterns.push(pattern);
  }

  /**
   * Remove intent pattern
   */
  removeIntentPattern(intent: string): void {
    this.patterns = this.patterns.filter(p => p.intent !== intent);
  }

  /**
   * Get all available intents
   */
  getAvailableIntents(): string[] {
    return this.patterns.map(p => p.intent);
  }

  /**
   * Validate intent detection result
   */
  validateResult(result: IntentDetectionResult): boolean {
    // Check if required entities are present
    const pattern = this.patterns.find(p => p.intent === result.intent);
    if (!pattern) return false;

    const requiredEntities = pattern.entities.filter(e => e.required);
    for (const required of requiredEntities) {
      const hasEntity = result.entities.some(e => e.type === required.type);
      if (!hasEntity) return false;
    }

    return true;
  }
}