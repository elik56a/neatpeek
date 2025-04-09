import { useState } from 'react';
import { BrandSetupFormData } from '../types';

export function useBrandSetup() {
  const [formData, setFormData] = useState<BrandSetupFormData>({
    name: '',
    description: '',
    pdfFile: null,
    designImages: [],
    customRules: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Update form data
  const updateFormData = (data: Partial<BrandSetupFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  // Submit form
  const submitForm = async () => {
    try {
      setError(null);
      setIsSubmitting(true);
      
      // Check if at least one of PDF, design images, or custom rules is provided
      const hasPdf = !!formData.pdfFile;
      const hasDesignImages = formData.designImages && formData.designImages.length > 0;
      const hasCustomRules = formData.customRules && formData.customRules.length > 0;
      
      // Validate form
      if (!formData.name) {
        setError('Brand name is required');
        setIsSubmitting(false);
        return;
      }
      
      if (!hasPdf && !hasDesignImages && !hasCustomRules) {
        setError('At least one of PDF, design images, or custom rules is required');
        setIsSubmitting(false);
        return;
      }
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      
      if (formData.description) {
        formDataToSend.append('description', formData.description);
      }
      
      if (formData.pdfFile) {
        formDataToSend.append('pdfFile', formData.pdfFile);
      }
      
      if (formData.designImages && formData.designImages.length > 0) {
        formData.designImages.forEach((image, index) => {
          formDataToSend.append(`designImages[${index}]`, image);
        });
      }
      
      if (formData.customRules && formData.customRules.length > 0) {
        formDataToSend.append('customRules', JSON.stringify(formData.customRules));
      }
      
      // Send data to server
      const response = await fetch('/api/brand-guidelines', {
        method: 'POST',
        body: formDataToSend,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create brand guidelines');
      }
      
      // Success
      setSuccess(true);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        window.location.href = '/brand-setup';
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isSubmitting,
    error,
    success,
    updateFormData,
    submitForm,
  };
}
