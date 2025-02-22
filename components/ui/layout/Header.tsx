"use client";

import Link from "next/link";
import { Bot } from "lucide-react";
import { ModeToggle } from "../darkMode";
import { motion } from "framer-motion";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 items-center justify-between px-4 sm:px-8 max-w-7xl">
        <Link 
          href="/" 
          className="flex items-center space-x-3 group"
        >
          <motion.span 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 transition-all duration-200 ease-in-out group-hover:bg-primary/15 group-hover:ring-primary/30 group-hover:scale-105"
          >
            <Bot className="h-4.5 w-4.5 text-primary transition-colors" />
          </motion.span>
          <motion.span 
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="text-sm font-medium sm:text-base bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
          >
            Claude-Thinking-Contextual-Search
          </motion.span>
        </Link>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.2 }}
        >
          <ModeToggle />
        </motion.div>
      </div>
    </header>
  );
} 