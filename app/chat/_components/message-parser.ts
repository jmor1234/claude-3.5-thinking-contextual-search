// app/chat/_components/message-parser.ts

export interface ReasoningBlock {
    type: "thinking" | "stress_test"
    iteration: number
    content: string
  }
  
  export interface Source {
    number: number
    url: string
    title?: string | undefined
  }
  
  export interface ParsedMessage {
    reasoning: ReasoningBlock[]
    finalResponse: string | null
    sources: Source[]
  }
  
  export function parseMessage(content: string): ParsedMessage {
    if (!content) {
      return { reasoning: [], finalResponse: null, sources: [] }
    }
  
    const reasoning: ReasoningBlock[] = []
    let finalResponse: string | null = null
    let sources: Source[] = []
  
    try {
      // Updated regex patterns to match exact format
      const reasoningRegex = /<(thinking|stress_test)(?:_(\d+))?>([\s\S]*?)<\/\1(?:_\2)?>/g
      const finalAnswerRegex = /<final_answer>([\s\S]*?)<\/final_answer>/g
      const sourcesRegex = /<sources>([\s\S]*?)<\/sources>/g
      let match
  
      // Parse reasoning blocks (thinking and stress_test)
      while ((match = reasoningRegex.exec(content)) !== null) {
        const [, type, iteration, blockContent] = match
        reasoning.push({
          type: type as "thinking" | "stress_test",
          iteration: iteration ? parseInt(iteration, 10) : 1,
          content: blockContent.trim()
        })
      }
  
      // Parse final answer - updated to handle multiple final_answer tags if present
      let finalContent = ''
      while ((match = finalAnswerRegex.exec(content)) !== null) {
        finalContent += (finalContent ? '\n' : '') + match[1].trim()
      }
      if (finalContent) {
        finalResponse = finalContent
      }
  
      // Parse sources with improved bullet point handling
      const sourcesMatch = sourcesRegex.exec(content)
      if (sourcesMatch) {
        const sourcesContent = sourcesMatch[1]
        sources = sourcesContent
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.startsWith('-'))
          .map((line, index) => {
            const content = line.substring(1).trim()
            const urlMatch = content.match(/(https?:\/\/[^\s]+)(?:\s+(.*))?/)
            
            return {
              number: index + 1,
              url: urlMatch ? urlMatch[1] : content,
              ...(urlMatch && urlMatch[2] ? { title: urlMatch[2].trim() } : {})
            }
          })
      }
  
      // If no final_answer tag was found, look for content between last reasoning and sources
      if (!finalResponse) {
        const contentWithoutTags = content
          .replace(reasoningRegex, '')
          .replace(sourcesRegex, '')
          .replace(/<final_answer>/g, '')
          .replace(/<\/final_answer>/g, '')
          .trim()
        
        if (contentWithoutTags) {
          finalResponse = contentWithoutTags
        }
      }
  
      return { reasoning, finalResponse, sources }
    } catch (error) {
      console.error('Error parsing message:', error)
      return { reasoning: [], finalResponse: content.trim(), sources: [] }
    }
  } 