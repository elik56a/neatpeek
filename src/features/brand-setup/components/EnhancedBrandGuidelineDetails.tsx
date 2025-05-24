"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColorValueDisplay } from "@/components/ui/color-value-display";
import { cn } from "@/utils/cn";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Brain,
  Edit,
  FileText,
  Image,
  Loader2,
  Play,
  Sparkles,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useBrandGuideline, useBrandGuidelineUI } from "../hooks";
import { BrandGuidelineStatus, BrandRule, ProcessingStatus } from "../types";
import { RuleCategory } from "../types";
import { EditableBrandRule } from "./EditableBrandRule";
import { appConfig } from "@/config/app";

interface EnhancedBrandGuidelineDetailsProps {
  id: string;
}

export function EnhancedBrandGuidelineDetails({ id }: EnhancedBrandGuidelineDetailsProps) {
  const { brandGuideline, isLoading, error, startAnalysis, deleteBrandGuideline } =
    useBrandGuideline(id);
  const {
    activeTab,
    setActiveTab,
    getCategoryIcon,
    getCategoryColor,
    getCategoryBadgeColor,
    getStatusBadge,
    groupRulesByCategory,
    getCategoryLabel,
    isBestPracticesActiveCategory,
  } = useBrandGuidelineUI();
  const [isStartingAnalysis, setIsStartingAnalysis] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // Handle start analysis
  const handleStartAnalysis = async () => {
    setIsStartingAnalysis(true);
    try {
      await startAnalysis();
    } finally {
      setIsStartingAnalysis(false);
    }
  };

  // Handle delete brand guideline
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBrandGuideline();
      router.push("/brand-setup");
    } catch (error) {
      console.error("Error deleting brand guideline:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!brandGuideline) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Not Found</AlertTitle>
        <AlertDescription>Brand guideline not found.</AlertDescription>
      </Alert>
    );
  }

  const rulesByCategory = groupRulesByCategory(brandGuideline?.brandRules);

  return (
    <div className="space-y-8">
      {/* Header with brand name and actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-lg shadow-sm border border-blue-100 animate-in fade-in duration-500">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild className="bg-white hover:bg-white/90">
            <Link href="/brand-setup">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{brandGuideline.name}</h1>
            <div className="flex items-center mt-1 space-x-2">
              {getStatusBadge(brandGuideline.status as BrandGuidelineStatus)}
              <span className="text-sm text-gray-500">
                Created on {new Date(brandGuideline.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          {/* Edit Button */}
          <Button variant="outline" asChild className="bg-white hover:bg-white/90">
            <Link href={`/brand-setup/edit/${id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>

          {/* Delete Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the brand guideline and
                  all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Start Analysis Button */}
          {brandGuideline.status === BrandGuidelineStatus.DRAFT && (
            <Button
              onClick={handleStartAnalysis}
              disabled={isStartingAnalysis}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              {isStartingAnalysis ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting Analysis...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Analysis
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {brandGuideline.processingMessage &&
        brandGuideline.processingStatus !== BrandGuidelineStatus.COMPLETED && (
          <Alert
            variant={
              brandGuideline.processingStatus === BrandGuidelineStatus.FAILED
                ? "destructive"
                : "default"
            }
            className={cn(
              "animate-in fade-in duration-500",
              brandGuideline.processingStatus === BrandGuidelineStatus.PROCESSING
                ? "bg-amber-50 border-amber-200"
                : brandGuideline.processingStatus === BrandGuidelineStatus.FAILED
                  ? "bg-red-50 border-red-200"
                  : ""
            )}
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {brandGuideline.processingStatus === BrandGuidelineStatus.PROCESSING
                ? "Processing"
                : brandGuideline.processingStatus === BrandGuidelineStatus.FAILED
                  ? "Failed"
                  : "Status"}
            </AlertTitle>
            <AlertDescription>{brandGuideline.processingMessage}</AlertDescription>
          </Alert>
        )}

      {/* Brand details card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1 animate-in fade-in duration-500 slide-in-from-left-5">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-gray-700" />
              Brand Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Description</h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  {brandGuideline.description || "No description provided."}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700">Resources</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {brandGuideline.pdfPath && (
                    <Badge
                      variant="outline"
                      className="flex items-center bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <FileText className="mr-1 h-3 w-3" />
                      <a
                        href={brandGuideline.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        Brand Guidelines PDF
                      </a>
                    </Badge>
                  )}

                  {brandGuideline.designImages && brandGuideline.designImages.length > 0 && (
                    <Badge
                      variant="outline"
                      className="flex items-center bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                    >
                      <Image className="mr-1 h-3 w-3" />
                      {brandGuideline.designImages.length} Design Images
                    </Badge>
                  )}

                  {brandGuideline.customRules && brandGuideline.customRules.length > 0 && (
                    <Badge
                      variant="outline"
                      className="flex items-center bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                    >
                      <BookOpen className="mr-1 h-3 w-3" />
                      {brandGuideline.customRules.length} Custom Rules
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI-generated brand rules */}
        {brandGuideline.status === BrandGuidelineStatus.COMPLETED &&
          brandGuideline.brandRules &&
          brandGuideline.brandRules.length > 0 && (
            <Card className="md:col-span-3 animate-in fade-in duration-500 slide-in-from-right-5">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Brain className="mr-2 h-5 w-5 text-indigo-600" />
                    <span className="flex items-center">
                      AI-Generated Brand Rules
                      <Badge className="ml-2 bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
                        <Sparkles className="mr-1 h-3 w-3" />
                        AI Generated
                      </Badge>
                    </span>
                  </CardTitle>
                </div>
                <CardDescription>
                  {activeTab === RuleCategory.BEST_PRACTICES
                    ? "These are general best practices for effective brand design and implementation."
                    : "These rules were automatically generated based on your brand guidelines."}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs
                  defaultValue={activeTab || Object.keys(rulesByCategory)[0]}
                  className="space-y-6"
                >
                  <TabsList className="flex flex-wrap bg-slate-50 p-1">
                    {Object.keys(rulesByCategory).map(category => {
                      return (
                        <TabsTrigger
                          key={category}
                          value={category}
                          className={cn(
                            "flex items-center data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200",
                            "data-[state=active]:text-indigo-700"
                          )}
                          onClick={() => setActiveTab(category)}
                        >
                          {getCategoryIcon(category as RuleCategory)}
                          <span className="ml-1.5">
                            {getCategoryLabel(category as RuleCategory)}
                          </span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  {/* Best Practices Header */}
                  {isBestPracticesActiveCategory() && (
                    <div className="bg-gradient-to-r from-primary/8 via-primary/5 to-primary/8 border border-primary/25 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-500">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {appConfig.name} Best Practices
                          </h3>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            These are carefully curated best practices that we've created
                            specifically for you. They represent industry standards and proven
                            design principles to help elevate your brand.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {Object.entries(rulesByCategory).map(
                    ([category, rules]: [RuleCategory, BrandRule[]]) => (
                      <TabsContent key={category} value={category} className="space-y-4 pt-2">
                        <div
                          className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500"
                          style={{
                            animationFillMode: "both",
                            animationDelay: "150ms",
                          }}
                        >
                          {rules.map(rule => (
                            <EditableBrandRule
                              key={rule.id}
                              rule={rule}
                              category={category as RuleCategory}
                              getCategoryBadgeColor={getCategoryBadgeColor}
                              getCategoryIcon={getCategoryIcon}
                              getCategoryColor={getCategoryColor}
                              getCategoryLabel={getCategoryLabel}
                              brandGuidelineId={id}
                            />
                          ))}
                        </div>
                      </TabsContent>
                    )
                  )}
                </Tabs>
              </CardContent>
            </Card>
          )}
      </div>

      {/* Custom rules card */}
      {brandGuideline.customRules && brandGuideline.customRules.length > 0 && (
        <Card className="animate-in fade-in duration-500 slide-in-from-bottom-5">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b">
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-amber-600" />
              Custom Rules
            </CardTitle>
            <CardDescription>Custom rules you provided for your brand.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {brandGuideline.customRules.map(rule => (
                <div
                  key={rule.id}
                  className="border rounded-lg p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900">{rule.name}</h3>
                    <Badge
                      variant="outline"
                      className="bg-amber-100 text-amber-800 hover:bg-amber-100"
                    >
                      {rule.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 pt-2 border-t border-amber-100">
                    {rule.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Design examples card */}
      {brandGuideline.designImages && brandGuideline.designImages.length > 0 && (
        <Card className="animate-in fade-in duration-500 slide-in-from-bottom-5">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b">
            <CardTitle className="flex items-center">
              <Image className="mr-2 h-5 w-5 text-purple-600" />
              Design Examples
            </CardTitle>
            <CardDescription>Design examples you provided for your brand.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {brandGuideline.designImages.map(image => (
                <div
                  key={image.id}
                  className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <div className="relative">
                    <img
                      src={image.url}
                      alt={image.name || "Design example"}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-3 w-full">
                        <a
                          href={image.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white text-sm font-medium hover:underline"
                        >
                          View Full Size
                        </a>
                      </div>
                    </div>
                  </div>
                  {image.name && (
                    <div className="p-3 bg-white">
                      <h3 className="font-medium text-sm text-gray-900">{image.name}</h3>
                      {image.description && (
                        <p className="text-xs text-gray-600 mt-1">{image.description}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
