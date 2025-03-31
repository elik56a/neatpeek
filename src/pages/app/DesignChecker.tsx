
import { useState } from "react";
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
import { Check, Copy, AlertCircle, Image as ImageIcon, FileText, Link2, Loader2, ExternalLink } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { BarChart, LineChart } from "recharts";

const DesignChecker = () => {
  const [figmaUrl, setFigmaUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [value, setValue] = useState("figma");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const { toast } = useToast();

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.3, ease: "easeIn" }
    }
  };

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

    // Mock analysis result
    setTimeout(() => {
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
      });
      setLoading(false);
    }, 3000);
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

    // Mock analysis result
    setTimeout(() => {
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
      });
      setLoading(false);
    }, 3000);
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Design Checker</h1>
        <p className="text-muted-foreground">
          Check if your designs align with your brand guidelines
        </p>
      </div>

      <Tabs 
        defaultValue="figma" 
        value={value} 
        onValueChange={setValue} 
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="figma" className="relative overflow-hidden group">
            <span className="relative z-10 flex items-center">
              <Link2 className="w-4 h-4 mr-2" />
              Analyze Figma Design
            </span>
            <span className="absolute inset-0 bg-primary/10 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform origin-left duration-300 ease-out"></span>
          </TabsTrigger>
          <TabsTrigger value="image" className="relative overflow-hidden group">
            <span className="relative z-10 flex items-center">
              <ImageIcon className="w-4 h-4 mr-2" />
              Analyze Images
            </span>
            <span className="absolute inset-0 bg-primary/10 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform origin-left duration-300 ease-out"></span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="figma" className="space-y-4">
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={tabVariants}
          >
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
              onClick={handleFigmaAnalysis} 
              disabled={loading}
              className="mt-4 hover:scale-105 transition-transform duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Figma Design...
                </>
              ) : (
                "Analyze Figma Design"
              )}
            </Button>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="image" className="space-y-4">
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={tabVariants}
          >
            <div className="grid gap-4">
              <Label htmlFor="imageUpload">Upload Design Images</Label>
              <div 
                className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer transform hover:scale-[1.01] transition-all duration-200"
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
                    Drag and drop or click to browse
                  </p>
                </div>
              </div>
              
              {imagePreviewUrls.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="border rounded-md overflow-hidden hover:shadow-md transition-all duration-200 hover:scale-[1.02] group">
                      <img 
                        src={url} 
                        alt={`Design ${index + 1}`} 
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-2 text-sm truncate">
                        {uploadedImages[index]?.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button 
                onClick={handleImageAnalysis} 
                disabled={loading || imagePreviewUrls.length === 0}
                className="mt-2 hover:scale-105 transition-transform duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Images...
                  </>
                ) : (
                  "Analyze Images"
                )}
              </Button>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {loading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center justify-center p-8 rounded-full bg-muted">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
          <h3 className="text-xl font-medium mt-6">
            We're checking your design against your brand guidelines
          </h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Our AI is analyzing your {value === "figma" ? "Figma design" : "images"} for color, typography, 
            spacing, and other brand elements to ensure consistency.
          </p>
        </motion.div>
      )}

      {analysisResult && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 space-y-4"
        >
          <h2 className="text-2xl font-bold">Brand Consistency Analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Brand Consistency</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-4">
                <div className="relative h-24 w-24 mx-auto">
                  <Progress
                    value={analysisResult.brandConsistencyScore}
                    className="absolute top-0 left-0 h-full w-full rounded-full"
                    indicatorClassName={`bg-gradient-to-r ${
                      analysisResult.brandConsistencyScore > 70
                        ? 'from-green-500 to-green-600'
                        : analysisResult.brandConsistencyScore > 40
                        ? 'from-yellow-500 to-yellow-600'
                        : 'from-red-500 to-red-600'
                    }`}
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
                    {analysisResult.brandConsistencyScore}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Color Match</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-4">
                <div className="relative h-24 w-24 mx-auto">
                  <Progress
                    value={analysisResult.colorMatchScore}
                    className="absolute top-0 left-0 h-full w-full rounded-full"
                    indicatorClassName={`bg-gradient-to-r ${
                      analysisResult.colorMatchScore > 70
                        ? 'from-green-500 to-green-600'
                        : analysisResult.colorMatchScore > 40
                        ? 'from-yellow-500 to-yellow-600'
                        : 'from-red-500 to-red-600'
                    }`}
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
                    {analysisResult.colorMatchScore}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Typography</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-4">
                <div className="relative h-24 w-24 mx-auto">
                  <Progress
                    value={analysisResult.typographyScore}
                    className="absolute top-0 left-0 h-full w-full rounded-full"
                    indicatorClassName={`bg-gradient-to-r ${
                      analysisResult.typographyScore > 70
                        ? 'from-green-500 to-green-600'
                        : analysisResult.typographyScore > 40
                        ? 'from-yellow-500 to-yellow-600'
                        : 'from-red-500 to-red-600'
                    }`}
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
                    {analysisResult.typographyScore}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Spacing & Layout</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-4">
                <div className="relative h-24 w-24 mx-auto">
                  <Progress
                    value={analysisResult.spacingScore}
                    className="absolute top-0 left-0 h-full w-full rounded-full"
                    indicatorClassName={`bg-gradient-to-r ${
                      analysisResult.spacingScore > 70
                        ? 'from-green-500 to-green-600'
                        : analysisResult.spacingScore > 40
                        ? 'from-yellow-500 to-yellow-600'
                        : 'from-red-500 to-red-600'
                    }`}
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
                    {analysisResult.spacingScore}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  {analysisResult.errors.map((error: string, index: number) => (
                    <div key={index} className="flex items-start p-3 rounded-lg border bg-background hover:shadow-sm transition-all duration-200">
                      <Badge variant="destructive" className="mr-2 mt-0.5 shrink-0">
                        Error
                      </Badge>
                      <p>{error}</p>
                    </div>
                  ))}
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
                  {analysisResult.warnings.map((warning: string, index: number) => (
                    <div key={index} className="flex items-start p-3 rounded-lg border bg-background hover:shadow-sm transition-all duration-200">
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
              <Card className="mt-6 hover:shadow-md transition-all duration-200">
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
                      <p className="text-sm font-medium truncate max-w-[300px]">{analysisResult.figmaLink}</p>
                    </div>
                    <Button variant="outline" className="hover:scale-105 transition-transform duration-200">
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
                <CardDescription>
                  Here's a summary of the brand consistency check
                </CardDescription>
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
                  className="hover:scale-105 transition-transform duration-200"
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
