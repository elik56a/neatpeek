
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LineChart, BarChart, PieChart, Area, Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { ArrowRight, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, PlusCircle, Users, CheckCircle2, Clock, Image as ImageIcon, FilePieChart, ImageIcon as ImageBoxIcon } from "lucide-react";

// Mock data for charts
const monthlyData = [
  { name: "Jan", designs: 65, errors: 12, score: 76 },
  { name: "Feb", designs: 59, errors: 15, score: 71 },
  { name: "Mar", designs: 80, errors: 8, score: 88 },
  { name: "Apr", designs: 81, errors: 10, score: 82 },
  { name: "May", designs: 56, errors: 20, score: 65 },
  { name: "Jun", designs: 55, errors: 22, score: 62 },
  { name: "Jul", designs: 40, errors: 15, score: 70 },
  { name: "Aug", designs: 72, errors: 5, score: 92 },
  { name: "Sep", designs: 90, errors: 10, score: 85 },
  { name: "Oct", designs: 95, errors: 8, score: 90 },
  { name: "Nov", designs: 110, errors: 12, score: 85 },
  { name: "Dec", designs: 120, errors: 14, score: 82 },
];

const issueTypeData = [
  { name: "Color Mismatch", value: 35 },
  { name: "Typography", value: 25 },
  { name: "Spacing", value: 15 },
  { name: "Logo Usage", value: 10 },
  { name: "Imagery", value: 15 },
];

const COLORS = ["#8344FF", "#FF6B6B", "#FFD166", "#06D6A0", "#118AB2"];

const designTypeData = [
  { name: "Web", value: 40 },
  { name: "Mobile", value: 30 },
  { name: "Email", value: 15 },
  { name: "Social", value: 10 },
  { name: "Print", value: 5 },
];

const recentDesigns = [
  {
    id: 1,
    name: "Homepage Redesign",
    type: "Web",
    date: "Today, 2:30 PM",
    score: 92,
    status: "Passed",
    issues: 2,
  },
  {
    id: 2,
    name: "Mobile App Checkout",
    type: "Mobile",
    date: "Yesterday, 11:20 AM",
    score: 76,
    status: "Passed",
    issues: 5,
  },
  {
    id: 3,
    name: "Email Newsletter",
    type: "Email",
    date: "Oct 21, 4:15 PM",
    score: 65,
    status: "Failed",
    issues: 8,
  },
  {
    id: 4,
    name: "Instagram Post",
    type: "Social",
    date: "Oct 20, 10:30 AM",
    score: 88,
    status: "Passed",
    issues: 3,
  },
  {
    id: 5,
    name: "Product Brochure",
    type: "Print",
    date: "Oct 18, 2:45 PM",
    score: 90,
    status: "Passed",
    issues: 2,
  },
];

const Dashboard = () => {
  const [chartView, setChartView] = useState<"line" | "bar" | "pie">("line");

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your brand consistency performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/design-checker">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Design Check
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Designs Checked</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">856</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <FilePieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Common Issue</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Color Match</div>
            <p className="text-xs text-muted-foreground">
              35% of all issues
            </p>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Check</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h ago</div>
            <p className="text-xs text-muted-foreground">
              Homepage redesign
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Design Checks Over Time</CardTitle>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setChartView("line")}
                  className={chartView === "line" ? "bg-primary/10" : ""}
                >
                  <LineChartIcon className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setChartView("bar")}
                  className={chartView === "bar" ? "bg-primary/10" : ""}
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setChartView("pie")}
                  className={chartView === "pie" ? "bg-primary/10" : ""}
                >
                  <PieChartIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              Track how your brand consistency has improved over time
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {chartView === "line" && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    name="Brand Score" 
                    stroke="#8344FF" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="designs" 
                    name="Designs Checked" 
                    stroke="#FF6B6B" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
            {chartView === "bar" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="designs" name="Designs Checked" fill="#8344FF" />
                  <Bar dataKey="errors" name="Issues Found" fill="#FF6B6B" />
                </BarChart>
              </ResponsiveContainer>
            )}
            {chartView === "pie" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                <div>
                  <h3 className="text-sm font-medium mb-2 text-center">Issue Types</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={issueTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {issueTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2 text-center">Design Types</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={designTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {designTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Design Checks</CardTitle>
            <CardDescription>
              Your latest designs analyzed for brand consistency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px]">
              <div className="space-y-4">
                {recentDesigns.map((design) => (
                  <div
                    key={design.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0 hover-scale"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`rounded-full p-2 ${design.type === 'Web' ? 'bg-blue-100' 
                        : design.type === 'Mobile' ? 'bg-purple-100' 
                        : design.type === 'Email' ? 'bg-green-100' 
                        : design.type === 'Social' ? 'bg-yellow-100' 
                        : 'bg-red-100'} `}>
                        {design.type === 'Web' ? <LineChartIcon className="h-4 w-4 text-blue-600" /> 
                        : design.type === 'Mobile' ? <ImageBoxIcon className="h-4 w-4 text-purple-600" /> 
                        : design.type === 'Email' ? <ImageIcon className="h-4 w-4 text-green-600" /> 
                        : design.type === 'Social' ? <Users className="h-4 w-4 text-yellow-600" /> 
                        : <FilePieChart className="h-4 w-4 text-red-600" />}
                      </div>
                      <div>
                        <p className="font-medium">{design.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {design.type} • {design.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center">
                        <span className={`h-2 w-2 rounded-full mr-1 ${
                          design.status === 'Passed' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <span className="text-xs font-medium">
                          {design.score}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {design.issues} issues
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle>Brand Guidelines</CardTitle>
            <CardDescription>
              Edit your brand guidelines to improve consistency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Current settings</p>
                <p className="text-xs text-muted-foreground">
                  Last updated 3 days ago
                </p>
              </div>
              <Button asChild variant="outline" className="hover-scale">
                <Link href="/brand-setup">
                  Edit Guidelines
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle>Design History</CardTitle>
            <CardDescription>
              View all your previous design checks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">856 designs analyzed</p>
                <p className="text-xs text-muted-foreground">
                  View their consistency scores and issues
                </p>
              </div>
              <Button asChild variant="outline" className="hover-scale">
                <Link href="/design-history">
                  View History
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
