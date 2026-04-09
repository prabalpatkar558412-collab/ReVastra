const { admin, db } = require("../config/firebase");
const { logCollectorStatusUpdated } = require("./activity.service");

const allowedCollectorTransitions = {
  assigned: ["picked_up"],
  picked_up: ["delivered_to_recycler"],
  delivered_to_recycler: [],
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

function buildCollectorStats(requests) {
  return {
    totalAssigned: requests.length,
    readyForPickup: requests.filter((request) => request.collectorStatus === "assigned")
      .length,
    pickedUp: requests.filter((request) => request.collectorStatus === "picked_up")
      .length,
    delivered: requests.filter(
      (request) => request.collectorStatus === "delivered_to_recycler"
    ).length,
  };
}

async function getCollectorDashboardSummary(currentUser) {
  const pickupSnapshot = await db
    .collection("pickupRequests")
    .where("assignedCollectorEmail", "==", currentUser.email)
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
    stats: buildCollectorStats(requests),
    requests: requests.map((request) => ({
      ...request,
      submission: submissionsById[request.submissionId] || null,
    })),
  };
}

async function updateCollectorRequestStatus(pickupId, nextStatus) {
  const normalizedStatus = String(nextStatus || "").trim().toLowerCase();
  const pickupRef = db.collection("pickupRequests").doc(pickupId);
  const pickupDoc = await pickupRef.get();

  if (!pickupDoc.exists) {
    const error = new Error("Pickup request not found");
    error.statusCode = 404;
    throw error;
  }

  const pickupRequest = pickupDoc.data();
  const currentStatus = String(pickupRequest.collectorStatus || "assigned");
  const allowedTransitions = allowedCollectorTransitions[currentStatus] || [];

  if (!allowedTransitions.includes(normalizedStatus)) {
    const error = new Error(
      `Invalid collector transition from ${currentStatus} to ${normalizedStatus}`
    );
    error.statusCode = 400;
    throw error;
  }

  const now = new Date().toISOString();
  const batch = db.batch();
  const pickupUpdate = {
    collectorStatus: normalizedStatus,
    updatedAt: now,
    updatedAtServer: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (normalizedStatus === "picked_up" && pickupRequest.status === "pending") {
    pickupUpdate.status = "assigned";
  }

  batch.update(pickupRef, pickupUpdate);

  if (pickupRequest.submissionId) {
    const submissionRef = db
      .collection("deviceSubmissions")
      .doc(pickupRequest.submissionId);

    batch.update(submissionRef, {
      collectorStatus: normalizedStatus,
      status:
        normalizedStatus === "picked_up" ? "assigned" : pickupRequest.status || "pickup_requested",
      updatedAt: now,
      updatedAtServer: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();

  await logCollectorStatusUpdated({
    userId: pickupRequest.userId,
    pickupRequest,
    nextStatus: normalizedStatus,
  });

  const updatedPickupDoc = await pickupRef.get();
  return updatedPickupDoc.data();
}

module.exports = {
  getCollectorDashboardSummary,
  updateCollectorRequestStatus,
};
