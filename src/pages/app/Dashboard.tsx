
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { BarChart3, FileCheck, CheckCircle2, AlertCircle, ArrowUpRight, Plus, Bell, Palette, Clock } from "lucide-react";
import { useAuth } from "@/context/auth-context";

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

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    designsChecked: 0,
    passRate: 0,
    issuesFixed: 0,
    avgIssuesPerDesign: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
        <Button asChild>
          <Link to="/design-checker">
            <Plus className="mr-2 h-4 w-4" />
            New Design Check
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Designs Checked</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.designsChecked}</div>
            <p className="text-xs text-muted-foreground">
              +7 from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.passRate}%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues Fixed</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.issuesFixed}</div>
            <p className="text-xs text-muted-foreground">
              100% resolution rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Issues per Design</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgIssuesPerDesign}</div>
            <p className="text-xs text-muted-foreground">
              -0.5 from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="brand">Brand Insights</TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-7">
            <Card className="col-span-1 md:col-span-4">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your recent design checks and brand updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center">
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
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/design-history">
                      View All Activity
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-1 md:col-span-3">
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Stay updated on your brand checks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Bell className="h-5 w-5 text-brand-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Mobile App UI check completed</p>
                      <p className="text-xs text-muted-foreground">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Brand guideline update reminder</p>
                      <p className="text-xs text-muted-foreground">It's been 30 days since your last update</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
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
                    <Button variant="outline" asChild size="sm">
                      <Link to="/design-checker">
                        New Check
                      </Link>
                    </Button>
                    <Button variant="outline" asChild size="sm">
                      <Link to="/brand-setup">
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
          <Card>
            <CardHeader>
              <CardTitle>Brand Insights</CardTitle>
              <CardDescription>
                Analytics and insights about your brand consistency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center border rounded-md bg-muted/50">
                <p className="text-muted-foreground">Brand analytics chart coming soon</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium">Most Common Issue</div>
                  <div className="mt-1 text-2xl font-bold">Color Mismatch</div>
                  <div className="text-xs text-muted-foreground">Found in 42% of designs</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium">Most Consistent Element</div>
                  <div className="mt-1 text-2xl font-bold">Typography</div>
                  <div className="text-xs text-muted-foreground">98% compliance rate</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium">Brand Health Score</div>
                  <div className="mt-1 text-2xl font-bold">87/100</div>
                  <div className="text-xs text-muted-foreground">+5 from last month</div>
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
