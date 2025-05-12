# Design Review Architecture Update Tasks

## Data Model Changes

- ✅ Create new `DesignsReview` model as parent container
- ✅ Rename `DesignReview` to `Design` and update relations
- ✅ Update relations in `BrandGuideline` model
- ✅ Add `designsReviewId` to `Design` model
- ✅ Update `ReviewHistory` to reference `DesignsReview` instead of `DesignReview`

## TypeScript Types

- ✅ Create new `DesignsReview` interface
- ✅ Update `Design` interface (formerly DesignReview)
- ✅ Update `DesignAnalysisResult` interface to use `designsReviewId`

## Service Updates

- ✅ Update `DesignReviewService` to create `DesignsReview` first
- ✅ Update `saveAnalysisResults` to create `Design` records linked to `DesignsReview`
- ✅ Update `recheckDesign` to work with new model structure
- ✅ Update `DesignRecheckService` to work with new model structure
- ✅ Update `FigmaService` to handle multiple frames per review

## API Route Updates

- ✅ Update `/api/design-review/analyze` to handle multiple frames
- ✅ Update `/api/design-review/recheck` to work with new model structure
- ✅ Update `/api/design-review/history` to work with `DesignsReview`
- ✅ Update `/api/design-review/export` to handle multiple frames

## Frontend Updates

- Update `DesignReviewForm` to handle multiple frames
- Update `DesignReviewResults` to show multiple frames
- Update `DesignReviewHistory` to work with `DesignsReview`
- Update `DesignReviewExport` to handle multiple frames
- Update `DesignReviewRecheck` to work with new model structure

## Testing

- Add tests for new `DesignsReview` model
- Add tests for updated `Design` model
- Add tests for updated services
- Add tests for updated API routes
- Add tests for updated frontend components

## Future Enhancements

- Add support for sub-guidelines
- Add support for manual uploads
- Add support for batch operations
- Add support for deleting brand guidelines while preserving design reviews
