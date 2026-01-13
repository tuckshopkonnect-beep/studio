
"use client"

import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"

const data = [
  { name: "Mon", total: Math.floor(Math.random() * 300) + 50 },
  { name: "Tue", total: Math.floor(Math.random() * 300) + 100 },
  { name: "Wed", total: Math.floor(Math.random() * 300) + 150 },
  { name: "Thu", total: Math.floor(Math.random() * 300) + 200 },
  { name: "Fri", total: Math.floor(Math.random() * 300) + 250 },
  { name: "Sat", total: Math.floor(Math.random() * 100) + 50 },
  { name: "Sun", total: Math.floor(Math.random() * 100) + 20 },
]

export default function WeeklySalesChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart 
        data={data}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '3 3' }}
          contentStyle={{ 
            background: 'hsl(var(--background))', 
            border: '1px solid hsl(var(--border))', 
            borderRadius: 'var(--radius)',
            color: 'hsl(var(--foreground))'
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="total" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          activeDot={{ r: 8 }}
          dot={{ r: 4, fill: 'hsl(var(--primary))' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
