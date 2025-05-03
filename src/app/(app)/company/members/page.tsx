"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useAppDataContext } from "@/providers";
import { User, CompanyRole } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building, Mail, Plus, UserPlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type CompanyMember = Pick<User, "id" | "name" | "email" | "image"> & {
  companyRole: CompanyRole;
};

const inviteUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
});

type InviteUserFormValues = z.infer<typeof inviteUserSchema>;

export default function CompanyMembersPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { company, isCompanyAdmin } = useAppDataContext();
  const companyId = company?.id;
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const form = useForm<InviteUserFormValues>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: "",
      role: "MEMBER",
    },
  });

  // Redirect if user is not a company admin
  useEffect(() => {
    if (!isLoading && (!companyId || !isCompanyAdmin)) {
      router.push("/dashboard");
      toast({
        title: "Access Denied",
        description: "You don't have permission to manage company members.",
        variant: "destructive",
      });
    }
  }, [companyId, isCompanyAdmin, isLoading, router, toast]);

  // Fetch company members
  useEffect(() => {
    const fetchCompanyMembers = async () => {
      if (!companyId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/companies/${companyId}/members`);

        if (!response.ok) {
          throw new Error("Failed to fetch company members");
        }

        const data = await response.json();
        setMembers(data);
      } catch (error) {
        console.error("Error fetching company members:", error);
        toast({
          title: "Error",
          description: "Failed to load company members",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyMembers();
  }, [companyId, toast]);

  const onInviteUser = async (data: InviteUserFormValues) => {
    if (!companyId) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/companies/${companyId}/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to invite user");
      }

      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${data.email}.`,
      });

      // Close the dialog and reset the form
      setInviteDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error inviting user:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to invite user",
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
    <div className="container py-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Company Members</h1>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a New Member</DialogTitle>
              <DialogDescription>Send an invitation to join your company.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onInviteUser)} className="space-y-6">
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
                        The email address of the person you want to invite.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="OWNER">Owner</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="MEMBER">Member</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The role determines what permissions the user will have.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send Invitation"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            <CardTitle>{company?.name || "Company"} Members</CardTitle>
          </div>
          <CardDescription>Manage the members of your company and their roles.</CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Users className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium">No members yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Invite team members to collaborate on your projects.
              </p>
              <Button onClick={() => setInviteDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map(member => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.companyRole}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
