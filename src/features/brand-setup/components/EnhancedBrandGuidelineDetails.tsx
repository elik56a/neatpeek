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
import { cn } from "@/utils/cn";
import {
    AlertCircle,
    ArrowLeft,
    BookOpen,
    Brain,
    Brush,
    Edit,
    FileText,
    Image,
    Loader2,
    Palette,
    Play,
    Sparkles,
    Trash2,
    Type
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useBrandGuideline } from "../hooks";
import { BrandGuidelineStatus, ProcessingStatus, RuleCategory } from "../types";

// Animation variants for elements
const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Helper function to get category icon
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'COLOR':
      return <Palette className="h-4 w-4" />;
    case 'TYPOGRAPHY':
      return <Type className="h-4 w-4" />;
    case 'SPACING':
      return <BookOpen className="h-4 w-4" />;
    case 'LOGO':
      return <Image className="h-4 w-4" />;
    case 'ICON':
      return <Image className="h-4 w-4" />;
    case 'LAYOUT':
      return <Brush className="h-4 w-4" />;
    case 'GENERAL':
      return <BookOpen className="h-4 w-4" />;
    default:
      return <BookOpen className="h-4 w-4" />;
  }
};

// Helper function to get category color
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'COLOR':
      return "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200";
    case 'TYPOGRAPHY':
      return "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200";
    case 'SPACING':
      return "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200";
    case 'LOGO':
      return "bg-gradient-to-r from-red-50 to-rose-50 border-red-200";
    case 'ICON':
      return "bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200";
    case 'LAYOUT':
      return "bg-gradient-to-r from-cyan-50 to-sky-50 border-cyan-200";
    case 'GENERAL':
      return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200";
    default:
      return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200";
  }
};

