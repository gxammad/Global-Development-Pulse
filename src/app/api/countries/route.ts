import { NextResponse } from "next/server";
import { getCountryIndex } from "@/lib/data";

export async function GET() {
  const countries = await getCountryIndex();
  return NextResponse.json({
    total: countries.length,
    countries,
  });
}
