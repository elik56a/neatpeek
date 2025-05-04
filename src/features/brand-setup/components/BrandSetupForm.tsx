"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAppDataContext } from "@/providers";
import {
  AlertCircle,
  ArrowRight,
  Building,
  CheckCircle,
  FileText,
  Loader2,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useBrandSetupForm } from "../hooks";
import { CustomRule } from "../types";

import { CustomRulesForm } from "./CustomRulesForm";
import { FileUploader } from "./FileUploader";
import { Team } from "@/types";

interface BrandSetupFormProps {
  brandId?: string;
  mode?: "create" | "edit";
}

export function BrandSetupForm({ brandId, mode = "create" }: BrandSetupFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const { company, companyId, hasCompany } = useAppDataContext();
  const [teams, setTeams] = useState<Pick<Team, "id" | "name">[]>([]);

  // Fetch teams when component mounts
  useEffect(() => {
    const fetchTeams = async () => {
      if (!companyId) return;

      try {
        const response = await fetch(`/api/companies/${companyId}/teams`);

        if (response.ok) {
          const data = await response.json();
          setTeams(data);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };

    fetchTeams();
  }, [companyId]);

  const {
    formData,
    isSubmitting,
    updateFormData,
    addDesignImages,
    removeDesignImage,
    setPdfFile,
    addCustomRule,
    removeCustomRule,
    submitForm,
  } = useBrandSetupForm({ brandId, mode });

  // Show loading state while form data is being loaded
  const [isLoading, setIsLoading] = useState(mode === "edit");

  // Set loading to false when form data is loaded
  useEffect(() => {
    if (formData.name && mode === "edit") {
      setIsLoading(false);
    }
  }, [formData.name, mode]);

  // Local state for error and success messages
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check if at least one of PDF, design images, or custom rules is provided
  const hasPdf = !!formData.pdfFile;
  const hasDesignImages = formData.designImages && formData.designImages.length > 0;
  const hasCustomRules = formData.customRules && formData.customRules.length > 0;
  const canSubmit = formData.name && (hasPdf || hasDesignImages || hasCustomRules);

  // Handle PDF file selection
  const handlePdfSelected = (files: File[]) => {
    if (files.length > 0) {
      setPdfFile(files[0]);
    }
  };

  // Handle PDF file removal
  const handlePdfRemoved = () => {
    setPdfFile(null);
  };

  // Handle design images selection
  const handleImagesSelected = (files: File[]) => {
    addDesignImages(files);
  };

  // Handle design image removal
  const handleImageRemoved = (index: number) => {
    removeDesignImage(index);
  };

  // Handle custom rule addition
  const handleAddRule = (rule: CustomRule) => {
    addCustomRule(rule);
  };

  // Handle custom rule removal
  const handleRemoveRule = (index: number) => {
    removeCustomRule(index);
  };

  // Handle form submission with error and success handling
  const handleSubmit = async () => {
    try {
      setError(null);
      const result = await submitForm();
      if (result) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
  };

  // Show loading indicator if data is being loaded
  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
          <CardDescription>Loading brand guideline data...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{mode === "edit" ? "Edit Brand Guidelines" : "Brand Setup"}</CardTitle>
        <CardDescription>
          {mode === "edit"
            ? "Update your brand guidelines"
            : "Upload your brand guidelines, design examples, and custom rules to get started."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">
              Your brand guidelines have been created successfully.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="files">Files & Images</TabsTrigger>
            <TabsTrigger value="rules">Custom Rules</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Brand Name *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={e => updateFormData({ name: e.target.value })}
                placeholder="Enter your brand name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={e => updateFormData({ description: e.target.value })}
                placeholder="Describe your brand"
                rows={4}
              />
            </div>

            {hasCompany && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <Label>Company</Label>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {company?.name || "Your Company"}
                </div>
                <input type="hidden" value={companyId || ""} />
              </div>
            )}

            {hasCompany && teams.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <Label htmlFor="teamId">Team (Optional)</Label>
                </div>
                <Select
                  value={formData.teamId || ""}
                  onValueChange={value =>
                    updateFormData({ teamId: value === "none" ? undefined : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              type="button"
              onClick={() => setActiveTab("files")}
              className="mt-4"
              disabled={!formData.name}
            >
              Next: Upload Files
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Brand Guidelines PDF</Label>
                <FileUploader
                  accept="application/pdf"
                  maxFiles={1}
                  onFilesSelected={handlePdfSelected}
                  selectedFiles={formData.pdfFile ? [formData.pdfFile] : []}
                  onFileRemoved={() => handlePdfRemoved()}
                  className="mt-2"
                />

                {/* Display existing PDF in edit mode */}
                {mode === "edit" && formData.pdfPath && !formData.pdfFile && (
                  <div className="mt-4 border rounded-md p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Current PDF</p>
                        <p className="text-xs text-muted-foreground">
                          {formData.pdfPath.split("/").pop() || "brand-guidelines.pdf"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateFormData({ pdfPath: undefined })}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <Label>Design Examples</Label>
                <FileUploader
                  accept="image/*"
                  maxFiles={5}
                  onFilesSelected={handleImagesSelected}
                  selectedFiles={formData.designImages || []}
                  onFileRemoved={handleImageRemoved}
                  className="mt-2"
                />

                {/* Display existing images in edit mode */}
                {mode === "edit" &&
                  formData.designImagePaths &&
                  formData.designImagePaths.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">Existing Images:</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {formData.designImagePaths.map(image => (
                          <div key={image.id} className="border rounded-md p-2">
                            <img
                              src={image.url}
                              alt={image.name || "Design image"}
                              className="w-full h-32 object-cover rounded-md mb-2"
                            />
                            <p className="text-xs truncate">{image.name || "Unnamed image"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>
                Back
              </Button>
              <Button type="button" onClick={() => setActiveTab("rules")}>
                Next: Custom Rules
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="rules" className="space-y-6">
            <CustomRulesForm
              rules={formData.customRules || []}
              onAddRule={handleAddRule}
              onRemoveRule={handleRemoveRule}
            />

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setActiveTab("files")}>
                Back
              </Button>
              <Button type="submit" onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : mode === "edit" ? (
                  "Update Brand Guidelines"
                ) : (
                  "Create Brand Guidelines"
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <div className="text-sm text-muted-foreground">* Required fields</div>
        <div className="text-sm text-muted-foreground">
          At least one of: PDF, design images, or custom rules is required.
        </div>
      </CardFooter>
    </Card>
  );
}
