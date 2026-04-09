const { admin, db } = require("../config/firebase");

function calculateEstimate(submission) {
  const basePrices = {
    Phone: 18000,
    Laptop: 42000,
    Tablet: 16000,
    Headphones: 6000,
  };

  const conditionAdjustment = {
    Excellent: 1,
    Good: 0.82,
    Damaged: 0.55,
    Dead: 0.25,
  };

  const workingAdjustment = {
    Yes: 1,
    Partially: 0.8,
    No: 0.55,
  };

  const basePrice = basePrices[submission.deviceType] || 10000;
  const age = Number(submission.age) || 0;
  const ageFactor = Math.max(0.35, 1 - age * 0.12);
  const conditionFactor = conditionAdjustment[submission.condition] || 0.7;
  const workingFactor = workingAdjustment[submission.working] || 0.75;

  const estimatedValue = Math.max(
    500,
    Math.round(basePrice * ageFactor * conditionFactor * workingFactor)
  );

  let suggestion = "Can be Resold or Recycled";

  if (submission.condition === "Dead" || submission.working === "No") {
    suggestion = "Best for Recycling";
  } else if (submission.condition === "Damaged" || submission.working === "Partially") {
    suggestion = "Repair or Recycle";
  }

  const sustainabilityScore = Math.max(
    30,
    Math.min(
      95,
      Math.round(
        95 - age * 6 - (submission.condition === "Dead" ? 12 : 0) - (submission.working === "No" ? 10 : 0)
      )
    )
  );

  const impact = {
    ewasteSavedKg:
      submission.deviceType === "Laptop"
        ? 2.4
        : submission.deviceType === "Tablet"
        ? 0.8
        : submission.deviceType === "Headphones"
        ? 0.25
        : 0.35,
    co2ReducedG:
      submission.deviceType === "Laptop"
        ? 950
        : submission.deviceType === "Tablet"
        ? 360
        : submission.deviceType === "Headphones"
        ? 110
        : 220,
    goldRecoveredG:
      submission.deviceType === "Laptop"
        ? 0.08
        : submission.deviceType === "Tablet"
        ? 0.04
        : submission.deviceType === "Headphones"
        ? 0.01
        : 0.02,
  };

  return {
    estimatedValue,
    suggestion,
    sustainabilityScore,
    impact,
  };
}

async function generateEstimate(submissionId) {
  const submissionRef = db.collection("deviceSubmissions").doc(submissionId);
  const submissionDoc = await submissionRef.get();

  if (!submissionDoc.exists) {
    const error = new Error("Submission not found");
    error.statusCode = 404;
    throw error;
  }

  const submission = submissionDoc.data();
  const estimate = calculateEstimate(submission);

  const updatedSubmission = {
    ...submission,
    ...estimate,
    status: "estimated",
    updatedAt: new Date().toISOString(),
  };

  await submissionRef.update({
    ...estimate,
    status: "estimated",
    updatedAt: updatedSubmission.updatedAt,
    updatedAtServer: admin.firestore.FieldValue.serverTimestamp(),
  });

  return updatedSubmission;
}

module.exports = {
  generateEstimate,
};
