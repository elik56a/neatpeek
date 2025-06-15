// src/features/onboarding/components/CompanyProfileForm.tsx
"use client";

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button'; // Assuming shadcn/ui
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast'; // Assuming a toast hook exists

const companyProfileSchema = z.object({
  industry: z.string().min(1, "Industry is required"),
  personas: z.string().min(1, "Personas are required"), // Consider a more structured input or JSON editor later
  positioning: z.string().min(1, "Positioning is required"),
});

export type CompanyProfileFormData = z.infer<typeof companyProfileSchema>;

interface CompanyProfileFormProps {
  companyId: string; // Assuming companyId is passed as a prop
  initialData?: Partial<CompanyProfileFormData>;
  onSuccess?: (data: CompanyProfileFormData) => void;
  onSkip?: () => void; // Optional: if skipping is allowed
}

export const CompanyProfileForm: React.FC<CompanyProfileFormProps> = ({ companyId, initialData, onSuccess, onSkip }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<CompanyProfileFormData>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: initialData || {
      industry: '',
      personas: '',
      positioning: '',
    },
  });

  const onSubmit: SubmitHandler<CompanyProfileFormData> = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/onboarding/company-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, companyId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save company profile');
      }

      const result = await response.json();
      toast({ title: 'Success', description: 'Company profile saved successfully.' });
      if (onSuccess) {
        onSuccess(result.data);
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Industry</FormLabel>
              <FormControl>
                <Input placeholder="e.g., SaaS, E-commerce, Healthcare" {...field} />
              </FormControl>
              <FormDescription>What industry is your company in?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="personas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Personas</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe your key customer personas (e.g., demographics, needs, pain points)" {...field} rows={5} />
              </FormControl>
              <FormDescription>Who are your ideal customers?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="positioning"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand Positioning</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe your unique value proposition and brand positioning" {...field} rows={3} />
              </FormControl>
              <FormDescription>How do you differentiate in the market?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          {onSkip && (
            <Button type="button" variant="outline" onClick={onSkip} disabled={isLoading}>
              Skip
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save and Continue'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
