import { ChatInterface } from "@/components/chat-interface";
import { Brain } from "lucide-react";
import Link from "next/link";

export default async function ChatPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Hexis Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">Chat Interface</p>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Status
            </Link>
            <Link
              href="/memory"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Memory
            </Link>
            <button className="text-sm font-medium text-foreground hover:text-primary">
              Chat
            </button>
            <Link
              href="/config"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Config
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content - Full Width Chat */}
      <main className="container mx-auto px-6 py-6">
        <ChatInterface />
      </main>
    </div>
  );
}
