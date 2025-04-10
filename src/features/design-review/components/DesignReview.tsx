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
import { useState } from "react";
import { useDesignReview } from "../hooks";
import { DesignAnalysisInput, DesignRecheckInput } from "../types";
import { AnalysisResults } from "./AnalysisResults";
import { FigmaConnectPrompt } from "./FigmaConnectPrompt";
import { FrameSelector } from "./FrameSelector";
import { RecheckResults } from "./RecheckResults";

interface DesignReviewProps {
  brandId: string;
}

/**
 * Main component for the Design Review feature
 */
export function DesignReview({ brandId }: DesignReviewProps) {
  const { company, user } = useAppDataContext();
  const [inputMode, setInputMode] = useState<"figma" | "image">("figma");
  const [figmaUrl, setFigmaUrl] = useState("");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [step, setStep] = useState<"input" | "frames" | "results" | "recheck">("input");
  
  const {
    isLoading,
    error,
    frames,
    fileKey,
    fileName,
    analysisResult,
    recheckResult,
    getFrames,
    toggleFrameSelection,
    selectAllFrames,
    deselectAllFrames,
    analyzeDesign,
    recheckDesign,
    reset
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
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    setUploadedImages(files);
    
    // Create preview URLs
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(previewUrls);
  };
  
  // Handle image analysis
  const handleImageAnalysis = async () => {
    if (uploadedImages.length === 0) return;
    
    const input: DesignAnalysisInput = {
      images: uploadedImages,
      brandId
    };
    
    const result = await analyzeDesign(input);
    if (result) {
      setStep("results");
    }
  };
  
  // Handle frame analysis
  const handleFrameAnalysis = async () => {
    const selectedFrames = frames.filter(frame => frame.selected);
    if (selectedFrames.length === 0) return;
    
    const input: DesignAnalysisInput = {
      figmaUrl,
      brandId
    };
    
    const result = await analyzeDesign(input);
    if (result) {
      setStep("results");
    }
  };
  
  // Handle recheck
  const handleRecheck = async () => {
    const input: DesignRecheckInput = {
      figmaUrl,
      brandId
    };
    
    const result = await recheckDesign(input);
    if (result) {
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
  
  // Render input step
  const renderInputStep = () => {
    // If user doesn't have a Figma token, show the connect prompt
    if (inputMode === "figma" && !user?.figmaAccessToken) {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Design Review</h1>
            <p className="text-muted-foreground">
              Checking designs against {company?.name || "your"} brand guidelines
            </p>
          </div>
          
          <FigmaConnectPrompt 
            user={user!} 
            onConnect={() => window.location.reload()}
          />
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Design Review</h1>
          <p className="text-muted-foreground">
            Checking designs against {company?.name || "your"} brand guidelines
          </p>
        </div>
        
        <Tabs 
          defaultValue="figma" 
          value={inputMode} 
          onValueChange={(value) => setInputMode(value as "figma" | "image")} 
          className="w-full"
        >
          <TabsList className="relative">
            <TabsTrigger value="figma" className="relative z-10 overflow-hidden group">
              <span className="relative z-10 flex items-center">
                <Link2 className="w-4 h-4 mr-2" />
                Analyze Figma Design
              </span>
            </TabsTrigger>
            <TabsTrigger value="image" className="relative z-10 overflow-hidden group">
              <span className="relative z-10 flex items-center">
                <ImageIcon className="w-4 h-4 mr-2" />
                Analyze Design Images
              </span>
            </TabsTrigger>
            <div 
              className="absolute h-full bottom-0 bg-primary/10 transition-all duration-300 ease-out rounded"
              style={{ 
                left: inputMode === "figma" ? "0%" : "50%", 
                width: "50%" 
              }}
            />
          </TabsList>
          
          <TabsContent value="figma" className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="figmaUrl">Figma Design URL</Label>
              <Input
                id="figmaUrl"
                placeholder="https://www.figma.com/file/..."
                type="url"
                value={figmaUrl}
                onChange={(e) => setFigmaUrl(e.target.value)}
                className="hover:border-primary/50 transition-colors duration-200"
              />
              <p className="text-sm text-muted-foreground">
                Paste a link to your Figma design file to analyze it for brand consistency
              </p>
            </div>
            <Button 
              onClick={handleFigmaUrlSubmit} 
              disabled={isLoading || !figmaUrl}
              className="mt-4 hover:shadow-md transition-all duration-200"
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
          </TabsContent>
          
          <TabsContent value="image" className="space-y-4">
            <div className="grid gap-4">
              <Label htmlFor="imageUpload">Upload Design Images</Label>
              <div 
                className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer hover:shadow-md transition-all duration-200"
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
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <p className="font-medium">Upload your design images</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Drag and drop or click to upload
                  </p>
                </div>
              </div>
              
              {imagePreviewUrls.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="border rounded-md overflow-hidden hover:shadow-md transition-all duration-200 group relative">
                      <div className="relative">
                        <img 
                          src={url} 
                          alt={`Design ${index + 1}`} 
                          className="w-full h-48 object-cover"
                        />
                        <button
                          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 flex items-center justify-center border text-destructive hover:bg-destructive hover:text-white hover:border-destructive transform hover:scale-110 transition-all duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Remove image
                            URL.revokeObjectURL(url);
                            setUploadedImages(prev => prev.filter((_, i) => i !== index));
                            setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              )}
            </div>
            
            <Button 
              onClick={handleImageAnalysis} 
              disabled={isLoading || uploadedImages.length === 0}
              className="mt-4 hover:shadow-md transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <CustomLoader size="sm" className="mr-2" />
                  Analyzing Images...
                </>
              ) : (
                "Analyze Images"
              )}
            </Button>
          </TabsContent>
        </Tabs>
        
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
  };
  
  // Render frames step
  const renderFramesStep = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleReset}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Select Frames</h1>
        </div>
        <p className="text-muted-foreground">
          {fileName || "Figma Design"}
        </p>
      </div>
      
      <FrameSelector 
        frames={frames}
        isLoading={isLoading}
        onToggleFrame={toggleFrameSelection}
        onSelectAll={selectAllFrames}
        onDeselectAll={deselectAllFrames}
        onAnalyze={handleFrameAnalysis}
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
  
  // Render results step
  const renderResultsStep = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleReset}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Analysis Results</h1>
        </div>
        <p className="text-muted-foreground">
          {fileName || "Design Analysis"}
        </p>
      </div>
      
      <Separator />
      
      {analysisResult && (
        <AnalysisResults 
          result={analysisResult}
          onRecheck={handleRecheck}
        />
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
  
  // Render recheck step
  const renderRecheckStep = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleReset}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Recheck Results</h1>
        </div>
        <p className="text-muted-foreground">
          {fileName || "Design Recheck"}
        </p>
      </div>
      
      <Separator />
      
      {recheckResult && (
        <RecheckResults 
          result={recheckResult}
          onRecheck={handleReset}
        />
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
  
  // Render loading state
  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <CustomLoader size="lg" />
      <p className="mt-4 text-lg font-medium">
        {step === "frames" ? "Loading Figma frames..." :
         step === "results" ? "Analyzing designs..." :
         step === "recheck" ? "Rechecking designs..." :
         "Loading..."}
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        This may take a moment...
      </p>
    </div>
  );
  
  // Render the appropriate step
  if (isLoading) {
    return renderLoading();
  }
  
  switch (step) {
    case "input":
      return renderInputStep();
    case "frames":
      return renderFramesStep();
    case "results":
      return renderResultsStep();
    case "recheck":
      return renderRecheckStep();
    default:
      return renderInputStep();
  }
}
