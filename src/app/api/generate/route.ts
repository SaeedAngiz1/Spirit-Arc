import { NextRequest, NextResponse } from 'next/server';
import { generateArchitecture, AIConfig } from '@/lib/ai/provider';

export async function POST(req: NextRequest) {
  try {
    const { prompt, config } = await req.json() as { prompt: string, config: AIConfig };

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const data = await generateArchitecture(prompt, config);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate architecture" }, { status: 500 });
  }
}
