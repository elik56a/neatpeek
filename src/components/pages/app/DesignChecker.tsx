"use client";

import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Check,
  Copy,
  AlertCircle,
  Image as ImageIcon,
  FileText,
  Link2,
  ExternalLink,
  X,
  LineChart,
  BarChart3,
  Trash2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import { CustomLoader } from "@/components/ui/custom-loader";

interface AnalysisResult {
  brandConsistencyScore: number;
  colorMatchScore: number;
  typographyScore: number;
  spacingScore: number;
  errors: string[];
  warnings: string[];
  figmaLink?: string;
  commentCount?: number;
  designImages?: { imageUrl: string; issues: string[] }[];
}

// Type for design type
type DesignType = "web" | "mobile" | "email" | "social" | "print" | "logo" | null;

const designTypes = [
  { id: "web", name: "Web Design", icon: <LineChart className="h-12 w-12" /> },
  { id: "mobile", name: "Mobile App", icon: <ImageIcon className="h-12 w-12" /> },
  { id: "email", name: "Email Design", icon: <FileText className="h-12 w-12" /> },
  { id: "social", name: "Social Media", icon: <Link2 className="h-12 w-12" /> },
  { id: "print", name: "Print Design", icon: <FileText className="h-12 w-12" /> },
  { id: "logo", name: "Logo & Branding", icon: <BarChart3 className="h-12 w-12" /> },
];

// Function to extract hex colors from strings
const extractHexColors = (text: string): string[] => {
  const hexRegex = /#([0-9A-F]{6})/gi;
  const matches = text.match(hexRegex);
  return matches ? matches : [];
};

