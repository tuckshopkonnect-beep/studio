
"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import {
  ChartContainer,
  ChartTooltip as ChartTooltipPrimitive,
  ChartTooltipContent,
} from "@/components/ui/chart"

const data = [
  { name: "Mon", total: Math.floor(Math.random() * 30000) + 5000 },
  { name: "Tue", total: Math.floor(Math.random() * 30000) + 10000 },
  { name: "Wed", total: Math.floor(Math.random() * 30000) + 15000 },
  { name: "Thu", total: Math.floor(Math.random() * 30000) + 20000 },
  { name: "Fri", total: Math.floor(Math.random() * 30000) + 25000 },
  { name: "Sat", total: Math.floor(Math.random() * 10000) + 5000 },
  { name: "Sun", total: Math.floor(Math.random() * 10000) + 2000 },
]

export default function WeeklySalesChart() {
  return (
    <ChartContainer config={{
      total: {
        label: "Sales",
        color: "hsl(var(--chart-1))",
      },
    }} className="h-[300px] w-full">
      <LineChart 
        accessibilityLayer
        data={data}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
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
          tickFormatter={(value) => `₦${value/1000}k`}
        />
        <ChartTooltipPrimitive
          cursor={true}
          content={
            <ChartTooltipContent 
              indicator="dot" 
              formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'NGN' }).format(value)}
            />
          }
        />
        <Line 
          dataKey="total" 
          stroke="var(--color-total)" 
          strokeWidth={2}
          dot={{
            fill: "var(--color-total)",
            r: 4
          }}
          activeDot={{
            r: 6
          }}
        />
      </LineChart>
    </ChartContainer>
  )
}
