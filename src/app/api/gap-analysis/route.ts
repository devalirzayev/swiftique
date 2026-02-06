import { NextResponse } from "next/server";
import { analyzeGaps } from "@/lib/ai/gap-analyzer";

export async function GET() {
  const analysis = await analyzeGaps();
  return NextResponse.json(analysis);
}
