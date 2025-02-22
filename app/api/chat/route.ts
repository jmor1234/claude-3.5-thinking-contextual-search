// app/api/chat/route.ts

import { anthropic } from '@ai-sdk/anthropic';
import { smoothStream, streamText, tool, generateObject } from 'ai';
import { z } from 'zod';
import Exa from 'exa-js';

// Allow responses up to 5 minutes
export const maxDuration = 300;

const exa = new Exa(process.env.EXA_API_KEY);

const formatCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString('en-US', { 
      timeZone: 'America/New_York',
      dateStyle: 'medium',
      timeStyle: 'medium'
    }) + ' EST';
  };

const SYSTEM_PROMPT = `
You are Claude the AI assistant from Anthropic.
You are the Claude 3.5 Sonnet model.
You have access to powerful web search capabilities through the contextualWebSearch tool.
You use the contextualWebSearch when contextually relevant to do so.

CORE CAPABILITIES & PERSONALITY:
- Engage in natural, helpful conversations
- Be flexible, contextually aware, and empathetic
- Show curiosity and appropriate playfulness when relevant
- Be fun playful an silly when you see that it's relevant to do so

CONTEXTUAL WEB SEARCH TOOL:
This is a sophisticated search tool you can use to gather current and accurate information. Here's how it works:

Capabilities:
- Executes multiple targeted searches (you decide how many, 2-6 per call)
- Provides comprehensive results with highlights and summaries
- Designed for multiple iterative calls, each building on previous results

SEARCH STRATEGY - IMPORTANT:
Always prefer multiple focused tool calls over fewer larger ones. Here's why and how:

1. Start Small and Build:
- Begin with 2-3 targeted queries in your first tool call
- Review those results thoroughly
- Use insights gained to inform your next tool call
- Each subsequent call becomes more contextually relevant

2. Progressive Understanding:
- First call: Establish baseline understanding
- Second call: Dive deeper based on initial findings
- Additional calls: Explore specific aspects or fill knowledge gaps
- Each iteration benefits from accumulated context

When Determining Number of Searches Per Call:
- Prefer 2-3 queries per call for most situations
- Use 4-6 queries only when topic requires immediate broad coverage
- Remember: Multiple focused calls > One large call

Guidelines for Search Count Per Call:
- 2 queries: Initial exploration or specific follow-up
- 3 queries: Multi-aspect exploration with focus
- 4-6 queries: Only when topic requires immediate broad coverage

When to Use:
- Fact verification
- Current events research
- Deep topic exploration
- Technical information gathering
- Multiple perspective analysis
- Any topic requiring up-to-date information

IMPORTANT - SEARCH PROCESS:

1. Before First Search:
   • Evaluate if you need user clarification
   • For ambiguous queries, ask 1-2 specific questions
   • Wait for user response before proceeding
   • Start with a small number of focused queries (2-3)
   • Ensure you understand:
     - Initial scope needed
     - Time period relevance
     - Key aspects to focus on first

2. During Search Iteration:
   • Start with 2-3 targeted queries
   • Review results thoroughly
   • Use those insights to plan next tool call
   • Each new call should build on previous findings
   • Use <thinking> tags to evaluate information
   • Use <stress_test> tags to validate understanding

3. After Each Search:
   • Evaluate if information is sufficient via <thinking> and <stress_test> tags
   • Plan next tool call based on current results
   • Identify gaps or areas needing deeper exploration
   • Make additional targeted tool calls as needed
   • Each new call should be more contextually informed

RESPONSE FORMAT:

Your responses must follow this structure:

<thinking>
[Provide your internal reasoning and considerations]
</thinking>

<stress_test>
[Double-check any potential misunderstandings or missing pieces]
</stress_test>

<final_answer>
[Present your final response to the user]
</final_answer>

If using web search results, add:

<sources>
[List sources in clean bullet point format]
- Source 1 [website url]
- Source 2 [website url]
</sources>

Source Guidelines:
- Only cite sources actually used in your response, when you use them, provide in text citations at the end of the sentence [1],[2] etc..
- Double-check all citations for accuracy
- Include only the most relevant sources
- Use proper formatting for each citation
- Make sure to include the website url in the citation

IMPORTANT REMINDERS:
- Your knowledge cutoff is 2024 - current date is ${formatCurrentDateTime()}
- Use contextualWebSearch for current events and recent information
- You can use multiple rounds of thinking/stress testing (<thinking_2>, <stress_test_2>, etc.)
- Never provide a final answer without completing thinking and stress testing phases
- You can and should use the search tool multiple times if needed for comprehensive information

Remember: Quality and accuracy are more important than speed. Take the time to think, validate, and ensure comprehensive understanding before responding.
`

