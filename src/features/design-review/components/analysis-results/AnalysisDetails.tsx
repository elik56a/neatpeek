"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DesignAnalysisResult } from "../../types";
import { AlertCircle, ExternalLink, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractHexColors, sortIssuesBySeverity } from "../../utils/export-utils";
import { getStatusIcon, getStatusLabel } from "../../utils/enum-mappers";

interface AnalysisDetailsProps {
  result: DesignAnalysisResult;
  className?: string;
  figmaFileName?: string;
  activeFrameId?: string | null;
}

/**
 * Component for displaying detailed analysis results
 */
export function AnalysisDetails({ result, className, figmaFileName, activeFrameId }: AnalysisDetailsProps) {
  // Get the active review based on the activeFrameId prop
  const currentReview = result.reviews.find(
    (review) => review.image.frame_id === activeFrameId
  ) || (result.reviews.length > 0 ? result.reviews[0] : null);

  // Render score card with animation
  const renderScoreCard = (score: number, label: string) => (
    <Card className="hover:shadow-md transition-all duration-300 overflow-hidden group">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <CardTitle className="text-sm font-medium mb-1">{label}</CardTitle>
          <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-1000 ease-out"
              style={{
                width: `${score}%`,
                backgroundColor: score > 70 ? "#22c55e" : score > 40 ? "#eab308" : "#ef4444"
              }}
            />
          </div>
        </div>
        <div
          className={`text-xl font-bold px-3 py-1 rounded-full transform transition-transform duration-300 group-hover:scale-110 ${
            score > 70 ? "bg-green-100 text-green-700" :
            score > 40 ? "bg-yellow-100 text-yellow-700" :
            "bg-red-100 text-red-700"
          }`}
        >
          {score}
        </div>
      </CardContent>
    </Card>
  );

  if (!currentReview) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <p className="text-muted-foreground">No analysis results available.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Display only the current review */}
      {currentReview && (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Frame preview */}
              <Card className="overflow-hidden">
                <div className="aspect-video bg-muted">
                  <img
                    src={`${currentReview.image.url}?t=${Date.now()}`} /* Add cache-busting parameter */
                    alt={currentReview.image.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle>{currentReview.image.name}</CardTitle>
                  <CardDescription>
                    Frame from Figma design
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {currentReview.image.screen_type || "Screen"}
                    </Badge>
                    <Badge variant="outline">
                      {currentReview.image.platform || "Platform"}
                    </Badge>
                    <Badge variant="outline">
                      {currentReview.image.position.width}x{currentReview.image.position.height}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href={`https://www.figma.com/file/${currentReview.image.frame_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open in Figma
                    </a>
                  </Button>
                </CardFooter>
              </Card>

              {/* Scores */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold mb-4">Design Scores</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in-50 duration-500">
                  {renderScoreCard(currentReview.design_score?.total || 0, "Overall Score")}
                  {renderScoreCard(currentReview.design_score?.breakdown?.brand_compliance || 0, "Brand Compliance")}
                  {renderScoreCard(currentReview.design_score?.breakdown?.visual_harmony || 0, "Visual Harmony")}
                  {renderScoreCard(currentReview.design_score?.breakdown?.usability || 0, "Usability")}
                </div>
              </div>
            </div>

            <Separator />

            {/* Issues */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Brand issues */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                  Brand Consistency Issues ({currentReview.brand_issues.length})
                </h3>
                {currentReview.brand_issues.length > 0 ? (
                  <Accordion type="multiple" className="w-full">
                    {/* Sort issues by severity: high first, then medium, then low */}
                    {sortIssuesBySeverity(currentReview.brand_issues)
                      .map((issue, index) => {
                      // Extract hex colors from the issue text
                      const colorHexCodes = extractHexColors(issue.description + (issue.brand_rule_violation || ""));
                      const severity = issue.severity.toUpperCase();

                      return (
                        <AccordionItem key={index} value={`brand-issue-${index}`}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center">
                                <Badge
                                  variant={
                                    issue.severity === "high" ? "destructive" :
                                    issue.severity === "medium" ? "default" :
                                    "outline"
                                  }
                                  className="mr-2"
                                >
                                  {severity}
                                </Badge>
                                <span className="font-medium truncate">Brand Issue</span>
                              </div>
                              {issue.status && (() => {
                                const StatusIcon = getStatusIcon(issue.status);
                                return (
                                  <Badge
                                    variant="outline"
                                    className={`text-xs px-2 py-0.5 flex items-center ${issue.status === 'fixed' ? 'bg-green-50 text-green-700 border-green-200' : issue.status === 'not_fixed' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}`}
                                  >
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {getStatusLabel(issue.status)}
                                  </Badge>
                                );
                              })()}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-2 px-2">
                            <p className="font-medium">{issue.description}</p>
                            {issue.brand_rule_violation && (
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium">Rule: </span>
                                {issue.brand_rule_violation}
                              </p>
                            )}
                            <p className="text-sm">
                              <span className="font-medium">Fix: </span>
                              {issue.fix_suggestion}
                            </p>
                            {colorHexCodes.length > 0 && (
                              <div className="flex gap-3 mt-2">
                                {colorHexCodes.map((hex, hexIndex) => (
                                  <div key={hexIndex} className="flex items-center">
                                    <div
                                      className="w-6 h-6 rounded-full border mr-1"
                                      style={{ backgroundColor: hex }}
                                    />
                                    <span className="text-xs">{hex}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                ) : (
                  <p className="text-muted-foreground">No brand consistency issues found.</p>
                )}
              </div>

              {/* General issues */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
                  UX & Accessibility Issues ({currentReview.general_issues.length})
                </h3>
                {currentReview.general_issues.length > 0 ? (
                  <Accordion type="multiple" className="w-full">
                    {/* Sort issues by severity: high first, then medium, then low */}
                    {sortIssuesBySeverity(currentReview.general_issues)
                      .map((issue, index) => {
                      const severity = issue.severity.toUpperCase();
                      return (
                        <AccordionItem key={index} value={`general-issue-${index}`}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center">
                                <Badge
                                  variant={
                                    issue.severity === "high" ? "destructive" :
                                    issue.severity === "medium" ? "default" :
                                    "outline"
                                  }
                                  className="mr-2"
                                >
                                  {severity}
                                </Badge>
                                <span className="font-medium truncate">UX Issue</span>
                              </div>
                              {issue.status && (() => {
                                const StatusIcon = getStatusIcon(issue.status);
                                return (
                                  <Badge
                                    variant="outline"
                                    className={`text-xs px-2 py-0.5 flex items-center ${issue.status === 'fixed' ? 'bg-green-50 text-green-700 border-green-200' : issue.status === 'not_fixed' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}`}
                                  >
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {getStatusLabel(issue.status)}
                                  </Badge>
                                );
                              })()}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-2 px-2">
                            <p className="font-medium">{issue.description}</p>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Issue: </span>
                              {issue.description}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Fix: </span>
                              {issue.fix_suggestion}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                ) : (
                  <p className="text-muted-foreground">No UX or accessibility issues found.</p>
                )}
              </div>
            </div>

            {/* Positive aspects */}
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <ThumbsUp className="mr-2 h-5 w-5 text-green-500" />
                Positive Aspects ({currentReview.positive_aspects.length})
              </h3>
              {currentReview.positive_aspects.length > 0 ? (
                <Accordion type="multiple" className="w-full">
                  {currentReview.positive_aspects.map((aspect: any, index: number) => (
                    <AccordionItem key={index} value={`positive-aspect-${index}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center">
                            <Badge variant="outline" className="bg-green-50 text-green-700 mr-2">
                              Positive
                            </Badge>
                            <span className="font-medium truncate">Positive Aspect</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2 px-2">
                        <p className="font-medium">{aspect}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-muted-foreground">No positive aspects highlighted.</p>
              )}
            </div>

            {/* Summary */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Review Summary</CardTitle>
                <CardDescription>
                  Here's a summary of the brand consistency check
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4 bg-muted/50">
                  <p className="text-sm">
                    {currentReview.design_score.total > 80
                      ? "Your design shows strong brand consistency! There are just a few minor issues to address."
                      : currentReview.design_score.total > 60
                      ? "Your design has good brand consistency with some issues that should be addressed."
                      : "Your design needs significant improvements to align with your brand guidelines."}
                  </p>

                  <div className="mt-4 text-sm">
                    <p className="font-medium">Key areas to improve:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      {currentReview.design_score.breakdown.brand_compliance < 90 && <li>Brand compliance</li>}
                      {currentReview.design_score.breakdown.visual_harmony < 85 && <li>Visual harmony</li>}
                      {currentReview.design_score.breakdown.usability < 80 && <li>Usability</li>}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Score Breakdown</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Brand Compliance</span>
                        <span className="text-sm font-medium">{currentReview.design_score.breakdown.brand_compliance}%</span>
                      </div>
                      <Progress value={currentReview.design_score.breakdown.brand_compliance} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Visual Harmony</span>
                        <span className="text-sm font-medium">{currentReview.design_score.breakdown.visual_harmony}%</span>
                      </div>
                      <Progress value={currentReview.design_score.breakdown.visual_harmony} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Usability</span>
                        <span className="text-sm font-medium">{currentReview.design_score.breakdown.usability}%</span>
                      </div>
                      <Progress value={currentReview.design_score.breakdown.usability} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Accessibility</span>
                        <span className="text-sm font-medium">{currentReview.design_score.breakdown.accessibility}%</span>
                      </div>
                      <Progress value={currentReview.design_score.breakdown.accessibility} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
