import { getScoreColor } from "@/features/design-review/utils/enum-mappers";
import { cn } from "@/utils/cn";

interface ScoreDisplayProps {
  score: number;
  className?: string;
  showBackground?: boolean;
}

export function ScoreDisplay({ score, className, showBackground = true }: ScoreDisplayProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded px-2 py-1 text-xs font-medium",
        getScoreColor(score),
        className
      )}
    >
      {score}
    </span>
  );
}
