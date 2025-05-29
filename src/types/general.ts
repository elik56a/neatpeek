/**
 * General type definitions
 */

export interface IdAndName {
  id: string;
  name: string;
}

export interface CustomDropdownOption {
  value: string;
  label: string;
}

export interface FigmaTokens {
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: Date | null;
  id: string;
}

// Page params interface for dynamic routes
export interface PageParams<T = Record<string, string>> {
  params: Promise<T>;
}
