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
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/features/auth";
import { Building, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Invitation {
  id: string;
  email: string;
  companyId: string;
  company: {
    name: string;
    domain?: string;
    logo?: string;
  };
  role: string;
  status: string;
  expires: string;
}

export default function InvitationPage({ params }: { params: { token: string } }) {
  const { token } = params;
  const { toast } = useToast();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [invitationStatus, setInvitationStatus] = useState<
    "loading" | "valid" | "invalid" | "accepted" | "error"
  >("loading");
  const [isAccepting, setIsAccepting] = useState(false);

  // Fetch invitation details
  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await fetch(`/api/invitations/${token}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Invalid invitation");
        }

        const data = await response.json();
        setInvitation(data);
        setInvitationStatus("valid");
      } catch (error) {
        console.error("Error fetching invitation:", error);
        setInvitationStatus("invalid");
        toast({
          title: "Invalid Invitation",
          description:
            error instanceof Error ? error.message : "This invitation is not valid or has expired.",
          variant: "destructive",
        });
      }
    };

    if (!isLoading) {
      fetchInvitation();
    }
  }, [token, toast, isLoading]);

  // Check if the user is logged in and the invitation is for them
  useEffect(() => {
    if (!isLoading && invitation && isAuthenticated) {
      if (user?.email !== invitation.email) {
        setInvitationStatus("invalid");
        toast({
          title: "Invalid Invitation",
          description: `This invitation is for ${invitation.email}, but you are logged in as ${user?.email}.`,
          variant: "destructive",
        });
      }
    }
  }, [invitation, isAuthenticated, isLoading, toast, user]);

  const acceptInvitation = async () => {
    if (!invitation || !isAuthenticated) return;

    setIsAccepting(true);

    try {
      const response = await fetch(`/api/invitations/${token}`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to accept invitation");
      }

      setInvitationStatus("accepted");
      toast({
        title: "Invitation Accepted",
        description: `You have joined ${invitation.company.name}.`,
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error("Error accepting invitation:", error);
      setInvitationStatus("error");
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to accept invitation",
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading || invitationStatus === "loading") {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (invitationStatus === "invalid") {
    return (
      <div className="container max-w-md py-10">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-center">Invalid Invitation</CardTitle>
            <CardDescription className="text-center">
              This invitation is not valid or has expired.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (invitationStatus === "accepted") {
    return (
      <div className="container max-w-md py-10">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-center">Invitation Accepted</CardTitle>
            <CardDescription className="text-center">
              You have successfully joined {invitation?.company.name}.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container max-w-md py-10">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center">
              <Building className="h-12 w-12" />
            </div>
            <CardTitle className="text-center">Company Invitation</CardTitle>
            <CardDescription className="text-center">
              You have been invited to join {invitation?.company.name}.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">
              Please log in or create an account with <strong>{invitation?.email}</strong> to accept
              this invitation.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() =>
                  router.push(
                    `/login?email=${encodeURIComponent(invitation?.email || "")}&callbackUrl=${encodeURIComponent(`/invitations/${token}`)}`
                  )
                }
              >
                Log In
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  router.push(
                    `/register?email=${encodeURIComponent(invitation?.email || "")}&callbackUrl=${encodeURIComponent(`/invitations/${token}`)}`
                  )
                }
              >
                Register
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center">
            <Building className="h-12 w-12" />
          </div>
          <CardTitle className="text-center">Company Invitation</CardTitle>
          <CardDescription className="text-center">
            You have been invited to join {invitation?.company.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-2 text-center">
            <p>
              <strong>Company:</strong> {invitation?.company.name}
            </p>
            <p>
              <strong>Role:</strong> {invitation?.role}
            </p>
            <p>
              <strong>Email:</strong> {invitation?.email}
            </p>
          </div>
          <div className="flex justify-center">
            <Button onClick={acceptInvitation} disabled={isAccepting}>
              {isAccepting ? "Accepting..." : "Accept Invitation"}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Decline
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
