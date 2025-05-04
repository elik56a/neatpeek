/**
 * Types for the brand setup feature
 *
 * TODO: Consider migrating these types to use the centralized types from @/types
 * For now, we're keeping these separate to avoid breaking changes, but we should
 * eventually migrate to use the centralized types for better consistency.
 */

export interface BrandGuideline {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: BrandGuidelineStatus;
  createdAt: Date;
  updatedAt: Date;
  pdfUrl?: string;
  pdfPath?: string;
  designImages?: DesignImage[];
  customRules?: CustomRule[];
  brandRules?: BrandRule[];
  processingStatus: BrandGuidelineStatus;
  processingMessage?: string;
  companyId?: string;
  teamId?: string;
  company?: {
    id: string;
    name: string;
    domain?: string;
    logo?: string;
  };
  team?: {
    id: string;
    name: string;
  };
}

export enum BrandGuidelineStatus {
  DRAFT = "DRAFT",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum ProcessingStatus {
  PENDING = "PENDING",
  FETCHING_FILES = "FETCHING_FILES",
  ANALYZING_PDF = "ANALYZING_PDF",
  ANALYZING_IMAGES = "ANALYZING_IMAGES",
  GENERATING_RULES = "GENERATING_RULES",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface DesignImage {
  id: string;
  brandGuidelineId: string;
  url: string;
  path: string;
  name?: string;
  description?: string;
  createdAt: Date;
}

export interface CustomRule {
  id: string;
  brandGuidelineId: string;
  category: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandRule {
  id: string;
  brandGuidelineId: string;
  category: RuleCategory;
  name: string;
  value: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum RuleCategory {
  COLOR = "COLOR",
  TYPOGRAPHY = "TYPOGRAPHY",
  SPACING = "SPACING",
  LOGO = "LOGO",
  ICON = "ICON",
  LAYOUT = "LAYOUT",
  GENERAL = "GENERAL",
}

export enum RuleSource {
  PDF = "PDF",
  IMAGE = "IMAGE",
  CUSTOM = "CUSTOM",
  AI = "AI",
}

export interface BrandSetupFormData {
  name: string;
  description?: string;
  pdfFile?: File | null;
  pdfPath?: string;
  designImages?: File[];
  designImagePaths?: {
    id: string;
    path: string;
    url: string;
    name?: string;
    description?: string;
  }[];
  customRules?: {
    id?: string;
    category: string;
    name: string;
    description: string;
  }[];
  companyId?: string;
  teamId?: string;
}

export interface AIAnalysisResult {
  metadata?: {
    companyName?: string;
    industry?: string;
    [key: string]: any;
  };
  colors?: {
    name: string;
    value: string;
    description?: string;
  }[];
  typography?: {
    name: string;
    value: string;
    description?: string;
  }[];
  spacing?: {
    name: string;
    value: string;
    description?: string;
  }[];
  logo?: {
    name: string;
    value: string;
    description?: string;
  }[];
  icons?: {
    name: string;
    value: string;
    description?: string;
  }[];
  layout?: {
    name: string;
    value: string;
    description?: string;
  }[];
  general?: {
    name: string;
    value: string;
    description?: string;
  }[];
  [key: string]: any;
}
