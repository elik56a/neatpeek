"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { RuleCategory, CustomRule } from "../types";

interface CustomRulesFormProps {
  rules: CustomRule[];
  onAddRule: (rule: CustomRule) => void;
  onRemoveRule: (index: number) => void;
  getCategoryColor: (category: RuleCategory) => string;
  getCategoryLabel: (category: RuleCategory) => string;
  maxRules?: number;
}

export function CustomRulesForm({
  rules,
  onAddRule,
  onRemoveRule,
  maxRules = 10,
  getCategoryColor,
  getCategoryLabel,
}: CustomRulesFormProps) {
  const [newRule, setNewRule] = useState<CustomRule>({
    category: "COLOR",
    name: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleAddRule = () => {
    setError(null);

    if (!newRule.name || !newRule.description) {
      setError("Please fill in all fields");
      return;
    }

    if (rules.length >= maxRules) {
      setError(`You can only add up to ${maxRules} rules`);
      return;
    }

    // Check for duplicate rule names
    if (rules.some(rule => rule.name.toLowerCase() === newRule.name.toLowerCase())) {
      setError("A rule with this name already exists");
      return;
    }

    onAddRule(newRule);

    // Reset the form
    setNewRule({
      category: "COLOR",
      name: "",
      description: "",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Custom Brand Rules</h3>
        <p className="text-sm text-muted-foreground">
          Add custom rules that define your brand guidelines. These will be used by our AI to
          generate comprehensive brand rules.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Add New Rule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newRule.category}
                onValueChange={value => setNewRule({ ...newRule, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COLOR">Color</SelectItem>
                  <SelectItem value="TYPOGRAPHY">Typography</SelectItem>
                  <SelectItem value="SPACING">Spacing</SelectItem>
                  <SelectItem value="LOGO">Logo</SelectItem>
                  <SelectItem value="ICON">Icon</SelectItem>
                  <SelectItem value="LAYOUT">Layout</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Rule Name</Label>
              <Input
                id="name"
                value={newRule.name}
                onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                placeholder="e.g., Primary Color"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newRule.description}
              onChange={e => setNewRule({ ...newRule, description: e.target.value })}
              placeholder="Describe the rule (e.g., Our primary color is #3B82F6 and should be used for all main buttons and links)"
              rows={3}
            />
          </div>

          <Button
            type="button"
            onClick={handleAddRule}
            disabled={!newRule.name || !newRule.description || rules.length >= maxRules}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Rule
          </Button>

          {rules.length >= maxRules && (
            <p className="text-xs text-muted-foreground text-center">
              You've reached the maximum number of rules ({maxRules}).
            </p>
          )}
        </CardContent>
      </Card>

      {rules.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Added Rules ({rules.length})</h3>
            {rules.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {rules.length} of {maxRules} rules added
              </p>
            )}
          </div>

          <div className="space-y-3">
            {rules.map((rule, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 mr-4">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <span className="text-sm font-medium">{rule.name}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(rule.category)}`}
                    >
                      {getCategoryLabel(rule.category)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveRule(index)}
                  className="flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4 " />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
