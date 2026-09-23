import React from "react";
import { formatValue } from "@/lib/formatters";
import type { FormatType, TimeSeriesPoint } from "@/types";
import { MiniSparkline } from "@/components/charts/MiniSparkline";
import { Card } from "@/components/ui/card";

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
  trendText?: string;
}

export function StatCard({
  title,
  value,
  year,
  unit,
  format = "decimal",
  subtitle,
  sparklineData,
  sparklineColor = "#2563eb",
  category,
  trendText,
}: StatCardProps) {
  const displayVal = formatValue(value, format, unit);

  return (
    <Card className="p-5 flex flex-col justify-between hover:border-accent-blue/40 hover:shadow-card transition-all group">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider line-clamp-1 font-sans">
            {title}
          </span>
          {year && (
            <span className="font-mono text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {year}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-sans">
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
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          {trendText && (
            <span className="text-emerald-500 font-semibold font-mono">
              {trendText}
            </span>
          )}
          <span>{subtitle || category || "World Bank"}</span>
        </div>

        {sparklineData && sparklineData.length > 1 && (
          <div className="shrink-0 group-hover:scale-105 transition-transform">
            <MiniSparkline data={sparklineData} color={sparklineColor} width={80} height={24} />
          </div>
        )}
      </div>
    </Card>
  );
}
