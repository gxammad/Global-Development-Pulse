import React from "react";
import {
  getPlatformSummary,
  getPipelineHealth,
  getCountryIndex,
  getIndicatorData,
} from "@/lib/data";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const revalidate = 3600;

export default async function HomePage() {
  const [summary, health, countries, internet, gdpCapita, renewables, lifeExp] =
    await Promise.all([
      getPlatformSummary(),
      getPipelineHealth(),
      getCountryIndex(),
      getIndicatorData("internet_users_percent"),
      getIndicatorData("gdp_per_capita_usd"),
      getIndicatorData("renewable_electricity_output"),
      getIndicatorData("life_expectancy_birth"),
    ]);

  return (
    <DashboardClient
      summary={summary}
      health={health}
      countries={countries}
      featuredDatasets={{
        internet,
        gdpCapita,
        renewables,
        lifeExp,
      }}
    />
  );
}
