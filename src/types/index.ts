export type IndicatorCategory =
  | "Economic"
  | "Population"
  | "Employment"
  | "Education"
  | "Digital"
  | "Environment";

export type FormatType = "currency" | "percentage" | "number" | "decimal";

export type PipelineStatusType = "Healthy" | "Warning" | "Failed" | "Stale";

export interface CountryMeta {
  id: string;
  iso3: string;
  iso2: string;
  name: string;
  region: string;
  income_group: string;
  capital: string;
  flag_emoji: string;
}

export interface IndicatorMeta {
  id: string;
  code: string;
  name: string;
  short_description: string;
  category: IndicatorCategory;
  unit: string;
  source: string;
  format: FormatType;
  chart_type: "line" | "area" | "bar";
  descriptive_only: boolean;
}

export interface TimeSeriesPoint {
  year: number;
  value: number | null;
}

export interface CountryIndicatorSeries {
  metadata: IndicatorMeta;
  time_series: TimeSeriesPoint[];
  latest_year: number | null;
  latest_value: number | null;
  data_points_count: number;
  coverage_percent: number;
}

export interface CountryDataset {
  country: CountryMeta;
  indicators: Record<string, CountryIndicatorSeries>;
  summary_metrics: Record<string, {
    value: number | null;
    year: number | null;
    unit: string;
    format: FormatType;
  }>;
}

export interface IndicatorCountrySeries {
  country: CountryMeta;
  time_series: TimeSeriesPoint[];
  latest_year: number | null;
  latest_value: number | null;
}

export interface IndicatorDataset {
  indicator: IndicatorMeta;
  countries: Record<string, IndicatorCountrySeries>;
}

export interface CountrySummary extends CountryMeta {
  summary_metrics: Record<string, {
    value: number | null;
    year: number | null;
    unit: string;
    format: FormatType;
  }>;
  coverage_percent: number;
  tracked_indicators_count: number;
}

export interface IndicatorSummary extends IndicatorMeta {
  reporting_countries_count: number;
  total_countries_count: number;
  latest_global_year: number | null;
}

export interface QualityReport {
  status: "healthy" | "warning" | "failed";
  records: number;
  valid_observations: number;
  missing_values: number;
  missing_percentage: number;
  duplicates: number;
  validation_errors: number;
  domain_warnings: number;
  last_updated: string;
  source: string;
  error_samples: string[];
  duplicate_samples: string[];
  warning_samples: string[];
}

export interface PipelineHealth {
  status: PipelineStatusType;
  status_message: string;
  last_run_timestamp: string;
  last_data_update: string;
  records_processed: number;
  records_changed: number;
  missing_values: number;
  missing_percentage: number;
  validation_errors: number;
  duplicates: number;
  source: string;
  refresh_frequency: string;
  next_scheduled_run: string;
  environment: string;
}

export interface HighlightItem {
  metric: string;
  country: string;
  value: number;
  unit: string;
  format: FormatType;
}

export interface PlatformSummary {
  platform_name: string;
  tagline: string;
  description: string;
  tracked_countries_count: number;
  tracked_indicators_count: number;
  total_records: number;
  valid_observations: number;
  data_freshness: string;
  last_updated_human: string;
  pipeline_status: PipelineStatusType;
  date_range: {
    start: number;
    end: number;
  };
  category_counts: Record<string, number>;
  highlights: HighlightItem[];
  featured_indicators: string[];
}
