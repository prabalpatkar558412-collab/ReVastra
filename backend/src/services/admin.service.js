const { admin, db } = require("../config/firebase");

const allowedStatusTransitions = {
  pending: ["assigned"],
  assigned: ["completed"],
  completed: [],
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

function mapStatusToSubmissionStatus(status) {
  if (status === "assigned") {
    return "assigned";
  }

  if (status === "completed") {
    return "completed";
  }

  return "pickup_requested";
}

function buildAdminStats(requests) {
  const totalRequests = requests.length;
  const pendingPickups = requests.filter((request) => request.status === "pending").length;
  const assignedPickups = requests.filter((request) => request.status === "assigned").length;
  const completedPickups = requests.filter((request) => request.status === "completed").length;
  const revenueProcessed = requests.reduce(
    (total, request) => total + Number(request.finalOffer || 0),
    0
  );

  const recyclerCounts = requests.reduce((counts, request) => {
    counts[request.recyclerName] = (counts[request.recyclerName] || 0) + 1;
    return counts;
  }, {});

  const topRecycler =
    Object.entries(recyclerCounts).sort((firstRecycler, secondRecycler) => {
      return secondRecycler[1] - firstRecycler[1];
    })[0]?.[0] || "No recycler data yet";

  return {
    totalRequests,
    pendingPickups,
    assignedPickups,
    completedPickups,
    revenueProcessed,
    topRecycler,
  };
}

async function getAdminRequestsSummary() {
  const [pickupSnapshot, submissionSnapshot, userSnapshot] = await Promise.all([
    db.collection("pickupRequests").get(),
    db.collection("deviceSubmissions").get(),
    db.collection("users").get(),
  ]);

  const submissions = sortByNewest(
    submissionSnapshot.docs.map((document) => document.data())
  );
  const usersById = userSnapshot.docs.reduce((userMap, document) => {
    const user = document.data();
    userMap[user.userId] = {
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    return userMap;
  }, {});

  const submissionsById = submissions.reduce((submissionMap, submission) => {
    submissionMap[submission.submissionId] = submission;
    return submissionMap;
  }, {});

  const requests = sortByNewest(
    pickupSnapshot.docs.map((document) => {
      const request = document.data();
      const user = usersById[request.userId] || null;
      const submission = submissionsById[request.submissionId] || null;

      return {
        ...request,
        user,
        submission,
      };
    })
  );

  return {
    stats: buildAdminStats(requests),
    requests,
    submissions: submissions.slice(0, 10),
  };
}

async function updateAdminRequestStatus(pickupId, nextStatus) {
  const normalizedStatus = String(nextStatus || "").trim().toLowerCase();
  const pickupRef = db.collection("pickupRequests").doc(pickupId);
  const pickupDoc = await pickupRef.get();

  if (!pickupDoc.exists) {
    const error = new Error("Pickup request not found");
    error.statusCode = 404;
    throw error;
  }

  const pickupRequest = pickupDoc.data();
  const currentStatus = String(pickupRequest.status || "pending").toLowerCase();
  const allowedTransitions = allowedStatusTransitions[currentStatus] || [];

  if (!allowedTransitions.includes(normalizedStatus)) {
    const error = new Error(
      `Invalid status transition from ${currentStatus} to ${normalizedStatus}`
    );
    error.statusCode = 400;
    throw error;
  }

  const now = new Date().toISOString();
  const batch = db.batch();

  batch.update(pickupRef, {
    status: normalizedStatus,
    updatedAt: now,
    updatedAtServer: admin.firestore.FieldValue.serverTimestamp(),
  });

  if (pickupRequest.submissionId) {
    const submissionRef = db
      .collection("deviceSubmissions")
      .doc(pickupRequest.submissionId);

    batch.update(submissionRef, {
      status: mapStatusToSubmissionStatus(normalizedStatus),
      updatedAt: now,
      updatedAtServer: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();

  const updatedPickupDoc = await pickupRef.get();
  return updatedPickupDoc.data();
}

module.exports = {
  getAdminRequestsSummary,
  updateAdminRequestStatus,
};
