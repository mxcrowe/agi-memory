"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";

interface ChatHistoryMessage {
  id: string;
  createdAt: Date;
  direction: "incoming" | "outgoing";
  message: string;
  sender: string;
  status: string;
}

interface ChatHistoryProps {
  onSelectMessage?: (message: ChatHistoryMessage) => void;
}

export function ChatHistory({ onSelectMessage }: ChatHistoryProps) {
  const [messages, setMessages] = useState<ChatHistoryMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/chat-history");
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSnippet = (text: string, maxWords = 12) => {
    if (!text) return "";
    const words = text.split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4" />
            Chat History
          </CardTitle>
          <button
            onClick={() => {
              setIsLoading(true);
              fetchHistory();
            }}
            className="p-1 hover:bg-muted rounded"
            title="Refresh"
          >
            <RefreshCw
              className={`h-3 w-3 text-muted-foreground ${
                isLoading ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Loading...
          </p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No messages yet
          </p>
        ) : (
          messages.map((msg) => (
            <button
              key={msg.id}
              onClick={() => onSelectMessage?.(msg)}
              className="w-full text-left rounded-lg border border-border/50 bg-card/50 p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  {msg.direction === "outgoing" ? (
                    <ArrowUpRight className="h-3 w-3 text-primary" />
                  ) : (
                    <ArrowDownLeft className="h-3 w-3 text-emerald-400" />
                  )}
                  <span className="text-xs font-medium text-foreground">
                    {msg.sender}
                  </span>
                </div>
                <Badge
                  variant={
                    msg.direction === "outgoing" ? "default" : "secondary"
                  }
                  className="text-[10px] px-1.5 py-0"
                >
                  {msg.direction === "outgoing" ? "Hexis → You" : "You → Hexis"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                {getSnippet(msg.message)}
              </p>
              <div className="text-[10px] text-muted-foreground/70">
                {formatDate(msg.createdAt)}
              </div>
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
}
