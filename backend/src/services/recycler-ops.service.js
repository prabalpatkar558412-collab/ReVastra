const { admin, db } = require("../config/firebase");
const { logRecyclerStageUpdated } = require("./activity.service");

const allowedRecyclerTransitions = {
  awaiting_device: ["verified"],
  verified: ["processed"],
  processed: [],
};

function sortByNewest(items) {
  return [...items].sort((firstItem, secondItem) => {
    const firstDate = new Date(
      firstItem.updatedAt || firstItem.createdAt || 0
    ).getTime();
    const secondDate = new Date(
      secondItem.updatedAt || secondItem.createdAt || 0
    ).getTime();

    return secondDate - firstDate;
  });
}

function buildRecyclerStats(requests) {
  return {
    totalDevices: requests.length,
    awaitingDevice: requests.filter(
      (request) => request.recyclerStatus === "awaiting_device"
    ).length,
    verified: requests.filter((request) => request.recyclerStatus === "verified")
      .length,
    processed: requests.filter((request) => request.recyclerStatus === "processed")
      .length,
  };
}

async function getRecyclerDashboardSummary(currentUser) {
  const pickupSnapshot = await db
    .collection("pickupRequests")
    .where("recyclerId", "==", currentUser.managedRecyclerId)
    .get();

  const requests = sortByNewest(
    pickupSnapshot.docs.map((document) => document.data())
  );
  const submissionIds = requests
    .map((request) => request.submissionId)
    .filter(Boolean);
  const submissions = await Promise.all(
    submissionIds.map((submissionId) =>
      db.collection("deviceSubmissions").doc(submissionId).get()
    )
  );
  const submissionsById = submissions.reduce((submissionMap, document) => {
    if (document.exists) {
      submissionMap[document.id] = document.data();
    }
    return submissionMap;
  }, {});

  return {
    stats: buildRecyclerStats(requests),
    requests: requests.map((request) => ({
      ...request,
      submission: submissionsById[request.submissionId] || null,
    })),
  };
}

async function updateRecyclerRequestStatus(pickupId, payload) {
  const normalizedStatus = String(payload.status || "").trim().toLowerCase();
  const pickupRef = db.collection("pickupRequests").doc(pickupId);
  const pickupDoc = await pickupRef.get();

  if (!pickupDoc.exists) {
    const error = new Error("Pickup request not found");
    error.statusCode = 404;
    throw error;
  }

  const pickupRequest = pickupDoc.data();
  const currentStatus = String(
    pickupRequest.recyclerStatus || "awaiting_device"
  ).toLowerCase();
  const allowedTransitions = allowedRecyclerTransitions[currentStatus] || [];

  if (!allowedTransitions.includes(normalizedStatus)) {
    const error = new Error(
      `Invalid recycler transition from ${currentStatus} to ${normalizedStatus}`
    );
    error.statusCode = 400;
    throw error;
  }

  const now = new Date().toISOString();
  const finalVerifiedValue =
    Number(payload.finalVerifiedValue) || pickupRequest.finalVerifiedValue;
  const pickupUpdate = {
    recyclerStatus: normalizedStatus,
    finalVerifiedValue,
    processingMethod:
      payload.processingMethod || pickupRequest.processingMethod || null,
    recyclerNotes: payload.recyclerNotes || pickupRequest.recyclerNotes || "",
    updatedAt: now,
    updatedAtServer: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (normalizedStatus === "processed") {
    pickupUpdate.status = "completed";
    pickupUpdate.paymentStatus = "processed";
  } else {
    pickupUpdate.status = "assigned";
  }

  await pickupRef.update(pickupUpdate);

  if (pickupRequest.submissionId) {
    await db
      .collection("deviceSubmissions")
      .doc(pickupRequest.submissionId)
      .update({
        recyclerStatus: normalizedStatus,
        finalVerifiedValue,
        paymentStatus:
          normalizedStatus === "processed" ? "processed" : "verification_pending",
        status: normalizedStatus === "processed" ? "completed" : "assigned",
        updatedAt: now,
        updatedAtServer: admin.firestore.FieldValue.serverTimestamp(),
      });
  }

  await logRecyclerStageUpdated({
    userId: pickupRequest.userId,
    pickupRequest,
    nextStatus: normalizedStatus,
  });

  const updatedPickupDoc = await pickupRef.get();
  return updatedPickupDoc.data();
}

module.exports = {
  getRecyclerDashboardSummary,
  updateRecyclerRequestStatus,
};
