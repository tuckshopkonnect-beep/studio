
"use client"

import { useMemo } from "react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import {
  ChartContainer,
  ChartTooltip as ChartTooltipPrimitive,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { Order } from "@/lib/data";
import { format, subDays } from 'date-fns';

interface WeeklySalesChartProps {
  orders: Order[];
}

export default function WeeklySalesChart({ orders }: WeeklySalesChartProps) {
  const data = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
    
    const salesData = last7Days.map(day => {
        const dayString = format(day, 'E'); // Mon, Tue, etc.
        const total = orders
            .filter(order => format(new Date(order.orderDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
            .reduce((sum, order) => sum + order.total, 0);
        return { name: dayString, total };
    });

    return salesData;
  }, [orders]);


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
              formatter={(value: number) => `₦${value.toLocaleString()}`}
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
