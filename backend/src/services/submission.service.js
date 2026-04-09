const path = require("node:path");
const { admin, bucket, db } = require("../config/firebase");
const {
  assertValidDeviceImage,
  validateDeviceImageWithGemini,
} = require("./gemini.service");

function sanitizeFileName(fileName) {
  const extension = path.extname(fileName || "");
  const nameWithoutExtension = path
    .basename(fileName || "upload", extension)
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();

  return `${nameWithoutExtension || "upload"}${extension}`;
}

async function uploadSubmissionImage(submissionId, file) {
  if (!file) {
    return {
      imagePath: null,
      imageUrl: null,
    };
  }

  const safeFileName = sanitizeFileName(file.originalname);
  const imagePath = `submissions/${submissionId}/${Date.now()}-${safeFileName}`;
  const storageFile = bucket.file(imagePath);

  await storageFile.save(file.buffer, {
    metadata: {
      contentType: file.mimetype,
    },
  });

  const [imageUrl] = await storageFile.getSignedUrl({
    action: "read",
    expires: "03-01-2500",
  });

  return {
    imagePath,
    imageUrl,
  };
}

async function createSubmission(payload, file) {
  const imageValidation = await validateDeviceImageWithGemini(
    file,
    payload.deviceType
  );

  assertValidDeviceImage(imageValidation, payload.deviceType);

  const submissionRef = db.collection("deviceSubmissions").doc();
  const submissionId = submissionRef.id;
  const now = new Date().toISOString();
  let imagePath = null;
  let imageUrl = null;
  let imageUploadError = null;

  try {
    const uploadResult = await uploadSubmissionImage(submissionId, file);
    imagePath = uploadResult.imagePath;
    imageUrl = uploadResult.imageUrl;
  } catch (error) {
    imageUploadError = error.message;
  }

  const submission = {
    submissionId,
    userId: null,
    deviceType: payload.deviceType,
    brand: payload.brand,
    model: payload.model,
    age: Number(payload.age),
    condition: payload.condition,
    working: payload.working,
    description: payload.description || "",
    imageName: file?.originalname || null,
    imageUrl,
    imagePath,
    imageUploadError,
    imageValidation,
    estimatedValue: null,
    suggestion: null,
    sustainabilityScore: null,
    impact: null,
    selectedRecyclerId: null,
    status: "submitted",
    createdAt: now,
    updatedAt: now,
  };

  await submissionRef.set({
    ...submission,
    createdAtServer: admin.firestore.FieldValue.serverTimestamp(),
    updatedAtServer: admin.firestore.FieldValue.serverTimestamp(),
  });

  return submission;
}

module.exports = {
  createSubmission,
};
