import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

console.log("GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);
console.log("PORT:", process.env.PORT);

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

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function extractJsonText(text) {
  if (!text) return "";

  let cleaned = String(text).trim();

  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
  }

  return cleaned;
}

function safeJsonParse(text) {
  try {
    const cleaned = extractJsonText(text);
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

function normalizeDeviceType(value) {
  const v = String(value || "").toLowerCase();

  if (v.includes("phone") || v.includes("smartphone") || v.includes("mobile")) {
    return "Phone";
  }
  if (v.includes("laptop") || v.includes("notebook")) {
    return "Laptop";
  }
  if (v.includes("tablet") || v.includes("ipad")) {
    return "Tablet";
  }
  if (
    v.includes("headphone") ||
    v.includes("earbud") ||
    v.includes("earphone")
  ) {
    return "Headphones";
  }

  return "Unknown Device";
}

function normalizeCondition(value) {
  const v = String(value || "").toLowerCase();

  if (v.includes("excellent")) return "Excellent";
  if (v.includes("good")) return "Good";
  if (v.includes("damaged")) return "Damaged";
  if (v.includes("broken")) return "Damaged";
  if (v.includes("cracked")) return "Damaged";
  if (v.includes("dead")) return "Dead";

  return "Unknown";
}

function normalizeResult(parsed) {
  const confidence = Number(parsed?.confidence ?? 0);

  return {
    deviceType: normalizeDeviceType(parsed?.deviceType),
    likelyBrand: parsed?.likelyBrand || "Unknown Brand",
    likelyModel: parsed?.likelyModel || "Model not confidently identified",
    visibleCondition: normalizeCondition(parsed?.visibleCondition),
    confidence: Number.isFinite(confidence) ? confidence : 0,
    reasoning:
      parsed?.reasoning ||
      "The image did not provide enough reliable detail for exact identification.",
    exactModelReliable: Number.isFinite(confidence) ? confidence >= 85 : false,
  };
}

app.post("/api/analyze-device", (req, res) => {
  upload.single("image")(req, res, async (uploadError) => {
    if (uploadError) {
      console.error("Upload error:", uploadError);
      return res.status(400).json({
        success: false,
        message: uploadError.message || "Image upload failed.",
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image uploaded.",
        });
      }

      console.log("req.file name:", req.file?.originalname);
      console.log("req.file size:", req.file?.size);
      console.log("req.file type:", req.file?.mimetype);

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          success: false,
          message: "GEMINI_API_KEY is missing in .env",
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
        model: "gemini-flash-latest",
        config: {
          responseMimeType: "application/json",
        },
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

      console.log("Gemini full response:", response);
      console.log("Gemini text:", response?.text);

      const rawText = String(response?.text || "").trim();
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
      console.error("Analyze device error full:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to analyze device image.",
        error:
          error?.message ||
          error?.statusText ||
          JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });
    }
  });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});