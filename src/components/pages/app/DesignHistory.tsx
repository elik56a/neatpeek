
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, ChevronDown, Eye, Filter, Grid, List, MoreHorizontal, Search } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

// Mock data
const designChecks = [
  {
    id: "DESIGN-1234",
    name: "Homepage Redesign",
    date: new Date("2023-10-10"),
    type: "Web Design",
    score: 92,
    status: "Passed",
    issues: 2,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
  },
  {
    id: "DESIGN-1235",
    name: "Mobile App Dashboard",
    date: new Date("2023-10-08"),
    type: "Mobile Design",
    score: 88,
    status: "Passed",
    issues: 3,
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
  },
  {
    id: "DESIGN-1236",
    name: "Email Newsletter",
    date: new Date("2023-10-05"),
    type: "Email Design",
    score: 65,
    status: "Failed",
    issues: 8,
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
  },
  {
    id: "DESIGN-1237",
    name: "Product Landing Page",
    date: new Date("2023-10-01"),
    type: "Web Design",
    score: 78,
    status: "Passed",
    issues: 5,
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
  },
  {
    id: "DESIGN-1238",
    name: "Instagram Campaign",
    date: new Date("2023-09-28"),
    type: "Social Media",
    score: 95,
    status: "Passed",
    issues: 1,
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
  },
  {
    id: "DESIGN-1239",
    name: "Blog Layout",
    date: new Date("2023-09-25"),
    type: "Web Design",
    score: 72,
    status: "Passed",
    issues: 4,
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
  },
  {
    id: "DESIGN-1240",
    name: "App Onboarding Flow",
    date: new Date("2023-09-20"),
    type: "Mobile Design",
    score: 58,
    status: "Failed",
    issues: 10,
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
  },
  {
    id: "DESIGN-1241",
    name: "Logo Redesign",
    date: new Date("2023-09-18"),
    type: "Brand Design",
    score: 90,
    status: "Passed",
    issues: 2,
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
  },
];

const DesignHistory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [sortColumn, setSortColumn] = useState<"date" | "score">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);

  // Filter and sort designs
  const filteredDesigns = designChecks
    .filter(
      (design) =>
        design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        design.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        design.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortColumn === "date") {
        return sortDirection === "asc"
          ? a.date.getTime() - b.date.getTime()
          : b.date.getTime() - a.date.getTime();
      } else {
        return sortDirection === "asc"
          ? a.score - b.score
          : b.score - a.score;
      }
    });

  const toggleSort = (column: "date" | "score") => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  // Function to handle design item click for details
  const handleDesignClick = (designId: string) => {
    setSelectedDesign(designId === selectedDesign ? null : designId);
  };

  // Get the selected design details
  const selectedDesignDetails = selectedDesign 
    ? designChecks.find(design => design.id === selectedDesign) 
    : null;

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Design History</h1>
          <p className="text-muted-foreground">
            View and analyze your past design checks
          </p>
        </div>
        <div className="flex w-full md:w-auto flex-col sm:flex-row gap-2">
          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search designs..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto sm:ml-0">
                <Filter className="mr-2 h-4 w-4" />
                Filter
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSearchQuery("Web")}>
                Web Design
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchQuery("Mobile")}>
                Mobile Design
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchQuery("Email")}>
                Email Design
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchQuery("Social")}>
                Social Media
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchQuery("Brand")}>
                Brand Design
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchQuery("")}>
                Clear Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center border rounded-md overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("table")}
              className={viewMode === "table" ? "bg-muted" : ""}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">Table view</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-muted" : ""}
            >
              <Grid className="h-4 w-4" />
              <span className="sr-only">Grid view</span>
            </Button>
          </div>
        </div>
      </div>

      {viewMode === "table" ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Design ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => toggleSort("date")}
                    >
                      Date
                      {sortColumn === "date" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => toggleSort("score")}
                    >
                      Score
                      {sortColumn === "score" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issues</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDesigns.map((design) => (
                  <TableRow 
                    key={design.id} 
                    className={cn(
                      "transition-colors duration-200 cursor-pointer",
                      selectedDesign === design.id ? "bg-muted" : "hover:bg-muted/50"
                    )}
                    onClick={() => handleDesignClick(design.id)}
                  >
                    <TableCell className="font-medium">{design.id}</TableCell>
                    <TableCell>{design.name}</TableCell>
                    <TableCell>{design.type}</TableCell>
                    <TableCell>{format(design.date, "MMM d, yyyy")}</TableCell>
                    <TableCell>{design.score}%</TableCell>
                    <TableCell>
                      <Badge
                        variant={design.status === "Passed" ? "default" : "destructive"}
                      >
                        {design.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{design.issues}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="hover:bg-muted">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDesigns.map((design) => (
            <motion.div 
              key={design.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  selectedDesign === design.id 
                    ? "ring-2 ring-primary" 
                    : "hover:shadow-md"
                )}
                onClick={() => handleDesignClick(design.id)}
              >
                <div className="aspect-video relative">
                  <img
                    src={design.image}
                    alt={design.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={design.status === "Passed" ? "default" : "destructive"}
                      className="font-medium"
                    >
                      {design.score}%
                    </Badge>
                  </div>
                </div>
                <CardHeader className="p-4 pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{design.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {design.id}
                        </Badge>
                      </div>
                      <CardDescription>{design.type}</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="flex justify-between text-sm">
                    <div className="text-muted-foreground">
                      {format(design.date, "MMM d, yyyy")}
                    </div>
                    <div>
                      <span className="font-medium">{design.issues}</span>{" "}
                      <span className="text-muted-foreground">issues</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button variant="outline" size="sm" className="w-full group">
                    <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">View Analysis</span>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {selectedDesignDetails && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="mt-6 overflow-hidden">
            <CardHeader className="bg-muted/40">
              <div className="flex justify-between items-center">
                <CardTitle>Design Details: {selectedDesignDetails.name}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSelectedDesign(null)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
              <CardDescription>{selectedDesignDetails.id} • {selectedDesignDetails.type}</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="aspect-video rounded-lg overflow-hidden border mb-4">
                    <img
                      src={selectedDesignDetails.image}
                      alt={selectedDesignDetails.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="space-y-1 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date Checked:</span>
                      <span>{format(selectedDesignDetails.date, "MMMM d, yyyy")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={selectedDesignDetails.status === "Passed" ? "default" : "destructive"}>
                        {selectedDesignDetails.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Issues:</span>
                      <span>{selectedDesignDetails.issues}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Brand Consistency Score</h3>
                  <div className="bg-muted h-8 rounded-full overflow-hidden mb-6">
                    <div 
                      className={cn(
                        "h-full rounded-full flex items-center justify-end px-3 text-white font-medium",
                        selectedDesignDetails.score > 70 ? "bg-green-500" :
                        selectedDesignDetails.score > 40 ? "bg-yellow-500" :
                        "bg-red-500"
                      )}
                      style={{ width: `${selectedDesignDetails.score}%` }}
                    >
                      {selectedDesignDetails.score}%
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">Analysis Summary</h3>
                  <p className="text-muted-foreground mb-4">
                    {selectedDesignDetails.score > 85 
                      ? "This design performs very well against your brand guidelines with only minor adjustments needed."
                      : selectedDesignDetails.score > 70
                      ? "This design generally follows brand guidelines but has several inconsistencies that should be addressed."
                      : "This design has significant inconsistencies with your brand guidelines and requires major revisions."}
                  </p>
                  
                  <div className="flex justify-end mt-8">
                    <Button variant="default" className="transition-all duration-200 hover:shadow">
                      View Full Analysis
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default DesignHistory;
