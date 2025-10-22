import { Intent, CommandType, Entity, EntityType, UserContext, IntentDetectionResult } from './types';

export class IntentDetector {
  private readonly patterns: Map<CommandType, RegExp[]>;
  private readonly entityPatterns: Map<EntityType, RegExp[]>;

  constructor() {
    this.patterns = new Map();
    this.entityPatterns = new Map();
    this.initializePatterns();
  }

  private initializePatterns(): void {
    // Update command patterns
    this.patterns.set(CommandType.UPDATE, [
      /mark\s+(.+?)\s+as\s+(.+)/i,
      /update\s+(.+?)\s+to\s+(.+)/i,
      /set\s+(.+?)\s+status\s+to\s+(.+)/i,
      /change\s+(.+?)\s+to\s+(.+)/i,
      /move\s+(.+?)\s+to\s+(.+)/i,
      /assign\s+(.+?)\s+to\s+(.+)/i
    ]);

    // Query command patterns
    this.patterns.set(CommandType.QUERY, [
      /what\s+is\s+(.+)/i,
      /what's\s+(.+)/i,
      /tell\s+me\s+about\s+(.+)/i,
      /show\s+me\s+(.+)/i,
      /find\s+(.+)/i,
      /search\s+for\s+(.+)/i,
      /how\s+do\s+i\s+(.+)/i,
      /where\s+is\s+(.+)/i,
      /when\s+is\s+(.+)/i,
      /who\s+is\s+(.+)/i
    ]);

    // Notify command patterns
    this.patterns.set(CommandType.NOTIFY, [
      /notify\s+(.+?)\s+about\s+(.+)/i,
      /send\s+(.+?)\s+a\s+message\s+about\s+(.+)/i,
      /alert\s+(.+?)\s+that\s+(.+)/i,
      /tell\s+(.+?)\s+that\s+(.+)/i,
      /inform\s+(.+?)\s+about\s+(.+)/i
    ]);

    // Search command patterns
    this.patterns.set(CommandType.SEARCH, [
      /search\s+(.+)/i,
      /find\s+(.+)/i,
      /look\s+for\s+(.+)/i,
      /show\s+me\s+(.+)/i
    ]);

    // Help command patterns
    this.patterns.set(CommandType.HELP, [
      /help/i,
      /what\s+can\s+you\s+do/i,
      /commands/i,
      /how\s+to\s+use/i
    ]);

    // Entity patterns
    this.entityPatterns.set(EntityType.PROJECT, [
      /project\s+([a-zA-Z0-9\s\-_]+)/i,
      /([a-zA-Z0-9\s\-_]+)\s+project/i
    ]);

    this.entityPatterns.set(EntityType.PERSON, [
      /@([a-zA-Z0-9\s\-_]+)/i,
      /user\s+([a-zA-Z0-9\s\-_]+)/i,
      /([a-zA-Z0-9\s\-_]+)\s+user/i
    ]);

    this.entityPatterns.set(EntityType.DOCUMENT, [
      /document\s+([a-zA-Z0-9\s\-_\.]+)/i,
      /file\s+([a-zA-Z0-9\s\-_\.]+)/i,
      /([a-zA-Z0-9\s\-_\.]+)\.(pdf|docx|txt|md)/i
    ]);

    this.entityPatterns.set(EntityType.DATE, [
      /(\d{1,2}\/\d{1,2}\/\d{4})/i,
      /(\d{4}-\d{2}-\d{2})/i,
      /(today|yesterday|tomorrow)/i,
      /(this\s+week|next\s+week|last\s+week)/i,
      /(this\s+month|next\s+month|last\s+month)/i
    ]);

    this.entityPatterns.set(EntityType.STATUS, [
      /(in\s+progress|completed|pending|on\s+hold|cancelled)/i,
      /(active|inactive|draft|published)/i,
      /(open|closed|resolved|assigned)/i
    ]);

    this.entityPatterns.set(EntityType.PRIORITY, [
      /(low|medium|high|urgent|critical)/i,
      /(p1|p2|p3|p4|p5)/i
    ]);

    this.entityPatterns.set(EntityType.TEAM, [
      /team\s+([a-zA-Z0-9\s\-_]+)/i,
      /([a-zA-Z0-9\s\-_]+)\s+team/i
    ]);

    this.entityPatterns.set(EntityType.DEPARTMENT, [
      /([a-zA-Z0-9\s\-_]+)\s+department/i,
      /department\s+([a-zA-Z0-9\s\-_]+)/i
    ]);
  }

