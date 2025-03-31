
"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import CompletionModal from "@/components/ui/completion-modal";
import BrandSetupForm from "./BrandSetupForm";

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
  const [showCompletionModal, setShowCompletionModal] = useState(false);
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

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);

    try {
      // This would be an actual API call in production
      // const response = await fetch('/api/brand-setup', {
      //   method: 'POST',
      //   body: formData
      // });
      // if (!response.ok) throw new Error('Failed to save brand settings');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Brand setup saved",
        description: "Your brand settings have been successfully saved.",
      });
      
      setShowCompletionModal(true);
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

  return (
    <>
      <BrandSetupForm 
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onFormChange={(newForm) => setBrandForm(newForm)}
        initialValues={brandForm}
      />
      
      <CompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        title="Brand Setup Complete!"
        description="Your brand guidelines have been successfully set up. You can now start checking your designs for brand consistency."
        brandName={brandForm.brandName}
        primaryColor={brandForm.primaryColor}
        primaryFont={brandForm.primaryFont}
        nextStep={{
          text: "Start Checking Designs",
          href: "/design-checker"
        }}
      />
    </>
  );
};

export default BrandSetup;
