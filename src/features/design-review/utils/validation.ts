/**
 * Validation functions for AI responses
 * These functions ensure that AI responses have the expected structure
 */

import { ReviewJson, DesignReviewResult, DesignRecheckResult } from '../types';

/**
 * Validate a design review result from AI
 */
export function validateDesignReviewResult(result: DesignReviewResult): boolean {
  // Check that the result has the required fields
  if (!result.image || !result.design_score) {
    console.error('Missing required fields in design review result');
    return false;
  }

  // Check that the image has the required fields
  if (!result.image.frame_id || !result.image.name || !result.image.url) {
    console.error('Missing required fields in image metadata');
    return false;
  }

  // Check that the design score has the required fields
  if (
    typeof result.design_score.total !== 'number' ||
    typeof result.design_score.max_score !== 'number' ||
    !result.design_score.breakdown
  ) {
    console.error('Missing or invalid design score fields');
    return false;
  }

  // Check that brand_issues and general_issues are arrays
  if (!Array.isArray(result.brand_issues) || !Array.isArray(result.general_issues)) {
    console.error('brand_issues or general_issues is not an array');
    return false;
  }

  // Validate each brand issue
  for (const issue of result.brand_issues) {
    if (
      !issue.description ||
      !issue.brand_rule_violation ||
      !issue.fix_suggestion ||
      !issue.severity ||
      !issue.coordinates
    ) {
      console.error('Missing required fields in brand issue', issue);
      return false;
    }
  }

  // Validate each general issue
  for (const issue of result.general_issues) {
    if (
      !issue.description ||
      !issue.fix_suggestion ||
      !issue.severity ||
      !issue.coordinates
    ) {
      console.error('Missing required fields in general issue', issue);
      return false;
    }
  }

  return true;
}

/**
 * Validate a design recheck result from AI
 */
export function validateDesignRecheckResult(result: DesignRecheckResult): boolean {
  // Check that the result has the required fields
  if (!result.recheck_results || !Array.isArray(result.recheck_results)) {
    console.error('Missing or invalid recheck_results field');
    return false;
  }

  // Validate each frame recheck result
  for (const frameResult of result.recheck_results) {
    if (!frameResult.frame_id || !frameResult.comment_checks) {
      console.error('Missing required fields in frame recheck result', frameResult);
      return false;
    }

    // Validate each comment check
    for (const check of frameResult.comment_checks) {
      if (
        !check.comment_id ||
        !check.check_result ||
        !check.check_result.status ||
        typeof check.is_fixed !== 'boolean'
      ) {
        console.error('Missing required fields in comment check', check);
        return false;
      }
    }

    // Validate new issues if present
    if (frameResult.new_issues) {
      if (!Array.isArray(frameResult.new_issues)) {
        console.error('new_issues is not an array', frameResult);
        return false;
      }

      for (const issue of frameResult.new_issues) {
        if (
          !issue.description ||
          !issue.fix_suggestion ||
          !issue.severity ||
          !issue.coordinates
        ) {
          console.error('Missing required fields in new issue', issue);
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Validate that the recheck response preserves the original review structure
 */
export function validateRecheckPreservesOriginal(
  original: ReviewJson,
  updated: ReviewJson
): boolean {
  // Check that all required fields exist
  const requiredFields = ['brand_issues', 'general_issues', 'design_score', 'image'];
  for (const field of requiredFields) {
    if (!(field in updated)) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }

  // Check that arrays have the same length or more (for new issues)
  if (updated.brand_issues.length < original.brand_issues.length) {
    console.error('Some brand issues are missing in the updated review');
    return false;
  }
  
  if (updated.general_issues.length < original.general_issues.length) {
    console.error('Some general issues are missing in the updated review');
    return false;
  }

  // Check that all original issues have a status field in the updated version
  for (let i = 0; i < original.brand_issues.length; i++) {
    if (!updated.brand_issues[i].status) {
      console.error(`Missing status for brand issue ${i}`);
      return false;
    }
  }

  for (let i = 0; i < original.general_issues.length; i++) {
    if (!updated.general_issues[i].status) {
      console.error(`Missing status for general issue ${i}`);
      return false;
    }
  }

  return true;
}
