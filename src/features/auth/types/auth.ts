export interface AuthError {
  code: string;
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface AuthResponse {
  success: boolean;
  error?: AuthError;
  data?: any;
}
