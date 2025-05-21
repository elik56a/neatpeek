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