const DesignChecker = () => {
  const { toast } = useToast();
  const [figmaUrl, setFigmaUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [value, setValue] = useState("figma");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [designType, setDesignType] = useState<DesignType>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  useEffect(() => {
    // Smooth scroll to results when analysis is complete
    if (analysisResult && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [analysisResult]);

  const handleFigmaAnalysis = async () => {
    if (!figmaUrl) {
      toast({
        title: "Missing URL",
        description: "Please enter a Figma URL to analyze",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setAnalysisResult(null);

    try {
      // This would be an actual API call in production
      // const response = await fetch('/api/analyze-figma', {
      //   method: 'POST',
      //   body: JSON.stringify({ figmaUrl, designType }),
      //   headers: { 'Content-Type': 'application/json' }
      // });
      // const data = await response.json();

      // For now, we'll simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock analysis result
      setAnalysisResult({
        brandConsistencyScore: 85,
        colorMatchScore: 72,
        typographyScore: 92,
        spacingScore: 78,
        errors: [
          "Primary color #3A86FF doesn't match brand color #8344FF",
          "Heading font 'Montserrat' doesn't match brand font 'Inter'",
          "Logo placement doesn't follow brand guidelines",
        ],
        warnings: [
          "Button radius (8px) differs from standard (6px)",
          "Secondary colors may need adjustment for better contrast",
        ],
        figmaLink: figmaUrl,
        commentCount: 4,
        designImages: [
          {
            imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
            issues: ["Primary color #3A86FF doesn't match brand color #8344FF"],
          },
          {
            imageUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
            issues: ["Heading font 'Montserrat' doesn't match brand font 'Inter'"],
          },
        ],
      });
    } catch (error) {
      console.error("Error analyzing Figma design:", error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your Figma design. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      // Create URLs for previews
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));

      setUploadedImages(files);
      setImagePreviewUrls(newPreviewUrls);
    }
  };

  const removeImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);

    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageAnalysis = async () => {
    if (uploadedImages.length === 0) {
      toast({
        title: "No images",
        description: "Please upload at least one image to analyze",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setAnalysisResult(null);

    try {
      // This would be an actual API call in production
      // const formData = new FormData();
      // uploadedImages.forEach((image, index) => {
      //   formData.append(`image${index}`, image);
      // });
      // formData.append('designType', designType || 'general');
      //
      // const response = await fetch('/api/analyze-design', {
      //   method: 'POST',
      //   body: formData
      // });
      // const data = await response.json();

      // For now, we'll simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock analysis result
      setAnalysisResult({
        brandConsistencyScore: 65,
        colorMatchScore: 58,
        typographyScore: 82,
        spacingScore: 70,
        errors: [
          "Primary color #3A86FF doesn't match brand color #8344FF",
          "Heading font 'Montserrat' doesn't match brand font 'Inter'",
          "Incorrect logo version used in header",
        ],
        warnings: [
          "Button styles inconsistent across designs",
          "Padding in content sections varies too much",
        ],
        designImages: uploadedImages.map((_, index) => ({
          imageUrl: imagePreviewUrls[index],
          issues: ["Color palette mismatch", "Typography inconsistency"],
        })),
      });
    } catch (error) {
      console.error("Error analyzing images:", error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(JSON.stringify(analysisResult, null, 2));
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "The analysis result has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const renderScoreCircle = (score: number, label: string) => (
    <Card className="hover-scale">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent className="text-center py-4">
        <div className="relative h-24 w-24 mx-auto">
          <div
            className={cn(
              "absolute top-0 left-0 h-full w-full rounded-full",
              "bg-muted overflow-hidden"
            )}
          >
            <div
              className={cn(
                "absolute top-0 left-0 h-full rounded-full transform-gpu origin-left",
                score > 70
                  ? "bg-gradient-to-r from-green-500 to-green-600"
                  : score > 40
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                    : "bg-gradient-to-r from-red-500 to-red-600"
              )}
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

  // Design Type Selection Screen
  if (!designType) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Design Checker</h1>
          <p className="text-muted-foreground mt-2">
            Select the type of design you want to analyze
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {designTypes.map(type => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: designTypes.indexOf(type) * 0.1 }}
            >
              <Card
                key={type.id}
                className="hover-scale cursor-pointer hover:border-primary/50 transition-all duration-200"
                onClick={() => setDesignType(type.id as DesignType)}
              >
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    {type.icon}
                  </div>
                  <h3 className="text-xl font-medium">{type.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Analyze {type.name.toLowerCase()} against your brand guidelines
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Design Checker</h1>
        <p className="text-muted-foreground">
          Checking{" "}
          <span className="font-medium">
            {designType.charAt(0).toUpperCase() + designType.slice(1)} Design
          </span>{" "}
          against your brand guidelines
        </p>
        <Button variant="outline" className="mt-2" onClick={() => setDesignType(null)}>
          Change Design Type
        </Button>
      </div>

      <Tabs defaultValue="figma" value={value} onValueChange={setValue} className="w-full">
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
              left: value === "figma" ? "0%" : "50%",
              width: "50%",
            }}
          />
        </TabsList>

        <AnimatePresence mode="wait">
          {value === "figma" && (
            <TabsContent value="figma" className="space-y-4" forceMount>
              <motion.div initial="hidden" animate="visible" exit="exit" variants={tabVariants}>
                <div className="grid gap-2">
                  <Label htmlFor="figmaUrl">Figma Design URL</Label>
                  <Input
                    id="figmaUrl"
                    placeholder="https://www.figma.com/file/..."
                    type="url"
                    value={figmaUrl}
                    onChange={e => setFigmaUrl(e.target.value)}
                    className="hover:border-primary/50 transition-colors duration-200"
                  />
                  <p className="text-sm text-muted-foreground">
                    Paste a link to your Figma design file to analyze it for brand consistency
                  </p>
                </div>
                <Button
                  onClick={handleFigmaAnalysis}
                  disabled={loading}
                  className="mt-4 hover-scale"
                >
                  {loading ? (
                    <>
                      <CustomLoader size="sm" className="mr-2" />
                      Analyzing Figma Design...
                    </>
                  ) : (
                    "Analyze Figma Design"
                  )}
                </Button>
              </motion.div>
            </TabsContent>
          )}

          {value === "image" && (
            <TabsContent value="image" className="space-y-4" forceMount>
              <motion.div initial="hidden" animate="visible" exit="exit" variants={tabVariants}>
                <div className="grid gap-4">
                  <Label htmlFor="imageUpload">Upload Design Images</Label>
                  <div
                    className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer hover-scale"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
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
                        Drag and drop or click to browse
                      </p>
                    </div>
                  </div>

                  {imagePreviewUrls.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      {imagePreviewUrls.map((url, index) => (
                        <div
                          key={index}
                          className="border rounded-md overflow-hidden hover-scale group relative"
                        >
                          <div className="relative">
                            <img
                              src={url}
                              alt={`Design ${index + 1}`}
                              className="w-full h-48 object-cover"
                            />
                            <button
                              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 flex items-center justify-center border text-destructive hover:bg-destructive hover:text-white hover:border-destructive transform hover:scale-110 transition-all duration-200"
                              onClick={e => removeImage(index, e)}
                              aria-label={`Remove design ${index + 1}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="p-2 text-sm truncate">
                            {uploadedImages[index]?.name || `Design ${index + 1}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={handleImageAnalysis}
                    disabled={loading || imagePreviewUrls.length === 0}
                    className="mt-2 hover-scale"
                  >
                    {loading ? (
                      <>
                        <CustomLoader size="sm" className="mr-2" />
                        Analyzing Designs...
                      </>
                    ) : (
                      "Analyze Design Images"
                    )}
                  </Button>
                </div>
              </motion.div>
            </TabsContent>
          )}
        </AnimatePresence>
      </Tabs>

      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 text-center">
          <div className="inline-flex items-center justify-center p-8">
            <CustomLoader size="xl" />
          </div>
          <h3 className="text-xl font-medium mt-6">
            We're checking your design against your brand guidelines
          </h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Our AI is analyzing your {value === "figma" ? "Figma design" : "images"} for color,
            typography, spacing, and other brand elements to ensure consistency.
          </p>
        </motion.div>
      )}

      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 space-y-4"
          ref={resultsRef}
        >
          <h2 className="text-2xl font-bold">Brand Consistency Analysis</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderScoreCircle(analysisResult.brandConsistencyScore, "Brand Consistency")}
            {renderScoreCircle(analysisResult.colorMatchScore, "Color Match")}
            {renderScoreCircle(analysisResult.typographyScore, "Typography")}
            {renderScoreCircle(analysisResult.spacingScore, "Spacing & Layout")}
          </div>

          <Separator className="my-4" />

          <div className="space-y-6">
            <h3 className="text-xl font-bold mb-4">Design Issues by Image</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analysisResult.designImages?.map((designImage, imageIndex) => (
                <Card key={imageIndex} className="overflow-hidden hover-scale">
                  <div className="aspect-video bg-muted">
                    <img
                      src={designImage.imageUrl}
                      alt={`Design ${imageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Design {imageIndex + 1}</CardTitle>
                    <CardDescription>Found {designImage.issues.length} issues</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {designImage.issues.map((issue, issueIndex) => {
                        // Extract hex colors from the issue text
                        const colorHexCodes = extractHexColors(issue);

                        return (
                          <div key={issueIndex} className="flex items-start p-2 rounded-md border">
                            <Badge variant="destructive" className="mr-2 mt-0.5 shrink-0">
                              Issue
                            </Badge>
                            <div>
                              <p>{issue}</p>
                              {colorHexCodes.length > 0 && (
                                <div className="flex gap-2 mt-2">
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
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                Brand Consistency Issues
              </h3>
              {analysisResult.errors.length > 0 ? (
                <div className="space-y-3">
                  {analysisResult.errors.map((error, index) => {
                    // Extract hex colors from the error text
                    const colorHexCodes = extractHexColors(error);

                    return (
                      <div
                        key={index}
                        className="flex items-start p-3 rounded-lg border bg-background hover-scale"
                      >
                        <Badge variant="destructive" className="mr-2 mt-0.5 shrink-0">
                          Error
                        </Badge>
                        <div>
                          <p>{error}</p>
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
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">No brand consistency issues found.</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
                Suggestions
              </h3>
              {analysisResult.warnings.length > 0 ? (
                <div className="space-y-3">
                  {analysisResult.warnings.map((warning, index) => (
                    <div
                      key={index}
                      className="flex items-start p-3 rounded-lg border bg-background hover-scale"
                    >
                      <Badge className="mr-2 mt-0.5 bg-amber-500 hover:bg-amber-600 shrink-0">
                        Suggestion
                      </Badge>
                      <p>{warning}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No suggestions at this time.</p>
              )}
            </motion.div>
          </div>

          {value === "figma" && analysisResult.figmaLink && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <Card className="mt-6 hover-scale">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Figma Comments
                  </CardTitle>
                  <CardDescription>
                    We've added {analysisResult.commentCount} comments directly to your Figma file
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">File URL:</p>
                      <p className="text-sm font-medium truncate max-w-[300px]">
                        {analysisResult.figmaLink}
                      </p>
                    </div>
                    <Button variant="outline" className="hover-scale">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open in Figma
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Analysis Summary</CardTitle>
                <CardDescription>Here's a summary of the brand consistency check</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4 bg-muted/50">
                  <p className="text-sm">
                    {analysisResult.brandConsistencyScore > 80
                      ? "Your design shows strong brand consistency! There are just a few minor issues to address."
                      : analysisResult.brandConsistencyScore > 60
                        ? "Your design has good brand consistency with some issues that should be addressed."
                        : "Your design needs significant improvements to align with your brand guidelines."}
                  </p>

                  <div className="mt-4 text-sm">
                    <p className="font-medium">Key areas to improve:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      {analysisResult.brandConsistencyScore < 90 && <li>Color consistency</li>}
                      {analysisResult.typographyScore < 85 && <li>Typography alignment</li>}
                      {analysisResult.spacingScore < 80 && <li>Spacing and layout</li>}
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleCopyCode}
                  variant="outline"
                  disabled={copied}
                  className="hover-scale"
                >
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
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default DesignChecker;