  async detectIntent(input: string, context: UserContext): Promise<IntentDetectionResult> {
    const startTime = Date.now();
    
    try {
      // Clean and normalize input
      const normalizedInput = this.normalizeInput(input);
      
      // Extract entities first
      const entities = this.extractEntities(normalizedInput);
      
      // Detect intent type
      const intentType = this.classifyCommand(normalizedInput);
      
      // Calculate confidence based on pattern matching and context
      const confidence = this.calculateConfidence(normalizedInput, intentType, entities, context);
      
      // Extract parameters based on intent type
      const parameters = this.extractParameters(normalizedInput, intentType, entities);
      
      const intent: Intent = {
        type: intentType,
        confidence,
        entities,
        parameters,
        originalInput: input
      };

      const processingTime = Date.now() - startTime;

      return {
        intent,
        confidence,
        processingTime,
        metadata: {
          normalizedInput,
          patternMatches: this.getPatternMatches(normalizedInput, intentType),
          contextRelevance: this.calculateContextRelevance(intent, context)
        }
      };
    } catch (error) {
      console.error('Intent detection error:', error);
      return {
        intent: {
          type: CommandType.UNKNOWN,
          confidence: 0,
          entities: [],
          parameters: {},
          originalInput: input
        },
        confidence: 0,
        processingTime: Date.now() - startTime,
        metadata: { error: error.message }
      };
    }
  }

