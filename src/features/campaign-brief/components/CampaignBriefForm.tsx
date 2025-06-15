// src/features/campaign-brief/components/CampaignBriefForm.tsx
"use client";

import React, { useState } from 'react';
import { useForm, SubmitHandler, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// Define Zod schemas for each step
const step1Schema = z.object({
  objective: z.string().min(1, "Objective is required"),
  funnelStage: z.string().min(1, "Funnel stage is required"), // Consider enum: AWARENESS, CONSIDERATION, CONVERSION
  targetPlatforms: z.array(z.string()).min(1, "Select at least one platform"), // e.g., ['linkedin', 'google_ads']
});
const step2Schema = z.object({
  audience: z.string().min(1, "Audience description is required"),
  messagingPainPoints: z.string().optional(),
  messagingTone: z.string().min(1, "Messaging tone is required"),
  messagingGoals: z.string().min(1, "Messaging goals are required"),
});
const step3Schema = z.object({
  // For file uploads, react-hook-form handles them differently.
  // We'll manage files separately and then link them upon submission.
  // This schema part is more for other content-related fields if any.
  uploadedContentReferences: z.array(z.object({ name: z.string(), type: z.string(), size: z.number() })).optional(),
});
const step4Schema = z.object({
  creativeConstraintsMustHaves: z.string().optional(),
  creativeConstraintsDonts: z.string().optional(),
  creativeConstraintsCTAs: z.string().min(1, "At least one CTA is required"),
});

// Combine schemas for overall validation if needed, or validate per step
const campaignBriefSchema = step1Schema.merge(step2Schema).merge(step3Schema).merge(step4Schema);
export type CampaignBriefFormData = z.infer<typeof campaignBriefSchema>;

// Individual step components (placeholders for now)
const Step1Objective: React.FC = () => {
  // (@ts-ignore)
  const { register, formState: { errors } } = useFormContext();
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="objective" className="block text-sm font-medium text-gray-700">Objective</label>
        <textarea id="objective" {...register("objective")} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" placeholder="e.g., Generate leads for new X feature" />
        {errors.objective && <p className="text-red-500 text-xs mt-1">{(errors.objective as any)?.message}</p>}
      </div>
      <div>
        <label htmlFor="funnelStage" className="block text-sm font-medium text-gray-700">Funnel Stage</label>
        <select id="funnelStage" {...register("funnelStage")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
          <option value="">Select Stage</option>
          <option value="AWARENESS">Awareness</option>
          <option value="CONSIDERATION">Consideration</option>
          <option value="CONVERSION">Conversion</option>
        </select>
        {errors.funnelStage && <p className="text-red-500 text-xs mt-1">{(errors.funnelStage as any)?.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Target Platforms</label>
        {/* Replace with actual multi-select component (e.g., checkboxes or multi-select dropdown) */}
        <div className="mt-1 space-y-2">
          {['LinkedIn', 'Google Ads', 'Facebook', 'Instagram', 'TikTok', 'Other'].map(platform => (
            <label key={platform} className="flex items-center">
              <input type="checkbox" {...register("targetPlatforms")} value={platform.toLowerCase().replace(' ', '_')} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
              <span className="ml-2 text-sm text-gray-700">{platform}</span>
            </label>
          ))}
        </div>
        {errors.targetPlatforms && <p className="text-red-500 text-xs mt-1">{(errors.targetPlatforms as any)?.message}</p>}
      </div>
    </div>
  );
};

const Step2Audience: React.FC = () => {
  // (@ts-ignore)
  const { register, formState: { errors } } = useFormContext();
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="audience" className="block text-sm font-medium text-gray-700">Audience</label>
        <textarea id="audience" {...register("audience")} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" placeholder="Describe your target audience..." />
        {errors.audience && <p className="text-red-500 text-xs mt-1">{(errors.audience as any)?.message}</p>}
      </div>
      <div>
        <label htmlFor="messagingPainPoints" className="block text-sm font-medium text-gray-700">Messaging: Pain Points</label>
        <textarea id="messagingPainPoints" {...register("messagingPainPoints")} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" placeholder="What problems do they face?" />
      </div>
      <div>
        <label htmlFor="messagingTone" className="block text-sm font-medium text-gray-700">Messaging: Tone</label>
        <input id="messagingTone" {...register("messagingTone")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" placeholder="e.g., Professional, Playful, Urgent" />
        {errors.messagingTone && <p className="text-red-500 text-xs mt-1">{(errors.messagingTone as any)?.message}</p>}
      </div>
      <div>
        <label htmlFor="messagingGoals" className="block text-sm font-medium text-gray-700">Messaging: Goals</label>
        <textarea id="messagingGoals" {...register("messagingGoals")} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" placeholder="What should the messaging achieve?" />
        {errors.messagingGoals && <p className="text-red-500 text-xs mt-1">{(errors.messagingGoals as any)?.message}</p>}
      </div>
    </div>
  );
};

const Step3Uploads: React.FC<{files: File[], setFiles: React.Dispatch<React.SetStateAction<File[]>>}> = ({ files, setFiles }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };
  return (
    <div>
      <label htmlFor="contentUploads" className="block text-sm font-medium text-gray-700">Upload Content (PDFs, Decks, etc.)</label>
      <input id="contentUploads" type="file" multiple onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"/>
      {files.length > 0 && (
        <ul className="mt-2 list-disc list-inside">
          {files.map(file => <li key={file.name} className="text-sm">{file.name} ({Math.round(file.size / 1024)} KB)</li>)}
        </ul>
      )}
    </div>
  );
};

const Step4Constraints: React.FC = () => {
  // (@ts-ignore)
  const { register, formState: { errors } } = useFormContext();
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="creativeConstraintsMustHaves" className="block text-sm font-medium text-gray-700">Creative Constraints: Must-Haves</label>
        <textarea id="creativeConstraintsMustHaves" {...register("creativeConstraintsMustHaves")} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" placeholder="e.g., Logo placement, specific disclaimers" />
      </div>
      <div>
        <label htmlFor="creativeConstraintsDonts" className="block text-sm font-medium text-gray-700">Creative Constraints: Don'ts</label>
        <textarea id="creativeConstraintsDonts" {...register("creativeConstraintsDonts")} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" placeholder="e.g., Avoid using competitor imagery" />
      </div>
      <div>
        <label htmlFor="creativeConstraintsCTAs" className="block text-sm font-medium text-gray-700">Call to Actions (CTAs)</label>
        <textarea id="creativeConstraintsCTAs" {...register("creativeConstraintsCTAs")} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" placeholder="e.g., Sign Up Now, Learn More" />
        {errors.creativeConstraintsCTAs && <p className="text-red-500 text-xs mt-1">{(errors.creativeConstraintsCTAs as any)?.message}</p>}
      </div>
    </div>
  );
};


export const CampaignBriefForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<CampaignBriefFormData>({
    resolver: zodResolver(
      currentStep === 1 ? step1Schema :
      currentStep === 2 ? step2Schema :
      currentStep === 4 ? step4Schema : campaignBriefSchema // Fallback or combined for final submit
    ),
    mode: "onChange", // Validate on change for better UX
  });

  const { handleSubmit, trigger, getValues } = methods;

  const handleNext = async () => {
    const isValid = await trigger();
    if (isValid) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        // Final submission handled by onSubmit
        await methods.handleSubmit(onSubmit)();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit: SubmitHandler<CampaignBriefFormData> = async (data) => {
    setIsLoading(true);
    const formData = new FormData();

    // Append JSON data
    formData.append('jsonData', JSON.stringify(data));

    // Append files
    uploadedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/campaign-briefs', {
        method: 'POST',
        body: formData, // Sending FormData for multipart/form-data
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create campaign brief');
      }
      const result = await response.json();
      toast({ title: 'Success', description: 'Campaign brief created successfully! AI recommendations are being generated.' });
      // router.push(`/campaign-brief/${result.data.id}`); // Navigate to view the new brief
      router.push('/dashboard'); // Or back to dashboard
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // For useFormContext
  // const { register, formState: { errors } } = methods; // This was causing a duplicate declaration error. Removed.


  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-4 border rounded-lg shadow">
        {currentStep === 1 && <Step1Objective />}
        {currentStep === 2 && <Step2Audience />}
        {currentStep === 3 && <Step3Uploads files={uploadedFiles} setFiles={setUploadedFiles} />}
        {currentStep === 4 && <Step4Constraints />}

        <div className="flex justify-between pt-4">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handlePrevious} disabled={isLoading}>
              Previous
            </Button>
          )}
          <div /> {/* For spacing */}
          {currentStep < 4 ? (
            <Button type="button" onClick={handleNext} disabled={isLoading}>
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Campaign Brief'}
            </Button>
          )}
        </div>
        <p className="text-sm text-center">Step {currentStep} of 4</p>
      </form>
    </FormProvider>
  );
};
