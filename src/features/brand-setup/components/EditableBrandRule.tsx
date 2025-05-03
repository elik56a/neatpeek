"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { ColorValueDisplay } from "@/components/ui/color-value-display";
import { cn } from "@/utils/cn";
import { Save, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { BrandRule, RuleCategory } from "../types";

interface EditableBrandRuleProps {
  rule: BrandRule;
  category: RuleCategory;
  getCategoryBadgeColor: (category: RuleCategory) => string;
  getCategoryIcon: (category: RuleCategory) => React.ReactNode;
  getCategoryColor: (category: RuleCategory) => string;
  brandGuidelineId: string;
  onRuleUpdated?: () => void;
}

export function EditableBrandRule({
  rule,
  category,
  getCategoryBadgeColor,
  getCategoryIcon,
  getCategoryColor,
  brandGuidelineId,
  onRuleUpdated,
}: EditableBrandRuleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(rule.name);
  const [description, setDescription] = useState(rule.description || "");
  const [value, setValue] = useState(rule.value || "");
  const { toast } = useToast();

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Rule name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/brand-guidelines/${brandGuidelineId}/rules/${rule.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          value,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update rule");
      }

      // Get the updated rule data
      const updatedRule = await response.json();

      // Update the rule locally
      rule.name = updatedRule.name;
      rule.description = updatedRule.description;
      rule.value = updatedRule.value;

      toast({
        title: "Rule Updated",
        description: "The rule has been updated successfully",
      });

      setIsEditing(false);

      // Notify parent but don't trigger a full refetch
      onRuleUpdated?.();
    } catch (error) {
      console.error("Error updating rule:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update rule",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setName(rule.name);
    setDescription(rule.description || "");
    setValue(rule.value || "");
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        "border rounded-lg p-4 shadow-sm transition-all duration-300 hover:shadow-md relative group",
        isEditing ? "bg-gray-50" : getCategoryColor(category)
      )}
    >
      {isSubmitting ? (
        // Skeleton loader when submitting
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-4 w-1/2 mt-2" />
          <Skeleton className="h-16 w-full mt-2" />
        </div>
      ) : isEditing ? (
        <div className="space-y-3">
          <div className="flex justify-between items-start gap-3">
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Rule name"
              className="font-medium"
            />
            <Badge
              variant="secondary"
              className={cn("font-medium flex-shrink-0", getCategoryBadgeColor(category))}
            >
              {getCategoryIcon(category)}
              <span className="ml-1">{category.charAt(0) + category.slice(1).toLowerCase()}</span>
            </Badge>
          </div>

          {category === RuleCategory.COLOR ? (
            <div className="flex items-center space-x-2 mt-2">
              <ColorValueDisplay value={value} showText={false} showIndividualColors={false} />
              <Input
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="Color value (e.g. #FF5733 or linear-gradient(#FF5733, #3366FF))"
                className="text-sm font-medium"
              />
            </div>
          ) : (
            <Input
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Value"
              className="text-sm font-medium mt-2"
            />
          )}

          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description"
            className="text-sm mt-2 mb-8"
            rows={3}
          />

          <div className="flex justify-end space-x-2 mt-3">
            <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSubmitting}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-gray-900 flex items-center">{rule.name}</h3>
            <Badge
              variant="secondary"
              className={cn("font-medium", getCategoryBadgeColor(category))}
            >
              {getCategoryIcon(category)}
              <span className="ml-1">{category.charAt(0) + category.slice(1).toLowerCase()}</span>
            </Badge>
          </div>

          {rule.value && (
            <div className="mt-2">
              {category === RuleCategory.COLOR ? (
                <ColorValueDisplay value={rule.value} />
              ) : (
                <p className="text-sm font-medium text-gray-800">{rule.value}</p>
              )}
            </div>
          )}

          {rule.description && (
            <p className="text-sm mt-2 pt-2 border-t border-gray-100 text-gray-600">
              {rule.description}
            </p>
          )}

          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-100 flex items-end justify-end p-2">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 bg-white/80 hover:bg-white shadow-sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Sparkles className="h-4 w-4 text-amber-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Fine-tune this AI-generated rule</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </>
      )}
    </div>
  );
}
