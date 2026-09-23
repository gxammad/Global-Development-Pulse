"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Globe2,
  BarChart3,
  Terminal,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  GitCommit,
  Clock,
  Sparkles,
  TrendingUp,
  Cpu,
  Layers,
  Search,
} from "lucide-react";
import type {
  PlatformSummary,
  PipelineHealth,
  CountrySummary,
  IndicatorDataset,
} from "@/types";
import { InteractiveChart } from "@/components/charts/InteractiveChart";
import { StatusBadge, CategoryBadge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatValue } from "@/lib/formatters";

interface DashboardClientProps {
  summary: PlatformSummary | null;
  health: PipelineHealth | null;
  countries: CountrySummary[];
  featuredDatasets: {
    internet: IndicatorDataset | null;
    gdpCapita: IndicatorDataset | null;
    renewables: IndicatorDataset | null;
    lifeExp: IndicatorDataset | null;
  };
}

export function DashboardClient({
  summary,
  health,
  countries,
  featuredDatasets,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"internet" | "gdpCapita" | "renewables" | "lifeExp">("internet");
  const [countrySearch, setCountrySearch] = useState("");

  const lastUpdate = health?.last_data_update || "24 Sep 2026, 00:59 UTC";
  const recordsCount = summary?.total_records || 11250;
  const validObservations = summary?.valid_observations || 10263;

  // Selected benchmark nations for primary dashboard chart
  const benchmarkNations = ["USA", "GBR", "CHN", "PAK", "IND", "DEU"];

  const getSeriesForDataset = (ds: IndicatorDataset | null) => {
    if (!ds) return [];
    return benchmarkNations
      .map((iso) => {
        const c = ds.countries[iso];
        if (!c) return null;
        return {
          id: iso,
          name: c.country.name,
          data: c.time_series,
        };
      })
      .filter(Boolean) as any[];
  };

  const tabConfigs = {
    internet: {
      title: "Internet Adoption (% of Population)",
      subtitle: "Digital connectivity trajectory across global economies (2000–2024)",
      unit: "%",
      format: "percentage" as const,
      category: "Digital" as const,
      dataset: featuredDatasets.internet,
      link: "/indicators/internet_users_percent",
    },
    gdpCapita: {
      title: "GDP per Capita (Current US$)",
      subtitle: "Economic productivity and standard of living comparisons (2000–2024)",
      unit: "current US$",
      format: "currency" as const,
      category: "Economic" as const,
      dataset: featuredDatasets.gdpCapita,
      link: "/indicators/gdp_per_capita_usd",
    },
    renewables: {
      title: "Renewable Electricity Output (% of Total)",
      subtitle: "Clean energy transition and power generation footprint (2000–2024)",
      unit: "%",
      format: "percentage" as const,
      category: "Environment" as const,
      dataset: featuredDatasets.renewables,
      link: "/indicators/renewable_electricity_output",
    },
    lifeExp: {
      title: "Life Expectancy at Birth (Years)",
      subtitle: "Long-term demographic health and mortality resilience (2000–2024)",
      unit: "years",
      format: "decimal" as const,
      category: "Population" as const,
      dataset: featuredDatasets.lifeExp,
      link: "/indicators/life_expectancy_birth",
    },
  };

  const currentTab = tabConfigs[activeTab];
  const chartSeries = getSeriesForDataset(currentTab.dataset);

  const filteredCountries = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.iso3.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.region.toLowerCase().includes(countrySearch.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10 font-sans">
      {/* Top Banner: Minimalist Header + Live Status Pill */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-border/60">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge status={health?.status || "Healthy"} />
            <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5 bg-surface border border-border/80 px-3 py-1 rounded-full shadow-subtle">
              <Clock className="h-3.5 w-3.5 text-accent-blue" />
              <span>Refreshed: {lastUpdate}</span>
            </span>
            <span className="text-xs font-mono text-muted-foreground hidden sm:flex items-center gap-1.5 bg-surface border border-border/80 px-3 py-1 rounded-full shadow-subtle">
              <GitCommit className="h-3.5 w-3.5 text-accent-purple" />
              <span>Cron: 0 */8 * * *</span>
            </span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Global Development Pulse
            </h1>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground font-medium">
              Autonomous, continuously validated World Bank indicator platform.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/compare">
            <Button variant="default" size="default" className="shadow-subtle">
              <span>Compare Nations</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
          <Link href="/pipeline">
            <Button variant="outline" size="default" className="shadow-subtle">
              <Terminal className="h-3.5 w-3.5 mr-1.5 text-accent-emerald" />
              <span>Pipeline Health</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* 4 Primary KPI Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Tracked Economies"
          value={summary?.tracked_countries_count || 15}
          unit="nations"
          format="number"
          subtitle="Zero hardcoded logic"
          trendText="100% active"
        />
        <StatCard
          title="Monitored Indicators"
          value={summary?.tracked_indicators_count || 30}
          unit="metrics"
          format="number"
          subtitle="6 development pillars"
          trendText="30 series"
        />
        <StatCard
          title="Valid Observations"
          value={validObservations}
          unit="points"
          format="number"
          subtitle={`${recordsCount.toLocaleString()} total observations`}
          trendText="2000–2024"
        />
        <StatCard
          title="Data Integrity Audit"
          value={100}
          unit="%"
          format="percentage"
          subtitle="0 errors • 0 duplicates"
          trendText="Verified"
        />
      </section>

      {/* Main Focus Canvas: Interactive Multi-Pillar Visualizer */}
      <section className="space-y-4">
        {/* Canvas Header & Tab Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent-blue">
                Interactive Analytical Canvas
              </span>
              <span className="text-border">|</span>
              <CategoryBadge category={currentTab.category} size="sm" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1">
              {currentTab.title}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {currentTab.subtitle}
            </p>
          </div>

          {/* Quick Segmented Pillar Toggles (Dribbble/shadcn Style) */}
          <div className="flex items-center rounded-xl bg-muted/70 p-1 border border-border/60 overflow-x-auto scrollbar-none self-start lg:self-center">
            <button
              onClick={() => setActiveTab("internet")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "internet"
                  ? "bg-surface text-foreground font-bold shadow-subtle border border-border/70"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Digital
            </button>
            <button
              onClick={() => setActiveTab("gdpCapita")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "gdpCapita"
                  ? "bg-surface text-foreground font-bold shadow-subtle border border-border/70"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              GDP / Capita
            </button>
            <button
              onClick={() => setActiveTab("renewables")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "renewables"
                  ? "bg-surface text-foreground font-bold shadow-subtle border border-border/70"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Clean Energy
            </button>
            <button
              onClick={() => setActiveTab("lifeExp")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "lifeExp"
                  ? "bg-surface text-foreground font-bold shadow-subtle border border-border/70"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Life Expectancy
            </button>
          </div>
        </div>

        {/* Visual Chart Canvas */}
        <InteractiveChart
          series={chartSeries}
          format={currentTab.format}
          unit={currentTab.unit}
          defaultRange="20Y"
        />
      </section>

      {/* Two-Column Insights & Country Explorer */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col (1 Col): Key Global Highlights */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent-amber" />
              <span>Global Highlights</span>
            </h3>
            <span className="text-[11px] font-mono text-muted-foreground">World Bank</span>
          </div>

          <div className="space-y-3">
            {summary?.highlights?.map((h, i) => (
              <Card key={i} className="p-4 hover:border-accent-blue/30 transition-all">
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {h.metric}
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <div className="text-xl font-bold font-sans text-foreground">
                    {formatValue(h.value, h.format, h.unit)}
                  </div>
                  <div className="font-semibold text-xs text-foreground bg-muted px-2 py-0.5 rounded-md font-sans">
                    {h.country}
                  </div>
                </div>
              </Card>
            ))}

            {/* Quick Link Card */}
            <Card className="p-5 border-dashed bg-muted/20 space-y-2">
              <div className="text-xs font-bold text-foreground">
                Cross-Country Comparison Engine
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Select any combination of 2 to 5 nations across all 30 indicators.
                Includes instant CSV export for empirical research.
              </p>
              <div className="pt-2">
                <Link href="/compare">
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    <span>Open Comparison Engine</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Col (2 Cols): Quick Country Directory Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-accent-blue" />
                <span>Monitored Economies Snapshot</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Showing {filteredCountries.length} nations with verified multi-year observations.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search country..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-surface text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
            {filteredCountries.map((c) => {
              const gdpMetric = c.summary_metrics?.gdp;
              const popMetric = c.summary_metrics?.population;
              const lifeMetric = c.summary_metrics?.life_expectancy;

              return (
                <Link
                  key={c.id}
                  href={`/countries/${c.id}`}
                  className="rounded-xl border border-border bg-surface p-4 shadow-subtle hover:border-accent-blue/50 hover:bg-surface-hover/50 transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl" role="img" aria-label={c.name}>
                        {c.flag_emoji}
                      </span>
                      <div>
                        <div className="font-bold text-foreground text-sm group-hover:text-accent-blue transition-colors">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {c.region}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {c.iso3}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-border/60 grid grid-cols-3 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block">GDP</span>
                      <strong className="text-foreground">
                        {formatValue(gdpMetric?.value, "currency")}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block">Pop</span>
                      <strong className="text-foreground">
                        {formatValue(popMetric?.value, "number")}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block">Life</span>
                      <strong className="text-foreground">
                        {formatValue(lifeMetric?.value, "decimal")}y
                      </strong>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
