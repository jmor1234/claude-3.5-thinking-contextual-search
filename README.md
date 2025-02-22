# Claude Thinking Contextual Search

A Next.js application that enhances Claude 3.5 Sonnet with visible chain-of-thought reasoning and intelligent web search capabilities.

## Why This Exists

While major AI providers have integrated visible reasoning and web search capabilities into their models, Anthropic's Claude lacks these features in their hosted solutions. This application bridges that gap by implementing:

1. **Visible Chain-of-Thought Reasoning**: See Claude's thought process as it works through queries, a capability pioneered by OpenAI's O1/O3 models, popularized through DeepSeek's raw chain-of-thought implementation, and most recently showcased in xAI's Grok 3.

2. **Intelligent Contextual Search**: Seamlessly integrates web search when relevant to the conversation, without requiring manual switching or disrupting the chat flow.

## Key Features

- **Automatic Contextual Search**: No manual search mode switching - the model intelligently determines when web search is beneficial based on conversation context
- **Agentic Tool Calling**: Leverages Vercel AI SDK's tool calling and maxSteps features to enable iterative, context-aware tool usage where each tool call can inform subsequent actions
- **Semantic Search Integration**: Uses Exa API's meaning-based search for more relevant results
- **Continuous Conversation Flow**: Maintains coherent dialogue before, during, and after web searches
- **Clean UI**: XML parsing separates reasoning, answers, and sources for clear presentation

## Technical Stack

- **Framework**: Next.js 15
- **UI Components**: Shadcn/UI
- **AI Integration**: Vercel AI SDK
- **Search Provider**: Exa API - LLM-native search API that indexes the web by meaning rather than keywords
- **Deployment**: Vercel

## Search Integration Details

The application leverages Exa API's advanced capabilities:

- **Semantic Search**: Unlike traditional keyword-based search, Exa indexes the entire web based on meaning, enabling more contextually relevant results
- **LLM-Optimized Results**: Provides highlights and summaries that are directly contextually relevant to queries, reducing context window usage
- **Efficient Context Management**: Summaries and highlights prevent context window clogging, as the LLM doesn't need to parse entire webpage contents
- **Intelligent Result Processing**: Returns results that are semantically aligned with query intent, improving response accuracy

## Project Structure

- `app/api/chat/route.ts`: AI and API integrations
- `app/chat`: Chat UI components, message handling, and conversational interface

## What Makes It Different

Unlike typical AI search implementations, this application:
- Determines search necessity contextually
- Scales search depth based on query complexity
- Maintains conversation coherence throughout
- Shows reasoning process transparently

## Getting Started

To run this application locally, you'll need:

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory with your API keys:
   ```env
   ANTHROPIC_API_KEY=your_anthropic_key_here
   EXA_API_KEY=your_exa_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```