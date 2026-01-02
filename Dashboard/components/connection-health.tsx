import { Card } from "@/components/ui/card"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"

interface ConnectionHealthProps {
  mcp_bridge: "connected" | "disconnected" | "error"
  postgres: "connected" | "disconnected" | "error"
  llm_api: "connected" | "disconnected" | "error"
}

export function ConnectionHealth({ mcp_bridge, postgres, llm_api }: ConnectionHealthProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      case "disconnected":
        return <XCircle className="h-4 w-4 text-slate-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-400" />
    }
  }

  const connections = [
    { name: "MCP Bridge", status: mcp_bridge },
    { name: "PostgreSQL", status: postgres },
    { name: "LLM API", status: llm_api },
  ]

  return (
    <Card className="p-4 bg-background/50 border-border/50">
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Connection Health</h3>
      <div className="space-y-2">
        {connections.map((conn) => (
          <div key={conn.name} className="flex items-center justify-between">
            <span className="text-sm text-foreground">{conn.name}</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(conn.status)}
              <span className="text-xs font-mono text-muted-foreground capitalize">{conn.status}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
