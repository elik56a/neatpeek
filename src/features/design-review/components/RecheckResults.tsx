"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { DesignRecheckResult, FrameRecheckResult } from "../types";
import { AlertCircle, Check, Copy, ExternalLink, FileText } from "lucide-react";
import { StatusChangeHighlight } from "./recheck-results/StatusChangeHighlight";
import { useToast } from "@/hooks/use-toast";

interface RecheckResultsProps {
  result: DesignRecheckResult;
  onRecheck: () => void;
}

/**
 * Component for displaying design recheck results
 */
export function RecheckResults({ result, onRecheck }: RecheckResultsProps) {
  const [activeFrame, setActiveFrame] = useState<string | null>(
    result.recheck_results.length > 0 ? result.recheck_results[0].frame_id : null
  );
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const [showToast, setShowToast] = useState(true); // Control when to show the toast

  // Get the active frame result
  const currentFrame = result.recheck_results.find(
    (frame) => frame.frame_id === activeFrame
  );

  // Show toast notification when component mounts
  useEffect(() => {
    if (!showToast) return;

    // Calculate total counts across all frames
    const totalCounts = {
      fixed: 0,
      partially_fixed: 0,
      not_fixed: 0,
      new_issues: 0,
      total: 0
    };

    result.recheck_results.forEach(frame => {
      const counts = getStatusCounts(frame);
      totalCounts.fixed += counts.fixed;
      totalCounts.partially_fixed += counts.partially_fixed;
      totalCounts.not_fixed += counts.not_fixed;
      totalCounts.new_issues += counts.new_issues;
      totalCounts.total += counts.fixed + counts.partially_fixed + counts.not_fixed;
    });

    // Determine the toast variant based on the results
    let variant: "default" | "destructive" = "default";
    let title = "Design Recheck Complete";

    if (totalCounts.fixed === totalCounts.total && totalCounts.new_issues === 0) {
      // All issues fixed, no new issues
      variant = "default";
      title = "All Issues Fixed!";
    } else if (totalCounts.fixed > 0 && totalCounts.fixed + totalCounts.partially_fixed === totalCounts.total && totalCounts.new_issues === 0) {
      // Some issues fixed or partially fixed, no new issues
      variant = "default";
      title = "Issues Improved";
    } else if (totalCounts.new_issues > 0) {
      // New issues found
      variant = "destructive";
      title = "New Issues Found";
    } else if (totalCounts.not_fixed === totalCounts.total) {
      // No issues fixed
      variant = "destructive";
      title = "No Issues Fixed";
    }

    // Create a summary message
    let description = "";

    if (totalCounts.total > 0) {
      const parts = [];

      if (totalCounts.fixed > 0) {
        parts.push(`${totalCounts.fixed} fixed`);
      }

      if (totalCounts.partially_fixed > 0) {
        parts.push(`${totalCounts.partially_fixed} partially fixed`);
      }

      if (totalCounts.not_fixed > 0) {
        parts.push(`${totalCounts.not_fixed} not fixed`);
      }

      if (parts.length > 0) {
        description = `${parts.join(", ")}`;
      }
    }

    if (totalCounts.new_issues > 0) {
      if (description) {
        description += `, ${totalCounts.new_issues} new issues found`;
      } else {
        description = `${totalCounts.new_issues} new issues found`;
      }
    }

    // Show the toast
    toast({
      title,
      description,
      variant
    });

    // Don't show the toast again until component is remounted
    setShowToast(false);
  }, [result, toast, showToast]);

  // Handle copy to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "The recheck result has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Count fixed, partially fixed, and not fixed issues
  const getStatusCounts = (frameResult: FrameRecheckResult) => {
    const counts = {
      fixed: 0,
      partially_fixed: 0,
      not_fixed: 0,
      new_issues: frameResult.new_issues.length
    };

    frameResult.comment_checks.forEach(check => {
      counts[check.check_result.status as keyof typeof counts]++;
    });

    return counts;
  };

  // Count status types for display

  // No results state
  if (result.recheck_results.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <h3 className="text-lg font-medium mb-2">No Issues to Recheck</h3>
        <p className="text-muted-foreground">
          All issues have been fixed or there were no issues to recheck.
        </p>
        <Button className="mt-4" onClick={onRecheck}>
          <FileText className="mr-2 h-4 w-4" />
          Run New Analysis
        </Button>
      </div>
    );
  }

  if (!currentFrame) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <p className="text-muted-foreground">No recheck results available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Design Recheck Results</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCopyCode} disabled={copied}>
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Full Report
              </>
            )}
          </Button>
          <Button onClick={onRecheck}>
            <FileText className="mr-2 h-4 w-4" />
            Run New Analysis
          </Button>
        </div>
      </div>

      {/* Frame selector tabs */}
      <Tabs
        value={activeFrame || ""}
        onValueChange={setActiveFrame}
        className="w-full"
      >
        <TabsList className="mb-4 flex flex-nowrap overflow-x-auto pb-1 scrollbar-thin">
          {result.recheck_results.map((frame) => {
            const counts = getStatusCounts(frame);
            return (
              <TabsTrigger
                key={frame.frame_id}
                value={frame.frame_id}
                className="relative z-10 overflow-hidden group"
              >
                <span className="relative z-10 flex items-center">
                  Frame {frame.frame_id.split(':')[1] || frame.frame_id}
                  {counts.fixed > 0 && (
                    <Badge variant="default" className="bg-green-100 text-green-800 ml-2">
                      {counts.fixed} Fixed
                    </Badge>
                  )}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {result.recheck_results.map((frame) => {
          const counts = getStatusCounts(frame);

          return (
            <TabsContent key={frame.frame_id} value={frame.frame_id} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Frame Summary</CardTitle>
                  <CardDescription>
                    Overview of issue status for this frame
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg border bg-muted/50 text-center">
                      <p className="text-2xl font-bold text-green-600">{counts.fixed}</p>
                      <p className="text-sm text-muted-foreground">Fixed Issues</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-muted/50 text-center">
                      <p className="text-2xl font-bold text-amber-600">{counts.partially_fixed}</p>
                      <p className="text-sm text-muted-foreground">Partially Fixed</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-muted/50 text-center">
                      <p className="text-2xl font-bold text-red-600">{counts.not_fixed}</p>
                      <p className="text-sm text-muted-foreground">Not Fixed</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-muted/50 text-center">
                      <p className="text-2xl font-bold text-blue-600">{counts.new_issues}</p>
                      <p className="text-sm text-muted-foreground">New Issues</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href={`https://www.figma.com/file/${frame.frame_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open in Figma
                    </a>
                  </Button>
                </CardFooter>
              </Card>

              <Separator />

              {/* Comment checks */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Check className="mr-2 h-5 w-5 text-green-500" />
                  Issue Status
                </h3>
                {frame.comment_checks.length > 0 ? (
                  <div className="space-y-4">
                    {frame.comment_checks.map((check, index) => (
                      <Card key={index} className="hover:shadow-md transition-all duration-200">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <StatusChangeHighlight
                              status={check.check_result.status as any}
                              previousStatus={check.original_issue?.status as any}
                              showAnimation={true}
                            />
                            <span className="text-xs text-muted-foreground">
                              Comment ID: {check.comment_id.split(':')[1] || check.comment_id}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="p-3 rounded-lg border bg-muted/50">
                            <p className="text-sm font-medium">Original Issue:</p>
                            <p className="text-sm">{check.original_message}</p>
                          </div>

                          <div>
                            <p className="font-medium">Status Details:</p>
                            <p className="text-sm">{check.check_result.details}</p>

                            {/* Additional details can be shown here if needed */}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No issues to recheck in this frame.</p>
                )}
              </div>

              {/* New issues */}
              {frame.new_issues.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <AlertCircle className="mr-2 h-5 w-5 text-blue-500" />
                    New Issues
                  </h3>
                  <div className="space-y-3">
                    {frame.new_issues.map((issue, index) => (
                      <Card key={index} className="hover:shadow-md transition-all duration-200">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <Badge
                              variant={
                                issue.severity === "high" ? "destructive" :
                                issue.severity === "medium" ? "default" :
                                "outline"
                              }
                            >
                              {issue.severity.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {"element_type" in issue ? String(issue.element_type) : "Element"}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="font-medium">{issue.description}</p>
                          {issue.fix_suggestion && (
                            <p className="text-sm mt-2">
                              <span className="font-medium">Fix: </span>
                              {issue.fix_suggestion}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Recheck Summary</CardTitle>
                  <CardDescription>
                    Here's a summary of the recheck results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <p className="text-sm">
                      {counts.fixed === frame.comment_checks.length
                        ? "All issues have been fixed! Great job!"
                        : counts.fixed > 0
                        ? `You've fixed ${counts.fixed} out of ${frame.comment_checks.length} issues. Keep going!`
                        : "None of the issues have been fixed yet. Please address the feedback and try again."}
                    </p>

                    {counts.new_issues > 0 && (
                      <p className="text-sm mt-2">
                        {counts.new_issues} new issue{counts.new_issues > 1 ? 's were' : ' was'} found during this recheck.
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={onRecheck}
                    className="w-full"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Run New Analysis
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
