/**
 * Core application types
 *
 * This file contains the core entity types used throughout the application.
 * All components should import these types instead of defining their own.
 */

import { CompanyRole } from "@prisma/client";

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
