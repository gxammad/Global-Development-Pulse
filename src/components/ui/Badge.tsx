import React from "react";
import type { IndicatorCategory, PipelineStatusType } from "@/types";

interface CategoryBadgeProps {
  category: IndicatorCategory | string;
  size?: "sm" | "md";
}

export function CategoryBadge({ category, size = "md" }: CategoryBadgeProps) {
  const styles: Record<string, string> = {
    Economic: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    Population: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    Employment: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    Education: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    Digital: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    Environment: "bg-teal-500/10 text-teal-500 border-teal-500/20",
  };

  const currentStyle = styles[category] || "bg-muted text-muted-foreground border-border";
  const sizeClasses = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${sizeClasses} ${currentStyle}`}
    >
      {category}
    </span>
  );
}

interface StatusBadgeProps {
  status: PipelineStatusType | string;
  showDot?: boolean;
}

export function StatusBadge({ status, showDot = true }: StatusBadgeProps) {
  const isHealthy = status === "Healthy" || status === "healthy";
  const isWarning = status === "Warning" || status === "warning";

  const colorClass = isHealthy
    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    : isWarning
    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
    : "bg-rose-500/10 text-rose-500 border-rose-500/20";

  const dotColor = isHealthy ? "bg-emerald-500" : isWarning ? "bg-amber-500" : "bg-rose-500";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${colorClass}`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${dotColor} animate-pulse`} />}
      {status}
    </span>
  );
}
