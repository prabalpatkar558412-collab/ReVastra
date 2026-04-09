const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const deviceTypeMap = {
  Phone: "phone",
  Laptop: "laptop",
  Tablet: "tablet",
  Headphones: "headphones",
};

async function validateDeviceImageWithGemini(file, deviceType) {
  if (!geminiApiKey) {
    const error = new Error(
      "GEMINI_API_KEY is not configured in backend/.env"
    );
    error.statusCode = 500;
    throw error;
  }

  const expectedType = deviceTypeMap[deviceType] || "electronic device";

  const schema = {
    type: "OBJECT",
    properties: {
      isElectronicDevice: { type: "BOOLEAN" },
      matchesSubmittedType: { type: "BOOLEAN" },
      detectedCategory: {
        type: "STRING",
        enum: [
          "phone",
          "laptop",
          "tablet",
          "headphones",
          "other_electronic",
          "non_electronic",
          "unclear",
        ],
      },
      confidence: { type: "NUMBER" },
      reason: { type: "STRING" },
    },
    required: [
      "isElectronicDevice",
      "matchesSubmittedType",
      "detectedCategory",
      "confidence",
      "reason",
    ],
  };

  const prompt = [
    "You are validating an uploaded resale/recycling image.",
    `Expected submitted device type: ${expectedType}.`,
    "Determine whether the image clearly shows a real consumer electronic device.",
    "Reject animals, people, artwork, toys, scenery, screenshots, posters, logos, text-only images, and unrelated objects.",
    "Also decide whether the image matches the submitted device type.",
    "Be strict. If the image is unclear, stylized, AI art, mixed with unrelated subjects, or not clearly the device, reject it.",
    "Return JSON only following the provided schema.",
  ].join(" ");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": geminiApiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: file.mimetype,
                  data: file.buffer.toString("base64"),
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.1,
        },
      }),
      signal: AbortSignal.timeout(20000),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    const error = new Error(
      result.error?.message || "Gemini image validation request failed"
    );
    error.statusCode = response.status;
    throw error;
  }

  const rawText =
    result.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

  let validation;

  try {
    validation = JSON.parse(rawText);
  } catch {
    const error = new Error("Gemini returned an invalid validation response");
    error.statusCode = 502;
    throw error;
  }

  return validation;
}

function assertValidDeviceImage(validation, deviceType) {
  const expectedType = deviceTypeMap[deviceType] || "electronic device";

  if (
    !validation.isElectronicDevice ||
    !validation.matchesSubmittedType ||
    Number(validation.confidence || 0) < 0.65
  ) {
    const error = new Error(
      validation.reason ||
        `Uploaded image is not a valid ${expectedType} image.`
    );
    error.statusCode = 400;
    throw error;
  }
}

module.exports = {
  assertValidDeviceImage,
  validateDeviceImageWithGemini,
};
