// Response processing utilities for AI chat messages

/**
 * Clean AI responses by removing unwanted patterns and formatting
 */
export function cleanAIResponse(response: string): string {
  let cleaned = response

  // Remove common AI disclaimers and formal language
  const patternsToRemove = [
    // Remove formal AI disclaimers
    /I'm an AI assistant and I don't have access to real-time information\./gi,
    /As an AI, I cannot/gi,
    /I'm an AI language model/gi,
    /I'm a large language model/gi,
    /I'm an AI assistant/gi,
    /I'm an artificial intelligence/gi,
    /I'm a machine learning model/gi,
    /I'm a computer program/gi,
    /I'm a chatbot/gi,
    /I'm a virtual assistant/gi,
    
    // Remove overly formal language
    /I apologize, but/gi,
    /I'm sorry, but/gi,
    /Unfortunately, I cannot/gi,
    /I'm unable to/gi,
    /I don't have the ability to/gi,
    /I cannot provide/gi,
    /I'm not able to/gi,
    
    // Remove repetitive phrases
    /I hope this helps\./gi,
    /Let me know if you need anything else\./gi,
    /Is there anything else I can help you with\?/gi,
    /Please let me know if you have any other questions\./gi,
    /Feel free to ask if you need more information\./gi,
    
    // Remove excessive politeness
    /Thank you for your question\./gi,
    /Thank you for asking\./gi,
    /I appreciate your question\./gi,
    
    // Remove AI-specific language
    /Based on my training data/gi,
    /According to my knowledge/gi,
    /From what I understand/gi,
    /In my experience/gi,
    /I believe/gi,
    /I think/gi,
    /I would suggest/gi,
    /I would recommend/gi,
    
    // Remove redundant phrases
    /To answer your question/gi,
    /To address your question/gi,
    /Regarding your question/gi,
    /In response to your question/gi,
    
    // Remove excessive explanations
    /Let me explain/gi,
    /Let me clarify/gi,
    /To clarify/gi,
    /To explain/gi,
  ]

  // Apply all patterns
  patternsToRemove.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '')
  })

  // Clean up multiple spaces and newlines
  cleaned = cleaned
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
    .trim()

  // Remove leading/trailing punctuation that might be left
  cleaned = cleaned.replace(/^[.,;:!?]+/, '').replace(/[.,;:!?]+$/, '')

  return cleaned
}

/**
 * Make AI responses more human-like and professional
 */
export function humanizeResponse(response: string): string {
  let humanized = response

  // Replace formal language with more natural expressions
  const replacements = [
    // Make responses more direct and confident
    [/I can help you with that\./gi, "Here's what I found:"],
    [/I can assist you with that\./gi, "Here's what I found:"],
    [/I can provide you with that information\./gi, "Here's the information:"],
    [/I can help you find that information\./gi, "Here's what I found:"],
    
    // Make responses more conversational
    [/Based on the available information/gi, "Looking at our documents"],
    [/According to the information provided/gi, "From our records"],
    [/The information shows/gi, "Our data indicates"],
    [/The documents indicate/gi, "Our records show"],
    
    // Remove overly cautious language
    [/I believe this is correct/gi, "This is accurate"],
    [/I think this might be/gi, "This appears to be"],
    [/This could be/gi, "This is"],
    [/This might be/gi, "This is"],
    
    // Make responses more professional and confident
    [/I'm not sure/gi, "I don't have that specific information"],
    [/I don't know/gi, "I don't have that information"],
    [/I'm uncertain/gi, "I don't have that information"],
    [/I'm not certain/gi, "I don't have that information"],
  ]

  // Apply replacements
  replacements.forEach(([pattern, replacement]) => {
    humanized = humanized.replace(pattern, replacement)
  })

  return humanized
}

/**
 * Process AI response to make it more professional and human-like
 */
export function processAIResponse(response: string): string {
  // First clean the response
  let processed = cleanAIResponse(response)
  
  // Then humanize it
  processed = humanizeResponse(processed)
  
  // Ensure the response doesn't start with unnecessary words
  processed = processed.replace(/^(So|Well|Now|Here|This|That|The|A|An)\s+/i, '')
  
  // Ensure proper capitalization
  if (processed.length > 0) {
    processed = processed.charAt(0).toUpperCase() + processed.slice(1)
  }
  
  return processed
}

/**
 * Client-side response processor for real-time message processing
 */
export function processClientResponse(response: string): string {
  return processAIResponse(response)
}
