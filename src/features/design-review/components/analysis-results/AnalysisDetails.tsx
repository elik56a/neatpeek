"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { IssueSeverity, Design, DesignsReview } from "../../types";
import { AlertCircle, ExternalLink, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractHexColors, sortIssuesBySeverity } from "../../utils/export-utils";
import {
  getStatusIcon,
  getStatusLabel,
  getSeverityBadgeVariant,
  getSeverityBadgeClasses,
} from "../../utils/enum-mappers";
import { getSeverityEmoji } from "../../utils/comment-formatters";
import { useMemo } from "react";
import { PositiveAspect } from "../../types/review-json";
import { appConfig } from "@/config/app";

// Add this constant
const FIX_SUGGESTION_ICON = "💡";

interface AnalysisDetailsProps {
  designsReview: DesignsReview;
  className?: string;
  figmaFileName?: string;
  activeFrameId?: string | null;
}

/**
 * Component for displaying detailed analysis results
 */
export function AnalysisDetails({
  designsReview,
  className,
  figmaFileName,
  activeFrameId,
}: AnalysisDetailsProps) {
  // Get the active review based on the activeFrameId prop
  const currentDesign: Design = useMemo(() => {
    return (
      designsReview.designs.find(design => design.frameId === activeFrameId) ||
      (designsReview.designs.length > 0 ? designsReview.designs[0] : null)
    );
  }, [activeFrameId]);

  // Render score card with animation
  const renderScoreCard = (score: number, label: string) => (
    <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md transition-all duration-300">
      <div className="flex-grow">
        <p className="text-sm font-medium">{label}</p>
        <div className="h-1.5 w-full mt-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-1000 ease-out"
            style={{
              width: `${score}%`,
              backgroundColor: score > 70 ? "#22c55e" : score > 40 ? "#eab308" : "#ef4444",
            }}
          />
        </div>
      </div>
      <div
        className={`ml-3 text-lg font-bold px-2.5 py-0.5 rounded-full transform transition-transform duration-300 hover:scale-110 ${
          score > 70
            ? "bg-green-100 text-green-700"
            : score > 40
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
        }`}
      >
        {score}
      </div>
    </div>
  );

  if (!currentDesign) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <p className="text-muted-foreground">No analysis results available.</p>
      </div>
    );
  }

  const { design_score, image, brand_issues, general_issues, positive_aspects } =
    currentDesign.reviewJson;

  return (
    <div className={className}>
      {/* Display only the current review */}
      {currentDesign && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Frame preview - takes up 2/3 of the space */}
            <Card className="overflow-hidden md:col-span-2">
              <div className="relative h-[300px] bg-muted">
                <img src={image.url} alt={image.name} className="w-full h-full object-contain" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle>{currentDesign.fileName}</CardTitle>
                <CardDescription>Frame from Figma design</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{image.screen_type || "Screen"}</Badge>
                  <Badge variant="outline">{image.platform || "Platform"}</Badge>
                  <Badge variant="outline">
                    {image.position.width}x{image.position.height}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <a href={designsReview.figmaUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in Figma
                  </a>
                </Button>
              </CardFooter>
            </Card>

            {/* Scores - takes up 1/3 of the space with vertical layout */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4">Design Scores</h3>
              <Card className="p-3">
                <div className="space-y-2 animate-in fade-in-50 duration-500">
                  {renderScoreCard(design_score.total || 0, "Overall Score")}
                  <Separator className="my-1" />
                  {renderScoreCard(design_score.max_score || 0, "Brand Compliance")}
                  {renderScoreCard(design_score.breakdown.visual_harmony || 0, "Visual Harmony")}
                  {renderScoreCard(design_score.breakdown.usability || 0, "Usability")}
                  {renderScoreCard(design_score.breakdown.accessibility || 0, "Accessibility")}
                </div>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Issues */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Brand issues */}
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                Brand Consistency Issues ({brand_issues.length})
              </h3>
              {brand_issues.length > 0 ? (
                <Accordion type="multiple" className="w-full">
                  {/* Sort issues by severity: high first, then medium, then low */}
                  {sortIssuesBySeverity(brand_issues).map((issue, index) => {
                    // Extract hex colors from the issue text
                    const colorHexCodes = extractHexColors(
                      issue.description + (issue.brand_rule_violation || "")
                    );
                    const severity = issue.severity.toUpperCase();

                    return (
                      <AccordionItem key={index} value={`brand-issue-${index}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center">
                              <Badge
                                variant={
                                  getSeverityBadgeVariant(issue.severity as IssueSeverity) as any
                                }
                                className={`mr-2 ${getSeverityBadgeClasses(issue.severity as IssueSeverity)}`}
                              >
                                {severity}
                              </Badge>
                              <span className="font-medium truncate">{issue.element_type}</span>
                            </div>
                            {issue.status &&
                              (() => {
                                const StatusIcon = getStatusIcon(issue.status);
                                return (
                                  <Badge
                                    variant="outline"
                                    className={`text-xs px-2 py-0.5 flex items-center ${issue.status === "fixed" ? "bg-green-50 text-green-700 border-green-200" : issue.status === "not_fixed" ? "bg-orange-50 text-orange-700 border-orange-200" : ""}`}
                                  >
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {getStatusLabel(issue.status)}
                                  </Badge>
                                );
                              })()}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-2 px-2">
                          <p className="font-medium">
                            {getSeverityEmoji(issue.severity as IssueSeverity)} {issue.description}
                          </p>
                          {issue.fix_suggestion && (
                            <p className="text-sm">
                              <span className="font-medium">{FIX_SUGGESTION_ICON} Fix: </span>
                              {issue.fix_suggestion}
                            </p>
                          )}
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
                UX & Accessibility Issues ({general_issues.length})
              </h3>
              {general_issues.length > 0 ? (
                <Accordion type="multiple" className="w-full">
                  {/* Sort issues by severity: high first, then medium, then low */}
                  {sortIssuesBySeverity(general_issues).map((issue, index) => {
                    const severity = issue.severity.toUpperCase();
                    return (
                      <AccordionItem key={index} value={`general-issue-${index}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center">
                              <Badge
                                variant={
                                  getSeverityBadgeVariant(issue.severity as IssueSeverity) as any
                                }
                                className={`mr-2 ${getSeverityBadgeClasses(issue.severity as IssueSeverity)}`}
                              >
                                {severity}
                              </Badge>
                              <span className="font-medium truncate">{issue.element_type}</span>
                            </div>
                            {issue.status &&
                              (() => {
                                const StatusIcon = getStatusIcon(issue.status);
                                return (
                                  <Badge
                                    variant="outline"
                                    className={`text-xs px-2 py-0.5 flex items-center ${issue.status === "fixed" ? "bg-green-50 text-green-700 border-green-200" : issue.status === "not_fixed" ? "bg-orange-50 text-orange-700 border-orange-200" : ""}`}
                                  >
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {getStatusLabel(issue.status)}
                                  </Badge>
                                );
                              })()}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-2 px-2">
                          <p className="font-medium">
                            {getSeverityEmoji(issue.severity as IssueSeverity)} {issue.description}
                          </p>
                          {issue.fix_suggestion && (
                            <p className="text-sm">
                              <span className="font-medium">{FIX_SUGGESTION_ICON} Fix: </span>
                              {issue.fix_suggestion}
                            </p>
                          )}
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
              Positive Aspects ({positive_aspects.length})
            </h3>
            {positive_aspects.length > 0 ? (
              <Accordion type="multiple" className="w-full">
                {positive_aspects.map((positiveAspect: PositiveAspect, index: number) => (
                  <AccordionItem key={index} value={`positive-aspect-${index}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center">
                          <Badge variant="outline" className="bg-green-50 text-green-700 mr-2">
                            Positive
                          </Badge>
                          <span className="font-medium truncate">
                            {positiveAspect.element_type}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 px-2">
                      <p className="font-medium">{positiveAspect.description}</p>
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
              <CardTitle>{appConfig.name} Review Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground font-normal ">
                  {design_score.scoring_rationale}
                </p>
              </div>
              <div className="rounded-lg border p-4 bg-muted/50">
                {design_score.areas_to_improve && (
                  <div className="text-sm">
                    <p className="font-medium">Key areas to improve:</p>
                    <p className="text-sm text-muted-foreground font-normal ">
                      {design_score.areas_to_improve}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
