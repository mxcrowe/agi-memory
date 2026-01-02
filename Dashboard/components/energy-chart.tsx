"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

interface EnergyDataPoint {
  time: string
  energy: number
  actions: number
}

// Generate mock energy history data
const generateEnergyHistory = (): EnergyDataPoint[] => {
  const data: EnergyDataPoint[] = []
  const now = Date.now()
  let currentEnergy = 1000

  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now - i * 5 * 60000) // 5-minute intervals
    const actions = Math.floor(Math.random() * 3)
    currentEnergy = Math.max(500, currentEnergy - actions * 15 - Math.random() * 10)

    data.push({
      time: timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      energy: Math.round(currentEnergy),
      actions,
    })
  }

  return data
}

export function EnergyChart() {
  const data = generateEnergyHistory()

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Energy Timeline</CardTitle>
        <CardDescription>Energy consumption over the last 2 hours</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            energy: {
              label: "Energy",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[250px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 1000]}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="energy"
                stroke="hsl(var(--chart-1))"
                fill="url(#energyGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
