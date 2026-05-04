# <img src="public/favicon.png" width="280" height="280" valign="middle"> Spirit Arc

![GitHub repo size](https://img.shields.io/github/repo-size/SaeedAngiz1/Spirit-Arc?style=for-the-badge)
![GitHub stars](https://img.shields.io/github/stars/SaeedAngiz1/Spirit-Arc?style=for-the-badge)
![Developer](https://img.shields.io/badge/Developed%20By-Mohammad%20Saeed%20Angiz-blueviolet?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20|%20TypeScript%20|%20Framer%20Motion-black?style=for-the-badge)

**Spirit Arc** is a high-fidelity, AI-powered systems architecture designer. It transforms complex technical requirements into interactive, visual architecture diagrams through a seamless natural language interface.

---

## 🛠 Exact Functionality

Spirit Arc serves as a bridge between conceptual system design and visual representation. Its primary function is to:
1. **Analyze Requirements**: Parse natural language descriptions of complex software systems (e.g., "Microservices with Redis caching and a PostgreSQL database").
2. **Synthesize Architecture**: Automatically determine the necessary components (nodes) and their interactions (edges/connections).
3. **Visualize Data**: Render these components onto a high-performance, interactive canvas where they can be manipulated, reorganized, and refined.

## 🧠 How It Works

The core of Spirit Arc is a sophisticated "Conceptual-to-Visual" pipeline:

### 1. The Configuration Layer
Users can configure their preferred AI engine. Spirit Arc supports:
*   **OpenAI & Anthropic**: For world-class reasoning and complex architecture synthesis.
*   **Ollama**: For local, private architecture generation.
*   **Custom API**: For enterprise-grade or specialized model endpoints.

### 2. The Prompt Engine
When a user describes a system, Spirit Arc wraps the request in a specialized "Architectural Schema" prompt. This ensures the AI returns structured JSON data containing node types (Frontend, Backend, Database, Cache, etc.) and their directional dependencies.

### 3. The Visual Orchestrator & Code Engine
Spirit Arc doesn't just visualize; it implements.
*   **Auto-Layout**: Nodes are placed intelligently using a hierarchical logic.
*   **Deep-Dive Code View**: Click any component to reveal its AI-generated source code (Express handlers, SQL schemas, etc.).
*   **Interactive Refinement**: Add components manually (n8n style), drag them, or delete them to perfect your design.
*   **Full Project Export**: Download your entire architecture as a structured JSON or a production-ready ZIP file containing all source files and metadata.

### 4. Glassmorphism Design System
The entire experience is wrapped in a "Frosted Obsidian" aesthetic. Every component uses real-time backdrop blurs, CSS-in-JS gradients, and micro-animations to create a premium, state-of-the-art environment for high-level engineering.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js 18+
*   An API key from a supported provider (OpenAI/Anthropic) or a local Ollama instance running.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/SaeedAngiz1/Spirit-Arc.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## ⚙️ AI Configuration
1. Open the **Settings** menu (top left).
2. Select your **Provider**.
3. Enter your **API Key** (stored locally in session memory).
4. For Ollama, ensure your base URL is set to `http://localhost:11434`.

---

## 👨‍💻 Developed By
**Mohammad Saeed Angiz**  
*Lead Architect & Full-Stack Developer*

Spirit Arc is built with a commitment to visual excellence and technical precision.