  private normalizeInput(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-_@\.\/]/g, '');
  }

  private extractEntities(input: string): Entity[] {
    const entities: Entity[] = [];

    for (const [entityType, patterns] of this.entityPatterns) {
      for (const pattern of patterns) {
        const matches = input.matchAll(new RegExp(pattern.source, 'gi'));
        for (const match of matches) {
          if (match.index !== undefined) {
            entities.push({
              type: entityType,
              value: match[1] || match[0],
              confidence: this.calculateEntityConfidence(match[0], pattern),
              startIndex: match.index,
              endIndex: match.index + match[0].length
            });
          }
        }
      }
    }

    return entities;
  }

  private classifyCommand(input: string): CommandType {
    let bestMatch: CommandType = CommandType.UNKNOWN;
    let highestConfidence = 0;

    for (const [commandType, patterns] of this.patterns) {
      for (const pattern of patterns) {
        if (pattern.test(input)) {
          const confidence = this.calculatePatternConfidence(input, pattern);
          if (confidence > highestConfidence) {
            highestConfidence = confidence;
            bestMatch = commandType;
          }
        }
      }
    }

    return bestMatch;
  }

  private calculateConfidence(
    input: string,
    intentType: CommandType,
    entities: Entity[],
    context: UserContext
  ): number {
    let confidence = 0;

    // Base confidence from pattern matching
    const patterns = this.patterns.get(intentType) || [];
    for (const pattern of patterns) {
      if (pattern.test(input)) {
        confidence = Math.max(confidence, this.calculatePatternConfidence(input, pattern));
      }
    }

    // Boost confidence based on entity presence
    if (entities.length > 0) {
      confidence += 0.1 * entities.length;
    }

    // Boost confidence based on context relevance
    const contextRelevance = this.calculateContextRelevance({ type: intentType, entities, parameters: {} } as Intent, context);
    confidence += contextRelevance * 0.2;

    // Boost confidence for help commands (they're usually clear)
    if (intentType === CommandType.HELP) {
      confidence = Math.max(confidence, 0.9);
    }

    return Math.min(confidence, 1.0);
  }

  private calculatePatternConfidence(input: string, pattern: RegExp): number {
    const match = input.match(pattern);
    if (!match) return 0;

    // Calculate confidence based on match completeness
    const matchLength = match[0].length;
    const inputLength = input.length;
    const completeness = matchLength / inputLength;

    // Calculate confidence based on pattern specificity
    const specificity = pattern.source.length / 50; // Longer patterns are more specific

    return Math.min(completeness + specificity * 0.3, 1.0);
  }

  private calculateEntityConfidence(match: string, pattern: RegExp): number {
    // Simple confidence calculation based on match quality
    const matchLength = match.length;
    const patternLength = pattern.source.length;
    return Math.min(matchLength / patternLength, 1.0);
  }

  private calculateContextRelevance(intent: Intent, context: UserContext): number {
    let relevance = 0;

    // Check if entities match user's current context
    if (context.currentProject) {
      const projectEntity = intent.entities.find(e => e.type === EntityType.PROJECT);
      if (projectEntity && projectEntity.value.toLowerCase().includes(context.currentProject.toLowerCase())) {
        relevance += 0.3;
      }
    }

    // Check if entities match user's department
    if (context.department) {
      const deptEntity = intent.entities.find(e => e.type === EntityType.DEPARTMENT);
      if (deptEntity && deptEntity.value.toLowerCase().includes(context.department.toLowerCase())) {
        relevance += 0.2;
      }
    }

    // Check conversation history for related topics
    const recentMessages = context.conversationHistory.slice(-5);
    const relatedTopics = recentMessages.some(msg => 
      intent.entities.some(entity => 
        msg.content.toLowerCase().includes(entity.value.toLowerCase())
      )
    );
    if (relatedTopics) {
      relevance += 0.2;
    }

    return Math.min(relevance, 1.0);
  }

  private extractParameters(input: string, intentType: CommandType, entities: Entity[]): Record<string, any> {
    const parameters: Record<string, any> = {};

    switch (intentType) {
      case CommandType.UPDATE:
        // Extract what to update and new value
        const updateMatch = input.match(/(?:mark|update|set|change|move|assign)\s+(.+?)\s+(?:as|to|status\s+to)\s+(.+)/i);
        if (updateMatch) {
          parameters.target = updateMatch[1].trim();
          parameters.newValue = updateMatch[2].trim();
        }
        break;

      case CommandType.QUERY:
        // Extract query subject
        const queryMatch = input.match(/(?:what\s+is|what's|tell\s+me\s+about|show\s+me|find|search\s+for|how\s+do\s+i|where\s+is|when\s+is|who\s+is)\s+(.+)/i);
        if (queryMatch) {
          parameters.subject = queryMatch[1].trim();
        }
        break;

      case CommandType.NOTIFY:
        // Extract recipient and message
        const notifyMatch = input.match(/(?:notify|send|alert|tell|inform)\s+(.+?)\s+(?:about|a\s+message\s+about|that)\s+(.+)/i);
        if (notifyMatch) {
          parameters.recipient = notifyMatch[1].trim();
          parameters.message = notifyMatch[2].trim();
        }
        break;

      case CommandType.SEARCH:
        // Extract search terms
        const searchMatch = input.match(/(?:search|find|look\s+for|show\s+me)\s+(.+)/i);
        if (searchMatch) {
          parameters.query = searchMatch[1].trim();
        }
        break;
    }

    // Add entity-based parameters
    entities.forEach(entity => {
      parameters[entity.type.toLowerCase()] = entity.value;
    });

    return parameters;
  }

  private getPatternMatches(input: string, intentType: CommandType): string[] {
    const patterns = this.patterns.get(intentType) || [];
    const matches: string[] = [];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        matches.push(match[0]);
      }
    }

    return matches;
  }
}