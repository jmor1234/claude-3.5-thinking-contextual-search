// app/chat/page.tsx

'use client'

import type React from "react"
import { useChat } from "ai/react"
import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MessageSquare, Sparkles } from "lucide-react"
import { AIMessage } from "./_components/ai-message"
import { ChatInput } from "./_components/chat-input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { MarkdownContent } from "./_components/markdown-content"

const messageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
}

const containerVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
}

// Add new loading animation variants
const loadingVariants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: -10,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
}

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [userScrolled, setUserScrolled] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const lastMessageRef = useRef<string>("")

  // Detect when AI is streaming a response
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === "assistant") {
      if (lastMessage.content !== lastMessageRef.current) {
        lastMessageRef.current = lastMessage.content
        setIsStreaming(true)
      }
    } else {
      setIsStreaming(false)
    }
  }, [messages])

  // Reset streaming state when loading starts
  useEffect(() => {
    if (isLoading) {
      setIsStreaming(false)
      lastMessageRef.current = ""
    }
  }, [isLoading])

  // Handle scroll events
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = event.currentTarget
    const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10
    setUserScrolled(!isAtBottom)
  }

  // Scroll to bottom only when appropriate
  useEffect(() => {
    const shouldAutoScroll =
      messages[messages.length - 1]?.role === "user" ||
      (isLoading && !isStreaming && !userScrolled) ||
      (!userScrolled && messages[messages.length - 1]?.role === "assistant" && !isStreaming)

    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isLoading, userScrolled, isStreaming])

  const handleClear = () => {
    setMessages([])
    setIsStreaming(false)
    lastMessageRef.current = ""
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="min-h-[calc(100vh-48px)] bg-background flex flex-col pt-12"
    >
      <ScrollArea 
        className={cn(
          "flex-grow px-4 md:px-6 lg:px-8 py-6 custom-scrollbar",
          "transition-opacity duration-200",
          "max-w-5xl mx-auto w-full",
          isLoading && !isStreaming && "opacity-50"
        )} 
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[70vh] text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">Start a conversation...</p>
          </div>
        ) : (
          <div className="space-y-6 pb-24">
            <AnimatePresence initial={false} mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  variants={messageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "user" ? (
                    <div className="bg-primary/90 text-primary-foreground rounded-2xl px-4 py-2.5 max-w-[85%] md:max-w-[75%] shadow-sm hover:shadow-md transition-all-fast backdrop-blur-sm">
                      <MarkdownContent 
                        content={message.content}
                        className="text-sm leading-relaxed"
                        isUser={true}
                      />
                    </div>
                  ) : (
                    <AIMessage message={message} />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && !isStreaming && (
              <motion.div 
                variants={loadingVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex justify-start"
              >
                <div className="flex items-center gap-3 text-muted-foreground bg-muted/80 backdrop-blur-sm rounded-full pl-3 pr-4 py-2 shadow-sm">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/20">
                    <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce" />
                    </div>
                    <span className="text-sm font-medium">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 text-sm text-center text-destructive bg-destructive/10 rounded-lg"
              >
                {error.message}
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t">
        <div className="max-w-5xl mx-auto w-full px-4 md:px-6 lg:px-8 py-4">
          <ChatInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            onClear={handleClear}
          />
        </div>
      </div>
    </motion.div>
  )
}