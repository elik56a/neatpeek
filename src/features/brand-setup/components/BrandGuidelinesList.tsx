"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowRight, Building, FileText, Image, Loader2, Plus, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useBrandGuidelines } from "../hooks";
import { BrandGuidelineStatus, ProcessingStatus } from "../types";

export function BrandGuidelinesList() {
  const { brandGuidelines, isLoading, error, refetch, deleteBrandGuideline } = useBrandGuidelines();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Handle delete confirmation
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteBrandGuideline(id);
    setDeletingId(null);
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Brand Guidelines</h2>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            New Brand Guideline
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Brand Guidelines</h2>
        <Button asChild>
          <Link href="/brand-setup/new">
            <Plus className="mr-2 h-4 w-4" />
            New Brand Guideline
          </Link>
        </Button>
      </div>

      {brandGuidelines.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Brand Guidelines</CardTitle>
            <CardDescription>
              You haven't created any brand guidelines yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Create your first brand guideline to get started with AI-powered brand analysis.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/brand-setup/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Brand Guideline
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brandGuidelines.map((guideline) => (
            <Card key={guideline.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="truncate">{guideline.name}</CardTitle>
                  {getStatusBadge(guideline.status as BrandGuidelineStatus, guideline.processingStatus as ProcessingStatus)}
                </div>
                <CardDescription className="flex flex-col gap-1">
                  <span>{new Date(guideline.createdAt).toLocaleDateString()}</span>
                  {guideline.company && (
                    <span className="flex items-center text-xs">
                      <Building className="mr-1 h-3 w-3" />
                      {guideline.company.name}
                    </span>
                  )}
                  {guideline.team && (
                    <span className="flex items-center text-xs">
                      <Users className="mr-1 h-3 w-3" />
                      {guideline.team.name}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {guideline.description || "No description provided."}
                  </p>

                  <div className="flex space-x-2">
                    {guideline.pdfPath && (
                      <Badge variant="outline" className="flex items-center">
                        <FileText className="mr-1 h-3 w-3" />
                        PDF
                      </Badge>
                    )}

                    {guideline.designImages && guideline.designImages.length > 0 && (
                      <Badge variant="outline" className="flex items-center">
                        <Image className="mr-1 h-3 w-3" />
                        {guideline.designImages.length} Images
                      </Badge>
                    )}

                    {guideline.customRules && guideline.customRules.length > 0 && (
                      <Badge variant="outline" className="flex items-center">
                        {guideline.customRules.length} Rules
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Brand Guideline</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this brand guideline? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {}}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(guideline.id)}
                        disabled={deletingId === guideline.id}
                      >
                        {deletingId === guideline.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button asChild>
                  <Link href={`/brand-setup/${guideline.id}`}>
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
