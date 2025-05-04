"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAppDataContext } from "@/providers";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const updateCompanySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters").max(100),
  domain: z.string().optional(),
  logo: z.string().optional(),
});

type UpdateCompanyFormValues = z.infer<typeof updateCompanySchema>;

export default function CompanySettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { company, isCompanyAdmin, refreshData } = useAppDataContext();
  const companyId = company?.id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<UpdateCompanyFormValues>({
    resolver: zodResolver(updateCompanySchema),
    defaultValues: {
      name: "",
      domain: "",
      logo: "",
    },
  });

  // Redirect if user is not a company admin
  useEffect(() => {
    if (!isLoading && (!companyId || !isCompanyAdmin)) {
      router.push("/dashboard");
      toast({
        title: "Access Denied",
        description: "You don't have permission to access company settings.",
        variant: "destructive",
      });
    }
  }, [companyId, isCompanyAdmin, isLoading, router, toast]);

  // Fetch company details
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (!companyId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/companies/${companyId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch company details");
        }

        const companyData = await response.json();

        // Update form values
        form.reset({
          name: companyData.name || "",
          domain: companyData.domain || "",
          logo: companyData.logo || "",
        });
      } catch (error) {
        console.error("Error fetching company details:", error);
        toast({
          title: "Error",
          description: "Failed to load company details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [companyId, form, toast]);

  const onSubmit = async (data: UpdateCompanyFormValues) => {
    if (!companyId) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/companies/${companyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update company");
      }

      await refreshData();

      toast({
        title: "Company updated",
        description: "Company settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating company:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update company",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            <CardTitle>Company Settings</CardTitle>
          </div>
          <CardDescription>Manage your company settings and preferences.</CardDescription>
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
                    <FormDescription>The name of your company or organization.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Domain</FormLabel>
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
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/logo.png" {...field} />
                    </FormControl>
                    <FormDescription>A URL to your company logo.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
