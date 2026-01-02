import { Card } from "@/components/ui/card"
import { Lightbulb } from "lucide-react"
import type { InsightProgress } from "@/lib/types"

interface InsightProgressBarProps {
  progress: InsightProgress
}

export function InsightProgressBar({ progress }: InsightProgressBarProps) {
  const minutes = Math.floor(progress.estimated_time_to_next / 60)

  return (
    <Card className="p-4 bg-background/50 border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-4 w-4 text-yellow-400" />
        <h3 className="text-sm font-semibold text-muted-foreground">Insight Consolidation Progress</h3>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground">Observations Collected</span>
          <span className="font-mono text-muted-foreground">
            {progress.current_observations} / {progress.threshold_for_consolidation}
          </span>
        </div>
        <div className="relative h-4 bg-background/30 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-500"
            style={{ width: `${progress.progress_percentage}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-semibold text-foreground">
            {progress.progress_percentage}%
          </div>
        </div>
        <div className="text-xs text-muted-foreground text-center">Next consolidation in ~{minutes} minutes</div>
      </div>
    </Card>
  )
}
