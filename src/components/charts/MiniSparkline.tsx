import React from "react";
import type { TimeSeriesPoint } from "@/types";

interface MiniSparklineProps {
  data: TimeSeriesPoint[];
  color?: string;
  width?: number;
  height?: number;
}

export function MiniSparkline({
  data,
  color = "#2563eb",
  width = 120,
  height = 36,
}: MiniSparklineProps) {
  const validPoints = data.filter((d) => d.value !== null) as { year: number; value: number }[];

  if (validPoints.length < 2) {
    return (
      <div
        style={{ width, height }}
        className="flex items-center justify-center text-[10px] text-muted-foreground/50 font-mono"
      >
        —
      </div>
    );
  }

  const values = validPoints.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const paddingY = 4;
  const paddingX = 2;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;

  const points = validPoints.map((d, i) => {
    const x = paddingX + (i / (validPoints.length - 1)) * plotWidth;
    const y = height - paddingY - ((d.value - min) / range) * plotHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(" L ")}`;
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const areaD = `${pathD} L ${plotWidth + paddingX},${height} L ${paddingX},${height} Z`;

  // Gradient ID unique per component instance
  const gradId = `sparkline-grad-${color.replace("#", "")}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
