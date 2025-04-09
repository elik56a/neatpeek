"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, FileText, Image, Check, X, Plus, Trash2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Define types for API requests and responses
interface BrandRequest {
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  primaryFont: string;
  secondaryFont: string;
  spacing: string;
  additionalNotes: string;
  customRules: { id: string; category: string; value: string }[];
  logo?: File;
  guidelinesFile?: File;
  designImages?: File[];
}

interface BrandResponse {
  success: boolean;
  brandId?: string;
  data?: BrandRequest;
  error?: string;
}

// Fetch functions for API interaction
const fetchBrandData = async (brandId: string): Promise<BrandResponse> => {
  const response = await fetch(`api/brand-setup?brandId=${brandId}`);

  if (!response.ok) {
    const error = await response.json();
    console.error('Error fetching brand data:', error);
    throw new Error(error.message || 'Failed to fetch brand data');
  }

  return response.json();
};

const createOrUpdateBrand = async (formData: FormData): Promise<BrandResponse> => {
  const response = await fetch(`/api/brand-setup`, {
    method: "POST",
    body: formData,
  });
  return response.json();
};

const deleteBrand = async (brandId: string): Promise<BrandResponse> => {
  const response = await fetch(`/api/brand-setup?brandId=${brandId}`, {
    method: "DELETE",
  });
  return response.json();
};

interface BrandForm {
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  primaryFont: string;
  secondaryFont: string;
  logo: File | null;
  spacing: string;
  additionalNotes: string;
  customRules: CustomRule[];
}

interface CustomRule {
  id: string;
  category: string;
  value: string;
}

interface CompletionStatus {
  guidelines: boolean;
  designs: boolean;
  settings: boolean;
}

