import { Card } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

interface SemanticDensityMapProps {
  clusters: {
    cluster_name: string
    size: number
    growth_rate: number
  }[]
}

export function SemanticDensityMap({ clusters }: SemanticDensityMapProps) {
  const maxSize = Math.max(...clusters.map((c) => c.size))

  return (
    <Card className="p-4 bg-background/50 border-border/50">
      <h3 className="text-sm font-semibold mb-4 text-muted-foreground">Semantic Density Heat Map</h3>
      <div className="space-y-3">
        {clusters.map((cluster) => {
          const widthPercent = (cluster.size / maxSize) * 100
          const growthColor =
            cluster.growth_rate > 10 ? "bg-emerald-500" : cluster.growth_rate > 5 ? "bg-cyan-500" : "bg-purple-500"

          return (
            <div key={cluster.cluster_name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-foreground">{cluster.cluster_name}</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                  <span className="text-xs font-mono text-muted-foreground">+{cluster.growth_rate.toFixed(1)}%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-6 bg-background/30 rounded-md overflow-hidden">
                  <div
                    className={`h-full ${growthColor} opacity-60 transition-all duration-500`}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground w-12 text-right">{cluster.size}</span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
