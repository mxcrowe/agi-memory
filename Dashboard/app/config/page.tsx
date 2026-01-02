import { ConfigManager } from "@/components/config-manager"
import { Brain } from "lucide-react"
import Link from "next/link"
import { mockConfiguration } from "@/lib/mock-data"

export default async function ConfigPage() {
  const config = mockConfiguration

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
              <p className="text-sm text-muted-foreground">Configuration</p>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Status
            </Link>
            <Link href="/memory" className="text-sm text-muted-foreground hover:text-foreground">
              Memory
            </Link>
            <Link href="/chat" className="text-sm text-muted-foreground hover:text-foreground">
              Chat
            </Link>
            <button className="text-sm font-medium text-foreground hover:text-primary">Config</button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <ConfigManager initialConfig={config} />
      </main>
    </div>
  )
}
