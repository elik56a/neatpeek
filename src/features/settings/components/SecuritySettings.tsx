"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSecuritySettings } from "../hooks";
import { SaveButton } from "./SaveButton";

export function SecuritySettings() {
  const { formData, isLoading, saveSuccess, handleChange, handleSubmit } = useSecuritySettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>Manage your account security and authentication settings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
              disabled={isLoading}
              className="transition-all duration-200"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                disabled={isLoading}
                className="transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                className="transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex items-center justify-between space-x-2 pt-4">
            <Label htmlFor="twoFactorEnabled" className="flex flex-col space-y-1">
              <span>Two-Factor Authentication</span>
              <span className="font-normal text-xs text-muted-foreground">
                Add an extra layer of security to your account.
              </span>
            </Label>
            <Switch
              id="twoFactorEnabled"
              name="twoFactorEnabled"
              checked={formData.twoFactorEnabled}
              onCheckedChange={checked =>
                handleChange({
                  target: { name: "twoFactorEnabled", checked, type: "checkbox" },
                } as any)
              }
              disabled={isLoading}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <SaveButton isLoading={isLoading} saveSuccess={saveSuccess} onClick={handleSubmit} />
      </CardFooter>
    </Card>
  );
}
