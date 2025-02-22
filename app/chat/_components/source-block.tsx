"use client"

import type { Source } from "./message-parser"
import { Link2, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, type KeyboardEvent } from "react"
import { cn } from "@/lib/utils"

interface SourceBlockProps {
  sources: Source[]
}

const blockVariants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: "auto", opacity: 1 },
}

function ensureExternalUrl(url: string): string {
  // Remove any localhost prefix if it exists
  if (url.startsWith('http://localhost:3000/')) {
    url = url.replace('http://localhost:3000/', '')
  }
  
  // If the URL doesn't start with http:// or https://, assume it's an external URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`
  }
  
  return url
}

export function SourceBlock({ sources }: SourceBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      setIsExpanded(!isExpanded)
    }
  }

  if (sources.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-muted/30 rounded-lg overflow-hidden transition-all duration-200 hover:bg-muted/40"
    >
      <button
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-controls="sources-content"
        className={cn(
          "w-full p-3 flex items-center justify-between text-sm font-medium",
          "text-muted-foreground hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "transition-all duration-200"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-background/50">
            <Link2 className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="text-sm font-medium">
            Sources ({sources.length})
          </span>
        </div>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isExpanded ? "rotate-180" : ""
          )}
        />
      </button>
      
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id="sources-content"
            role="region"
            aria-label="Source citations"
            variants={blockVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div className="px-4 pb-3 pt-1">
              <ul className="space-y-2">
                {sources.map((source) => (
                  <li 
                    key={source.number}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                      {source.number}
                    </span>
                    <a
                      href={ensureExternalUrl(source.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "hover:text-foreground transition-colors duration-200",
                        "underline decoration-1 underline-offset-4 hover:decoration-2",
                        "flex-1 break-all"
                      )}
                    >
                      {source.title || source.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 