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
import { AlertCircle, ArrowLeft, Edit, FileText, Image, Loader2, Play, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useBrandGuideline } from "../hooks";
import { BrandGuidelineStatus, ProcessingStatus, RuleCategory } from "../types";

interface BrandGuidelineDetailsProps {
  id: string;
}

export function BrandGuidelineDetails({ id }: BrandGuidelineDetailsProps) {
  const { brandGuideline, isLoading, error, startAnalysis, deleteBrandGuideline } = useBrandGuideline(id);
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
      return <Badge variant="outline">Draft</Badge>;
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

    return brandGuideline.brandRules.reduce((acc, rule) => {
      const category = rule.category as RuleCategory;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(rule);
      return acc;
    }, {} as Record<RuleCategory, any[]>);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/brand-setup">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{brandGuideline.name}</h1>
          {getStatusBadge(brandGuideline.status as BrandGuidelineStatus, brandGuideline.processingStatus as ProcessingStatus)}
        </div>

        <div className="flex items-center space-x-2">
          {/* Edit Button */}
          <Button variant="outline" asChild>
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

      {brandGuideline.processingMessage && (
        <Alert variant={brandGuideline.processingStatus === ProcessingStatus.FAILED ? "destructive" : "default"}>
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

      <Card>
        <CardHeader>
          <CardTitle>Brand Guideline Details</CardTitle>
          <CardDescription>
            Created on {new Date(brandGuideline.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Description</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {brandGuideline.description || "No description provided."}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium">Resources</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {brandGuideline.pdfPath && (
                  <Badge variant="outline" className="flex items-center">
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
                  <Badge variant="outline" className="flex items-center">
                    <Image className="mr-1 h-3 w-3" />
                    {brandGuideline.designImages.length} Design Images
                  </Badge>
                )}

                {brandGuideline.customRules && brandGuideline.customRules.length > 0 && (
                  <Badge variant="outline" className="flex items-center">
                    {brandGuideline.customRules.length} Custom Rules
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {brandGuideline.status === BrandGuidelineStatus.COMPLETED && brandGuideline.brandRules && brandGuideline.brandRules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Brand Rules</CardTitle>
            <CardDescription>
              AI-generated rules based on your brand guidelines.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="COLOR" className="space-y-4">
              <TabsList className="flex flex-wrap">
                {Object.keys(rulesByCategory).map((category) => (
                  <TabsTrigger key={category} value={category}>
                    {category.charAt(0) + category.slice(1).toLowerCase()}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(rulesByCategory).map(([category, rules]) => (
                <TabsContent key={category} value={category} className="space-y-4">
                  {rules.map((rule) => (
                    <div key={rule.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{rule.name}</h3>
                        <Badge variant="outline">{category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {rule.value}
                      </p>
                      {rule.description && (
                        <p className="text-sm mt-2 border-t pt-2">
                          {rule.description}
                        </p>
                      )}
                    </div>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {brandGuideline.customRules && brandGuideline.customRules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Custom Rules</CardTitle>
            <CardDescription>
              Custom rules you provided for your brand.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {brandGuideline.customRules.map((rule) => (
                <div key={rule.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{rule.name}</h3>
                    <Badge variant="outline">{rule.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {rule.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {brandGuideline.designImages && brandGuideline.designImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Design Examples</CardTitle>
            <CardDescription>
              Design examples you provided for your brand.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {brandGuideline.designImages.map((image) => (
                <div key={image.id} className="border rounded-md overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.name || "Design example"}
                    className="w-full h-48 object-cover"
                  />
                  {image.name && (
                    <div className="p-2">
                      <h3 className="font-medium text-sm">{image.name}</h3>
                      {image.description && (
                        <p className="text-xs text-muted-foreground mt-1">
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
