"use client";

import { Mail } from "lucide-react";
import { useState } from "react";

interface MailIndicatorProps {
  initialUnseenCount: number;
}

export function MailIndicator({ initialUnseenCount }: MailIndicatorProps) {
  const [unseenCount, setUnseenCount] = useState(initialUnseenCount);
  const [isAcknowledging, setIsAcknowledging] = useState(false);

  const handleClick = async () => {
    if (unseenCount === 0 || isAcknowledging) return;

    setIsAcknowledging(true);
    try {
      const response = await fetch("/api/outbox/acknowledge", {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        setUnseenCount(0);
      }
    } catch (error) {
      console.error("Error acknowledging messages:", error);
    } finally {
      setIsAcknowledging(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center p-1 rounded transition-colors ${
        unseenCount > 0
          ? "hover:bg-red-400/20 cursor-pointer"
          : "cursor-default"
      }`}
      title={
        unseenCount > 0 ? "Click to acknowledge messages" : "No new messages"
      }
    >
      <Mail
        className={`h-5 w-5 ${
          unseenCount > 0
            ? "text-red-400 animate-pulse"
            : "text-muted-foreground"
        }`}
      />
      {unseenCount > 0 && (
        <span className="ml-1 text-xs font-bold text-red-400">
          {unseenCount}
        </span>
      )}
    </button>
  );
}
