import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/parse-entry", async (req, res) => {
    try {
      const { transcription } = req.body;
      if (!transcription) {
        return res.status(400).json({ error: "Transcription is required" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: transcription,
        config: {
          systemInstruction: `You are a health data parser. Parse natural language into structured health entries.
          Supported types: hydration, food, medication, mood, energy, sleep, exercise, mindfulness, vitals, reflection.
          Return a JSON array of entries.
          Each entry must have:
          - type: string (one of the supported types)
          - value: string (numeric or high-level status)
          - unit: string (oz, mg, quality, level, etc. or null)
          - notes: string (optional context)
          - timestamp: string (ISO 8601 current time: ${new Date().toISOString()})
          If multiple actions are mentioned, return multiple objects.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                value: { type: Type.STRING },
                unit: { type: Type.STRING },
                notes: { type: Type.STRING },
                timestamp: { type: Type.STRING }
              },
              required: ["type", "value", "timestamp"]
            }
          }
        }
      });

      const entries = JSON.parse(response.text);
      res.json({ entries });
    } catch (error) {
      console.error("Gemini context error:", error);
      res.status(500).json({ error: "Failed to parse entries" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
