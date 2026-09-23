import React from "react";
import { formatValue } from "@/lib/formatters";
import type { FormatType, TimeSeriesPoint } from "@/types";
import { MiniSparkline } from "@/components/charts/MiniSparkline";

interface StatCardProps {
  title: string;
  value: number | null | undefined;
  year?: number | null;
  unit?: string;
  format?: FormatType;
  subtitle?: string;
  sparklineData?: TimeSeriesPoint[];
  sparklineColor?: string;
  category?: string;
}

export function StatCard({
  title,
  value,
  year,
  unit,
  format = "decimal",
  subtitle,
  sparklineData,
  sparklineColor,
  category,
}: StatCardProps) {
  const displayVal = formatValue(value, format, unit);

  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-surface p-5 shadow-sm hover:border-accent-blue/40 transition-colors">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider line-clamp-1">
            {title}
          </span>
          {year && (
            <span className="font-mono text-[11px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {year}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
            {displayVal}
          </span>
          {unit && format !== "currency" && format !== "percentage" && (
            <span className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">
              {unit}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
        <div className="text-[11px] text-muted-foreground truncate max-w-[180px]">
          {subtitle || category || "World Bank Data"}
        </div>
        {sparklineData && sparklineData.length > 1 && (
          <div className="shrink-0">
            <MiniSparkline data={sparklineData} color={sparklineColor} width={90} height={26} />
          </div>
        )}
      </div>
    </div>
  );
}
