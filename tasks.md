# Design Review Implementation Tasks

## Database Schema Changes

- [*] Create a migration to update the Prisma schema:
  - [*] Remove the FigmaFile model
  - [*] Update FigmaFrame model to include file metadata (figmaFileKey, figmaFileName, lastSynced)
  - [*] Add brandGuidelineId to FigmaFrame model
  - [*] Add unique constraint on [figmaFileKey, frameId] in FigmaFrame
  - [*] Update DesignReview model to include userId and brandGuidelineId
  - [*] Remove the FigmaComment model (comments will be stored in reviewJson)
  - [*] Add relations between models (User->DesignReview, BrandGuideline->FigmaFrame, etc.)
  - [*] Add ReviewHistory model to track timeline events

## TypeScript Interfaces

- [*] Create proper TypeScript interfaces for reviewJson structure:
  - [*] Define ReviewJson interface with all properties
  - [*] Define Issue interface with comment IDs
  - [*] Define BrandIssue and GeneralIssue interfaces
  - [*] Define IssueStatus enum (fixed, not_fixed, partially_fixed)
  - [*] Define ReviewScore interface

## Type Cleanup

- [*] Clean up existing types in design-review feature:
  - [*] Remove types related to deleted models (FigmaFile, FigmaComment)
  - [*] Update types in types.ts to use new ReviewJson interfaces
  - [*] Ensure consistency between types in different files
  - [*] Fix type issues in design review components
  - [*] Update imports to use the new type definitions

## Helper Functions

- [*] Create formatBrandIssueComment function for consistent Figma comment formatting
- [*] Create formatGeneralIssueComment function for consistent Figma comment formatting
- [*] Create function to update reviewJson with recheck results
- [*] Create validation function for AI responses
- [*] Create function to generate history summary from changes

## Design Review Service Updates

- [*] Update saveAnalysisResults method:

  - [*] Remove FigmaFile creation
  - [*] Update FigmaFrame creation to include file metadata
  - [*] Add userId and brandGuidelineId to DesignReview
  - [*] Store Figma comment IDs in reviewJson
  - [*] Create format functions for consistent comment formatting
  - [*] Create initial ReviewHistory entry for new review

- [*] Update recheckDesign method:
  - [*] Modify to use comment IDs from reviewJson
  - [*] Update existing review instead of creating new ones
  - [*] Preserve original issue data while updating status
  - [*] Add new issues to existing reviewJson
  - [*] Create ReviewHistory entry for recheck with summary of changes

## Review History Timeline

- [*] Create ReviewHistory model in Prisma schema:

  - [*] Include designReviewId, timestamp, action fields
  - [*] Include summary field for human-readable description
  - [*] Include changes field (JSON) to store structured data about changes

- [*] Implement history tracking:

  - [*] Track initial review creation
  - [*] Track rechecks with summary (e.g., "Fixed 2 issues, 1 partially fixed, 3 still pending")
  - [*] Track new issues added during rechecks
  - [*] Generate human-readable summaries for timeline display

- [*] Create API endpoint to fetch review history

## Handling New Issues During Rechecks

- [*] Implement special handling for new issues discovered during rechecks:

  - [*] Add new issues to existing reviewJson arrays (brand_issues or general_issues)
  - [*] Mark new issues with a special status "new"
  - [*] Add timestamp to track when new issues were discovered
  - [*] Create Figma comments with special formatting (e.g., 🆕 prefix)
  - [*] Store Figma comment IDs for new issues

- [*] Update history tracking for new issues:

  - [*] Create specific history entries when new issues are found
  - [*] Include count and summary of new issues in history
  - [*] Track severity and types of new issues

- [ ] Enhance frontend to highlight new issues:
  - [ ] Add visual indicators for new issues in the UI
  - [ ] Provide filtering options to view only new issues
  - [ ] Show when issues were discovered in the timeline

## API Route Updates

- [*] Update design-review/review route to pass userId and brandGuidelineId
- [*] Update design-review/recheck route to handle updated data structure
- [*] Create design-review/history route to fetch timeline data

## Frontend Components

- [ ] Create ReviewTimeline component to display history:

  - [ ] Style timeline entries with appropriate icons and formatting
  - [ ] Design timeline as a collapsible sidebar component (similar to Jira)
  - [ ] Show timeline only when user explicitly clicks on history icon
  - [ ] Ensure timeline doesn't take full focus from the main review content

- [ ] Implement URL-based navigation:

  - [ ] Update URL to include review ID after analysis is complete (design-review/[id])
  - [ ] Enable direct access to specific review via URL
  - [ ] Preserve user's state on page reload
  - [ ] Handle navigation and browser history properly

- [ ] Enhance recheck UI feedback:
  - [ ] Highlight updated issue statuses in the UI after recheck
  - [ ] Add toast notification when recheck is complete
  - [ ] Animate status changes to draw user attention
  - [ ] Provide visual indication of which issues were fixed/updated

## Testing

- [ ] Test initial design review flow with new schema
- [ ] Test recheck flow with new schema
- [ ] Verify data integrity during rechecks
- [ ] Test comment ID tracking between Figma and our database
- [ ] Test history timeline generation and display

## Code Refactoring

- [*] Define clear types for all parameters and return values:

  - [*] Create proper TypeScript interfaces for service methods
  - [*] Avoid using `any` type to ensure type safety
  - [*] Use existing types from type definitions where possible

- [*] Create a dedicated Design Recheck Service:

  - [*] Separate recheck functionality from main DesignReviewService
  - [*] Define clear interfaces for all methods
  - [*] Ensure proper typing for all parameters and return values

- [*] Break down large methods into smaller functions:

  - [*] Split recheckDesign method into focused functions
  - [*] Give each function a single responsibility
  - [*] Use descriptive names that indicate what each function does

- [*] Extract common logic to utility functions:

  - [*] Identify shared logic between analyze and recheck operations
  - [*] Move shared logic to utility functions
  - [*] Ensure utility functions are properly typed

- [*] Update the main DesignReviewService:

  - [*] Refactor to use the new Design Recheck Service
  - [*] Simplify by delegating to specialized services
  - [*] Remove unused methods that reference old models

- [*] Ensure proper error handling:
  - [*] Add try/catch blocks consistently
  - [*] Log errors appropriately
  - [*] Return meaningful error messages

## Type Improvements

- [*] Replace hardcoded string literals with proper enums:
  - [*] Create ReviewHistoryAction enum in review-history.ts
  - [*] Create ReviewStatus enum in review-status.ts
  - [*] Create IssueType enum in review-json.ts
  - [*] Create ScoreCategory enum in score-category.ts
  - [*] Create ExportFileType enum in file-type.ts
  - [*] Update all relevant code to use these enums

## Documentation

- [ ] Update code comments to reflect new data structure
- [ ] Document the reviewJson structure with comment IDs
- [ ] Document the recheck process and how it updates existing reviews
- [ ] Document the history timeline feature and data structure
