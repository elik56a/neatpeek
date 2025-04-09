"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AreaChart,
  BarChart,
  LineChart,
  PieChart,
} from '@/components/ui/chart';
import { format, subDays } from "date-fns";
import {
  ArrowRight,
  BarChart3,
  FileText,
  Layers,
  LineChart as LineChartIcon,
  LayoutDashboard,
  PieChart as PieChartIcon,
  Sliders,
  TrendingUp,
  Folder,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Type definitions for chart data
interface ChartData {
  name: string;
  value: number;
}

interface LineData {
  date: string;
  value: number;
}

interface AreaData {
  date: string;
  desktop: number;
  mobile: number;
  tablet: number;
}

interface BarData {
  name: string;
  value: number;
}

// Utility functions to generate dates
const generateDates = (days: number): string[] => {
  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - i - 1);
    return format(date, "MMM dd");
  });
};

// Mock dashboard data
const activityData: LineData[] = generateDates(30).map((date, i) => ({
  date,
  value: Math.floor(Math.random() * 20) + 10 + (i % 10),
}));

const deviceBreakdownData: ChartData[] = [
  { name: "Desktop", value: 65 },
  { name: "Mobile", value: 25 },
  { name: "Tablet", value: 10 },
];

const designTypeData: BarData[] = [
  { name: "Web", value: 45 },
  { name: "Mobile", value: 28 },
  { name: "Email", value: 15 },
  { name: "Social", value: 12 },
];

const historyData: AreaData[] = generateDates(30).map((date, i) => ({
  date,
  desktop: Math.floor(Math.random() * 50) + 20 + (i % 5),
  mobile: Math.floor(Math.random() * 30) + 10 + (i % 7),
  tablet: Math.floor(Math.random() * 20) + 5 + (i % 3),
}));

const Dashboard = () => {
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar' | 'pie'>('line');

  const recentActivity = [
    {
      id: "ACT-1234",
      type: "Design Check",
      name: "Homepage Redesign",
      date: new Date("2023-10-10"),
      status: "Passed",
    },
    {
      id: "ACT-1235",
      type: "Brand Update",
      name: "Logo Colors Updated",
      date: new Date("2023-10-09"),
      status: "Updated",
    },
    {
      id: "ACT-1236",
      type: "Design Check",
      name: "Mobile App Dashboard",
      date: new Date("2023-10-08"),
      status: "Failed",
    },
    {
      id: "ACT-1237",
      type: "Brand Setup",
      name: "Typography Guidelines",
      date: new Date("2023-10-05"),
      status: "Updated",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back to your brand consistency dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild className="hover-scale">
            <Link href="/design-checker">
              New Design Check <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Design Checks</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground">+14% from last month</p>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passing Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">86%</div>
            <p className="text-xs text-muted-foreground">+2.5% from last month</p>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brand Consistency</CardTitle>
            <Sliders className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">+5.2% from last month</p>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">+1 from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Design Checks Analytics</CardTitle>
            <CardDescription>Design checks performed over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Tabs
              value={chartType}
              onValueChange={(v) => setChartType(v as 'line' | 'area' | 'bar' | 'pie')}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 w-fit h-8 mb-4">
                <TabsTrigger value="line"><LineChartIcon className="h-4 w-4" /></TabsTrigger>
                <TabsTrigger value="area"><LayoutDashboard className="h-4 w-4" /></TabsTrigger>
                <TabsTrigger value="bar"><BarChart3 className="h-4 w-4" /></TabsTrigger>
                <TabsTrigger value="pie"><PieChartIcon className="h-4 w-4" /></TabsTrigger>
              </TabsList>

              <TabsContent value="line">
                <LineChart
                  data={activityData}
                  categories={['value']}
                  colors={['#8344FF']}
                  yAxisWidth={30}
                  showLegend={false}
                  showGridLines={false}
                  showAnimation={true}
                  className="aspect-[4/2]"
                />
              </TabsContent>
              <TabsContent value="area">
                <AreaChart
                  data={historyData}
                  categories={['desktop', 'mobile', 'tablet']}
                  colors={['#8344FF', '#4BCAFF', '#F97316']}
                  yAxisWidth={30}
                  showLegend={true}
                  showGridLines={false}
                  showAnimation={true}
                  className="aspect-[4/2]"
                />
              </TabsContent>
              <TabsContent value="bar">
                <BarChart
                  data={designTypeData}
                  categories={['value']}
                  colors={['#8344FF']}
                  yAxisWidth={30}
                  showLegend={false}
                  showGridLines={false}
                  showAnimation={true}
                  className="aspect-[4/2]"
                />
              </TabsContent>
              <TabsContent value="pie">
                <PieChart
                  data={deviceBreakdownData}
                  category="value"
                  index="name"
                  colors={['#8344FF', '#4BCAFF', '#F97316']}
                  showAnimation={true}
                  className="aspect-[4/2]"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest design checks and brand updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 hover-scale">
                  <div className="rounded-full p-1.5 mt-0.5">
                    {activity.type === "Design Check" ? (
                      activity.status === "Passed" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )
                    ) : (
                      <Layers className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{activity.name}</div>
                      <div className="text-sm text-muted-foreground">{format(activity.date, "MMM d")}</div>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="text-muted-foreground">{activity.type}</div>
                      <div className="ml-auto">
                        <Badge
                          variant={
                            activity.status === "Passed"
                              ? "default"
                              : activity.status === "Failed"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full hover-scale">
              View All Activity
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-6">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Design Checks by Type</CardTitle>
            <CardDescription>
              Distribution of design checks by type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={designTypeData}
              index="name"
              categories={['value']}
              colors={['#8344FF']}
              layout="vertical"
              showLegend={false}
              showGridLines={false}
              showAnimation={true}
              className="aspect-[4/3]"
            />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>
              Designs checked by device type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PieChart 
              data={deviceBreakdownData}
              category="value"
              index="name"
              colors={['#8344FF', '#4BCAFF', '#F97316']}
              valueFormatter={(number) => `${number}%`}
              showAnimation={true}
              className="aspect-[4/3]"
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="md:w-2/3">
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
            <CardDescription>Latest updates on your active projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Website Redesign", progress: 75, status: "In Progress" },
                { name: "Mobile App", progress: 90, status: "Finalizing" },
                { name: "Brand Guidelines Update", progress: 30, status: "Just Started" },
                { name: "Email Campaign", progress: 100, status: "Completed" },
              ].map((project, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{project.name}</div>
                    <Badge variant={
                      project.progress === 100 
                        ? "default" 
                        : project.progress > 70 
                        ? "outline" 
                        : "secondary"
                    }>
                      {project.status}
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        project.progress === 100 
                          ? "bg-green-500" 
                          : project.progress > 70 
                          ? "bg-blue-500" 
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:w-1/3">
          <CardHeader>
            <CardTitle>Top Issues</CardTitle>
            <CardDescription>Most common brand inconsistencies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { issue: "Color Consistency", count: 32 },
                { issue: "Typography", count: 28 },
                { issue: "Logo Placement", count: 17 },
                { issue: "Spacing", count: 12 },
                { issue: "Element Alignment", count: 8 },
              ].map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between hover-scale py-1"
                >
                  <div className="flex items-center">
                    <span className="w-5 text-muted-foreground">{index + 1}.</span>
                    <span>{item.issue}</span>
                  </div>
                  <Badge variant="outline">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
