const { admin, db } = require("../config/firebase");
const { logEstimateGenerated } = require("./activity.service");

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

  const marketRates = {
    updatedAt: new Date().toISOString().slice(0, 10),
    goldPerG: 6450,
    copperPerKg: 785,
    lithiumPerKg: 6100,
    plasticGlassPerKg: 42,
  };

  const componentRatioByDevice = {
    Phone: {
      gold: 0.16,
      copper: 0.24,
      lithium: 0.2,
      plasticGlass: 0.18,
      recovery: 0.22,
    },
    Laptop: {
      gold: 0.12,
      copper: 0.3,
      lithium: 0.18,
      plasticGlass: 0.18,
      recovery: 0.22,
    },
    Tablet: {
      gold: 0.14,
      copper: 0.22,
      lithium: 0.22,
      plasticGlass: 0.18,
      recovery: 0.24,
    },
    Headphones: {
      gold: 0.08,
      copper: 0.26,
      lithium: 0.14,
      plasticGlass: 0.28,
      recovery: 0.24,
    },
  };
  const componentRatio =
    componentRatioByDevice[submission.deviceType] ||
    componentRatioByDevice.Phone;
  const componentBreakdown = {
    gold: Math.round(estimatedValue * componentRatio.gold),
    copper: Math.round(estimatedValue * componentRatio.copper),
    lithium: Math.round(estimatedValue * componentRatio.lithium),
    plasticGlass: Math.round(estimatedValue * componentRatio.plasticGlass),
  };
  componentBreakdown.recovery =
    estimatedValue -
    componentBreakdown.gold -
    componentBreakdown.copper -
    componentBreakdown.lithium -
    componentBreakdown.plasticGlass;

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
    componentBreakdown,
    marketRates,
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

  await logEstimateGenerated({
    userId: submission.userId,
    submission: updatedSubmission,
  });

  return updatedSubmission;
}

module.exports = {
  generateEstimate,
};
