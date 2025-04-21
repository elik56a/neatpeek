"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const createCompanySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters").max(100),
  domain: z.string().optional(),
  logo: z.string().optional(),
});

type CreateCompanyFormValues = z.infer<typeof createCompanySchema>;

export default function CreateCompanyPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateCompanyFormValues>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: "",
      domain: "",
      logo: "",
    },
  });

  const onSubmit = async (data: CreateCompanyFormValues) => {
    setIsSubmitting(true);

    try {
      // Trim input values and convert empty strings to undefined
      const cleanedData = {
        name: data.name.trim(),
        domain: data.domain?.trim() || undefined,
        logo: data.logo?.trim() || undefined,
      };

      const response = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create company");
      }

      const result = await response.json();

      toast({
        title: "Company created",
        description: `${result.company.name} has been created successfully.`,
      });

      // Update the session with the new company data
      await updateSession({
        companyId: result.user.companyId,
        companyRole: result.user.companyRole
      });

      // Show success message
      toast({
        title: "Success",
        description: "Refreshing session with your new company data...",
        duration: 3000,
      });

    } catch (error) {
      console.error("Error creating company:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create company",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            <CardTitle>Create a Company</CardTitle>
          </div>
          <CardDescription>
            Create a new company to manage your brands and team members.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Inc." {...field} />
                    </FormControl>
                    <FormDescription>
                      The name of your company or organization.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Domain (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="acme.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Users with this email domain will automatically join your company.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/logo.png" {...field} />
                    </FormControl>
                    <FormDescription>
                      A URL to your company logo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Company"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
