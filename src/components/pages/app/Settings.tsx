
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, useRefreshUser } from "@/features/auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { useRef, useState } from "react";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { refreshUser } = useRefreshUser();
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Use a ref to store the initial form data to avoid re-renders
  const initialFormDataRef = useRef({
    name: user?.name || "",
    email: user?.email || "",
    company: user?.companyName || "",
    role: user?.role || "Design Manager",
  });

  // Use local state that doesn't depend on user prop changes
  const [profileForm, setProfileForm] = useState(initialFormDataRef.current);
  const [notificationSettings, setNotificationSettings] = useState({
    designChecksComplete: true,
    designChecksFailed: true,
    commentsOnDesigns: true,
    brandUpdates: true,
    marketingEmails: false,
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Update the form state directly without using a callback
    // This prevents unnecessary re-renders
    const updatedForm = { ...profileForm, [name]: value };
    setProfileForm(updatedForm);

    // Add a very subtle highlight effect
    const inputElement = e.target;
    inputElement.style.transition = 'background-color 0.3s ease';
    inputElement.style.backgroundColor = 'rgba(var(--primary), 0.03)';
    setTimeout(() => {
      inputElement.style.backgroundColor = '';
    }, 300);
  };

  const handleNotificationChange = (key: string, checked: boolean) => {
    setNotificationSettings((prev) => ({ ...prev, [key]: checked }));
  };

  const handleSaveProfile = async () => {
    if (isLoading) return; // Prevent multiple submissions
    setIsLoading(true);

    try {
      // Make a real API call to update the profile
      const response = await fetch('/api/users/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileForm.name,
          company: profileForm.company,
          role: profileForm.role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      // Get the updated user data
      const updatedUser = await response.json();

      // Update the local form state with the returned data
      // Use the ref approach to avoid re-renders
      const updatedForm = {
        ...profileForm,
        name: updatedUser.name,
        company: updatedUser.companyName || profileForm.company,
        role: updatedUser.role || profileForm.role,
      };

      // Update the form state without causing a re-render cascade
      setProfileForm(updatedForm);

      // Update the ref value too
      initialFormDataRef.current = updatedForm;

      // Show success animation and message
      setSaveSuccess(true);
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      });

      // Reset success state after animation
      setTimeout(() => setSaveSuccess(false), 2000);

      // We'll update the session in the background without waiting for it
      // This prevents the page from reloading
      refreshUser({
        name: updatedUser.name,
        companyName: updatedUser.companyName,
        role: updatedUser.role
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Update failed",
        description: typeof error === 'object' && error !== null && 'message' in error
          ? error.message as string
          : "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      console.error("Failed to update notification settings:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your notification settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Update your personal information and profile settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-[180px] flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={user?.image} alt={user?.name || ''} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground font-medium">
                      {user?.name ? user.name.split(' ').map(n => n[0]?.toUpperCase()).join('').substring(0, 2) : ''}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" className="mt-2">
                    Change Avatar
                  </Button>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileChange}
                        disabled={isLoading}
                        className="transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <Input
                        id="company"
                        name="company"
                        value={profileForm.company}
                        onChange={handleProfileChange}
                        disabled={isLoading}
                        className="transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Job Role</Label>
                      <Input
                        id="role"
                        name="role"
                        value={profileForm.role}
                        onChange={handleProfileChange}
                        disabled={isLoading}
                        className="transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      disabled={isLoading}
                    />
                  </div>
                  <div />
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className={saveSuccess ? "bg-green-600 hover:bg-green-700 transition-colors duration-300" : "transition-colors duration-300"}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : saveSuccess ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure when and how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="design-checks">Design Checks Complete</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive an email when your design checks are completed
                      </p>
                    </div>
                    <Switch
                      id="design-checks"
                      checked={notificationSettings.designChecksComplete}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("designChecksComplete", checked)
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="failed-checks">Failed Design Checks</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive an email when a design fails compliance checks
                      </p>
                    </div>
                    <Switch
                      id="failed-checks"
                      checked={notificationSettings.designChecksFailed}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("designChecksFailed", checked)
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="comments">Comments on Designs</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive an email when someone comments on your designs
                      </p>
                    </div>
                    <Switch
                      id="comments"
                      checked={notificationSettings.commentsOnDesigns}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("commentsOnDesigns", checked)
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="brand-updates">Brand Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive an email when your brand guidelines are updated
                      </p>
                    </div>
                    <Switch
                      id="brand-updates"
                      checked={notificationSettings.brandUpdates}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("brandUpdates", checked)
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketing">Marketing and Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about new features and product updates
                      </p>
                    </div>
                    <Switch
                      id="marketing"
                      checked={notificationSettings.marketingEmails}
                      onCheckedChange={(checked) =>
                        handleNotificationChange("marketingEmails", checked)
                      }
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveNotifications} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Invite team members and manage permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="py-6">
              <div className="flex flex-col items-center justify-center text-center py-12">
                <div className="rounded-full h-12 w-12 bg-muted flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Team Management</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  This feature is available on the Professional and Enterprise plans.
                  Upgrade your account to invite team members to collaborate.
                </p>
                <Button>Upgrade Plan</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing and Subscription</CardTitle>
              <CardDescription>
                Manage your subscription plan and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Current Plan</h3>
                <div className="rounded-lg border p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-600 dark:bg-brand-950 dark:text-brand-300">
                        Starter Plan
                      </div>
                      <p className="text-sm mt-2">
                        <span className="font-medium">$29</span>
                        <span className="text-muted-foreground"> / month</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Renews on October 12, 2023
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button variant="outline">Change Plan</Button>
                      <Button variant="destructive">Cancel Subscription</Button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Payment Method</h3>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md border bg-card p-2 h-10 w-14 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="28"
                          height="16"
                          viewBox="0 0 28 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-foreground"
                        >
                          <rect width="26" height="14" x="1" y="1" rx="2" />
                          <path d="M1 5h26" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Visa ending in 4242</p>
                        <p className="text-sm text-muted-foreground">
                          Expires 08/2025
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Update
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Billing History</h3>
                <div className="rounded-lg border">
                  <div className="divide-y">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-medium">Invoice #{2023000 + i}</p>
                          <p className="text-sm text-muted-foreground">
                            September {i}, 2023
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-medium">$29.00</p>
                          <Button variant="ghost" size="sm">
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
