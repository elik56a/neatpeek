
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "next/link";
import { 
  BarChart3, FileCheck, CheckCircle2, AlertCircle, ArrowUpRight, Plus, 
  Bell, Palette, Clock, LineSegment, TrendingUp
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import { motion } from "framer-motion";

// Mock data
const getRecentActivity = () => [
  { 
    id: 1, 
    type: "design_check", 
    title: "Homepage Redesign", 
    status: "passed",
    issues: 0,
    time: "2 hours ago" 
  },
  { 
    id: 2, 
    type: "design_check", 
    title: "Mobile App UI", 
    status: "failed",
    issues: 3,
    time: "5 hours ago" 
  },
  { 
    id: 3, 
    type: "brand_update", 
    title: "Updated Color Palette", 
    time: "yesterday" 
  },
  { 
    id: 4, 
    type: "design_check", 
    title: "Landing Page", 
    status: "passed",
    issues: 0,
    time: "2 days ago" 
  },
];

// Chart data
const weeklyChecksData = [
  { name: 'Mon', checks: 4 },
  { name: 'Tue', checks: 6 },
  { name: 'Wed', checks: 8 },
  { name: 'Thu', checks: 5 },
  { name: 'Fri', checks: 9 },
  { name: 'Sat', checks: 3 },
  { name: 'Sun', checks: 2 },
];

const consistencyScoreData = [
  { name: 'Week 1', score: 68 },
  { name: 'Week 2', score: 72 },
  { name: 'Week 3', score: 75 },
  { name: 'Week 4', score: 82 },
  { name: 'Week 5', score: 87 },
  { name: 'Week 6', score: 85 },
  { name: 'Week 7', score: 90 },
];

const issueBreakdownData = [
  { name: 'Colors', value: 42 },
  { name: 'Typography', value: 28 },
  { name: 'Spacing', value: 15 },
  { name: 'Logo', value: 10 },
  { name: 'Other', value: 5 },
];

const COLORS = ['#8344FF', '#5112CC', '#F97316', '#A573FF', '#C8B9E8'];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "passed":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "failed":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
};

interface DashboardStats {
  designsChecked: number;
  passRate: number;
  issuesFixed: number;
  avgIssuesPerDesign: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    designsChecked: 0,
    passRate: 0,
    issuesFixed: 0,
    avgIssuesPerDesign: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartActive, setChartActive] = useState(false);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setStats({
        designsChecked: 24,
        passRate: 75,
        issuesFixed: 18,
        avgIssuesPerDesign: 2.5,
      });
      setRecentActivity(getRecentActivity());
      setIsLoading(false);
      
      // Activate charts with slight delay for animation
      setTimeout(() => setChartActive(true), 300);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const CountUpAnimation = ({ value, label, increase }: { value: number, label?: string, increase?: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="text-2xl font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {value}
          {label && label}
        </motion.span>
      </motion.div>
      {increase && (
        <p className="text-xs text-muted-foreground">{increase}</p>
      )}
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}!
          </p>
        </div>
        <Button asChild className="hover-scale">
          <Link href="/design-checker">
            <Plus className="mr-2 h-4 w-4" />
            New Design Check
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Designs Checked</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CountUpAnimation value={stats.designsChecked} increase="+7 from last week" />
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CountUpAnimation value={stats.passRate} label="%" increase="+5% from last month" />
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues Fixed</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CountUpAnimation value={stats.issuesFixed} increase="100% resolution rate" />
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Issues per Design</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CountUpAnimation value={stats.avgIssuesPerDesign} increase="-0.5 from last month" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList className="relative">
          <TabsTrigger value="activity" className="relative z-10">Recent Activity</TabsTrigger>
          <TabsTrigger value="brand" className="relative z-10">Brand Insights</TabsTrigger>
          <div 
            className="absolute h-full bottom-0 bg-primary/10 transition-all duration-300 ease-out rounded"
            style={{ 
              left: "0%", 
              width: "50%",
              transform: `translateX(${document.querySelector('[data-state="active"]')?.id === "brand" ? "100%" : "0%"})`
            }}
          />
        </TabsList>
        <TabsContent value="activity" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-7">
            <Card className="col-span-1 md:col-span-4 hover-scale">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your recent design checks and brand updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center p-2 rounded-lg border hover:bg-muted/20 transition-colors duration-200">
                      <div className="mr-4 rounded-full p-2 bg-muted">
                        {activity.type === 'design_check' && (
                          <FileCheck className="h-4 w-4" />
                        )}
                        {activity.type === 'brand_update' && (
                          <Palette className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center">
                          <p className="text-sm font-medium leading-none mr-2">
                            {activity.title}
                          </p>
                          {activity.status && getStatusIcon(activity.status)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {activity.type === 'design_check' 
                            ? `Design check ${activity.status} with ${activity.issues} issues`
                            : 'Brand guidelines updated'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {activity.time}
                        </span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/50 transition-colors duration-200">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Button variant="outline" asChild className="w-full hover-scale">
                    <Link href="/design-history">
                      View All Activity
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-1 md:col-span-3 hover-scale">
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Stay updated on your brand checks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-2 rounded-lg border hover:bg-muted/20 transition-colors duration-200">
                    <Bell className="h-5 w-5 text-brand-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Mobile App UI check completed</p>
                      <p className="text-xs text-muted-foreground">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-2 rounded-lg border hover:bg-muted/20 transition-colors duration-200">
                    <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Brand guideline update reminder</p>
                      <p className="text-xs text-muted-foreground">It's been 30 days since your last update</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-2 rounded-lg border hover:bg-muted/20 transition-colors duration-200">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">All issues resolved in "Homepage Redesign"</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                </div>
                <div className="border-t mt-6 pt-6">
                  <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" asChild size="sm" className="hover-scale">
                      <Link href="/design-checker">
                        New Check
                      </Link>
                    </Button>
                    <Button variant="outline" asChild size="sm" className="hover-scale">
                      <Link href="/brand-setup">
                        Update Brand
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="brand" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Weekly Design Checks
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {chartActive && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyChecksData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))' 
                          }} 
                        />
                        <Bar dataKey="checks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <LineSegment className="mr-2 h-5 w-5" />
                    Consistency Score Trend
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {chartActive && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={consistencyScoreData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))' 
                          }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2} 
                          dot={{ r: 4 }} 
                          activeDot={{ r: 6 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Brand Issues Breakdown</CardTitle>
              <CardDescription>
                The most common issues found in your designs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="col-span-2 h-[250px] flex items-center justify-center">
                  {chartActive && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={issueBreakdownData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={(entry) => entry.name}
                        >
                          {issueBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            background: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))' 
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 md:mt-0">
                  <div className="rounded-lg border p-3 hover-scale">
                    <div className="text-sm font-medium">Most Common Issue</div>
                    <div className="mt-1 text-2xl font-bold">Color Mismatch</div>
                    <div className="text-xs text-muted-foreground">Found in 42% of designs</div>
                  </div>
                  <div className="rounded-lg border p-3 hover-scale">
                    <div className="text-sm font-medium">Most Consistent Element</div>
                    <div className="mt-1 text-2xl font-bold">Typography</div>
                    <div className="text-xs text-muted-foreground">98% compliance rate</div>
                  </div>
                  <div className="rounded-lg border p-3 hover-scale">
                    <div className="text-sm font-medium">Brand Health Score</div>
                    <div className="mt-1 text-2xl font-bold">87/100</div>
                    <div className="text-xs text-muted-foreground">+5 from last month</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
