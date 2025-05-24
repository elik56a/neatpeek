"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { ColorValueDisplay } from "@/components/ui/color-value-display";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/utils/cn";
import { Save, Sparkles, X, Trash2, Edit, Loader2 } from "lucide-react";
import { useState } from "react";
import { BrandRule, RuleCategory } from "../types";

interface EditableBrandRuleProps {
  rule: BrandRule;
  category: RuleCategory;
  getCategoryBadgeColor: (category: RuleCategory) => string;
  getCategoryIcon: (category: RuleCategory) => React.ReactNode;
  getCategoryColor: (category: RuleCategory) => string;
  getCategoryLabel: (category: RuleCategory) => string;
  brandGuidelineId: string;
  onRuleUpdated?: () => void;
  onRuleDeleted?: (ruleId: string) => void;
}

export function EditableBrandRule({
  rule,
  category,
  getCategoryBadgeColor,
  getCategoryIcon,
  getCategoryColor,
  getCategoryLabel,
  brandGuidelineId,
  onRuleUpdated,
  onRuleDeleted,
}: EditableBrandRuleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
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
    setIsClosing(true);
    setTimeout(() => {
      setName(rule.name);
      setDescription(rule.description || "");
      setValue(rule.value || "");
      setIsEditing(false);
      setIsClosing(false);
    }, 200);
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/brand-guidelines/${brandGuidelineId}/rules/${rule.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete rule");
      }

      toast({
        title: "Rule Deleted",
        description: "The rule has been deleted successfully",
      });

      setShowDeleteDialog(false);
      onRuleDeleted?.(rule.id);
    } catch (error) {
      console.error("Error deleting rule:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete rule",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={cn(
        "border rounded-lg shadow-sm transition-all duration-300 hover:shadow-md relative group",
        isEditing
          ? "bg-white border-gray-200 shadow-lg ring-1 ring-gray-100"
          : getCategoryColor(category)
      )}
    >
      {isSubmitting ? (
        // Skeleton loader when submitting
        <div className="space-y-3 p-4">
          <div className="flex justify-between items-start">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-4 w-1/2 mt-2" />
          <Skeleton className="h-16 w-full mt-2" />
        </div>
      ) : isEditing ? (
        <div
          className={cn(
            "overflow-hidden bg-gradient-to-br from-gray-50/80 to-white border-gray-200 transition-all duration-300 ease-in-out",
            isClosing
              ? "animate-out slide-out-to-top-2 fade-out"
              : "animate-in slide-in-from-top-2 fade-in"
          )}
        >
          <div className="p-6 space-y-4">
            {/* Header toolbar with X button */}
            <div className="flex justify-between items-center py-2 px-3 -m-6 mb-4 bg-gray-100 border-b border-gray-200">
              <div className="flex items-center">
                <Edit className="h-4 w-4 mr-2 text-gray-600" />
                <h4 className="text-sm font-medium text-gray-800">Editing Rule</h4>
              </div>
              <div className="flex items-center space-x-3">
                <Badge
                  variant="secondary"
                  className={cn(
                    "font-medium flex-shrink-0 whitespace-nowrap",
                    getCategoryBadgeColor(category)
                  )}
                >
                  {getCategoryIcon(category)}
                  <span className="ml-1">{getCategoryLabel(category)}</span>
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="h-7 w-7 p-0 hover:bg-gray-200 rounded-full"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
            </div>

            {/* Rule Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Rule Name</label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter rule name..."
                className="font-medium border-gray-200 focus:border-primary focus:ring-primary/20"
              />
            </div>

            {/* Rule Value */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {category === RuleCategory.COLOR ? "Color Value" : "Value"}
              </label>
              {category === RuleCategory.COLOR ? (
                <div className="flex items-center space-x-3">
                  <ColorValueDisplay value={value} showText={false} />
                  <Input
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    placeholder="e.g. #FF5733 or linear-gradient(#FF5733, #3366FF)"
                    className="text-sm border-gray-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>
              ) : (
                <Input
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  placeholder="Enter value..."
                  className="text-sm border-gray-200 focus:border-primary focus:ring-primary/20"
                />
              )}
            </div>

            {/* Rule Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe this rule..."
                className="text-sm border-gray-200 focus:border-primary focus:ring-primary/20 resize-none"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isSubmitting || isDeleting}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 h-8 px-3 rounded-md"
              >
                <Trash2 className="h-3 w-3" />
              </Button>

              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSubmitting}
                loading={isSubmitting}
                className="h-9 px-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-gray-900 flex items-center flex-1 pr-2">{rule.name}</h3>
            <Badge
              variant="secondary"
              className={cn(
                "font-medium flex-shrink-0 whitespace-nowrap",
                getCategoryBadgeColor(category)
              )}
            >
              {getCategoryIcon(category)}
              <span className="ml-1">{getCategoryLabel(category)}</span>
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
                    disabled={isDeleting}
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
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Rule"
        description="Are you sure you want to delete this rule? This action cannot be undone and will permanently remove the rule from your brand guidelines."
        confirmText="Delete Rule"
        cancelText="Cancel"
        isLoading={isDeleting}
        variant="destructive"
        icon={<Trash2 className="h-5 w-5" />}
      />
    </div>
  );
}
