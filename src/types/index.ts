/**
 * Global type definitions
 */

/**
 * Figma Frame entity
 */

export enum CompanyRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export interface FigmaFrame {
  id: string;
  brandGuidelineId: string;
  figmaFileKey: string;
  figmaFileName: string;
  frameId: string;
  name: string;
  imageUrl: string;
  screenType?: string;
  platform?: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  lastSynced?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  designReviews?: DesignReview[];
  brandGuideline?: BrandGuideline;
}

/**
 * Design Review entity
 */
export interface DesignReview {
  id: string;
  userId: string;
  brandGuidelineId: string;
  frameId: string;
  frame?: FigmaFrame;
  reviewJson: any; // This will be typed properly in the feature-specific code
  designScore: number;
  designScoreMax: number;
  brandComplianceScore?: number;
  visualHarmonyScore?: number;
  usabilityScore?: number;
  accessibilityScore?: number;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
  user?: User;
  brandGuideline?: BrandGuideline;
  history?: ReviewHistory[];
}

/**
 * Review History entity
 */
export interface ReviewHistory {
  id: string;
  designReviewId: string;
  action: string;
  summary: string;
  changes?: any;
  timestamp: Date;
  designReview?: DesignReview;
}

/**
 * User entity
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  emailVerified?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
  lastLogin?: Date;
  role?: string;
  companyId?: string;
  companyRole?: string;
  figmaUserId?: string;
  figmaAccessToken?: string;
  figmaRefreshToken?: string;
  figmaTokenExpiry?: Date;
  company?: Company;
  brands?: Brand[];
  brandGuidelines?: BrandGuideline[];
  designReviews?: DesignReview[];
}

/**
 * Company entity
 */
export interface Company {
  id: string;
  name: string;
  domain?: string;
  logo?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
  settings?: any;
  users?: User[];
  brands?: Brand[];
  brandGuidelines?: BrandGuideline[];
}

/**
 * Brand entity
 */
export interface Brand {
  id: string;
  name: string;
  description?: string;
  userId: string;
  teamId?: string;
  companyId?: string;
  brandRules: any;
  createdAt?: Date;
  updatedAt?: Date;
  user?: User;
  team?: Team;
  company?: Company;
}

/**
 * Team entity
 */
export interface Team {
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
  ownerId: string;
  companyId?: string;
  description?: string;
  owner?: User;
  company?: Company;
  members?: TeamMember[];
}

/**
 * Team Member entity
 */
export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
  team?: Team;
  user?: User;
}

/**
 * Brand Guideline entity
 */
export interface BrandGuideline {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: string;
  pdfUrl?: string;
  pdfPath?: string;
  processingStatus: string;
  processingMessage?: string;
  createdAt?: Date;
  updatedAt?: Date;
  companyId?: string;
  teamId?: string;
  user?: User;
  company?: Company;
  team?: Team;
  brandRules?: BrandRule[];
  customRules?: CustomRule[];
  designImages?: DesignImage[];
  figmaFrames?: FigmaFrame[];
  designReviews?: DesignReview[];
}

/**
 * Brand Rule entity
 */
export interface BrandRule {
  id: string;
  brandGuidelineId: string;
  category: string;
  name: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
  confidence?: number;
  source?: string;
  value?: string;
  brandGuideline?: BrandGuideline;
}

/**
 * Custom Rule entity
 */
export interface CustomRule {
  id: string;
  brandGuidelineId: string;
  category: string;
  name: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
  brandGuideline?: BrandGuideline;
}

/**
 * Design Image entity
 */
export interface DesignImage {
  id: string;
  brandGuidelineId: string;
  url: string;
  path: string;
  name?: string;
  description?: string;
  createdAt?: Date;
  brandGuideline?: BrandGuideline;
}
