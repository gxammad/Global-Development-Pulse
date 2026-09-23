import fs from "fs/promises";
import path from "path";
import type {
  PlatformSummary,
  PipelineHealth,
  QualityReport,
  CountrySummary,
  IndicatorSummary,
  CountryDataset,
  IndicatorDataset,
} from "@/types";

const DATA_DIR = path.join(process.cwd(), "data", "processed");

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
}

export async function getPlatformSummary(): Promise<PlatformSummary | null> {
  return readJsonFile<PlatformSummary>(path.join(DATA_DIR, "summary.json"));
}

export async function getPipelineHealth(): Promise<PipelineHealth | null> {
  return readJsonFile<PipelineHealth>(path.join(DATA_DIR, "pipeline_health.json"));
}

export async function getQualityReport(): Promise<QualityReport | null> {
  return readJsonFile<QualityReport>(path.join(DATA_DIR, "quality_report.json"));
}

export async function getCountryIndex(): Promise<CountrySummary[]> {
  const data = await readJsonFile<CountrySummary[]>(path.join(DATA_DIR, "country_index.json"));
  return data ?? [];
}

export async function getIndicatorIndex(): Promise<IndicatorSummary[]> {
  const data = await readJsonFile<IndicatorSummary[]>(path.join(DATA_DIR, "indicator_index.json"));
  return data ?? [];
}

export async function getCountryData(countryId: string): Promise<CountryDataset | null> {
  // Normalize countryId to lowercase filename
  const cleanId = countryId.toLowerCase().trim();
  const filePath = path.join(DATA_DIR, "countries", `${cleanId}.json`);
  return readJsonFile<CountryDataset>(filePath);
}

export async function getIndicatorData(indicatorId: string): Promise<IndicatorDataset | null> {
  const cleanId = indicatorId.trim();
  const filePath = path.join(DATA_DIR, "indicators", `${cleanId}.json`);
  return readJsonFile<IndicatorDataset>(filePath);
}
