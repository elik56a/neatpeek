"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAppDataContext } from "@/providers";
import { zodResolver } from "@hookform/resolvers/zod";
import { LayoutDashboard, Mail, Plus, Settings, Trash2, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
}

interface TeamDetailProps {
  teamId: string;
}

const addMemberSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type AddMemberFormValues = z.infer<typeof addMemberSchema>;

export function TeamDetail({ teamId }: TeamDetailProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { companyId, isCompanyAdmin } = useAppDataContext();
  const [team, setTeam] = useState<{
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
  } | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      email: "",
    },
  });

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
        setTeam(data);

        // Fetch team members
        const membersResponse = await fetch(`/api/teams/${teamId}/members`);

        if (!membersResponse.ok) {
          const errorData = await membersResponse.json();
          throw new Error(errorData.error || "Failed to fetch team members");
        }

        const membersData = await membersResponse.json();
        setMembers(membersData);
      } catch (error) {
        console.error("Error fetching team details:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch team details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamDetails();
  }, [teamId, companyId]);

  const onAddMember = async (data: AddMemberFormValues) => {
    if (!teamId || !companyId) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add member");
      }

      // Refetch team members
      const membersResponse = await fetch(`/api/teams/${teamId}/members`);
      const membersData = await membersResponse.json();
      setMembers(membersData);

      setIsAddMemberDialogOpen(false);
      form.reset();

      toast({
        title: "Member added",
        description: `${data.email} has been added to the team.`,
      });
    } catch (error) {
      console.error("Error adding member:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add member",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!teamId || !companyId || !isCompanyAdmin) return;

    try {
      const response = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove member");
      }

      // Update the members list
      setMembers(members.filter((member) => member.id !== memberId));

      toast({
        title: "Member removed",
        description: "The member has been removed from the team.",
      });
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove member",
        variant: "destructive",
      });
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
        <p>Error loading team details: {error}</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
        <p>Team not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{team.name}</h1>
          <p className="text-muted-foreground">{team.description || "No description provided."}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/teams/${teamId}/dashboard`}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          {isCompanyAdmin && (
            <Button onClick={() => router.push(`/teams/${teamId}/edit`)}>
              <Settings className="mr-2 h-4 w-4" />
              Edit Team
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Information</CardTitle>
              <CardDescription>
                Basic information about the team.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Name</h3>
                <p>{team.name}</p>
              </div>
              <div>
                <h3 className="font-medium">Description</h3>
                <p>{team.description || "No description provided."}</p>
              </div>
              <div>
                <h3 className="font-medium">Created</h3>
                <p>{new Date(team.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="font-medium">Members</h3>
                <p>{members.length}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="members" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Team Members</h2>
            {isCompanyAdmin && (
              <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>
                      Add a new member to the team by email address.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onAddMember)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="user@example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              The email address of the user you want to add to the team.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Adding..." : "Add Member"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <Users className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium">No members yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Add members to your team to collaborate on projects.
              </p>
              {isCompanyAdmin && (
                <Button onClick={() => setIsAddMemberDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              )}
            </div>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    {isCompanyAdmin && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.role}</TableCell>
                      {isCompanyAdmin && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              window.location.href = `mailto:${member.email}`;
                            }}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
