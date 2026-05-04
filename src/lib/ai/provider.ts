import { GoogleGenerativeAI } from "@google/generative-ai";
import { OpenAI } from "openai";
import { Ollama } from "ollama";

export type AIProviderType = 'gemini' | 'ollama' | 'custom-openai';

export interface AIConfig {
  provider: AIProviderType;
  apiKey?: string;
  baseUrl?: string;
  modelName: string;
}

export interface DiagramNode {
  id: string;
  type: string;
  data: { label: string };
  position: { x: number; y: number };
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface DiagramData {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export async function generateArchitecture(prompt: string, config: AIConfig): Promise<DiagramData> {
  const systemPrompt = `You are an elite Systems Architect. Your task is to generate a precise, production-ready architectural blueprint in JSON format.
  
  OBLIGATORY OUTPUT FORMAT:
  Return ONLY a single, valid JSON object. Do NOT include any preamble, introduction, markdown explanation, or closing remarks.
  
  JSON SCHEMA:
  {
    "nodes": [
      { 
        "id": "unique-id", 
        "type": "service" | "database" | "api-gateway" | "queue" | "client" | "cache" | "cloud-service",
        "data": { 
          "label": "Human Readable Name",
          "code": "/* FULL production-ready implementation code here. Include imports, logic, and exports. */",
          "filename": "path/to/component.ext"
        }
      }
    ],
    "edges": [
      { "id": "e-source-target", "source": "source-id", "target": "target-id", "label": "connection-description" }
    ]
  }
  
  TECHNICAL REQUIREMENTS:
  - id: Short strings like 'web-app', 'db-main', 'auth-service'.
  - code: This must be the ACTUAL implementation. If it's a backend service, write Express/Node code. If a frontend, write React/TypeScript.
  - filename: Standard paths like 'src/app.ts' or 'api/routes/user.js'.
  - Logical flow: Edges must represent actual data dependencies.
  
  FAILURE TO RETURN VALID JSON WILL RESULT IN SYSTEM ERROR.`;

  switch (config.provider) {
    case 'gemini':
      return await generateGemini(prompt, systemPrompt, config);
    case 'ollama':
      return await generateOllama(prompt, systemPrompt, config);
    case 'custom-openai':
      return await generateOpenAI(prompt, systemPrompt, config);
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}

async function generateGemini(prompt: string, systemPrompt: string, config: AIConfig): Promise<DiagramData> {
  if (!config.apiKey) throw new Error("API Key required for Gemini");
  const genAI = new GoogleGenerativeAI(config.apiKey);
  // Using JSON mode if supported by the model
  const model = genAI.getGenerativeModel({ 
    model: config.modelName,
    generationConfig: {
      responseMimeType: "application/json",
    }
  });
  
  const result = await model.generateContent(`${systemPrompt}\n\nUser Request: ${prompt}`);
  const text = result.response.text();
  return parseAIResponse(text);
}

async function generateOllama(prompt: string, systemPrompt: string, config: AIConfig): Promise<DiagramData> {
  const ollama = new Ollama({ host: config.baseUrl || 'http://localhost:11434' });
  const response = await ollama.chat({
    model: config.modelName,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    format: 'json'
  });
  return parseAIResponse(response.message.content);
}

async function generateOpenAI(prompt: string, systemPrompt: string, config: AIConfig): Promise<DiagramData> {
  const openai = new OpenAI({
    apiKey: config.apiKey || 'no-key',
    baseURL: config.baseUrl,
    dangerouslyAllowBrowser: true 
  });

  const response = await openai.chat.completions.create({
    model: config.modelName,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" }
  });

  return parseAIResponse(response.choices[0].message.content || '{}');
}

function repairJSON(json: string): string {
  // Simple stack-based brace/bracket closer
  const stack: string[] = [];
  for (let i = 0; i < json.length; i++) {
    const char = json[i];
    if (char === '{') stack.push('}');
    else if (char === '[') stack.push(']');
    else if (char === '}' || char === ']') {
      if (stack.length > 0 && stack[stack.length - 1] === char) {
        stack.pop();
      }
    }
  }
  
  let repaired = json;
  // If we have open braces/brackets, close them in reverse order
  while (stack.length > 0) {
    repaired += stack.pop();
  }
  return repaired;
}

function parseAIResponse(text: string): DiagramData {
  let cleaned = text.trim();
  
  // 1. Remove Markdown code blocks
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
  
  // 2. Isolate JSON object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1) {
    // If we have a last brace, take everything between them
    if (lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    } else {
      // If no closing brace, it might be truncated. Try to repair it.
      cleaned = cleaned.substring(firstBrace);
      cleaned = repairJSON(cleaned);
    }
  }

  try {
    const parsed = JSON.parse(cleaned);
    
    // Structure Validation
    if (!parsed.nodes || !Array.isArray(parsed.nodes)) {
      throw new Error("Invalid structure: missing 'nodes' array");
    }
    
    return parsed as DiagramData;
  } catch (e: any) {
    console.warn("JSON Parse Failed, attempting aggressive recovery...", e);
    
    try {
      // Final attempt: regex match for anything resembling the nodes array
      const nodesMatch = text.match(/"nodes"\s*:\s*(\[[\s\S]*?\])/);
      const edgesMatch = text.match(/"edges"\s*:\s*(\[[\s\S]*?\])/);
      
      if (nodesMatch) {
        return {
          nodes: JSON.parse(repairJSON(nodesMatch[1])),
          edges: edgesMatch ? JSON.parse(repairJSON(edgesMatch[1])) : []
        };
      }
    } catch (innerError) {
      console.error("Recovery failed:", innerError);
    }

    throw new Error(`The AI response was truncated or malformed. Try a simpler prompt or check if your model supports large outputs.`);
  }
}