// Helper function to get category badge color
const getCategoryBadgeColor = (category: string) => {
  switch (category) {
    case 'COLOR':
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case 'TYPOGRAPHY':
      return "bg-amber-100 text-amber-800 hover:bg-amber-100";
    case 'SPACING':
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case 'LOGO':
      return "bg-red-100 text-red-800 hover:bg-red-100";
    case 'ICON':
      return "bg-violet-100 text-violet-800 hover:bg-violet-100";
    case 'LAYOUT':
      return "bg-cyan-100 text-cyan-800 hover:bg-cyan-100";
    case 'GENERAL':
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

interface EnhancedBrandGuidelineDetailsProps {
  id: string;
}

export function EnhancedBrandGuidelineDetails({ id }: EnhancedBrandGuidelineDetailsProps) {
  const { brandGuideline, isLoading, error, startAnalysis, deleteBrandGuideline } = useBrandGuideline(id);
  const [isStartingAnalysis, setIsStartingAnalysis] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string | null>(null);

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
      router.push('/brand-setup');
    } catch (error) {
      console.error('Error deleting brand guideline:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Get status badge color
  const getStatusBadge = (status: BrandGuidelineStatus, processingStatus: ProcessingStatus) => {
    if (status === BrandGuidelineStatus.DRAFT) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-800">Draft</Badge>;
    }

    if (status === BrandGuidelineStatus.PROCESSING) {
      return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Processing</Badge>;
    }

    if (status === BrandGuidelineStatus.COMPLETED) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
    }

    if (status === BrandGuidelineStatus.FAILED) {
      return <Badge variant="destructive">Failed</Badge>;
    }

    return <Badge variant="outline">Unknown</Badge>;
  };

  // Group rules by category
  const groupRulesByCategory = () => {
    if (!brandGuideline?.brandRules) return {};

    const grouped = brandGuideline.brandRules.reduce((acc, rule) => {
      const category = rule.category as RuleCategory;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(rule);
      return acc;
    }, {} as Record<RuleCategory, any[]>);

    // Set active tab to the first category if not set
    if (!activeTab && Object.keys(grouped).length > 0) {
      setActiveTab(Object.keys(grouped)[0]);
    }

    return grouped;
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

  const rulesByCategory = groupRulesByCategory();
  const canStartAnalysis = brandGuideline.status !== BrandGuidelineStatus.PROCESSING;

  return (
    <div className="space-y-8">
      {/* Header with brand name and actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-sm border border-blue-100 animate-in fade-in duration-500">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild className="bg-white hover:bg-white/90">
            <Link href="/brand-setup">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{brandGuideline.name}</h1>
            <div className="flex items-center mt-1 space-x-2">
              {getStatusBadge(brandGuideline.status as BrandGuidelineStatus, brandGuideline.processingStatus as ProcessingStatus)}
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
                  This action cannot be undone. This will permanently delete the brand guideline
                  and all associated data.
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
                    'Delete'
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

      {/* Processing status message */}
      {brandGuideline.processingMessage && (
        <Alert
          variant={brandGuideline.processingStatus === ProcessingStatus.FAILED ? "destructive" : "default"}
          className={cn(
            "animate-in fade-in duration-500",
            brandGuideline.processingStatus === ProcessingStatus.PROCESSING ? "bg-amber-50 border-amber-200" :
            brandGuideline.processingStatus === ProcessingStatus.COMPLETED ? "bg-green-50 border-green-200" :
            brandGuideline.processingStatus === ProcessingStatus.FAILED ? "bg-red-50 border-red-200" : ""
          )}
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {brandGuideline.processingStatus === ProcessingStatus.PROCESSING
              ? "Processing"
              : brandGuideline.processingStatus === ProcessingStatus.COMPLETED
              ? "Completed"
              : brandGuideline.processingStatus === ProcessingStatus.FAILED
              ? "Failed"
              : "Status"}
          </AlertTitle>
          <AlertDescription>{brandGuideline.processingMessage}</AlertDescription>
        </Alert>
      )}

      {/* Brand details card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <Badge variant="outline" className="flex items-center bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
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
                    <Badge variant="outline" className="flex items-center bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
                      <Image className="mr-1 h-3 w-3" />
                      {brandGuideline.designImages.length} Design Images
                    </Badge>
                  )}

                  {brandGuideline.customRules && brandGuideline.customRules.length > 0 && (
                    <Badge variant="outline" className="flex items-center bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors">
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
        {brandGuideline.status === BrandGuidelineStatus.COMPLETED && brandGuideline.brandRules && brandGuideline.brandRules.length > 0 && (
          <Card className="md:col-span-2 animate-in fade-in duration-500 slide-in-from-right-5">
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
                These rules were automatically generated based on your brand guidelines.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue={activeTab || Object.keys(rulesByCategory)[0]} className="space-y-6">
                <TabsList className="flex flex-wrap bg-slate-50 p-1">
                  {Object.keys(rulesByCategory).map((category) => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      className={cn(
                        "flex items-center data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200",
                        "data-[state=active]:text-indigo-700"
                      )}
                      onClick={() => setActiveTab(category)}
                    >
                      {getCategoryIcon(category)}
                      <span className="ml-1.5">{category.charAt(0) + category.slice(1).toLowerCase()}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(rulesByCategory).map(([category, rules]) => (
                  <TabsContent key={category} value={category} className="space-y-4 pt-2">
                    <div
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500"
                      style={{
                        animationFillMode: 'both',
                        animationDelay: '150ms'
                      }}
                    >
                      {rules.map((rule, index) => (
                        <div
                          key={rule.id}
                          className={cn(
                            "border rounded-lg p-4 shadow-sm transition-all duration-300 hover:shadow-md",
                            getCategoryColor(category)
                          )}
                          style={{
                            animationDelay: `${150 + (index * 50)}ms`,
                            animationFillMode: 'both'
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-gray-900 flex items-center">
                              {rule.name}
                            </h3>
                            <Badge variant="secondary" className={cn("font-medium", getCategoryBadgeColor(category))}>
                              {getCategoryIcon(category)}
                              <span className="ml-1">{category.charAt(0) + category.slice(1).toLowerCase()}</span>
                            </Badge>
                          </div>

                          {rule.value && (
                            <div className="mt-2">
                              {category === 'COLOR' ? (
                                <div className="flex items-center space-x-2">
                                  <div
                                    className="w-6 h-6 rounded-full border border-gray-200"
                                    style={{ backgroundColor: rule.value }}
                                  />
                                  <p className="text-sm font-medium">{rule.value}</p>
                                </div>
                              ) : (
                                <p className="text-sm font-medium text-gray-800">{rule.value}</p>
                              )}
                            </div>
                          )}

                          {rule.description && (
                            <p className="text-sm mt-2 pt-2 border-t border-gray-100 text-gray-600">
                              {rule.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
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
            <CardDescription>
              Custom rules you provided for your brand.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {brandGuideline.customRules.map((rule) => (
                <div key={rule.id} className="border rounded-lg p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900">{rule.name}</h3>
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
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
            <CardDescription>
              Design examples you provided for your brand.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {brandGuideline.designImages.map((image, index) => (
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
                        <p className="text-xs text-gray-600 mt-1">
                          {image.description}
                        </p>
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
