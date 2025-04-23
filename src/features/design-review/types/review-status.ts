/**
 * TypeScript enum for review status
 * This should match the ReviewStatus enum in the Prisma schema
 */
export enum ReviewStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  IN_PROGRESS = 'IN_PROGRESS',
}
