/**
 * API utilities for settings-related operations
 */

/**
 * Update user profile information
 */
export async function updateUserProfile(data: { name: string; company: string; role: string }) {
  const response = await fetch("/api/users/update-profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update profile");
  }

  return response.json();
}

/**
 * Update user notification settings
 */
export async function updateNotificationSettings(data: Record<string, boolean>) {
  const response = await fetch("/api/users/notification-settings", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update notification settings");
  }

  return response.json();
}

/**
 * Update user appearance settings
 */
export async function updateAppearanceSettings(data: {
  theme: string;
  fontSize: string;
  colorScheme: string;
}) {
  const response = await fetch("/api/users/appearance-settings", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update appearance settings");
  }

  return response.json();
}

/**
 * Update user security settings
 */
export async function updateSecuritySettings(data: {
  currentPassword?: string;
  newPassword?: string;
  twoFactorEnabled?: boolean;
}) {
  const response = await fetch("/api/users/security-settings", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update security settings");
  }

  return response.json();
}
