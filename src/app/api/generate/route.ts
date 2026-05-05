import { NextRequest, NextResponse } from 'next/server';
import { generateArchitecture, AIConfig } from '@/lib/ai/provider';

export const maxDuration = 60; // Increase timeout to 60 seconds

export async function GET() {
  return NextResponse.json({ status: "API is reachable" });
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, config } = await req.json() as { prompt: string, config: AIConfig };
    console.log(`[API] Generating architecture for: "${prompt}" using provider: ${config.provider}`);

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const data = await generateArchitecture(prompt, config);
    console.log(`[API] Generation successful. Nodes: ${data.nodes.length}`);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API ERROR]:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to generate architecture",
      details: error.stack
    }, { status: 500 });
  }
}
