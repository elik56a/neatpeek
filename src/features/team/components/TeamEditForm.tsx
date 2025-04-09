"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAppDataContext } from "@/providers";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface TeamEditFormProps {
  teamId: string;
}

const editTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters").max(50, "Team name must be less than 50 characters"),
  description: z.string().optional(),
});

type EditTeamFormValues = z.infer<typeof editTeamSchema>;

export function TeamEditForm({ teamId }: TeamEditFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { companyId, isCompanyAdmin } = useAppDataContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<EditTeamFormValues>({
    resolver: zodResolver(editTeamSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Redirect if user is not a company admin
  useEffect(() => {
    if (!isLoading && (!companyId || !isCompanyAdmin)) {
      router.push("/teams");
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit teams.",
        variant: "destructive",
      });
    }
  }, [companyId, isCompanyAdmin, isLoading, router, toast]);

  // Fetch team details
  useEffect(() => {
    const fetchTeamDetails = async () => {
      if (!teamId || !companyId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/teams/${teamId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch team details");
        }

        const data = await response.json();
        
        // Update form values
        form.reset({
          name: data.name,
          description: data.description || "",
        });
      } catch (error) {
        console.error("Error fetching team details:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch team details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamDetails();
  }, [teamId, companyId, form]);

  const onSubmit = async (data: EditTeamFormValues) => {
    if (!teamId || !companyId) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update team");
      }

      toast({
        title: "Team updated",
        description: "The team has been updated successfully.",
      });

      // Redirect to team details page
      router.push(`/teams/${teamId}`);
    } catch (error) {
      console.error("Error updating team:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update team",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTeam = async () => {
    if (!teamId || !companyId || !isCompanyAdmin) return;

    if (!confirm("Are you sure you want to delete this team? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete team");
      }

      toast({
        title: "Team deleted",
        description: "The team has been deleted successfully.",
      });

      // Redirect to teams page
      router.push("/teams");
    } catch (error) {
      console.error("Error deleting team:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete team",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
        <div className="flex items-center">
          <AlertCircle className="mr-2 h-4 w-4" />
          <p>Error loading team details: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Team</h1>
        <p className="text-muted-foreground">Update team information or delete the team.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Information</CardTitle>
          <CardDescription>
            Edit the team's basic information.
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
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Marketing Team" {...field} />
                    </FormControl>
                    <FormDescription>
                      The name of your team.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Team responsible for marketing activities"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description of the team's purpose.
                    </FormDescription>
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
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete this team and all associated data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Once you delete a team, there is no going back. This action cannot be undone.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            variant="destructive"
            onClick={deleteTeam}
            disabled={isDeleting}
            className="flex items-center"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete Team"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
