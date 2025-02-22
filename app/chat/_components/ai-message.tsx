// app/chat/_components/ai-message.tsx

import { Message } from 'ai';
import { parseMessage } from './message-parser';
import { ReasoningBlockComponent } from './reasoning-block';
import { SourceBlock } from './source-block';
import { motion } from 'framer-motion';
import { MarkdownContent } from './markdown-content';
import { cn } from '@/lib/utils';

interface AIMessageProps {
  message: Message;
}

const messageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

export function AIMessage({ message }: AIMessageProps) {
  const { reasoning, finalResponse, sources } = parseMessage(message.content);
  
  return (
    <motion.div
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-4"
    >
      {reasoning.length > 0 && (
        <div className="space-y-2">
          {reasoning.map((block, index) => (
            <ReasoningBlockComponent key={`${block.type}-${block.iteration}-${index}`} block={block} />
          ))}
        </div>
      )}
      
      {finalResponse && (
        <div className={cn(
          "bg-card text-card-foreground rounded-[22px] px-6 py-4 max-w-[85%]",
          "hover:bg-card/98 transition-all duration-300 ease-out",
          "shadow-[0_2px_12px_-3px_rgba(0,0,0,0.08),0_2px_4px_-1px_rgba(0,0,0,0.04)]", 
          "hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.12),0_2px_6px_-1px_rgba(0,0,0,0.08)]",
          "border border-border/10",
          "mb-5 last:mb-0",
          "backdrop-blur-sm",
          "dark:bg-card/95 dark:hover:bg-card/98"
        )}>
          <MarkdownContent 
            content={finalResponse}
            className={cn(
              "text-[15.5px] tracking-[-0.01em]",
              "selection:bg-primary/15"
            )}
            isUser={false}
          />
        </div>
      )}

      {sources.length > 0 && (
        <div className="mt-2">
          <SourceBlock sources={sources} />
        </div>
      )}
    </motion.div>
  );
} 