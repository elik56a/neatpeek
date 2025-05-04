"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useNotificationSettings } from "../hooks";
import { SaveButton } from "./SaveButton";

export function NotificationSettings() {
  const { settings, isLoading, saveSuccess, handleChange, handleSubmit } =
    useNotificationSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Configure how you receive notifications and updates.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="designChecksComplete" className="flex flex-col space-y-1">
              <span>Design Checks Complete</span>
              <span className="font-normal text-xs text-muted-foreground">
                Receive notifications when design checks are completed.
              </span>
            </Label>
            <Switch
              id="designChecksComplete"
              checked={settings.designChecksComplete}
              onCheckedChange={checked => handleChange("designChecksComplete", checked)}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="designChecksFailed" className="flex flex-col space-y-1">
              <span>Design Checks Failed</span>
              <span className="font-normal text-xs text-muted-foreground">
                Receive notifications when design checks fail.
              </span>
            </Label>
            <Switch
              id="designChecksFailed"
              checked={settings.designChecksFailed}
              onCheckedChange={checked => handleChange("designChecksFailed", checked)}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="commentsOnDesigns" className="flex flex-col space-y-1">
              <span>Comments on Designs</span>
              <span className="font-normal text-xs text-muted-foreground">
                Receive notifications when someone comments on your designs.
              </span>
            </Label>
            <Switch
              id="commentsOnDesigns"
              checked={settings.commentsOnDesigns}
              onCheckedChange={checked => handleChange("commentsOnDesigns", checked)}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="brandUpdates" className="flex flex-col space-y-1">
              <span>Brand Updates</span>
              <span className="font-normal text-xs text-muted-foreground">
                Receive notifications when your brand guidelines are updated.
              </span>
            </Label>
            <Switch
              id="brandUpdates"
              checked={settings.brandUpdates}
              onCheckedChange={checked => handleChange("brandUpdates", checked)}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="marketingEmails" className="flex flex-col space-y-1">
              <span>Marketing Emails</span>
              <span className="font-normal text-xs text-muted-foreground">
                Receive emails about new features and promotions.
              </span>
            </Label>
            <Switch
              id="marketingEmails"
              checked={settings.marketingEmails}
              onCheckedChange={checked => handleChange("marketingEmails", checked)}
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