const BrandSetup = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("guidelines");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus>({
    guidelines: false,
    designs: false,
    settings: false,
  });
  const [brandForm, setBrandForm] = useState<BrandForm>({
    brandName: "",
    primaryColor: "#8344ff",
    secondaryColor: "#5112cc",
    accentColor: "#f97316",
    primaryFont: "",
    secondaryFont: "",
    logo: null,
    spacing: "",
    additionalNotes: "",
    customRules: [],
  });

  const updateCompletionStatus = () => {
    setCompletionStatus({
      guidelines: !!uploadedFile,
      designs: uploadedImages.length > 0,
      settings: !!(brandForm.brandName && brandForm.primaryColor && brandForm.primaryFont),
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      updateCompletionStatus();
    }
  };

  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Create URLs for previews
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      
      setUploadedImages((prev) => [...prev, ...newFiles]);
      setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls]);
      updateCompletionStatus();
    }
  };

  const removeImage = (index: number) => {
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
    updateCompletionStatus();
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBrandForm((prev) => ({ ...prev, [name]: value }));
    updateCompletionStatus();
  };

  const addCustomRule = () => {
    const newRule = {
      id: `rule-${Date.now()}`,
      category: "",
      value: ""
    };
    
    setBrandForm(prev => ({
      ...prev,
      customRules: [...prev.customRules, newRule]
    }));
  };

  const updateCustomRule = (id: string, field: "category" | "value", value: string) => {
    setBrandForm(prev => ({
      ...prev,
      customRules: prev.customRules.map(rule => 
        rule.id === id ? { ...rule, [field]: value } : rule
      )
    }));
  };

  const removeCustomRule = (id: string) => {
    setBrandForm(prev => ({
      ...prev,
      customRules: prev.customRules.filter(rule => rule.id !== id)
    }));
  };

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

  const calculateProgress = () => {
    const { guidelines, designs, settings } = completionStatus;
    const completed = (guidelines ? 1 : 0) + (designs ? 1 : 0) + (settings ? 1 : 0);
    return (completed / 3) * 100;
  };

  const isAtLeastOneTabComplete = () => {
    return completionStatus.guidelines || completionStatus.designs || completionStatus.settings;
  };

  const handleSubmit = async () => {
    if (!isAtLeastOneTabComplete()) {
      toast({
        title: "Incomplete Setup",
        description: "Please complete at least one tab before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare form data for API submission
      const formData = new FormData();
      
      // Add brand form data
      formData.append('brandName', brandForm.brandName);
      formData.append('primaryColor', brandForm.primaryColor);
      formData.append('secondaryColor', brandForm.secondaryColor);
      formData.append('accentColor', brandForm.accentColor);
      formData.append('primaryFont', brandForm.primaryFont);
      formData.append('secondaryFont', brandForm.secondaryFont);
      formData.append('spacing', brandForm.spacing);
      formData.append('additionalNotes', brandForm.additionalNotes);
      
      // Add custom rules
      formData.append('customRules', JSON.stringify(brandForm.customRules));
      
      // Add logo if present
      if (brandForm.logo) {
        formData.append('logo', brandForm.logo);
      }
      
      // Add guidelines file if present
      if (uploadedFile) {
        formData.append('guidelinesFile', uploadedFile);
      }
      
      // Add design images if present
      uploadedImages.forEach((image, index) => {
        formData.append(`designImage${index}`, image);
      });
      
      //api call
      await createOrUpdateBrand(formData);
      
      // Show success message
      toast({
        title: "Brand setup saved",
        description: "Your brand settings have been successfully saved.",
      });
      
      // Show completion modal
      // Implementation for this would go here

    } catch (error) {
      console.error("Error saving brand setup:", error);
      toast({
        title: "Save failed",
        description: "There was an issue saving your brand setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Example usage of fetchBrandData on component mount
  useEffect(() => {
    const loadBrandData = async () => {
      const brandId = "example-brand-id"; // Replace with actual logic to get brandId
      const result = await fetchBrandData(brandId);
      if (result.success && result.data) {
        console.log("Fetched brand data:", result.data);
      } else {
        console.error("Failed to fetch brand data:", result.error);
      }
    };

    loadBrandData();
  }, []);


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Brand Setup</h1>
        <p className="text-muted-foreground">
          Configure your brand guidelines to ensure design consistency
        </p>
      </div>
      
      {/* Progress Indicator */}
      <Card className="hover-scale">
        <CardContent className="pt-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium">Completion Status</h3>
            <span className="text-sm text-muted-foreground">
              {Math.round(calculateProgress())}% Complete
            </span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                {completionStatus.guidelines ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">Guidelines</span>
              </div>
              <div className="flex items-center gap-2">
                {completionStatus.designs ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">Designs</span>
              </div>
              <div className="flex items-center gap-2">
                {completionStatus.settings ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">Manual Settings</span>
              </div>
            </div>
            
            <Button 
              onClick={handleSubmit} 
              disabled={!isAtLeastOneTabComplete() || isSubmitting}
              className="h-9 hover-scale hidden sm:inline-flex"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Brand Settings"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs 
        defaultValue="guidelines" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="guidelines" className="relative overflow-hidden group">
            <span className="relative z-10">Brand Guidelines</span>
            <span className="absolute inset-0 bg-primary/10 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform origin-left duration-300 ease-out"></span>
          </TabsTrigger>
          <TabsTrigger value="designs" className="relative overflow-hidden group">
            <span className="relative z-10">Example Designs</span>
            <span className="absolute inset-0 bg-primary/10 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform origin-left duration-300 ease-out"></span>
          </TabsTrigger>
          <TabsTrigger value="manual" className="relative overflow-hidden group">
            <span className="relative z-10">Manual Settings</span>
            <span className="absolute inset-0 bg-primary/10 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform origin-left duration-300 ease-out"></span>
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {activeTab === "guidelines" && (
            <TabsContent value="guidelines" forceMount>
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tabVariants}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Brand Guidelines</CardTitle>
                    <CardDescription>
                      Upload your brand guideline document (PDF, Word, etc.) and we'll automatically extract your brand rules.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div 
                        className={cn(
                          "border-2 border-dashed rounded-lg p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer hover-scale",
                          uploadedFile ? "border-brand-500 bg-brand-50/30 dark:bg-brand-950/20" : "border-border"
                        )}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          id="guidelines-upload"
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.ppt,.pptx"
                          onChange={handleFileUpload}
                        />
                        
                        {uploadedFile ? (
                          <div className="flex flex-col items-center">
                            <div className="h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-4">
                              <FileText className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                            </div>
                            <p className="font-medium">{uploadedFile.name}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                            <div className="mt-4 flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUploadedFile(null);
                                  updateCompletionStatus();
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  fileInputRef.current?.click();
                                }}
                              >
                                <Upload className="h-4 w-4 mr-1" />
                                Replace
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                              <Upload className="h-6 w-6" />
                            </div>
                            <p className="font-medium">Upload your brand guidelines</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Drag and drop or click to browse
                            </p>
                            <p className="text-xs text-muted-foreground mt-4">
                              Supports PDF, Word, and PowerPoint files up to 10MB
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="rounded-lg border p-4">
                        <h3 className="text-sm font-medium mb-2">What happens after upload?</h3>
                        <p className="text-sm text-muted-foreground">
                          Our AI will analyze your brand guidelines and extract key information like colors, typography, spacing rules, and more. This process may take a few minutes depending on the file size.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setActiveTab("designs")} className="hover-scale">
                      Skip for now
                    </Button>
                    <Button 
                      onClick={() => setActiveTab("designs")} 
                      disabled={!uploadedFile}
                      className="relative overflow-hidden group hover-scale"
                    >
                      <span className="relative z-10">Continue to Designs</span>
                      <span className="absolute inset-0 bg-primary/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out"></span>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>
          )}

          {activeTab === "designs" && (
            <TabsContent value="designs" forceMount>
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tabVariants}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Example Designs</CardTitle>
                    <CardDescription>
                      Upload sample designs that represent your brand's aesthetic and design standard.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div 
                        className={cn(
                          "border-2 border-dashed rounded-lg p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer hover-scale",
                          "border-border"
                        )}
                        onClick={() => imagesInputRef.current?.click()}
                      >
                        <input
                          ref={imagesInputRef}
                          id="designs-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={handleImagesUpload}
                        />
                        
                        <div className="flex flex-col items-center">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Image className="h-6 w-6" />
                          </div>
                          <p className="font-medium">Upload example designs</p>
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
                            <div key={index} className="relative rounded-lg border overflow-hidden group hover-scale">
                              <div className="aspect-video bg-muted/50 flex items-center justify-center">
                                {imagePreviewUrls[index] && (
                                  <img 
                                    src={imagePreviewUrls[index]} 
                                    alt={`Preview of ${image.name}`}
                                    className="object-cover w-full h-full"
                                  />
                                )}
                              </div>
                              <div className="p-2">
                                <p className="text-sm font-medium truncate">{image.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(image.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </div>
                              <button
                                className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/80 flex items-center justify-center border text-muted-foreground hover:text-destructive transform hover:scale-110 transition-all duration-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(index);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <div 
                            className="relative rounded-lg border border-dashed flex items-center justify-center p-4 h-[140px] hover:bg-muted/50 cursor-pointer hover-scale"
                            onClick={() => imagesInputRef.current?.click()}
                          >
                            <div className="text-center">
                              <Plus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Add more designs</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="rounded-lg border p-4">
                        <h3 className="text-sm font-medium mb-2">How we analyze your designs</h3>
                        <p className="text-sm text-muted-foreground">
                          Our AI will analyze your example designs to identify common design patterns, color usage, spacing, and layout preferences. This helps us build a more accurate profile of your brand style.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab("guidelines")}
                      className="hover-scale"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={() => setActiveTab("manual")}
                      className="hover-scale"
                    >
                      Continue to Manual Settings
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>
          )}

          {activeTab === "manual" && (
            <TabsContent value="manual" forceMount>
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tabVariants}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Manual Brand Settings</CardTitle>
                    <CardDescription>
                      Input your brand specifications manually for more precise control.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-2">
                          <Label htmlFor="brandName">Brand Name</Label>
                          <Input
                            id="brandName"
                            name="brandName"
                            placeholder="Acme Inc."
                            value={brandForm.brandName}
                            onChange={handleFormChange}
                            className="hover:border-primary/50 transition-colors duration-200"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="logo">Brand Logo</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="logo"
                              type="file"
                              accept="image/*"
                              className="flex-1 hover:border-primary/50 transition-colors duration-200"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setBrandForm(prev => ({
                                    ...prev,
                                    logo: e.target.files![0]
                                  }));
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <Accordion type="single" collapsible className="space-y-4">
                        <AccordionItem value="colors" className="border rounded-lg px-4">
                          <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 bg-gradient-to-r from-primary to-brand-600 rounded-full"></div>
                              <span>Brand Colors</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="primaryColor">Primary Color</Label>
                                <div className="flex gap-2">
                                  <div
                                    className="w-10 h-10 rounded-md border hover-scale"
                                    style={{ backgroundColor: brandForm.primaryColor }}
                                  />
                                  <Input
                                    id="primaryColor"
                                    name="primaryColor"
                                    type="color"
                                    value={brandForm.primaryColor}
                                    onChange={handleFormChange}
                                    className="flex-1 hover:border-primary/50 transition-colors duration-200"
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="secondaryColor">Secondary Color</Label>
                                <div className="flex gap-2">
                                  <div
                                    className="w-10 h-10 rounded-md border hover-scale"
                                    style={{ backgroundColor: brandForm.secondaryColor }}
                                  />
                                  <Input
                                    id="secondaryColor"
                                    name="secondaryColor"
                                    type="color"
                                    value={brandForm.secondaryColor}
                                    onChange={handleFormChange}
                                    className="flex-1 hover:border-primary/50 transition-colors duration-200"
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="accentColor">Accent Color</Label>
                                <div className="flex gap-2">
                                  <div
                                    className="w-10 h-10 rounded-md border hover-scale"
                                    style={{ backgroundColor: brandForm.accentColor }}
                                  />
                                  <Input
                                    id="accentColor"
                                    name="accentColor"
                                    type="color"
                                    value={brandForm.accentColor}
                                    onChange={handleFormChange}
                                    className="flex-1 hover:border-primary/50 transition-colors duration-200"
                                  />
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="typography" className="border rounded-lg px-4">
                          <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 flex items-center justify-center bg-muted rounded-full">
                                <span className="text-xs font-bold">A</span>
                              </div>
                              <span>Typography</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="primaryFont">Primary Font</Label>
                                <Input
                                  id="primaryFont"
                                  name="primaryFont"
                                  placeholder="Inter, Helvetica, sans-serif"
                                  value={brandForm.primaryFont}
                                  onChange={handleFormChange}
                                  className="hover:border-primary/50 transition-colors duration-200"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="secondaryFont">Secondary Font</Label>
                                <Input
                                  id="secondaryFont"
                                  name="secondaryFont"
                                  placeholder="Georgia, serif"
                                  value={brandForm.secondaryFont}
                                  onChange={handleFormChange}
                                  className="hover:border-primary/50 transition-colors duration-200"
                                />
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="spacing" className="border rounded-lg px-4">
                          <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 flex items-center justify-center bg-muted rounded-full">
                                <span className="text-xs">⊞</span>
                              </div>
                              <span>Spacing</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 py-4">
                              <Label htmlFor="spacing">Spacing Guidelines</Label>
                              <Textarea
                                id="spacing"
                                name="spacing"
                                placeholder="Describe your brand's spacing guidelines (e.g. '8px grid system')"
                                value={brandForm.spacing}
                                onChange={handleFormChange}
                                rows={3}
                                className="hover:border-primary/50 transition-colors duration-200"
                              />
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="custom" className="border rounded-lg px-4">
                          <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 flex items-center justify-center bg-muted rounded-full">
                                <span className="text-xs">+</span>
                              </div>
                              <span>Custom Rules</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 py-4">
                              {brandForm.customRules.map((rule) => (
                                <div key={rule.id} className="flex gap-2 items-center">
                                  <Input
                                    placeholder="Category (e.g., Button radius)"
                                    value={rule.category}
                                    onChange={(e) => updateCustomRule(rule.id, "category", e.target.value)}
                                    className="flex-1"
                                  />
                                  <Input
                                    placeholder="Value (e.g., 8px)"
                                    value={rule.value}
                                    onChange={(e) => updateCustomRule(rule.id, "value", e.target.value)}
                                    className="flex-1"
                                  />
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => removeCustomRule(rule.id)}
                                    className="h-10 w-10 text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              
                              <Button 
                                variant="outline" 
                                onClick={addCustomRule}
                                className="w-full"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Custom Rule
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="notes" className="border rounded-lg px-4">
                          <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 flex items-center justify-center bg-muted rounded-full">
                                <span className="text-xs">📝</span>
                              </div>
                              <span>Additional Notes</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 py-4">
                              <Textarea
                                id="additionalNotes"
                                name="additionalNotes"
                                placeholder="Any other brand guidelines or rules to consider"
                                value={brandForm.additionalNotes}
                                onChange={handleFormChange}
                                rows={4}
                                className="hover:border-primary/50 transition-colors duration-200"
                              />
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab("designs")}
                      className="hover-scale"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleSubmit} 
                      disabled={isSubmitting}
                      className="hover-scale"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Brand Settings"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>
          )}
        </AnimatePresence>
      </Tabs>

      {/* Mobile save button */}
      <div className="sm:hidden">
        <Button 
          onClick={handleSubmit} 
          disabled={!isAtLeastOneTabComplete() || isSubmitting}
          className="w-full hover-scale"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Brand Settings"
          )}
        </Button>
      </div>
    </div>
  );
};

export default BrandSetup;
