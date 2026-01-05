import { Card } from "@/components/ui/card";
import { Clock, Zap, Activity, Server } from "lucide-react";

interface VitalityMetricsProps {
  hb_min: number;
  mx_sec: number;
  next_beat_due: Date | null;
  api_latency_ms: number;
  heartbeats_24h: number;
}

export function VitalityMetrics({
  hb_min,
  mx_sec,
  next_beat_due,
  api_latency_ms,
  heartbeats_24h,
}: VitalityMetricsProps) {
  // Calculate time until next beat
  const getNextBeatText = () => {
    if (!next_beat_due) return "--";
    const diff = new Date(next_beat_due).getTime() - Date.now();
    if (diff <= 0) return "Now";
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <Card className="p-3 bg-background/50 border-border/50">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="h-4 w-4 text-purple-400" />
          <div className="text-xs text-muted-foreground">
            Heartbeat Interval
          </div>
        </div>
        <div className="text-xl font-mono font-bold text-foreground">
          {hb_min}
          <span className="text-sm text-muted-foreground ml-1">min</span>
        </div>
      </Card>

      <Card className="p-3 bg-background/50 border-border/50">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-4 w-4 text-cyan-400" />
          <div className="text-xs text-muted-foreground">
            Maintenance Interval
          </div>
        </div>
        <div className="text-xl font-mono font-bold text-foreground">
          {mx_sec}
          <span className="text-sm text-muted-foreground ml-1">sec</span>
        </div>
      </Card>

      <Card className="p-3 bg-background/50 border-border/50">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="h-4 w-4 text-emerald-400" />
          <div className="text-xs text-muted-foreground">Next Beat Due</div>
        </div>
        <div className="text-xl font-mono font-bold text-foreground">
          {getNextBeatText()}
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
          <div className="text-xs text-muted-foreground">Beats Last 24hr</div>
        </div>
        <div className="text-xl font-mono font-bold text-foreground">
          {heartbeats_24h}
        </div>
      </Card>
    </div>
  );
}
