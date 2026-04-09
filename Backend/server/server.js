import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  },
});

// TEMPORARY: allow all origins for local testing
app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

console.log("Gemini key loaded:", !!process.env.GEMINI_API_KEY);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function normalizeResult(parsed) {
  const confidence = Number(parsed?.confidence ?? 0);

  return {
    deviceType: parsed?.deviceType || "Unknown Device",
    likelyBrand: parsed?.likelyBrand || "Unknown Brand",
    likelyModel: parsed?.likelyModel || "Model not confidently identified",
    visibleCondition: parsed?.visibleCondition || "Unknown",
    confidence: Number.isFinite(confidence) ? confidence : 0,
    reasoning:
      parsed?.reasoning ||
      "The image did not provide enough reliable detail for exact identification.",
    exactModelReliable: confidence >= 85,
  };
}

app.post("/api/analyze-device", upload.single("image"), async (req, res) => {
  console.log("AI route hit");

  try {
    console.log("File received:", !!req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY is missing in server/.env",
      });
    }

    const prompt = `
Analyze this uploaded electronic device image.

Rules:
1. Identify device type.
2. Identify likely brand.
3. Identify exact model ONLY if very confident.
4. Identify visible physical condition.
5. Return confidence from 0 to 100.
6. Do not guess exact model if unsure.
7. If unsure, write "Model not confidently identified".

Return ONLY valid JSON:
{
  "deviceType": "Phone | Laptop | Tablet | Headphones | Unknown Device",
  "likelyBrand": "string",
  "likelyModel": "string",
  "visibleCondition": "Excellent | Good | Damaged | Broken | Cracked | Dead | Unknown",
  "confidence": 0,
  "reasoning": "short explanation"
}
    `.trim();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: req.file.mimetype,
                data: req.file.buffer.toString("base64"),
              },
            },
          ],
        },
      ],
    });

    console.log("Gemini response received");

    const rawText = (response.text || "").trim();
    console.log("Raw Gemini output:", rawText);

    const parsed = safeJsonParse(rawText);

    if (!parsed) {
      return res.status(200).json({
        success: true,
        analysis: {
          deviceType: "Unknown Device",
          likelyBrand: "Unknown Brand",
          likelyModel: "Model not confidently identified",
          visibleCondition: "Unknown",
          confidence: 0,
          reasoning: "The AI response could not be parsed into structured JSON.",
          exactModelReliable: false,
        },
        raw: rawText,
      });
    }

    return res.status(200).json({
      success: true,
      analysis: normalizeResult(parsed),
    });
  } catch (error) {
    console.error("Analyze device error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to analyze device image.",
      error: error.message || "Unknown server error",
    });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});