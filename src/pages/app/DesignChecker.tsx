
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Image, Link as LinkIcon, CheckCircle2, AlertCircle, Upload, ArrowRight, FileX } from "lucide-react";

const DesignChecker = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("upload");
  const [figmaLink, setFigmaLink] = useState("");
  const [designName, setDesignName] = useState("");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkResults, setCheckResults] = useState<null | {
    status: "passed" | "failed";
    issues: Array<{
      type: string;
      message: string;
      severity: "high" | "medium" | "low";
      element?: string;
      coordinates?: { x: number; y: number };
    }>;
  }>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedImages((prev) => [...prev, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validation
    if (activeTab === "upload" && uploadedImages.length === 0) {
      toast({
        title: "No images selected",
        description: "Please upload at least one image to check.",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === "figma" && !figmaLink) {
      toast({
        title: "No Figma link provided",
        description: "Please enter a valid Figma link.",
        variant: "destructive",
      });
      return;
    }

    if (!designName) {
      toast({
        title: "Design name required",
        description: "Please provide a name for this design check.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate results - in a real app this would come from the server
      const simulatedResults = {
        status: Math.random() > 0.5 ? "passed" : "failed",
        issues: [],
      } as { status: "passed" | "failed"; issues: Array<any> };

      // If failed, generate some mock issues
      if (simulatedResults.status === "failed") {
        simulatedResults.issues = [
          {
            type: "color",
            message: "The button color #FF5733 doesn't match your brand's primary color #8344FF",
            severity: "high",
            element: "Call-to-action button",
            coordinates: { x: 450, y: 320 },
          },
          {
            type: "typography",
            message: "The heading font 'Montserrat' doesn't match your brand's primary font 'Inter'",
            severity: "medium",
            element: "Main heading",
            coordinates: { x: 200, y: 150 },
          },
          {
            type: "spacing",
            message: "Inconsistent spacing between elements. Should use 16px grid system.",
            severity: "low",
            element: "Card container",
            coordinates: { x: 300, y: 400 },
          },
        ];
      }

      setCheckResults(simulatedResults);

      toast({
        title: "Design check complete",
        description: simulatedResults.status === "passed" 
          ? "Your design passed all brand compliance checks!" 
          : `Your design has ${simulatedResults.issues.length} compliance issues.`,
        variant: simulatedResults.status === "passed" ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error checking design:", error);
      toast({
        title: "Check failed",
        description: "There was an issue processing your design. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Design Checker</h1>
        <p className="text-muted-foreground">
          Check your designs against your brand guidelines
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>New Design Check</CardTitle>
            <CardDescription>
              Upload your design or connect to Figma to check brand compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="designName">Design Name</Label>
                <Input
                  id="designName"
                  placeholder="Homepage Redesign"
                  value={designName}
                  onChange={(e) => setDesignName(e.target.value)}
                  disabled={isSubmitting || !!checkResults}
                />
              </div>

              <Tabs
                defaultValue="upload"
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-4"
                disabled={isSubmitting || !!checkResults}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload Images</TabsTrigger>
                  <TabsTrigger value="figma">Figma Link</TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-4">
                  <div 
                    className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => document.getElementById("design-upload")?.click()}
                  >
                    <input
                      id="design-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={isSubmitting || !!checkResults}
                    />
                    
                    <div className="flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Upload className="h-6 w-6" />
                      </div>
                      <p className="font-medium">Upload design images</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Drag and drop or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground mt-4">
                        Supports PNG, JPG, and SVG files up to 5MB each
                      </p>
                    </div>
                  </div>
                  
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative rounded-lg border overflow-hidden">
                          <div className="aspect-video bg-muted/50 flex items-center justify-center">
                            <Image className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div className="p-2">
                            <p className="text-sm font-medium truncate">{image.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(image.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/80 flex items-center justify-center border text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(index);
                            }}
                            disabled={isSubmitting || !!checkResults}
                          >
                            <FileX className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="figma" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="figmaLink">Figma Link</Label>
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="figmaLink"
                          placeholder="https://www.figma.com/file/..."
                          className="pl-8"
                          value={figmaLink}
                          onChange={(e) => setFigmaLink(e.target.value)}
                          disabled={isSubmitting || !!checkResults}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Paste a link to your Figma file. Make sure the file is set to "Anyone with the link can view".
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div />
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !!checkResults}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  Check Design
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Check Status</CardTitle>
            <CardDescription>
              View compliance check results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {checkResults ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center py-6">
                  {checkResults.status === "passed" ? (
                    <>
                      <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500" />
                      </div>
                      <h3 className="text-xl font-bold text-green-600 dark:text-green-500">Passed!</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your design matches your brand guidelines
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
                      </div>
                      <h3 className="text-xl font-bold text-red-600 dark:text-red-500">
                        {checkResults.issues.length} Issues Found
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your design needs some adjustments
                      </p>
                    </>
                  )}
                </div>

                {checkResults.status === "failed" && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Issues to Fix:</h4>
                    {checkResults.issues.map((issue, index) => (
                      <div key={index} className="rounded-lg border p-3 text-sm space-y-1">
                        <div className="font-medium flex items-center gap-2">
                          <span 
                            className={`inline-block h-2 w-2 rounded-full ${
                              issue.severity === "high" 
                                ? "bg-red-500" 
                                : issue.severity === "medium" 
                                ? "bg-amber-500" 
                                : "bg-blue-500"
                            }`}
                          />
                          {issue.element}
                        </div>
                        <p className="text-muted-foreground">{issue.message}</p>
                        {issue.coordinates && (
                          <p className="text-xs text-muted-foreground">
                            Location: x: {issue.coordinates.x}, y: {issue.coordinates.y}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t pt-4 mt-6">
                  <Button className="w-full" onClick={() => {
                    setCheckResults(null);
                    setActiveTab("upload");
                    setUploadedImages([]);
                    setFigmaLink("");
                    setDesignName("");
                  }}>
                    Start New Check
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <FileX className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No check in progress</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  Upload your designs or provide a Figma link to start checking for brand compliance
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-brand-gradient text-white flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="font-medium">Upload or Link</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload design images or connect directly to your Figma file to check against your brand guidelines.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-brand-gradient text-white flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="font-medium">Automatic Analysis</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Our AI compares your designs against your brand rules to identify inconsistencies or deviations.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-brand-gradient text-white flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="font-medium">Get Detailed Feedback</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Receive specific feedback on what needs to be fixed with exact locations and suggestions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignChecker;
