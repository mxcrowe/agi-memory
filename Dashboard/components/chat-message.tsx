"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Brain, User, Zap } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  energyCost?: number;
}

export function ChatMessage({
  role,
  content,
  timestamp,
  energyCost,
}: ChatMessageProps) {
  const isAssistant = role === "assistant";

  return (
    <div
      className={`flex gap-4 ${isAssistant ? "flex-row" : "flex-row-reverse"}`}
    >
      <Avatar
        className={`h-10 w-10 shrink-0 ${
          isAssistant ? "bg-primary/10" : "bg-accent/10"
        }`}
      >
        <AvatarFallback>
          {isAssistant ? (
            <Brain className="h-5 w-5 text-primary" />
          ) : (
            <User className="h-5 w-5 text-accent" />
          )}
        </AvatarFallback>
      </Avatar>
      <div
        className={`flex-1 space-y-2 ${
          isAssistant ? "" : "flex flex-col items-end"
        }`}
      >
        <div
          className={`flex items-center gap-2 ${
            isAssistant ? "" : "flex-row-reverse"
          }`}
        >
          <span className="text-sm font-medium text-foreground">
            {isAssistant ? "Hexis" : "You"}
          </span>
          <span className="text-xs text-muted-foreground">
            {timestamp.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            {timestamp.toLocaleTimeString()}
          </span>
          {energyCost && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 text-xs"
            >
              <Zap className="h-3 w-3" />
              {energyCost}
            </Badge>
          )}
        </div>
        <div
          className={`rounded-lg px-4 py-3 ${
            isAssistant
              ? "bg-card border border-border/50"
              : "bg-primary/10 border border-primary/20"
          }`}
        >
          <p className="text-sm leading-relaxed text-foreground">{content}</p>
        </div>
      </div>
    </div>
  );
}
