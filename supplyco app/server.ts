import dotenv from "dotenv";
import fs from "fs";
if (fs.existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
} else {
  dotenv.config();
}

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = 3000;

// Check API Key Type (Groq / OpenRouter / Gemini)
const apiKey = process.env.GEMINI_API_KEY || "";
const isGroqOrOpenRouter = apiKey.startsWith("gsk_") || apiKey.startsWith("sk-");

// Initialize Gemini safely only if it's a standard API key
let ai: GoogleGenAI | null = null;
try {
  if (apiKey && !isGroqOrOpenRouter && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
} catch (error) {
  console.error("Failed to initialize Google GenAI:", error);
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiConfigured: !!ai });
});

// Helper to run AI with model fallback and retries
async function callGeminiWithRetry(messages: any[]) {
  if (!ai && !isGroqOrOpenRouter) {
    throw new Error("AI client not initialized and no Auth Token provided");
  }

  const systemInstruction = `You are the Supplyco Kerala AI Smart Saver Assistant (ശബരി സ്മാർട്ട് സേവർ).
            Your mission is to help shoppers maximize their savings using Civil Supplies groceries, government subsidies, and affordable Sabari brand items.
            
            Keep your advice highly practical, encouraging, and focused on Kerala cuisine and shopping realities:
            - Highlight the specific subsidy products like Jaya Rice (ജയ അരി), Green Gram (ചെറുപയർ), Coconut Oil (വെളിച്ചെണ്ണ), Sugar (പഞ്ചസാര), and Red Onion (സവാള).
            - Provide answers/recipes in a beautiful bilingual tone combining English and Malayalam (where appropriate, e.g. names of products).
            - Suggest budget-friendly recipes (like Thoran, Sambar, Green Gram Curry, Rice meals) using these subsidy and Sabari ingredients.
            - Give a clear breakdown of savings! Format outputs using elegant Markdown, bold headers, and bullet points. Keep response concise, readable and structured.`;

  // Fallback chain (Groq models + the user's requested model + Gemini models)
  const modelsToTry = apiKey.startsWith("gsk_") 
    ? ["llama-3.3-70b-versatile", "llama3-8b-8192"] 
    : ["gemini-1.5-flash", "gemini-1.5-pro"];
    
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    let retries = 2; // Try up to 2 times per model
    while (retries > 0) {
      try {
        console.log(`[AI] Attempting generation with model=${modelName} (retries left=${retries - 1})`);
        
        if (isGroqOrOpenRouter) {
           // Groq / OpenRouter REST API Fetch (OpenAI Format)
           const systemMsg = { role: "system", content: systemInstruction };
           const formattedMessages = [systemMsg, ...messages];
           
           const endpoint = apiKey.startsWith("gsk_") 
              ? "https://api.groq.com/openai/v1/chat/completions"
              : "https://openrouter.ai/api/v1/chat/completions";

           const response = await fetch(endpoint, {
             method: "POST",
             headers: {
               "Authorization": `Bearer ${apiKey}`,
               "Content-Type": "application/json"
             },
             body: JSON.stringify({
               model: modelName,
               messages: formattedMessages,
               temperature: 0.7
             })
           });
           
           if (!response.ok) {
             const errorData = await response.text();
             throw new Error(`API Fetch Failed: ${response.status} - ${errorData}`);
           }
           
           const data = await response.json();
           if (data.choices && data.choices[0].message.content) {
              console.log(`[AI] Success using model=${modelName}`);
              return data.choices[0].message.content;
           }
           throw new Error("Invalid response structure from fetch");
        } else if (ai) {
          // Standard SDK Call
          // Map OpenAI style messages back to Gemini style
          const contents = messages.map((m: any) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }]
          }));

          const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });

          if (response && response.text) {
            console.log(`[Gemini] Success using API Key with model=${modelName}`);
            return response.text;
          }
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[AI] Warning: Model ${modelName} encountered error. ${err.message || err}`);
        retries--;
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 800)); // Sleep 800ms before retrying
        }
      }
    }
  }

  throw lastError || new Error("All fallback models timed out or failed.");
}


app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { prompt, history = [] } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Prompt is required." });
      return;
    }

    // Convert history format cleanly to OpenAI format
    const messages = history.map((h: any) => ({
      role: h.role === "user" ? "user" : "assistant",
      content: h.text
    }));

    // Append the new message
    messages.push({
      role: "user",
      content: prompt
    });

    let generatedText = "";

    // If Gemini is configured or an Auth Token is provided, attempt with retry/fallback
    if (ai || isGroqOrOpenRouter) {
      generatedText = await callGeminiWithRetry(messages);
    } else {
      res.status(500).json({ error: "Gemini is not configured. Please add an API key." });
      return;
    }

    res.json({ text: generatedText });
  } catch (error: any) {
    console.error("Critical chat route error:", error.message || error);
    res.status(500).json({
      error: error.message || "An unexpected error occurred connecting to the AI."
    });
  }
});

// Vite middleware setup
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
};

startServer();
