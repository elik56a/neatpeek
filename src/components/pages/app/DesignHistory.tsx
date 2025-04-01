
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileCheck, CheckCircle2, AlertCircle, ArrowUpRight, 
  Grid, List, Eye, Calendar, Filter, FileText
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DesignCheck {
  id: string;
  title: string;
  date: string;
  status: "passed" | "failed";
  issueCount: number;
  type: "figma" | "image";
  thumbnail?: string;
  figmaUrl?: string;
  lastModified: string;
  brandConsistencyScore: number;
}

// Mock data
const designCheckHistory: DesignCheck[] = [
  {
    id: "check-1",
    title: "Homepage Redesign",
    date: "2023-05-15",
    status: "passed",
    issueCount: 0,
    type: "figma",
    figmaUrl: "https://figma.com/file/...",
    lastModified: "2 hours ago",
    brandConsistencyScore: 95,
    thumbnail: "https://placehold.co/600x400/8344ff/ffffff?text=Homepage+Redesign"
  },
  {
    id: "check-2",
    title: "Mobile App UI",
    date: "2023-05-14",
    status: "failed",
    issueCount: 3,
    type: "image",
    lastModified: "5 hours ago",
    brandConsistencyScore: 65,
    thumbnail: "https://placehold.co/600x400/f97316/ffffff?text=Mobile+App+UI"
  },
  {
    id: "check-3",
    title: "About Page",
    date: "2023-05-10",
    status: "passed",
    issueCount: 0,
    type: "figma",
    figmaUrl: "https://figma.com/file/...",
    lastModified: "2 days ago",
    brandConsistencyScore: 90,
    thumbnail: "https://placehold.co/600x400/5112cc/ffffff?text=About+Page"
  },
  {
    id: "check-4",
    title: "Product Page",
    date: "2023-05-08",
    status: "failed",
    issueCount: 5,
    type: "image",
    lastModified: "4 days ago",
    brandConsistencyScore: 55,
    thumbnail: "https://placehold.co/600x400/e11d48/ffffff?text=Product+Page"
  },
  {
    id: "check-5",
    title: "Blog Layout",
    date: "2023-05-05",
    status: "passed",
    issueCount: 1,
    type: "figma",
    figmaUrl: "https://figma.com/file/...",
    lastModified: "1 week ago",
    brandConsistencyScore: 85,
    thumbnail: "https://placehold.co/600x400/8344ff/ffffff?text=Blog+Layout"
  },
  {
    id: "check-6",
    title: "Navigation Menu",
    date: "2023-05-03",
    status: "passed",
    issueCount: 0,
    type: "image",
    lastModified: "1 week ago",
    brandConsistencyScore: 100,
    thumbnail: "https://placehold.co/600x400/22c55e/ffffff?text=Navigation+Menu"
  },
];

const DesignHistory = () => {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState<"date" | "score">("date");

  const sortedDesignChecks = [...designCheckHistory].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      return b.brandConsistencyScore - a.brandConsistencyScore;
    }
  });

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "passed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800">
            Passed
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800">
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "figma":
        return <FileText className="h-4 w-4" />;
      case "image":
        return <FileCheck className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Design History</h1>
          <p className="text-muted-foreground">
            View and manage your past design checks
          </p>
        </div>
        <Button asChild className="hover-scale">
          <Link href="/design-checker">
            New Design Check
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === "list" ? "default" : "outline"} 
            size="icon"
            onClick={() => setViewMode("list")}
            className="w-10 h-10 hover-scale"
          >
            <List className="h-5 w-5" />
          </Button>
          <Button 
            variant={viewMode === "grid" ? "default" : "outline"} 
            size="icon"
            onClick={() => setViewMode("grid")}
            className="w-10 h-10 hover-scale"
          >
            <Grid className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSortBy("date")}
            className={cn(
              "hover-scale",
              sortBy === "date" && "bg-muted"
            )}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Date
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSortBy("score")}
            className={cn(
              "hover-scale",
              sortBy === "score" && "bg-muted"
            )}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Score
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "list" ? (
          <motion.div 
            key="list-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {sortedDesignChecks.map((check) => (
              <Card key={check.id} className="hover-scale">
                <div className="flex flex-col sm:flex-row">
                  <div className="p-4 flex-1">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full p-2 bg-muted">
                          {getTypeIcon(check.type)}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">{check.title}</h3>
                          <div className="flex items-center text-sm text-muted-foreground gap-2">
                            <span>{new Date(check.date).toLocaleDateString()}</span>
                            <span>·</span>
                            <span>{check.lastModified}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(check.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
                      <div>
                        <div className="text-sm text-muted-foreground">Design Type</div>
                        <div className="font-medium mt-1 capitalize">{check.type}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Consistency Score</div>
                        <div className="font-medium mt-1">{check.brandConsistencyScore}/100</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Issues</div>
                        <div className="font-medium mt-1">{check.issueCount}</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex justify-end items-center gap-2 border-t sm:border-t-0 sm:border-l">
                    <Button variant="outline" size="sm" className="hover-scale">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    {check.type === "figma" && check.figmaUrl && (
                      <Button variant="outline" size="sm" className="hover-scale">
                        <ArrowUpRight className="h-4 w-4 mr-2" />
                        Open in Figma
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="grid-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {sortedDesignChecks.map((check) => (
              <Card key={check.id} className="overflow-hidden hover-scale">
                <div 
                  className="h-48 bg-muted flex items-center justify-center relative"
                >
                  {check.thumbnail && (
                    <img 
                      src={check.thumbnail} 
                      alt={check.title} 
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-4 right-4">
                    {getStatusBadge(check.status)}
                  </div>
                </div>
                
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium">{check.title}</h3>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>{check.type}</span>
                        <span>·</span>
                        <span>{check.lastModified}</span>
                      </div>
                    </div>
                    <div className="rounded-full p-2 bg-muted">
                      {getTypeIcon(check.type)}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Consistency Score</span>
                      <span className="font-medium">{check.brandConsistencyScore}/100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Issues</span>
                      <span className="font-medium">{check.issueCount}</span>
                    </div>
                  </div>
                </CardContent>
                
                <div className="px-6 pb-6 flex gap-2">
                  <Button className="flex-1 hover-scale" variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-2" />
                    View
                  </Button>
                  {check.type === "figma" && check.figmaUrl && (
                    <Button className="flex-1 hover-scale" variant="outline" size="sm">
                      <ArrowUpRight className="h-3 w-3 mr-2" />
                      Figma
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DesignHistory;
