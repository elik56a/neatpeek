/**
 * Core application types
 *
 * This file contains the core entity types used throughout the application.
 * All components should import these types instead of defining their own.
 */

// Define CompanyRole enum to avoid importing from Prisma on the client side
export enum CompanyRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER"
}

// User roles
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN"
}

/**
 * User entity
 */
export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string | null;
  role?: UserRole | string | null;
  companyId?: string | null;
  companyName?: string | null;
  companyRole?: CompanyRole | null;
  company?: Company | null;
  figmaUserId?: string | null;
  figmaAccessToken?: string | null;
  figmaRefreshToken?: string | null;
  figmaTokenExpiry?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Company entity
 */
export interface Company {
  id: string;
  name: string;
  domain?: string | null;
  logo?: string | null;
  settings?: Record<string, any> | null;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

/**
 * Team entity
 */
export interface Team {
  id: string;
  name: string;
  description?: string | null;
  companyId: string;
  company?: Company;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Brand Guideline entity
 */
export interface BrandGuideline {
  id: string;
  name: string;
  description?: string | null;
  companyId: string;
  company?: Company;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
  rules?: BrandRule[];
  files?: BrandFile[];
}

/**
 * Brand Rule entity
 */
export interface BrandRule {
  id: string;
  name: string;
  value: string;
  description?: string | null;
  category: string;
  brandGuidelineId: string;
  brandGuideline?: BrandGuideline;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Brand File entity
 */
export interface BrandFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number;
  brandGuidelineId: string;
  brandGuideline?: BrandGuideline;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * API Response type
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta?: PaginationMeta;
}

/**
 * Figma File entity
 */
export interface FigmaFile {
  id: string;
  projectId: string;
  figmaFileKey: string;
  figmaFileName: string;
  lastSynced: Date;
  createdAt?: Date;
  updatedAt?: Date;
  frames?: FigmaFrame[];
}

/**
 * Figma Frame entity
 */
export interface FigmaFrame {
  id: string;
  figmaFileId: string;
  figmaFile?: FigmaFile;
  frameId: string;
  name: string;
  imageUrl: string;
  screenType?: string;
  platform?: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  createdAt?: Date;
  updatedAt?: Date;
  designReviews?: DesignReview[];
}

/**
 * Design Review entity
 */
export interface DesignReview {
  id: string;
  frameId: string;
  frame?: FigmaFrame;
  reviewJson: any;
  designScore: number;
  designScoreMax: number;
  brandComplianceScore: number;
  visualHarmonyScore: number;
  usabilityScore: number;
  accessibilityScore: number;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
  comments?: FigmaComment[];
}

/**
 * Figma Comment entity
 */
export interface FigmaComment {
  id: string;
  reviewId: string;
  review?: DesignReview;
  frameId: string;
  frame?: FigmaFrame;
  commentId?: string;
  messageType: string;
  message: string;
  elementType?: string;
  severity: string;
  positionX: number;
  positionY: number;
  isResolved: boolean;
  recheckStatus?: string;
  recheckDetails?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
