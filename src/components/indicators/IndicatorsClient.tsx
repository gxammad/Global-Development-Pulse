"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, BarChart3, ArrowRight, Database, ExternalLink } from "lucide-react";
import type { IndicatorSummary, IndicatorCategory } from "@/types";
import { CategoryBadge } from "@/components/ui/Badge";

interface IndicatorsClientProps {
  indicators: IndicatorSummary[];
}

const CATEGORIES: ("All" | IndicatorCategory)[] = [
  "All",
  "Economic",
  "Population",
  "Employment",
  "Education",
  "Digital",
  "Environment",
];

export function IndicatorsClient({ indicators }: IndicatorsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | IndicatorCategory>("All");

  const filtered = useMemo(() => {
    return indicators.filter((ind) => {
      const matchSearch =
        ind.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ind.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ind.short_description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory =
        selectedCategory === "All" || ind.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [indicators, searchTerm, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Category Tabs and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-surface shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search 30 indicators by name, code, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent-blue"
          />
        </div>

        {/* Category Pills */}
        <div className="flex overflow-x-auto space-x-1.5 py-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-foreground text-background font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
        <span>
          Showing {filtered.length} of {indicators.length} standardized indicators
        </span>
        {(searchTerm || selectedCategory !== "All") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
            }}
            className="text-accent-blue hover:underline"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ind) => (
          <Link
            key={ind.id}
            href={`/indicators/${ind.id}`}
            className="group rounded-xl border border-border bg-surface p-5 shadow-sm hover:border-accent-blue/50 hover:bg-surface-hover/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <CategoryBadge category={ind.category} size="sm" />
                <span className="font-mono text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {ind.code}
                </span>
              </div>

              <h2 className="mt-3 font-bold text-foreground text-base group-hover:text-accent-blue transition-colors">
                {ind.name}
              </h2>
              <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {ind.short_description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-border/70 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Unit:</span>
                <span className="font-semibold text-foreground truncate max-w-[160px]">
                  {ind.unit}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Reporting Nations:</span>
                <span className="font-semibold text-foreground">
                  {ind.reporting_countries_count} / {ind.total_countries_count}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Latest Global Year:</span>
                <span className="font-semibold text-accent-blue">
                  {ind.latest_global_year || "2023"}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end text-[11px] font-sans font-semibold text-foreground group-hover:text-accent-blue group-hover:translate-x-0.5 transition-all">
                <span>View Global Trends & Rankings</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
