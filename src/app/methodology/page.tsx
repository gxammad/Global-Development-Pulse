import React from "react";
import type { Metadata } from "next";
import {
  FileText,
  Database,
  ShieldAlert,
  GitBranch,
  Scale,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Methodology & Attribution | Global Development Pulse",
  description:
    "Comprehensive documentation of data provenance, World Bank API ingestion mechanics, normalization schemas, validation rules, and known limitations.",
};

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Page Title */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-accent-blue" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
            Documentation & Standards
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Data Methodology & Provenance
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Global Development Pulse is engineered to provide authentic, verifiable, and transparent
          access to public international development data. This document outlines our data lifecycle,
          mathematical rules, validation boundaries, and analytical limitations.
        </p>
      </div>

      {/* Attribution & Legal Notice */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-3 shadow-sm">
        <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
          <Scale className="h-4 w-4 text-accent-cyan" />
          <span>Attribution & World Bank Open Data License</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The indicators presented on this platform are collected from the{" "}
          <a
            href="https://datahelpdesk.worldbank.org/knowledgebase/articles/889392"
            target="_blank"
            rel="noreferrer"
            className="text-accent-blue hover:underline font-medium inline-flex items-center gap-1"
          >
            World Bank Open Data API <ExternalLink className="h-3 w-3" />
          </a>
          , published under the Creative Commons Attribution 4.0 International License (CC BY 4.0).
        </p>
        <div className="pt-2 text-xs font-mono text-muted-foreground bg-muted p-3 rounded-lg border border-border">
          <strong>Mandatory Disclosure:</strong> Global Development Pulse is an independent
          open-data visualization and engineering project. It is not affiliated with, endorsed by, or
          sponsored by the World Bank Group.
        </div>
      </div>

      {/* Section 1: Data Collection & API Architecture */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Database className="h-4 w-4 text-accent-blue" />
          <span>1. Ingestion Architecture</span>
        </h2>
        <div className="text-xs sm:text-sm text-muted-foreground space-y-3 leading-relaxed">
          <p>
            The ingestion pipeline runs on an automated 8-hour schedule via GitHub Actions.
            To minimize network overhead and respect external API quotas, the pipeline utilizes
            multi-country batching queries:
          </p>
          <pre className="p-3 rounded-lg bg-surface border border-border font-mono text-xs overflow-x-auto text-foreground">
            GET https://api.worldbank.org/v2/country/PAK;IND;USA;.../indicator/NY.GDP.MKTP.CD?date=2000:2024&format=json&per_page=1000
          </pre>
          <p>
            Network requests are managed with exponential backoff retries (status codes 429, 500,
            502, 503, 504), connection pooling, polite per-request delays, and custom User-Agent headers.
          </p>
        </div>
      </section>

      {/* Section 2: Normalization & Missing Data Handling */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-accent-purple" />
          <span>2. Normalization & Missing Data Handling</span>
        </h2>
        <div className="text-xs sm:text-sm text-muted-foreground space-y-3 leading-relaxed">
          <p>
            Raw API payloads vary in nesting and field naming. The transformation stage
            normalizes every point into a strict, unified observation record:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 font-mono text-xs text-foreground/90">
            <li>Country ISO-3 codes and World Bank indicator IDs are enforced as authoritative keys.</li>
            <li>Years are validated as four-digit integers between 2000 and 2024.</li>
            <li>Numeric values are cast to IEEE floating-point and rounded to 4 decimal places.</li>
          </ul>
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-500">
              <AlertCircle className="h-4 w-4" />
              <span>Strict Zero-Imputation Policy</span>
            </div>
            <p className="text-muted-foreground">
              Missing values in international development data represent real reporting delays,
              conflict disruptions, or varying statistical survey schedules. We do{" "}
              <strong>NOT</strong> interpolate, guess, or impute missing data points.
              Missing observations are explicitly preserved as <code>null</code>, and their volume
              is transparently audited in the quality report.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Data Validation & Domain Sanity Rules */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-accent-emerald" />
          <span>3. Multi-Layer Validation Rules</span>
        </h2>
        <div className="text-xs sm:text-sm text-muted-foreground space-y-3 leading-relaxed">
          <p>
            Before any output is written, <code>validate.py</code> runs automated integrity checks:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="rounded-lg border border-border bg-surface p-3.5 space-y-1">
              <div className="font-semibold text-foreground text-xs">Schema Verification</div>
              <p className="text-xs text-muted-foreground">
                Ensures all 12 required fields exist and correspond to registered countries and indicators.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-3.5 space-y-1">
              <div className="font-semibold text-foreground text-xs">Duplicate Detection</div>
              <p className="text-xs text-muted-foreground">
                Enforces strict uniqueness on (country_code, indicator_code, year) tuples.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-3.5 space-y-1">
              <div className="font-semibold text-foreground text-xs">Domain Boundaries</div>
              <p className="text-xs text-muted-foreground">
                Flags impossible values (e.g. negative access to electricity, life expectancy &gt; 115).
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-3.5 space-y-1">
              <div className="font-semibold text-foreground text-xs">Content Fingerprinting</div>
              <p className="text-xs text-muted-foreground">
                Computes deterministic SHA-256 hash to prevent unnecessary Git commits when data is unchanged.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Analytical Stance: Non-Normative Analysis */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          4. Descriptive vs. Normative Representation
        </h2>
        <div className="text-xs sm:text-sm text-muted-foreground space-y-3 leading-relaxed">
          <p>
            A common flaw in data dashboards is presenting indicators with simplistic &ldquo;good&rdquo; or
            &ldquo;bad&rdquo; color-coding (e.g. marking high birth rates or low imports as inherently negative).
          </p>
          <p>
            Global Development Pulse follows a strictly descriptive paradigm:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
            <li>
              Indicators describe structural socio-economic states, not moral judgments.
            </li>
            <li>
              Economic metrics (e.g. exports % of GDP, FDI inflows) reflect specific national
              economic models rather than universal success metrics.
            </li>
            <li>
              Neutral palettes are maintained across charts, avoiding bias.
            </li>
          </ul>
        </div>
      </section>

      {/* Section 5: Known Limitations */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          5. Known Limitations
        </h2>
        <div className="text-xs sm:text-sm text-muted-foreground space-y-2 leading-relaxed">
          <p>
            Users and researchers relying on this data should take note of the following:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2 text-xs">
            <li>
              <strong>Reporting Lag:</strong> World Bank indicators are compiled from national statistical
              offices, central banks, and international bodies (UN, UNESCO, ILO, ITU, IEA). Most annual
              indicators carry a natural lag of 1 to 2 years.
            </li>
            <li>
              <strong>Methodology Variations:</strong> Definitions of terms like &ldquo;urban population&rdquo;
              or &ldquo;literacy&rdquo; may vary between individual countries&apos; statistical bureaus.
            </li>
            <li>
              <strong>Revision Windows:</strong> Prior year figures (e.g. GDP and population counts) are
              periodically adjusted by statistical authorities when census data is reconciled.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