export async function POST(req: Request) {
  console.log('\n🤖 --- New Chat Request ---\n');
  
  const { messages } = await req.json();
  
  // Show full message content
  const lastMessage = messages[messages.length - 1];
  console.log('📝 Last User Message:', {
    role: lastMessage.role,
    content: lastMessage.content  // Removed truncation
  });

  let stepCounter = 0;

  const result = streamText({
    model: anthropic('claude-3-5-sonnet-latest'),
    system: SYSTEM_PROMPT,
    messages,
    experimental_transform: smoothStream(),
    maxSteps: 6,
    toolChoice: 'auto',
    onStepFinish: ({ toolCalls, toolResults, finishReason, usage, text }) => {
      stepCounter++;
      console.log(`\n📊 Step ${stepCounter} Finished:`);
      console.log('🏁 Finish Reason:', finishReason);

      console.log('💬 Model Response:', text);
      
      if (toolCalls && toolCalls.length > 0) {
        console.log('🛠️ Tool Calls:');
        toolCalls.forEach((call, index) => {
          console.log(`  [${index + 1}] Tool: ${call.toolName}, Arguments:`, call.args);
        });
      }
      
      if (toolResults && toolResults.length > 0) {
        console.log('🔧 Tool Results:');
        toolResults.forEach((result, index) => {
          console.log(`  [${index + 1}] Result:`, typeof result === 'object' ? JSON.stringify(result).slice(0, 100) + '...' : result);
        });
      }
      
      if (usage) {
        console.log('📈 Usage:', usage);
      }
      
      console.log('------------------------');
    },
    tools: {
      contextualWebSearch: tool({
        description: `Executes a specified number of web searches based on your strategic decision. You determine the number of searches (2-6) based on topic complexity and user needs. Current date is ${formatCurrentDateTime()}`,
        parameters: z.object({
          numberOfQueries: z.number()
            .min(2)
            .max(6)
            .describe('Number of searches to perform (2-6), determined based on topic complexity and depth needed'),
          conversationContext: z.string()
            .describe('Detailed Summary of the current conversation context and topic'),
          currentIntent: z.string()
            .describe('The current user intent or area of curiosity with detail')
        }),
        execute: async ({ numberOfQueries, conversationContext, currentIntent }) => {
          const searchStartTime = new Date();
          
          // Define schema for query generation with fixed count
          const queryGenSchema = z.object({
            queries: z.array(z.object({
              query: z.string(),
              reasoning: z.string()
            })).length(numberOfQueries)
          });

          try {
            // Generate contextual queries
            const { object: generatedQueries } = await generateObject({
              model: anthropic('claude-3-5-sonnet-latest'),
              schema: queryGenSchema,
              prompt: `Based on the following context, generate exactly ${numberOfQueries} search queries to gather comprehensive information:

              Conversation Context: ${conversationContext}
              Current User Intent: ${currentIntent}
              Current Date: ${formatCurrentDateTime()}

              Generate ${numberOfQueries} queries that:
              - Cover different aspects of the topic
              - Are specific and focused
              - Will yield relevant but diverse results
              - Help build a comprehensive understanding

              For each query, provide:
              1. The search query
              2. Reasoning for how this query contributes to the overall information gathering strategy`,
            });

            // Configure search parameters
            const searchConfig = {
              numResults: 5,
              type: 'auto' as const,
              useAutoprompt: true,
              highlights: {
                numSentences: 3,
                highlightsPerUrl: 4
              } as const,
              summary: true as const
            };

            // Add delay helper
            const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

            console.log('\n🔬 Deep Research Strategy:');
            console.log('📊 Number of Queries:', numberOfQueries);
            console.log('------------------------\n');

            // Execute searches with delay
            const searchResults = await Promise.all(
              generatedQueries.queries.map(async ({ query, reasoning }: { query: string; reasoning: string }, index: number) => {
                try {
                  // Add delay between requests (250ms between each)
                  await delay(index * 250);
                  
                  const results = await exa.searchAndContents(query, searchConfig);
                  
                  console.log('\n🤖 Autoprompt:');
                  console.log('------------------------');
                  console.log('Original Query:', query);
                  if (results.autopromptString) {
                    console.log('Auto Query:', results.autopromptString);
                  } else {
                    console.log('Auto Query: No autoprompt generated');
                  }
                  console.log('------------------------\n');

                  console.log('🔎 Search Results:');
                  results.results.forEach((result, index) => {
                    console.log(`\n[${index + 1}] ${result.title}`);
                    console.log('🔗 URL:', result.url);
                    if (result.highlights) {
                      console.log('💡 Highlights:', `${result.highlights.length} found`);
                    }
                    if (result.summary) {
                      console.log('📝 Summary:', 'Available');
                    }
                  });
                  console.log('\n------------------------\n');

                  return {
                    query,
                    reasoning,
                    results: results.results,
                    autopromptString: results.autopromptString
                  };
                } catch (error) {
                  console.error(`\n❌ Search Error for query "${query}":`, error);
                  return {
                    query,
                    reasoning,
                    error: 'Failed to perform search',
                    results: []
                  };
                }
              })
            );

            const searchDuration = new Date().getTime() - searchStartTime.getTime();
            
            console.log('\n📊 Search Summary:');
            console.log('------------------------');
            console.log(`⏱️ Duration: ${searchDuration}ms`);
            console.log(`📝 Queries: ${searchResults.length}`);
            console.log('------------------------\n');

            return {
              queries: generatedQueries.queries,
              searchResults,
              metadata: {
                duration: searchDuration,
                totalQueries: searchResults.length,
                timestamp: new Date().toISOString()
              }
            };

          } catch (error) {
            console.error('\n❌ Deep Research Error:', error);
            if (error instanceof Error) {
              console.error('Type:', error.name);
              console.error('Message:', error.message);
              console.error('Stack:', error.stack);
            } else {
              console.error('Unknown error:', error);
            }
            return { error: 'Failed to perform deep research' };
          }
        },
      }),
    },
  });

  // Log when the response starts streaming
  console.log('\n📤 Starting response stream...\n');
  console.log('------------------------\n');

  return result.toDataStreamResponse();
}