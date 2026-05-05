import { GoogleGenerativeAI } from "@google/generative-ai";
import { OpenAI } from "openai";
import { Ollama } from "ollama";

export type AIProviderType = 'gemini' | 'ollama' | 'anthropic' | 'groq' | 'nvidia' | 'perplexity' | 'mistral' | 'together' | 'openrouter' | 'custom-openai';

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
  reasoning: string;
}

export async function generateArchitecture(prompt: string, config: AIConfig): Promise<DiagramData> {
  const systemPrompt = `You are an elite Agentic Systems Architect. Your goal is to transform a high-level user request into a comprehensive, multi-tiered technical architecture.

  THINKING PROCESS (INTERNAL LOGIC):
  1. Decompose the request into core functional requirements (UI, Data Processing, Storage, Intelligence).
  2. Determine the optimal tech stack (e.g., Next.js for Frontend, Express for Backend, OpenAI for Intelligence).
  3. Define data flow: How does information move from the user to the database and back?
  
  OBLIGATORY OUTPUT FORMAT:
  Return ONLY a single, valid JSON object. No preamble. No markdown. No chatter.
  
  JSON SCHEMA:
  {
    "reasoning": "A high-level technical rationale for the architectural decisions made.",
    "nodes": [
      { 
        "id": "node-id", 
        "type": "client" | "server" | "database" | "ai-agent" | "cloud-function" | "gateway" | "cache",
        "data": { 
          "label": "Human Readable Name",
          "category": "service" | "database" | "api-gateway" | "queue" | "client" | "cache" | "cloud-service",
          "status": "Stable" | "Beta" | "Dev",
          "code": "/* COMPLETE production-ready implementation. Include imports, full logic, and exports. */",
          "filename": "src/path/to/file.ext"
        }
      }
    ],
    "edges": [
      { "id": "e-id", "source": "src", "target": "dest", "label": "data-description" }
    ]
  }
  
  ARCHITECTURAL RULES:
  - Client-Server Separation: Always include a dedicated UI/Client node and a Backend/Logic node if the app requires processing.
  - Intelligence Tier: If AI features are requested, create a specific 'AI Agent' or 'Intelligence Service' node.
  - Code Fidelity: The code inside 'data.code' must be high-quality, functional code, not placeholders.
  - Visual Clarity: Use distinct IDs like 'frontend-main', 'api-server', 'mood-processor'.`;

  let cleanedBaseUrl = config.baseUrl;
  if (cleanedBaseUrl) {
    // Remove trailing slashes and common API paths that libraries append themselves
    cleanedBaseUrl = cleanedBaseUrl.replace(/\/+$/, '');
    if (config.provider === 'ollama') {
      cleanedBaseUrl = cleanedBaseUrl.replace(/\/api$/, '');
    } else if (config.provider === 'custom-openai') {
      cleanedBaseUrl = cleanedBaseUrl.replace(/\/v1$/, '');
    }
  }

  switch (config.provider) {
    case 'gemini':
      return await generateGemini(prompt, systemPrompt, config);
    case 'ollama':
      return await generateOllama(prompt, systemPrompt, { ...config, baseUrl: cleanedBaseUrl });
    case 'anthropic':
      return await generateAnthropic(prompt, systemPrompt, config);
    case 'groq':
      return await generateOpenAI(prompt, systemPrompt, { ...config, baseUrl: cleanedBaseUrl || 'https://api.groq.com/openai/v1' });
    case 'nvidia':
      // NVIDIA NIM requires a specific base URL and sometimes model prefixes
      return await generateOpenAI(prompt, systemPrompt, { 
        ...config, 
        baseUrl: cleanedBaseUrl || 'https://integrate.api.nvidia.com/v1'
      });
    case 'perplexity':
      return await generateOpenAI(prompt, systemPrompt, { ...config, baseUrl: cleanedBaseUrl || 'https://api.perplexity.ai' });
    case 'mistral':
      return await generateOpenAI(prompt, systemPrompt, { ...config, baseUrl: cleanedBaseUrl || 'https://api.mistral.ai/v1' });
    case 'together':
      return await generateOpenAI(prompt, systemPrompt, { ...config, baseUrl: cleanedBaseUrl || 'https://api.together.xyz/v1' });
    case 'openrouter':
      return await generateOpenAI(prompt, systemPrompt, { ...config, baseUrl: cleanedBaseUrl || 'https://openrouter.ai/api/v1' });
    case 'custom-openai':
      return await generateOpenAI(prompt, systemPrompt, { ...config, baseUrl: cleanedBaseUrl });
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
    dangerouslyAllowBrowser: true,
    timeout: 50000 // 50 seconds timeout
  });

  const response = await openai.chat.completions.create({
    model: config.modelName,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    // Only use json_object if the provider is likely to support it
    response_format: config.provider === 'nvidia' ? undefined : { type: "json_object" }
  });

  return parseAIResponse(response.choices[0].message.content || '{}');
}

async function generateAnthropic(prompt: string, systemPrompt: string, config: AIConfig): Promise<DiagramData> {
  if (!config.apiKey) throw new Error("API Key required for Anthropic");
  
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
      "dangerously-allow-browser": "true" // Note: Usually proxy is needed, but we'll try for local dev
    },
    body: JSON.stringify({
      model: config.modelName || "claude-3-5-sonnet-20240620",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Anthropic API Error: ${response.status} ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return parseAIResponse(data.content[0].text);
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
          edges: edgesMatch ? JSON.parse(repairJSON(edgesMatch[1])) : [],
          reasoning: "Architecture generated based on the specified requirements."
        };
      }
    } catch (innerError) {
      console.error("Recovery failed:", innerError);
    }

    throw new Error(`The AI response was truncated or malformed. Try a simpler prompt or check if your model supports large outputs.`);
  }
}
