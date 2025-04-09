"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth";
import { useProfileForm } from "../hooks";
import { SaveButton } from "./SaveButton";

export function ProfileSettings() {
  const { user } = useAuth();
  const { formData, isLoading, saveSuccess, handleChange, handleSubmit } = useProfileForm();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Manage your personal information and how it appears to others.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user?.image} alt={user?.name || ''} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground font-medium">
                {user?.name ? user.name.split(' ').map(n => n[0]?.toUpperCase()).join('').substring(0, 2) : ''}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">
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
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled={true}
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Job Role</Label>
                <Input
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <SaveButton
          isLoading={isLoading}
          saveSuccess={saveSuccess}
          onClick={handleSubmit}
        />
      </CardFooter>
    </Card>
  );
}
