import { NextResponse } from "next/server";
import { getCountryData } from "@/lib/data";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ country: string }> }
) {
  const { country } = await params;
  const data = await getCountryData(country);

  if (!data) {
    return NextResponse.json(
      { error: `Country '${country}' not found in registry.` },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
