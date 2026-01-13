
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar as CalendarIcon,
  Download,
  FileDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Line, LineChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  addDays,
  format,
  isAfter,
  isBefore,
  startOfDay,
  subDays,
} from "date-fns";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { initialOrders, initialUsers, menuItems, initialInventory } from "@/lib/data";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  snacks: {
    label: "Snacks",
    color: "hsl(var(--chart-1))",
  },
  drinks: {
    label: "Drinks",
    color: "hsl(var(--chart-2))",
  },
  meals: {
    label: "Meals",
    color: "hsl(var(--chart-3))",
  },
  fruit: {
    label: "Fruit",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

// Helper to categorize items
const getCategory = (itemName: string): keyof typeof chartConfig => {
    const lowerCaseName = itemName.toLowerCase();
    if (lowerCaseName.includes('juice') || lowerCaseName.includes('water') || lowerCaseName.includes('soda')) return 'drinks';
    if (lowerCaseName.includes('sandwich') || lowerCaseName.includes('pie') || lowerCaseName.includes('roll')) return 'meals';
    if (lowerCaseName.includes('apple')) return 'fruit';
    return 'snacks';
};

export default function ReportsPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  // Filter data based on date range
  const filteredOrders = initialOrders.filter(order => {
    const orderDate = new Date(order.orderDate);
    const from = date?.from ? startOfDay(date.from) : null;
    const to = date?.to ? startOfDay(addDays(date.to, 1)) : null; // include the whole 'to' day

    if (from && isBefore(orderDate, from)) return false;
    if (to && isAfter(orderDate, to)) return false;

    return true;
  });

  // --- Process Data for Reports ---

  // Activity Log
  const activityLog = filteredOrders.map(order => ({
      type: 'Purchase',
      description: `${order.customerName} purchased items.`,
      amount: -order.total,
      date: new Date(order.orderDate)
  })).sort((a,b) => b.date.getTime() - a.date.getTime());


  // Sales Report (Line Chart)
  const salesByDay = filteredOrders.reduce((acc, order) => {
      const day = format(new Date(order.orderDate), 'MMM d');
      acc[day] = (acc[day] || 0) + order.total;
      return acc;
  }, {} as Record<string, number>);

  const salesChartData = Object.entries(salesByDay).map(([date, revenue]) => ({
      date,
      revenue: Number(revenue.toFixed(2))
  })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Sales by Category (Pie Chart)
  const salesByCategory = filteredOrders
    .flatMap(order => order.items.map(item => ({...item, total: initialOrders.find(o => o.id === order.id)?.total || 0 })))
    .reduce((acc, item) => {
        const menuItem = menuItems.find(mi => mi.name === item.name);
        if(!menuItem) return acc;
        const category = getCategory(menuItem.name);
        const itemRevenue = menuItem.price * item.quantity;
        acc[category] = (acc[category] || 0) + itemRevenue;
        return acc;
    }, {} as Record<string, number>);

  const pieChartData = Object.entries(salesByCategory).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2)),
      fill: chartConfig[name as keyof typeof chartConfig]?.color || 'hsl(var(--muted))'
  }));

  // Student Spending Report
  const studentSpending = filteredOrders.reduce((acc, order) => {
      acc[order.customerName] = (acc[order.customerName] || 0) + order.total;
      return acc;
  }, {} as Record<string, number>);

  const topStudents = Object.entries(studentSpending)
      .map(([name, total]) => ({ name, total }))
      .sort((a,b) => b.total - a.total);

  // Product Performance Report
  const productPerformance = filteredOrders
    .flatMap(order => order.items)
    .reduce((acc, item) => {
        const menuItem = menuItems.find(mi => mi.name === item.name);
        if(!menuItem) return acc;

        if(!acc[item.name]) {
            acc[item.name] = { unitsSold: 0, revenue: 0 };
        }
        acc[item.name].unitsSold += item.quantity;
        acc[item.name].revenue += item.quantity * menuItem.price;
        return acc;
    }, {} as Record<string, {unitsSold: number, revenue: number}>);
  
  const topProducts = Object.entries(productPerformance)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a,b) => b.revenue - a.revenue);

  // --- PDF Export Logic ---
  const handleExportSection = async (sectionTitle: string) => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    doc.text(sectionTitle, 14, 16);
    
    let body: (string|number)[][] = [];
    let head: string[][] = [];

    switch (sectionTitle) {
      case 'Activity Log':
        head = [['Date', 'Type', 'Description', 'Amount']];
        body = activityLog.map(a => [format(a.date, 'Pp'), a.type, a.description, `₦${a.amount.toFixed(2)}`]);
        break;
      case 'Sales Report':
        head = [['Date', 'Revenue']];
        body = salesChartData.map(s => [s.date, `₦${s.revenue.toFixed(2)}`]);
        break;
      case 'Sales by Category':
        head = [['Category', 'Revenue']];
        body = pieChartData.map(p => [p.name, `₦${p.value.toFixed(2)}`]);
        break;
      case 'Business Intelligence':
        autoTable(doc, {
            head: [['Student', 'Total Spent']],
            body: topStudents.map(s => [s.name, `₦${s.total.toFixed(2)}`]),
            startY: 20,
            didDrawPage: (data) => { data.doc.text('Student Spending', 14, 15); }
        });
        autoTable(doc, {
            head: [['Product', 'Units Sold', 'Revenue']],
            body: topProducts.map(p => [p.name, p.unitsSold, `₦${p.revenue.toFixed(2)}`]),
            didDrawPage: (data) => { data.doc.text('Product Performance', 14, data.cursor?.y ? data.cursor.y - 10 : 15); }
        });
        doc.save('business-intelligence.pdf');
        return; // Early return for this special case
      case 'Inventory Report':
        head = [['Product', 'Current Stock']];
        body = initialInventory.map(i => [i.name, i.stock]);
        break;
    }

    autoTable(doc, { head, body, startY: 20 });
    doc.save(`${sectionTitle.toLowerCase().replace(/ /g, '-')}-report.pdf`);
  };

  const handleGenerateReport = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    
    const doc = new jsPDF();
    const finalY = (doc.internal.pageSize.height - 10);
    const pageMargin = 14;

    doc.setFontSize(20);
    doc.text("Tuckshop Full Report", pageMargin, 22);
    doc.setFontSize(12);
    const fromDate = date?.from ? format(date.from, "LLL dd, y") : 'N/A';
    const toDate = date?.to ? format(date.to, "LLL dd, y") : 'N/A';
    doc.text(`Date Range: ${fromDate} - ${toDate}`, pageMargin, 30);
    let startY = 40;

    // Helper to add a new page if content overflows
    const checkPageBreak = (currentY: number) => {
        if (currentY > finalY - 30) { // 30 is a buffer
            doc.addPage();
            return 20;
        }
        return currentY;
    }

    // Activity Log
    startY = checkPageBreak(startY);
    doc.setFontSize(16);
    doc.text("Activity Log", pageMargin, startY);
    autoTable(doc, {
        head: [['Date', 'Type', 'Description', 'Amount']],
        body: activityLog.map(a => [format(a.date, 'Pp'), a.type, a.description, `₦${a.amount.toFixed(2)}`]),
        startY: startY + 5,
    });
    startY = (doc as any).lastAutoTable.finalY + 15;

    // Sales Report
    startY = checkPageBreak(startY);
    doc.setFontSize(16);
    doc.text("Sales Report", pageMargin, startY);
    autoTable(doc, {
        head: [['Date', 'Revenue']],
        body: salesChartData.map(s => [s.date, `₦${s.revenue.toFixed(2)}`]),
        startY: startY + 5,
    });
    startY = (doc as any).lastAutoTable.finalY + 15;

    // Sales by Category
    startY = checkPageBreak(startY);
    doc.setFontSize(16);
    doc.text("Sales by Category", pageMargin, startY);
    autoTable(doc, {
        head: [['Category', 'Revenue']],
        body: pieChartData.map(p => [p.name, `₦${p.value.toFixed(2)}`]),
        startY: startY + 5,
    });
    startY = (doc as any).lastAutoTable.finalY + 15;

    // Student Spending
    startY = checkPageBreak(startY);
    doc.setFontSize(16);
    doc.text("Student Spending", pageMargin, startY);
    autoTable(doc, {
        head: [['Student', 'Total Spent']],
        body: topStudents.map(s => [s.name, `₦${s.total.toFixed(2)}`]),
        startY: startY + 5,
    });
    startY = (doc as any).lastAutoTable.finalY + 15;
    
    // Product Performance
    startY = checkPageBreak(startY);
    doc.setFontSize(16);
    doc.text("Product Performance", pageMargin, startY);
    autoTable(doc, {
        head: [['Product', 'Units Sold', 'Revenue']],
        body: topProducts.map(p => [p.name, p.unitsSold, `₦${p.revenue.toFixed(2)}`]),
        startY: startY + 5,
    });
    startY = (doc as any).lastAutoTable.finalY + 15;

    // Inventory Report
    startY = checkPageBreak(startY);
    doc.setFontSize(16);
    doc.text("Inventory Report (Current State)", pageMargin, startY);
    autoTable(doc, {
        head: [['Product', 'Current Stock']],
        body: initialInventory.map(i => [i.name, i.stock]),
        startY: startY + 5,
    });
    
    doc.save(`full-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8">
      <div className="flex flex-wrap items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        <Button onClick={handleGenerateReport}>
          <FileDown className="mr-2 h-4 w-4" />
          Generate Full Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center">
             <div className="grid gap-2">
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>A log of all system events in the selected period.</CardDescription>
            </div>
            <Button size="sm" variant="outline" className="ml-auto gap-1" onClick={() => handleExportSection('Activity Log')}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent className="h-[350px] overflow-y-auto">
            <Table>
                <TableBody>
                    {activityLog.length > 0 ? activityLog.map((activity, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <div className="font-medium">{activity.type}</div>
                                <div className="text-sm text-muted-foreground">{activity.description}</div>
                            </TableCell>
                            <TableCell className="text-right">
                               <div className={cn("font-medium flex items-center justify-end", activity.amount > 0 ? 'text-green-600' : 'text-destructive')}>
                                   {activity.amount > 0 ? <ArrowUp className="mr-1 h-4 w-4" /> : <ArrowDown className="mr-1 h-4 w-4" />}
                                   ₦{Math.abs(activity.amount).toFixed(2)}
                                </div>
                                <div className="text-xs text-muted-foreground text-right">{format(activity.date, 'Pp')}</div>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No activity in this period.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
                <CardTitle>Sales Report</CardTitle>
                <CardDescription>Daily revenue for the selected period.</CardDescription>
            </div>
             <Button size="sm" variant="outline" className="ml-auto gap-1" onClick={() => handleExportSection('Sales Report')}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart accessibilityLayer data={salesChartData}>
                 <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 6)}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `₦${value/1000}k`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Line dataKey="revenue" type="monotone" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Revenue distribution across categories.</CardDescription>
            </div>
             <Button size="sm" variant="outline" className="ml-auto gap-1" onClick={() => handleExportSection('Sales by Category')}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
             <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square h-[300px]"
            >
              <PieChart>
                 <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie data={pieChartData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5} />
                 <ChartLegend
                  content={<ChartLegendContent nameKey="name" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-4">
           <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
                <CardTitle>Business Intelligence</CardTitle>
                <CardDescription>Key performance indicators.</CardDescription>
            </div>
             <Button size="sm" variant="outline" className="ml-auto gap-1" onClick={() => handleExportSection('Business Intelligence')}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2 h-[350px] overflow-y-auto">
            <div>
              <h3 className="font-semibold mb-2">Student Spending</h3>
               <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                  {topStudents.length > 0 ? topStudents.map(s => (
                    <TableRow key={s.name}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-right">₦{s.total.toFixed(2)}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={2} className="text-center">No student data.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
             <div>
              <h3 className="font-semibold mb-2">Product Performance</h3>
              <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-center">Units</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.length > 0 ? topProducts.map(p => (
                     <TableRow key={p.name}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-center">{p.unitsSold}</TableCell>
                      <TableCell className="text-right">₦{p.revenue.toFixed(2)}</TableCell>
                    </TableRow>
                  )) : (
                     <TableRow><TableCell colSpan={3} className="text-center">No product data.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
                <CardTitle>Inventory Report</CardTitle>
                <CardDescription>Current stock levels for all products (not date-dependent).</CardDescription>
            </div>
             <Button size="sm" variant="outline" className="ml-auto gap-1" onClick={() => handleExportSection('Inventory Report')}>
              <Download className="h-4 w-4" />
              Export
            </Button>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Current Stock</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {initialInventory.map(item => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className={cn(
                                "text-right font-semibold",
                                item.stock < item.lowStockThreshold ? 'text-destructive' : 'text-green-600'
                            )}>{item.stock}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
