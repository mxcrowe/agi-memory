"use client"

import { useEffect, useState } from "react"
import { Activity } from "lucide-react"

interface PulseIndicatorProps {
  status: "active" | "sleeping" | "error"
}

export function PulseIndicator({ status }: PulseIndicatorProps) {
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    if (status !== "active") return

    const interval = setInterval(() => {
      setPulse((p) => (p + 1) % 100)
    }, 20)

    return () => clearInterval(interval)
  }, [status])

  const getStatusColor = () => {
    switch (status) {
      case "active":
        return "text-emerald-400"
      case "sleeping":
        return "text-slate-500"
      case "error":
        return "text-red-400"
    }
  }

  const waveHeight = status === "active" ? Math.sin(pulse * 0.1) * 15 + 15 : 5

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Activity className={`h-8 w-8 ${getStatusColor()}`} />
        {status === "active" && (
          <div className="absolute inset-0 animate-ping">
            <Activity className="h-8 w-8 text-emerald-400 opacity-75" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 h-12">
        <svg width="200" height="48" className="overflow-visible">
          <path
            d={`M 0 24 ${Array.from({ length: 50 })
              .map((_, i) => {
                const x = i * 4
                const y = 24 + Math.sin((pulse + i * 2) * 0.1) * waveHeight
                return `L ${x} ${y}`
              })
              .join(" ")}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={getStatusColor()}
          />
        </svg>
      </div>
      <div className="text-sm font-mono">
        <div className={`font-semibold ${getStatusColor()}`}>{status.toUpperCase()}</div>
        <div className="text-xs text-muted-foreground">Heartbeat Monitor</div>
      </div>
    </div>
  )
}
