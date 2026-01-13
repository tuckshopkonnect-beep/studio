
"use client"

import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"

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
          tickFormatter={(value) => `₦${value/1000}k`}
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
          formatter={(value: number) => [`₦${value.toFixed(2)}`, 'Sales']}
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
