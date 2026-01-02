import { Card } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

interface MemoryDepthChartProps {
  data: {
    type: string
    count: number
    color: string
  }[]
}

export function MemoryDepthChart({ data }: MemoryDepthChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count))

  return (
    <Card className="p-4 bg-background/50 border-border/50">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-4 w-4 text-cyan-400" />
        <h3 className="text-sm font-semibold text-muted-foreground">Memory Distribution by Type</h3>
      </div>
      <div className="space-y-3">
        {data.map((item) => {
          const widthPercent = (item.count / maxCount) * 100

          return (
            <div key={item.type}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-foreground">{item.type}</span>
                <span className="text-xs font-mono text-muted-foreground">{item.count}</span>
              </div>
              <div className="h-6 bg-background/30 rounded-md overflow-hidden">
                <div
                  className={`h-full ${item.color} opacity-70 transition-all duration-500`}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
