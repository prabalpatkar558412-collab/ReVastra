const { admin, db } = require("../config/firebase");
const { logPickupStatusUpdated } = require("./activity.service");

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

function normalizeSearchValue(value) {
  return String(value || "").trim().toLowerCase();
}

function matchesSearch(request, searchQuery) {
  if (!searchQuery) {
    return true;
  }

  const searchableText = [
    request.pickupId,
    request.submissionId,
    request.recyclerName,
    request.deviceType,
    request.brand,
    request.model,
    request.name,
    request.contact,
    request.user?.name,
    request.user?.email,
    request.submission?.suggestion,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableText.includes(searchQuery);
}

function filterRequests(requests, filters) {
  const searchQuery = normalizeSearchValue(filters.q);
  const statusFilter = normalizeSearchValue(filters.status);
  const recyclerFilter = normalizeSearchValue(filters.recycler);
  const dateFilter = String(filters.date || "").trim();

  return requests.filter((request) => {
    if (statusFilter && request.status !== statusFilter) {
      return false;
    }

    if (
      recyclerFilter &&
      normalizeSearchValue(request.recyclerName) !== recyclerFilter
    ) {
      return false;
    }

    if (dateFilter && String(request.pickupDate || "") !== dateFilter) {
      return false;
    }

    if (!matchesSearch(request, searchQuery)) {
      return false;
    }

    return true;
  });
}

function filterSubmissions(submissions, filters) {
  const searchQuery = normalizeSearchValue(filters.q);
  const statusFilter = normalizeSearchValue(filters.status);
  const recyclerFilter = normalizeSearchValue(filters.recycler);

  return submissions.filter((submission) => {
    if (statusFilter && normalizeSearchValue(submission.status) !== statusFilter) {
      return false;
    }

    if (
      recyclerFilter &&
      normalizeSearchValue(submission.selectedRecyclerId || "") !== recyclerFilter &&
      normalizeSearchValue(submission.selectedRecyclerName || "") !== recyclerFilter
    ) {
      return false;
    }

    if (!searchQuery) {
      return true;
    }

    const searchableText = [
      submission.submissionId,
      submission.deviceType,
      submission.brand,
      submission.model,
      submission.suggestion,
      submission.status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(searchQuery);
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

async function getAdminRequestsSummary(filters = {}) {
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
  const availableRecyclers = Array.from(
    new Set(
      requests.map((request) => request.recyclerName).filter(Boolean)
    )
  ).sort((firstRecycler, secondRecycler) =>
    firstRecycler.localeCompare(secondRecycler)
  );
  const filteredRequests = filterRequests(requests, filters);
  const filteredSubmissions = filterSubmissions(submissions, {
    ...filters,
    recycler:
      requests.find(
        (request) =>
          normalizeSearchValue(request.recyclerName) ===
          normalizeSearchValue(filters.recycler)
      )?.recyclerId || filters.recycler,
  });

  return {
    stats: buildAdminStats(filteredRequests),
    requests: filteredRequests,
    submissions: filteredSubmissions,
    availableRecyclers,
    filters: {
      q: filters.q || "",
      status: filters.status || "",
      recycler: filters.recycler || "",
      date: filters.date || "",
    },
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

  await logPickupStatusUpdated({
    userId: pickupRequest.userId,
    pickupRequest,
    nextStatus: normalizedStatus,
  });

  const updatedPickupDoc = await pickupRef.get();
  return updatedPickupDoc.data();
}

module.exports = {
  getAdminRequestsSummary,
  updateAdminRequestStatus,
};
