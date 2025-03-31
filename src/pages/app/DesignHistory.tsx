
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { CheckCircle2, AlertCircle, Calendar, Search, FileText, ArrowUpDown, ExternalLink } from "lucide-react";

// Mock data
const generateDesignChecks = () => [
  {
    id: 1,
    name: "Homepage Redesign",
    type: "Web Design",
    status: "passed",
    issues: 0,
    date: "2023-09-15T14:00:00",
    figmaLink: "https://figma.com/file/123",
  },
  {
    id: 2,
    name: "Mobile App UI v2",
    type: "App Design",
    status: "failed",
    issues: 3,
    date: "2023-09-14T10:30:00",
    figmaLink: "https://figma.com/file/456",
  },
  {
    id: 3,
    name: "Product Landing Page",
    type: "Web Design",
    status: "passed",
    issues: 0,
    date: "2023-09-12T16:15:00",
    figmaLink: null,
  },
  {
    id: 4,
    name: "Email Newsletter Template",
    type: "Email Design",
    status: "failed",
    issues: 2,
    date: "2023-09-10T09:45:00",
    figmaLink: null,
  },
  {
    id: 5,
    name: "Logo Variations",
    type: "Brand Design",
    status: "passed",
    issues: 0,
    date: "2023-09-08T11:20:00",
    figmaLink: "https://figma.com/file/789",
  },
  {
    id: 6,
    name: "Social Media Kit",
    type: "Social Media",
    status: "passed",
    issues: 0,
    date: "2023-09-05T13:10:00",
    figmaLink: null,
  },
  {
    id: 7,
    name: "Product Detail Page",
    type: "Web Design",
    status: "failed",
    issues: 5,
    date: "2023-09-03T15:30:00",
    figmaLink: "https://figma.com/file/101",
  },
  {
    id: 8,
    name: "Brand Guidelines Cover",
    type: "Print Design",
    status: "passed",
    issues: 0,
    date: "2023-09-01T10:00:00",
    figmaLink: null,
  },
];

const DesignHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDesigns, setFilteredDesigns] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize with mock data
  const [designs, setDesigns] = useState<any[]>([]);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDesigns(generateDesignChecks());
      } catch (error) {
        console.error("Error fetching design history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filter and sort designs
    let results = [...designs];
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(
        design => 
          design.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          design.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    results.sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "asc" 
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === "status") {
        return sortOrder === "asc"
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      } else if (sortBy === "issues") {
        return sortOrder === "asc"
          ? a.issues - b.issues
          : b.issues - a.issues;
      }
      return 0;
    });
    
    setFilteredDesigns(results);
  }, [designs, searchTerm, sortBy, sortOrder]);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Design History</h1>
          <p className="text-muted-foreground">
            View and manage all your previous design checks
          </p>
        </div>
        <Button asChild>
          <Link to="/design-checker">
            New Design Check
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Recent Design Checks</CardTitle>
              <CardDescription>
                A history of all your brand compliance checks
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search designs..."
                className="pl-8 w-full md:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => toggleSort("name")}
                  >
                    <div className="flex items-center gap-1">
                      Design Name
                      {sortBy === "name" && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => toggleSort("status")}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {sortBy === "status" && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer text-right"
                    onClick={() => toggleSort("issues")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Issues
                      {sortBy === "issues" && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => toggleSort("date")}
                  >
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      Date
                      {sortBy === "date" && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDesigns.length > 0 ? (
                  filteredDesigns.map((design) => (
                    <TableRow key={design.id}>
                      <TableCell className="font-medium">{design.name}</TableCell>
                      <TableCell>{design.type}</TableCell>
                      <TableCell>
                        {design.status === "passed" ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/60">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Passed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/60">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Failed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {design.issues > 0 ? design.issues : "—"}
                      </TableCell>
                      <TableCell>{formatDate(design.date)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/design-checker?id=${design.id}`}>
                              <FileText className="h-3.5 w-3.5 mr-1" />
                              View
                            </Link>
                          </Button>
                          {design.figmaLink && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <a href={design.figmaLink} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No design checks found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignHistory;
