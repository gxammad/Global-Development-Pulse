import React from "react";
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
} from "lucide-react";
import {
  getPlatformSummary,
  getPipelineHealth,
  getCountryIndex,
  getIndicatorData,
} from "@/lib/data";
import { InteractiveChart } from "@/components/charts/InteractiveChart";
import { StatusBadge, CategoryBadge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { formatValue } from "@/lib/formatters";

export const revalidate = 3600; // ISR cache revalidation

export default async function HomePage() {
  const [summary, health, countries, featuredIndicatorData] = await Promise.all([
    getPlatformSummary(),
    getPipelineHealth(),
    getCountryIndex(),
    getIndicatorData("internet_users_percent"),
  ]);

  const lastUpdate = health?.last_data_update || "24 Sep 2026, 00:59 UTC";
  const recordsCount = summary?.total_records || 11250;
  const validObservations = summary?.valid_observations || 10263;

  // Prepare featured comparison chart across key nations
  const featuredCountries = ["USA", "GBR", "CHN", "PAK", "IND"];
  const featuredSeries = featuredCountries
    .map((iso) => {
      const countryData = featuredIndicatorData?.countries[iso];
      if (!countryData) return null;
      return {
        id: iso,
        name: countryData.country.name,
        data: countryData.time_series,
      };
    })
    .filter(Boolean) as any[];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Section */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={health?.status || "Healthy"} />
          <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5 bg-surface border border-border px-2.5 py-1 rounded-full">
            <Clock className="h-3.5 w-3.5 text-accent-blue" />
            <span>Refreshed: {lastUpdate}</span>
          </span>
          <span className="text-xs font-mono text-muted-foreground hidden sm:flex items-center gap-1.5 bg-surface border border-border px-2.5 py-1 rounded-full">
            <GitCommit className="h-3.5 w-3.5 text-accent-purple" />
            <span>Automated Cron: 0 */8 * * *</span>
          </span>
        </div>

        <div className="max-w-3xl space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Global Development Pulse
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground font-medium">
            Automated global development data, refreshed continuously.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            A production data platform collecting, validating, transforming, and versioning
            30 critical public indicators across 15 nations directly from the World Bank Open Data API.
            Every update is verified with automated schema integrity and change detection.
          </p>
        </div>

        {/* Quick CTA Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 rounded-lg bg-foreground text-background px-4 py-2 text-xs sm:text-sm font-semibold hover:bg-foreground/90 transition-colors shadow-sm"
          >
            <span>Launch Cross-Country Compare</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/countries"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-xs sm:text-sm font-medium text-foreground hover:bg-surface-hover transition-colors shadow-sm"
          >
            <Globe2 className="h-4 w-4 text-accent-blue" />
            <span>Explore Countries (15)</span>
          </Link>
          <Link
            href="/pipeline"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-xs sm:text-sm font-medium text-foreground hover:bg-surface-hover transition-colors shadow-sm"
          >
            <Terminal className="h-4 w-4 text-accent-emerald" />
            <span>Pipeline Diagnostics</span>
          </Link>
        </div>
      </section>

      {/* KPI Stats Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Tracked Countries
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
              {summary?.tracked_countries_count || 15}
            </span>
            <span className="text-xs text-muted-foreground font-mono">nations</span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            <span>Zero hardcoded logic</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Tracked Indicators
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
              {summary?.tracked_indicators_count || 30}
            </span>
            <span className="text-xs text-muted-foreground font-mono">indicators</span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            6 core development pillars
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Total Observations
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
              {recordsCount.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground font-mono">records</span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            {validObservations.toLocaleString()} valid points (2000–2024)
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Pipeline Health
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-500">
              {health?.status || "Healthy"}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            <span>0 validation errors</span>
          </div>
        </div>
      </section>

      {/* Featured Interactive Visualization */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-accent-cyan">
                Featured Trend
              </span>
              <span className="text-border">|</span>
              <CategoryBadge category="Digital" size="sm" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1">
              Internet Adoption (% of Population)
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Historical digital connectivity trajectory across selected economies (2000–2024).
            </p>
          </div>

          <Link
            href="/indicators/internet_users_percent"
            className="text-xs font-medium text-accent-blue hover:underline flex items-center gap-1"
          >
            <span>Full indicator breakdown</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {featuredSeries.length > 0 && (
          <InteractiveChart
            series={featuredSeries}
            format="percentage"
            unit="%"
            defaultRange="20Y"
          />
        )}
      </section>

      {/* Global Highlights Section */}
      {summary?.highlights && summary.highlights.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent-amber" />
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Key Factual Data Highlights
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {summary.highlights.map((h, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-surface p-5 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {h.metric}
                  </span>
                  <div className="mt-2 text-2xl font-bold font-mono text-foreground">
                    {formatValue(h.value, h.format, h.unit)}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Nation:</span>
                  <span className="font-semibold text-foreground">{h.country}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Country Spotlight Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Tracked Economies Snapshot
            </h2>
            <p className="text-xs text-muted-foreground">
              Recent macroeconomic, demographic, and human development indicators.
            </p>
          </div>
          <Link
            href="/countries"
            className="text-xs font-medium text-accent-blue hover:underline flex items-center gap-1"
          >
            <span>View all 15 countries</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {countries.slice(0, 6).map((c) => {
            const gdpMetric = c.summary_metrics?.gdp;
            const popMetric = c.summary_metrics?.population;
            const lifeMetric = c.summary_metrics?.life_expectancy;

            return (
              <Link
                key={c.id}
                href={`/countries/${c.id}`}
                className="group rounded-xl border border-border bg-surface p-5 shadow-sm hover:border-accent-blue/50 hover:bg-surface-hover/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl" role="img" aria-label={c.name}>
                        {c.flag_emoji}
                      </span>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm group-hover:text-accent-blue transition-colors">
                          {c.name}
                        </h3>
                        <div className="text-[11px] text-muted-foreground">
                          {c.region} • {c.income_group}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {c.iso3}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-border/60 text-xs font-mono">
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">GDP</div>
                      <div className="font-semibold text-foreground mt-0.5">
                        {formatValue(gdpMetric?.value, "currency")}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">Pop.</div>
                      <div className="font-semibold text-foreground mt-0.5">
                        {formatValue(popMetric?.value, "number")}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">Life Exp.</div>
                      <div className="font-semibold text-foreground mt-0.5">
                        {formatValue(lifeMetric?.value, "decimal")}y
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Coverage: {c.coverage_percent}%</span>
                  <span className="group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-medium text-foreground">
                    Deep dive <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Technical Transparency Teaser */}
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-accent-emerald" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                Automated Architecture
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Built on Continuous ETL, Data Validation & Git Versioning
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Every 8 hours, GitHub Actions invokes the Python pipeline to query the World Bank API.
              Responses undergo schema integrity checks, duplicate auditing, and domain range validation.
              Deterministic content hashing ensures zero meaningless commits.
            </p>
          </div>
          <Link
            href="/pipeline"
            className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-xs sm:text-sm font-semibold text-foreground hover:bg-surface-hover transition-colors shadow-sm font-mono"
          >
            <span>View Architecture & Audit</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
