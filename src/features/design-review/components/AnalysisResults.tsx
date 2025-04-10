"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { DesignAnalysisResult, DesignReviewResult } from "../types";
import { AlertCircle, Check, Copy, ExternalLink, FileText, ThumbsUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResultsProps {
  result: DesignAnalysisResult;
  onRecheck: () => void;
}

/**
 * Component for displaying design analysis results
 */
export function AnalysisResults({ result, onRecheck }: AnalysisResultsProps) {
  const [activeReview, setActiveReview] = useState<string | null>(
    result.reviews.length > 0 ? result.reviews[0].image.frame_id : null
  );
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  // Get the active review
  const currentReview = result.reviews.find(
    (review) => review.image.frame_id === activeReview
  );
  
  // Handle copy to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "The analysis result has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Render score circle
  const renderScoreCircle = (score: number, label: string) => (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent className="text-center py-4">
        <div className="relative h-24 w-24 mx-auto">
          <div 
            className="absolute top-0 left-0 h-full w-full rounded-full bg-muted overflow-hidden"
          >
            <div 
              className={`absolute top-0 left-0 h-full rounded-full transform-gpu origin-left ${
                score > 70 ? "bg-gradient-to-r from-green-500 to-green-600" :
                score > 40 ? "bg-gradient-to-r from-yellow-500 to-yellow-600" :
                "bg-gradient-to-r from-red-500 to-red-600"
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
            {score}
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  // Extract hex colors from strings
  const extractHexColors = (text: string): string[] => {
    const hexRegex = /#([0-9A-F]{6})/gi;
    const matches = text.match(hexRegex);
    return matches ? matches : [];
  };
  
  if (!currentReview) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <p className="text-muted-foreground">No analysis results available.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Design Analysis Results</h2>
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
            Recheck Design
          </Button>
        </div>
      </div>
      
      {/* Frame selector tabs */}
      <Tabs 
        value={activeReview || ""} 
        onValueChange={setActiveReview}
        className="w-full"
      >
        <TabsList className="mb-4 flex flex-nowrap overflow-x-auto pb-1 scrollbar-thin">
          {result.reviews.map((review) => (
            <TabsTrigger 
              key={review.image.frame_id} 
              value={review.image.frame_id}
              className="relative z-10 overflow-hidden group"
            >
              <span className="relative z-10 flex items-center">
                {review.image.name}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {result.reviews.map((review) => (
          <TabsContent key={review.image.frame_id} value={review.image.frame_id} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Frame preview */}
              <Card className="overflow-hidden">
                <div className="aspect-video bg-muted">
                  <img 
                    src={review.image.url} 
                    alt={review.image.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle>{review.image.name}</CardTitle>
                  <CardDescription>
                    {review.image.description || "Frame from Figma design"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {review.image.screen_type || "Screen"}
                    </Badge>
                    <Badge variant="outline">
                      {review.image.platform || "Platform"}
                    </Badge>
                    <Badge variant="outline">
                      {review.image.position.width}x{review.image.position.height}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <a 
                      href={`https://www.figma.com/file/${review.image.frame_id}`} 
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
                <h3 className="text-xl font-bold">Design Scores</h3>
                <div className="grid grid-cols-2 gap-4">
                  {renderScoreCircle(review.design_score.total, "Overall Score")}
                  {renderScoreCircle(review.design_score.breakdown.brand_compliance, "Brand Compliance")}
                  {renderScoreCircle(review.design_score.breakdown.visual_harmony, "Visual Harmony")}
                  {renderScoreCircle(review.design_score.breakdown.usability, "Usability")}
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
                  Brand Consistency Issues
                </h3>
                {review.brand_issues.length > 0 ? (
                  <div className="space-y-3">
                    {review.brand_issues.map((issue, index) => {
                      // Extract hex colors from the issue text
                      const colorHexCodes = extractHexColors(issue.description + issue.brand_rule_violation);
                      
                      return (
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
                                {issue.element_type}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <p className="font-medium">{issue.description}</p>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Rule: </span>
                              {issue.brand_rule_violation}
                            </p>
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
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No brand consistency issues found.</p>
                )}
              </div>
              
              {/* General issues */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
                  UX & Accessibility Issues
                </h3>
                {review.general_issues.length > 0 ? (
                  <div className="space-y-3">
                    {review.general_issues.map((issue, index) => (
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
                              {issue.element_type}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="font-medium">{issue.description}</p>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Issue: </span>
                            {issue.issue}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Fix: </span>
                            {issue.fix_suggestion}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No UX or accessibility issues found.</p>
                )}
              </div>
            </div>
            
            {/* Positive aspects */}
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <ThumbsUp className="mr-2 h-5 w-5 text-green-500" />
                Positive Aspects
              </h3>
              {review.positive_aspects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {review.positive_aspects.map((aspect, index) => (
                    <Card key={index} className="hover:shadow-md transition-all duration-200">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">
                            {aspect.element_type}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="font-medium">{aspect.description}</p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Strength: </span>
                          {aspect.strength}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Brand Alignment: </span>
                          {aspect.brand_alignment}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No positive aspects highlighted.</p>
              )}
            </div>
            
            {/* Summary */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Analysis Summary</CardTitle>
                <CardDescription>
                  Here's a summary of the brand consistency check
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4 bg-muted/50">
                  <p className="text-sm">
                    {review.design_score.total > 80 
                      ? "Your design shows strong brand consistency! There are just a few minor issues to address."
                      : review.design_score.total > 60
                      ? "Your design has good brand consistency with some issues that should be addressed."
                      : "Your design needs significant improvements to align with your brand guidelines."}
                  </p>
                  
                  <div className="mt-4 text-sm">
                    <p className="font-medium">Key areas to improve:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      {review.design_score.breakdown.brand_compliance < 90 && <li>Brand compliance</li>}
                      {review.design_score.breakdown.visual_harmony < 85 && <li>Visual harmony</li>}
                      {review.design_score.breakdown.usability < 80 && <li>Usability</li>}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Score Breakdown</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Brand Compliance</span>
                        <span className="text-sm font-medium">{review.design_score.breakdown.brand_compliance}%</span>
                      </div>
                      <Progress value={review.design_score.breakdown.brand_compliance} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Visual Harmony</span>
                        <span className="text-sm font-medium">{review.design_score.breakdown.visual_harmony}%</span>
                      </div>
                      <Progress value={review.design_score.breakdown.visual_harmony} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Usability</span>
                        <span className="text-sm font-medium">{review.design_score.breakdown.usability}%</span>
                      </div>
                      <Progress value={review.design_score.breakdown.usability} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Accessibility</span>
                        <span className="text-sm font-medium">{review.design_score.breakdown.accessibility}%</span>
                      </div>
                      <Progress value={review.design_score.breakdown.accessibility} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={onRecheck} 
                  className="w-full"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Recheck Design
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
