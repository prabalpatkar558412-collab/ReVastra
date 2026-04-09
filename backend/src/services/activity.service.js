const { admin, db } = require("../config/firebase");

const activityLogsCollection = db.collection("activityLogs");

function formatStatus(status) {
  return String(status || "").replace(/_/g, " ");
}

async function createActivityLog({
  userId,
  submissionId = null,
  pickupId = null,
  type,
  title,
  description,
  metadata = {},
}) {
  if (!userId || !type || !title) {
    return null;
  }

  const activityRef = activityLogsCollection.doc();
  const now = new Date().toISOString();
  const activityLog = {
    activityId: activityRef.id,
    userId,
    submissionId,
    pickupId,
    type,
    title,
    description: description || "",
    metadata,
    createdAt: now,
    updatedAt: now,
  };

  await activityRef.set({
    ...activityLog,
    createdAtServer: admin.firestore.FieldValue.serverTimestamp(),
    updatedAtServer: admin.firestore.FieldValue.serverTimestamp(),
  });

  return activityLog;
}

async function logSubmissionCreated({ userId, submission }) {
  return createActivityLog({
    userId,
    submissionId: submission.submissionId,
    type: "submission_created",
    title: `${submission.brand} ${submission.model} submitted`,
    description: `Device submission created with status ${formatStatus(
      submission.status
    )}`,
    metadata: {
      deviceType: submission.deviceType,
      status: submission.status,
    },
  });
}

async function logEstimateGenerated({ userId, submission }) {
  return createActivityLog({
    userId,
    submissionId: submission.submissionId,
    type: "estimate_generated",
    title: `Estimate ready for ${submission.brand} ${submission.model}`,
    description: `Estimated value is ${submission.estimatedValue}`,
    metadata: {
      estimatedValue: submission.estimatedValue,
      suggestion: submission.suggestion,
      sustainabilityScore: submission.sustainabilityScore,
    },
  });
}

async function logPickupCreated({ userId, pickupRequest }) {
  return createActivityLog({
    userId,
    submissionId: pickupRequest.submissionId,
    pickupId: pickupRequest.pickupId,
    type: "pickup_created",
    title: `Pickup scheduled with ${pickupRequest.recyclerName}`,
    description: `Pickup request is ${formatStatus(
      pickupRequest.status
    )} for ${pickupRequest.pickupDate}`,
    metadata: {
      recyclerName: pickupRequest.recyclerName,
      finalOffer: pickupRequest.finalOffer,
      status: pickupRequest.status,
    },
  });
}

async function logPickupStatusUpdated({ userId, pickupRequest, nextStatus }) {
  return createActivityLog({
    userId,
    submissionId: pickupRequest.submissionId,
    pickupId: pickupRequest.pickupId,
    type: "pickup_status_updated",
    title: `Pickup moved to ${formatStatus(nextStatus)}`,
    description: `${pickupRequest.recyclerName} request updated to ${formatStatus(
      nextStatus
    )}`,
    metadata: {
      recyclerName: pickupRequest.recyclerName,
      status: nextStatus,
    },
  });
}

async function logCollectorStatusUpdated({
  userId,
  pickupRequest,
  nextStatus,
}) {
  return createActivityLog({
    userId,
    submissionId: pickupRequest.submissionId,
    pickupId: pickupRequest.pickupId,
    type: "collector_status_updated",
    title: `Collector stage: ${formatStatus(nextStatus)}`,
    description: `${pickupRequest.assignedCollectorName} marked the request as ${formatStatus(
      nextStatus
    )}`,
    metadata: {
      collectorName: pickupRequest.assignedCollectorName,
      status: nextStatus,
    },
  });
}

async function logRecyclerStageUpdated({
  userId,
  pickupRequest,
  nextStatus,
}) {
  return createActivityLog({
    userId,
    submissionId: pickupRequest.submissionId,
    pickupId: pickupRequest.pickupId,
    type: "recycler_stage_updated",
    title: `Recycler stage: ${formatStatus(nextStatus)}`,
    description: `${pickupRequest.recyclerName} updated processing to ${formatStatus(
      nextStatus
    )}`,
    metadata: {
      recyclerName: pickupRequest.recyclerName,
      status: nextStatus,
    },
  });
}

async function getRecentActivityForUser(userId, limit = 6) {
  const snapshot = await activityLogsCollection
    .where("userId", "==", userId)
    .get();

  return snapshot.docs
    .map((document) => document.data())
    .sort((firstActivity, secondActivity) => {
      const firstDate = new Date(firstActivity.createdAt || 0).getTime();
      const secondDate = new Date(secondActivity.createdAt || 0).getTime();
      return secondDate - firstDate;
    })
    .slice(0, limit);
}

module.exports = {
  getRecentActivityForUser,
  logCollectorStatusUpdated,
  logEstimateGenerated,
  logPickupCreated,
  logPickupStatusUpdated,
  logRecyclerStageUpdated,
  logSubmissionCreated,
};
