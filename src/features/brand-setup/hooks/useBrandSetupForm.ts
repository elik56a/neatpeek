"use client";

import { useToast } from "@/hooks/use-toast";
import { useAppDataContext } from "@/providers";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BrandGuideline, BrandSetupFormData } from "../types";

interface UseBrandSetupFormProps {
  brandId?: string;
  mode?: 'create' | 'edit';
}

/**
 * Hook for managing the brand setup form
 */
export function useBrandSetupForm({ brandId, mode = 'create' }: UseBrandSetupFormProps = {}) {
  // Get company context
  const { companyId, company } = useAppDataContext();

  const [formData, setFormData] = useState<BrandSetupFormData>({
    name: '',
    description: '',
    pdfFile: null,
    designImages: [],
    customRules: [],
    companyId: companyId || undefined,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const router = useRouter();

  // Load existing brand data in edit mode
  useEffect(() => {
    if (mode === 'edit' && brandId) {
      setIsLoading(true);
      fetch(`/api/brand-guidelines/${brandId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch brand guideline');
          }
          return response.json();
        })
        .then((data: BrandGuideline) => {
          setFormData({
            name: data.name,
            description: data.description || '',
            pdfFile: null, // Can't load the actual file, but we can keep the path
            pdfPath: data.pdfPath,
            designImages: [], // Can't load the actual files, but we can keep the paths
            designImagePaths: data.designImages?.map(img => ({
              id: img.id,
              path: img.path,
              url: img.url,
              name: img.name || '',
              description: img.description || '',
            })) || [],
            customRules: data.customRules?.map(rule => ({
              id: rule.id,
              category: rule.category,
              name: rule.name,
              description: rule.description,
            })) || [],
          });
        })
        .catch(error => {
          console.error('Error fetching brand guideline:', error);
          toast({
            title: 'Error',
            description: 'Failed to load brand guideline data',
            variant: 'destructive',
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [brandId, mode, toast]);

  // Update form data
  const updateFormData = useCallback((data: Partial<BrandSetupFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  // Add a custom rule
  const addCustomRule = useCallback((rule: { category: string; name: string; description: string }) => {
    setFormData((prev) => ({
      ...prev,
      customRules: [...(prev.customRules || []), rule],
    }));
  }, []);

  // Remove a custom rule
  const removeCustomRule = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      customRules: prev.customRules?.filter((_, i) => i !== index) || [],
    }));
  }, []);

  // Add design images
  const addDesignImages = useCallback((files: File[]) => {
    setFormData((prev) => ({
      ...prev,
      designImages: [...(prev.designImages || []), ...files],
    }));
  }, []);

  // Remove a design image
  const removeDesignImage = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      designImages: prev.designImages?.filter((_, i) => i !== index) || [],
    }));
  }, []);

  // Set PDF file
  const setPdfFile = useCallback((file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      pdfFile: file,
    }));
  }, []);

  // Go to next step
  const nextStep = useCallback(() => {
    setCurrentStep((prev) => prev + 1);
  }, []);

  // Go to previous step
  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  // Submit the form
  const submitForm = useCallback(async (): Promise<BrandGuideline | null> => {
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!formData.name) {
        throw new Error('Brand name is required');
      }

      // Check if at least one of PDF, design images, or custom rules is provided
      const hasPdf = !!formData.pdfFile;
      const hasDesignImages = formData.designImages && formData.designImages.length > 0;
      const hasCustomRules = formData.customRules && formData.customRules.length > 0;

      if (!hasPdf && !hasDesignImages && !hasCustomRules) {
        throw new Error('At least one of PDF, design images, or custom rules is required');
      }

      let brandGuideline;

      if (mode === 'edit' && brandId) {
        // Update the brand guideline
        const updateResponse = await fetch(`/api/brand-guidelines/${brandId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
          }),
        });

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(errorData.error || 'Failed to update brand guideline');
        }

        brandGuideline = await updateResponse.json();
      } else {
        // Create the brand guideline
        const createResponse = await fetch('/api/brand-guidelines', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            companyId: formData.companyId,
            teamId: formData.teamId,
          }),
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          throw new Error(errorData.error || 'Failed to create brand guideline');
        }

        brandGuideline = await createResponse.json();
      }

      // Upload files and custom rules
      const uploadFormData = new FormData();

      // Add PDF file if available
      if (formData.pdfFile) {
        uploadFormData.append('pdfFile', formData.pdfFile);
      }

      // Add design images if available
      if (formData.designImages && formData.designImages.length > 0) {
        formData.designImages.forEach((file, index) => {
          uploadFormData.append(`designImages[${index}]`, file);
        });
      }

      // Add custom rules if available
      if (formData.customRules && formData.customRules.length > 0) {
        uploadFormData.append('customRules', JSON.stringify(formData.customRules));
      }

      // Start analysis immediately
      uploadFormData.append('startAnalysis', 'true');

      // Upload files and start analysis
      const uploadResponse = await fetch(`/api/brand-guidelines/${brandGuideline.id}/upload`, {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload files');
      }

      const updatedBrandGuideline = await uploadResponse.json();

      toast({
        title: 'Success',
        description: 'Brand guideline created and analysis started. This may take a few minutes.',
      });

      // Reset form data
      setFormData({
        name: '',
        description: '',
        pdfFile: null,
        designImages: [],
        customRules: [],
      });

      // Navigate to the brand guideline page
      router.push(`/brand-setup/${updatedBrandGuideline.id}`);

      return updatedBrandGuideline;
    } catch (error) {
      console.error('Error submitting form:', error);

      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit form',
        variant: 'destructive',
      });

      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, toast, router]);

  return {
    formData,
    isSubmitting,
    currentStep,
    updateFormData,
    addCustomRule,
    removeCustomRule,
    addDesignImages,
    removeDesignImage,
    setPdfFile,
    nextStep,
    prevStep,
    submitForm,
  };
}
