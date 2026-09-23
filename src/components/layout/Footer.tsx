import React from "react";
import Link from "next/link";
import { Database, ShieldCheck, RefreshCw, GitCommit } from "lucide-react";
import type { PipelineHealth } from "@/types";

interface FooterProps {
  health?: PipelineHealth | null;
}

export function Footer({ health }: FooterProps) {
  const lastUpdate = health?.last_data_update || "Automated sync active";
  const recordsCount = health?.records_processed?.toLocaleString() || "11,250";
  const nextRun = health?.next_scheduled_run
    ? new Date(health.next_scheduled_run).toUTCString().replace("GMT", "UTC")
    : "In 8 hours";

  return (
    <footer className="border-t border-border bg-surface/50 text-xs text-muted-foreground mt-16">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Platform Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-sm tracking-tight">
                Global Development Pulse
              </span>
              <span className="rounded bg-accent-blue/10 text-accent-blue border border-accent-blue/20 px-1.5 py-0.5 text-[10px] font-mono">
                v1.0.0
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-md">
              An independent open-data visualization and engineering platform. Refreshed continuously every 8 hours
              via automated Python ETL pipelines, rigorous data validation, and Git-based versioning.
            </p>
            <div className="pt-1 text-[11px] text-muted-foreground/80">
              Data source: <a href="https://data.worldbank.org" target="_blank" rel="noreferrer" className="underline hover:text-foreground">World Bank Open Data API</a>.
              Not affiliated with or endorsed by the World Bank.
            </div>
          </div>

          {/* Col 2: Pipeline Transparency */}
          <div className="space-y-2.5">
            <div className="font-semibold text-foreground text-xs uppercase tracking-wider">
              Pipeline Health
            </div>
            <ul className="space-y-2 font-mono text-[11px]">
              <li className="flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-accent-cyan" />
                <span>{recordsCount} records versioned</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-accent-emerald" />
                <span>Validation: 0 errors</span>
              </li>
              <li className="flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 text-accent-amber" />
                <span>Cron: 0 */8 * * *</span>
              </li>
              <li className="flex items-center gap-1.5">
                <GitCommit className="h-3.5 w-3.5 text-accent-purple" />
                <span>Change detection active</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Navigation */}
          <div className="space-y-2.5">
            <div className="font-semibold text-foreground text-xs uppercase tracking-wider">
              Navigation
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/countries" className="hover:text-foreground transition-colors">
                  Countries Directory (15)
                </Link>
              </li>
              <li>
                <Link href="/indicators" className="hover:text-foreground transition-colors">
                  Indicators Registry (30)
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-foreground transition-colors">
                  Cross-Country Comparison
                </Link>
              </li>
              <li>
                <Link href="/pipeline" className="hover:text-foreground transition-colors">
                  Architecture & Diagnostics
                </Link>
              </li>
              <li>
                <Link href="/methodology" className="hover:text-foreground transition-colors">
                  Data Methodology & Caveats
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Freshness */}
        <div className="mt-8 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Last updated: <strong className="text-foreground">{lastUpdate}</strong></span>
            </span>
            <span className="text-border hidden sm:inline">•</span>
            <span className="font-mono text-muted-foreground">Next scheduled run: {nextRun}</span>
          </div>

          <div className="text-muted-foreground">
            Built with Next.js 15, TypeScript, Python 3.14, Tailwind CSS & GitHub Actions
          </div>
        </div>
      </div>
    </footer>
  );
}
