import { ChatInterface } from "@/components/chat-interface"
import { ConversationHistory } from "@/components/conversation-history"
import { Brain } from "lucide-react"
import Link from "next/link"
import { mockRelationships } from "@/lib/mock-data"

export default async function ChatPage() {
  const relationships = mockRelationships

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
              <h1 className="text-xl font-semibold text-foreground">Hexis Dashboard</h1>
              <p className="text-sm text-muted-foreground">Chat Interface</p>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Status
            </Link>
            <Link href="/memory" className="text-sm text-muted-foreground hover:text-foreground">
              Memory
            </Link>
            <button className="text-sm font-medium text-foreground hover:text-primary">Chat</button>
            <Link href="/config" className="text-sm text-muted-foreground hover:text-foreground">
              Config
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Chat Interface - Takes 3 columns */}
          <div className="lg:col-span-3">
            <ChatInterface />
          </div>

          {/* Conversation History - Takes 1 column */}
          <div className="space-y-6">
            <ConversationHistory relationships={relationships} />
          </div>
        </div>
      </main>
    </div>
  )
}
