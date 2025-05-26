"use client";

import { Badge } from "@/components/ui/badge";
import { ReactNode, useState } from "react";
import { BrandGuidelineStatus, BrandRule, ProcessingStatus, RuleCategory } from "../types";
import { BookOpen, Brush, Image, Palette, Sparkles, Type } from "lucide-react";

/**
 * Hook for UI-related functionality for brand guideline details
 */
export function useBrandGuidelineUI() {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  /**
   * Get category icon based on category name
   */
  const getCategoryIcon = (category: RuleCategory) => {
    switch (category) {
      case RuleCategory.COLOR:
        return <Palette className="h-4 w-4" />;
      case RuleCategory.TYPOGRAPHY:
        return <Type className="h-4 w-4" />;
      case RuleCategory.SPACING:
        return <BookOpen className="h-4 w-4" />;
      case RuleCategory.LOGO:
        return <Image className="h-4 w-4" />;
      case RuleCategory.ICON:
        return <Image className="h-4 w-4" />;
      case RuleCategory.LAYOUT:
        return <Brush className="h-4 w-4" />;
      case RuleCategory.GENERAL:
        return <BookOpen className="h-4 w-4" />;
      case RuleCategory.BEST_PRACTICES:
        return <Sparkles className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  /**
   * Get category color based on category name
   */
  const getCategoryColor = (category: RuleCategory) => {
    switch (category) {
      case RuleCategory.COLOR:
        return "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200";
      case RuleCategory.TYPOGRAPHY:
        return "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200";
      case RuleCategory.SPACING:
        return "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200";
      case RuleCategory.LOGO:
        return "bg-gradient-to-r from-red-50 to-rose-50 border-red-200";
      case RuleCategory.ICON:
        return "bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200";
      case RuleCategory.LAYOUT:
        return "bg-gradient-to-r from-cyan-50 to-sky-50 border-cyan-200";
      case RuleCategory.GENERAL:
        return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200";
      case RuleCategory.BEST_PRACTICES:
        return "bg-gradient-to-br from-primary/10 via-primary/5 to-primary/20 border-primary/30";
      default:
        return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200";
    }
  };

  /**
   * Get category badge color based on category name
   */
  const getCategoryBadgeColor = (category: RuleCategory) => {
    switch (category) {
      case RuleCategory.COLOR:
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case RuleCategory.TYPOGRAPHY:
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case RuleCategory.SPACING:
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case RuleCategory.LOGO:
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case RuleCategory.ICON:
        return "bg-violet-100 text-violet-800 hover:bg-violet-100";
      case RuleCategory.LAYOUT:
        return "bg-cyan-100 text-cyan-800 hover:bg-cyan-100";
      case RuleCategory.GENERAL:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      case RuleCategory.BEST_PRACTICES:
        return "bg-gradient-to-r from-primary/20 to-primary/30 text-primary border-primary/40";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  /**
   * Get status badge based on brand guideline status
   */
  const getStatusBadge = (status: BrandGuidelineStatus): ReactNode => {
    if (status === BrandGuidelineStatus.DRAFT) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800">
          Draft
        </Badge>
      );
    }

    if (status === BrandGuidelineStatus.PROCESSING) {
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
          Processing
        </Badge>
      );
    }

    if (status === BrandGuidelineStatus.COMPLETED) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
          Completed
        </Badge>
      );
    }

    if (status === BrandGuidelineStatus.FAILED) {
      return <Badge variant="destructive">Failed</Badge>;
    }

    return <Badge variant="outline">Unknown</Badge>;
  };

  /**
   * Group rules by category and sort alphabetically with BEST_PRACTICES last
   */
  const groupRulesByCategory = (brandRules?: BrandRule[]) => {
    if (!brandRules || brandRules.length === 0) return {};

    const grouped = brandRules.reduce(
      (acc, rule) => {
        const category = rule.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(rule);
        return acc;
      },
      {} as Record<RuleCategory, BrandRule[]>
    );

    // Create a sorted version of the grouped categories (alphabetically A-Z, but BEST_PRACTICES last)
    const sortedGrouped = Object.keys(grouped)
      .sort((a, b) => {
        // Always put BEST_PRACTICES at the end
        if (a === RuleCategory.BEST_PRACTICES) return 1;
        if (b === RuleCategory.BEST_PRACTICES) return -1;
        // Sort all other categories alphabetically
        return a.localeCompare(b);
      })
      .reduce(
        (acc, key) => {
          acc[key] = grouped[key];
          return acc;
        },
        {} as Record<RuleCategory, BrandRule[]>
      );

    // Set active tab to the first category if not set
    if (!activeTab && Object.keys(sortedGrouped).length > 0) {
      setActiveTab(Object.keys(sortedGrouped)[0]);
    }

    return sortedGrouped;
  };

  const getCategoryLabel = (category: RuleCategory): string => {
    return category
      .replace(/_/g, " ") // Replace underscores with spaces
      .split(" ")
      .map(word => word.charAt(0) + word.slice(1).toLowerCase()) // Capitalize first letter of each word
      .join(" ");
  };

  const isBestPracticesActiveCategory = (): boolean => {
    return activeTab === RuleCategory.BEST_PRACTICES;
  };

  return {
    activeTab,
    setActiveTab,
    getCategoryIcon,
    getCategoryColor,
    getCategoryBadgeColor,
    getStatusBadge,
    groupRulesByCategory,
    getCategoryLabel,
    isBestPracticesActiveCategory,
  };
}
