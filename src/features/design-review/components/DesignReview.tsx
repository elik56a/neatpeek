"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomLoader } from "@/components/ui/custom-loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDataContext } from "@/providers";
import { AlertCircle, ArrowLeft, Image as ImageIcon, Link2 } from "lucide-react";
import { GuidelineSelector } from "./GuidelineSelector";
import { useState, useEffect } from "react";
import { useDesignReview } from "../hooks";
import { useRouter } from "next/navigation";
import { AnalysisResults } from "./AnalysisResults";
import { FigmaConnectPrompt } from "./FigmaConnectPrompt";
import { FrameSelector } from "./FrameSelector";
import { RecheckResults } from "./RecheckResults";
import { BrandGuideline } from "@/features/brand-setup/types";


interface DesignReviewProps {
  brandId: string;
  allGuidelines?: BrandGuideline[];
  onGuidelineChange?: (value: string) => void;
}

/**
 * Main component for the Design Review feature
 */
export function DesignReview({
  brandId: initialBrandId,
  allGuidelines,
  onGuidelineChange,
}: DesignReviewProps) {
  const { company, user, brands } = useAppDataContext();
  const router = useRouter();
  const [brandId, setBrandId] = useState(initialBrandId);
  const [inputMode, setInputMode] = useState<"figma" | "image">("figma");
  // Use either provided guidelines or brands from context
  const guidelines = allGuidelines || brands || [];
  const [figmaUrl, setFigmaUrl] = useState("");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [step, setStep] = useState<"input" | "frames" | "results" | "recheck">("input");

  const {
    isLoading,
    error,
    frames,
    // fileKey not used directly
    fileName,
    analysisResult,
    recheckResult,
    getFrames,
    toggleFrameSelection,
    selectAllFrames,
    deselectAllFrames,
    reviewDesign,
    recheckDesign,
    reset,
  } = useDesignReview();

  // Handle Figma URL submission
  const handleFigmaUrlSubmit = async () => {
    if (!figmaUrl) return;

    const result = await getFrames(figmaUrl);
    if (result) {
      setStep("frames");
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedImages(files);

    // Create preview URLs
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(previewUrls);
  };

  // Handle image review
  const handleImageReview = async () => {
    if (uploadedImages.length === 0) return;

    const input = {
      images: uploadedImages,
      brandId, // Use the current selected brandId
    };

    const result = await reviewDesign(input);
    if (result) {
      setStep("results");
    }
  };

  // Handle frame review
  const handleFrameReview = async () => {
    const selectedFrames = frames.filter(frame => frame.selected);
    if (selectedFrames.length === 0) return;

    // Get the selected frame IDs
    const selectedFrameIds = selectedFrames.map(frame => frame.frameId);

    const input = {
      figmaUrl,
      brandId, // Use the current selected brandId
      selectedFrameIds, // Pass the selected frame IDs to the API
    };

    const result = await reviewDesign(input);
    if (result && result.reviewId) {
      // Update the URL to include the review ID
      router.replace(`/design-review/${result.reviewId}`);
      setStep("results");
    }
  };

  // Handle recheck
  const handleRecheck = async () => {
    if (!user?.id) {
      console.error("User ID is required for recheck");
      return;
    }

    const input = {
      figmaUrl,
      brandId, // Use the current selected brandId
      userId: user.id, // Add the user ID
    };

    const result = await recheckDesign(input);
    if (result && result.reviewId) {
      // Update the URL to include the review ID
      router.replace(`/design-review/${result.reviewId}`);
      setStep("recheck");
    }
  };

  // Handle reset
  const handleReset = () => {
    reset();
    setFigmaUrl("");
    setUploadedImages([]);
    setImagePreviewUrls([]);
    setStep("input");
  };

  // If user doesn't have a Figma token and is trying to use Figma, show the connect prompt
  if (inputMode === "figma" && !user?.figmaAccessToken && step === "input") {
    return <FigmaConnectPrompt />;
  }

  // Loading state - only show full-page loader for initial loading (input step)
  // For other steps, we'll show skeletons in place
  if (isLoading && step === "input") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <CustomLoader size="lg" />
        <p className="mt-4 text-lg font-medium">Loading Figma frames...</p>
        <p className="text-sm text-muted-foreground mt-2">This may take a moment...</p>
      </div>
    );
  }

  // Input step - Show the design input options
  if (step === "input") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Design Review</h1>
            <p className="text-muted-foreground mt-1">
              Check designs against {company?.name || "your"} brand guidelines
            </p>
          </div>
          <div className="ml-auto">
            <GuidelineSelector
              guidelines={guidelines}
              selectedId={brandId}
              onSelect={id => {
                setBrandId(id);
                if (onGuidelineChange) {
                  onGuidelineChange(id);
                }
              }}
              companyName={company?.name}
            />
          </div>
        </div>

        <Card className="border-primary/20 shadow-sm">
          <CardContent className="pt-6">
            <Tabs
              defaultValue="figma"
              value={inputMode}
              onValueChange={value => setInputMode(value as "figma" | "image")}
              className="w-full"
            >
              <TabsList className="relative w-full mb-6 grid grid-cols-2">
                <TabsTrigger
                  value="figma"
                  className="relative z-10 overflow-hidden group data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <span className="relative z-10 flex items-center">
                    <Link2 className="w-4 h-4 mr-2" />
                    Review Figma Design
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="image"
                  className="relative z-10 overflow-hidden group data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <span className="relative z-10 flex items-center">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Review Design Images
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="figma" className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="figmaUrl">Figma Design URL</Label>
                  <div className="relative">
                    <Input
                      id="figmaUrl"
                      placeholder="https://www.figma.com/file/..."
                      type="url"
                      value={figmaUrl}
                      onChange={e => setFigmaUrl(e.target.value)}
                      className="pl-10 hover:border-primary/50 transition-colors duration-200 focus-visible:ring-primary/20"
                    />
                    <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Paste a link to your Figma design file to review it for brand consistency
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleFigmaUrlSubmit}
                    disabled={isLoading || !figmaUrl}
                    className="mt-4 hover:shadow-md transition-all duration-200 px-6"
                  >
                    {isLoading ? (
                      <>
                        <CustomLoader size="sm" className="mr-2" />
                        Loading Figma Frames...
                      </>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="image" className="space-y-4">
                <div className="grid gap-4">
                  <Label htmlFor="imageUpload">Upload Design Images</Label>
                  <div
                    className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer hover:shadow-md transition-all duration-200 bg-muted/20"
                    onClick={() => document.getElementById("imageUpload")?.click()}
                  >
                    <input
                      id="imageUpload"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <div className="flex flex-col items-center">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <ImageIcon className="h-8 w-8 text-primary" />
                      </div>
                      <p className="font-medium text-lg">Upload your design images</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Drag and drop or click to upload
                      </p>
                    </div>
                  </div>

                  {imagePreviewUrls.length > 0 && (
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium">Uploaded Images ({imagePreviewUrls.length})</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
                            setUploadedImages([]);
                            setImagePreviewUrls([]);
                          }}
                          className="text-xs"
                        >
                          Clear All
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {imagePreviewUrls.map((url, index) => (
                          <div
                            key={index}
                            className="border rounded-md overflow-hidden hover:shadow-md transition-all duration-200 group relative bg-background"
                          >
                            <div className="relative aspect-video">
                              <img
                                src={url}
                                alt={`Design ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 flex items-center justify-center border text-destructive hover:bg-destructive hover:text-white hover:border-destructive transform hover:scale-110 transition-all duration-200"
                                onClick={e => {
                                  e.stopPropagation();
                                  // Remove image
                                  URL.revokeObjectURL(url);
                                  setUploadedImages(prev => prev.filter((_, i) => i !== index));
                                  setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </div>
                            <div className="p-3">
                              <p className="font-medium truncate">Design {index + 1}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleImageReview}
                    disabled={isLoading || uploadedImages.length === 0}
                    className="mt-4 hover:shadow-md transition-all duration-200 px-6"
                  >
                    {isLoading ? (
                      <>
                        <CustomLoader size="sm" className="mr-2" />
                        Reviewing Images...
                      </>
                    ) : (
                      "Review Images"
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-destructive">
            <CardHeader className="pb-2">
              <CardTitle className="text-destructive flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error.message}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Frames step - Show the frame selector
  if (step === "frames") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={handleReset} className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Select Frames</h1>
          </div>
          <p className="text-muted-foreground">{fileName || "Figma Design"}</p>
        </div>

        <FrameSelector
          frames={frames}
          isLoading={isLoading}
          onToggleFrame={toggleFrameSelection}
          onSelectAll={selectAllFrames}
          onDeselectAll={deselectAllFrames}
          onAnalyze={handleFrameReview}
        />

        {error && (
          <Card className="border-destructive">
            <CardHeader className="pb-2">
              <CardTitle className="text-destructive flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error.message}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Results step - Show the analysis results
  if (step === "results") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={handleReset} className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Review Results</h1>
          </div>
          <p className="text-muted-foreground">{fileName || "Design Review"}</p>
        </div>

        <Separator />

        {isLoading ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="h-8 w-48 bg-muted rounded animate-pulse" />
              <div className="h-8 w-24 bg-muted rounded animate-pulse" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="border rounded-md p-4 space-y-3">
                    <div className="h-5 w-full bg-muted rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="border rounded-md p-4 space-y-3">
                    <div className="h-5 w-full bg-muted rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : analysisResult ? (
          <AnalysisResults result={analysisResult} onRecheck={handleRecheck} />
        ) : (
          <div className="text-center p-8 border border-dashed rounded-lg">
            <p className="text-muted-foreground">No analysis results available.</p>
          </div>
        )}

        {error && (
          <Card className="border-destructive">
            <CardHeader className="pb-2">
              <CardTitle className="text-destructive flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error.message}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Recheck step - Show the recheck results
  if (step === "recheck") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={handleReset} className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Recheck Results</h1>
          </div>
          <p className="text-muted-foreground">{fileName || "Design Recheck"}</p>
        </div>

        <Separator />

        {recheckResult && <RecheckResults result={recheckResult} onRecheck={handleReset} />}

        {error && (
          <Card className="border-destructive">
            <CardHeader className="pb-2">
              <CardTitle className="text-destructive flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error.message}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Default fallback
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <p>Something went wrong. Please try again.</p>
      <Button onClick={handleReset} className="mt-4">
        Start Over
      </Button>
    </div>
  );
}
