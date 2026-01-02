import { Card } from "@/components/ui/card"
import { Clock, Zap, Activity, Server } from "lucide-react"

interface VitalityMetricsProps {
  hb_min: number
  mx_sec: number
  uptime_seconds: number
  api_latency_ms: number
  loop_latency_ms: number
}

export function VitalityMetrics({
  hb_min,
  mx_sec,
  uptime_seconds,
  api_latency_ms,
  loop_latency_ms,
}: VitalityMetricsProps) {
  const uptimeHours = (uptime_seconds / 3600).toFixed(1)

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <Card className="p-3 bg-background/50 border-border/50">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="h-4 w-4 text-purple-400" />
          <div className="text-xs text-muted-foreground">Heartbeat Interval</div>
        </div>
        <div className="text-xl font-mono font-bold text-foreground">
          {hb_min}
          <span className="text-sm text-muted-foreground ml-1">min</span>
        </div>
      </Card>

      <Card className="p-3 bg-background/50 border-border/50">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-4 w-4 text-cyan-400" />
          <div className="text-xs text-muted-foreground">Maintenance Interval</div>
        </div>
        <div className="text-xl font-mono font-bold text-foreground">
          {mx_sec}
          <span className="text-sm text-muted-foreground ml-1">sec</span>
        </div>
      </Card>

      <Card className="p-3 bg-background/50 border-border/50">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="h-4 w-4 text-emerald-400" />
          <div className="text-xs text-muted-foreground">Elapsed Time Since Init</div>
        </div>
        <div className="text-xl font-mono font-bold text-foreground">
          {uptimeHours}
          <span className="text-sm text-muted-foreground ml-1">hrs</span>
        </div>
      </Card>

      <Card className="p-3 bg-background/50 border-border/50">
        <div className="flex items-center gap-2 mb-1">
          <Server className="h-4 w-4 text-blue-400" />
          <div className="text-xs text-muted-foreground">API Latency</div>
        </div>
        <div className="text-xl font-mono font-bold text-foreground">
          {api_latency_ms}
          <span className="text-sm text-muted-foreground ml-1">ms</span>
        </div>
      </Card>

      <Card className="p-3 bg-background/50 border-border/50">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="h-4 w-4 text-violet-400" />
          <div className="text-xs text-muted-foreground">Loop Latency</div>
        </div>
        <div className="text-xl font-mono font-bold text-foreground">
          {loop_latency_ms}
          <span className="text-sm text-muted-foreground ml-1">ms</span>
        </div>
      </Card>
    </div>
  )
}
