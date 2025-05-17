/**
 * Global type definitions
 */

/**
 * Figma Frame entity
 */

import { Prisma } from "@prisma/client";

export enum CompanyRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

/**
 * Review Timeline entity
 */
export type ReviewTimeline = Prisma.DesignTimelineGetPayload<{
  include: {
    design: true;
  };
}>;

/**
 * User entity
 */
export type User = Prisma.UserGetPayload<{
  include: {
    company: true;
    brands: true;
    brandGuidelines: true;
  };
}>;

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
export type BrandGuideline = Prisma.BrandGuidelineGetPayload<{
  include: {
    brandRules: true;
    customRules: true;
    designImages: true;
    designReviews: true;
  };
}>;

/**
 * Brand Rule entity
 */
export type BrandRule = Prisma.BrandRuleGetPayload<{
  include: {
    brandGuideline: true;
  };
}>;

/**
 * Custom Rule entity
 */
export type CustomRule = Prisma.CustomRuleGetPayload<{
  include: {
    brandGuideline: true;
  };
}>;

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

/**
 * Designs Review entity - container for multiple designs
 */
export type DesignsReview = Prisma.DesignsReviewGetPayload<{
  include: {
    user: true;
    brandGuideline: true;
    designs: true;
  };
}>;

/**
 * Design entity (formerly DesignReview)
 */
export type Design = Prisma.DesignGetPayload<{
  include: {
    user: true;
    designsReview: true;
    timeline: true;
  };
}>;
