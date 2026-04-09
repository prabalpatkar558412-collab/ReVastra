const { db } = require("../config/firebase");
const { recyclers } = require("../data/recyclers");
const { getUserById } = require("./auth.service");
const { getRecentActivityForUser } = require("./activity.service");

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

function buildFallbackActivity(submissions, pickups) {
  const submissionActivities = submissions.map((submission) => ({
    activityId: `submission-${submission.submissionId}`,
    createdAt: submission.updatedAt || submission.createdAt,
    title: `${submission.brand} ${submission.model} submission`,
    description: `Status: ${String(submission.status || "").replace(/_/g, " ")}`,
    type: "submission",
  }));

  const pickupActivities = pickups.map((pickup) => ({
    activityId: `pickup-${pickup.pickupId}`,
    createdAt: pickup.updatedAt || pickup.createdAt,
    title: `${pickup.recyclerName} pickup request`,
    description: `Status: ${String(pickup.status || "").replace(/_/g, " ")} for ${pickup.pickupDate}`,
    type: "pickup",
  }));

  return sortByNewest([...submissionActivities, ...pickupActivities]).slice(0, 6);
}

function getDefaultMarketRates() {
  return {
    updatedAt: new Date().toISOString().slice(0, 10),
    goldPerG: 6450,
    copperPerKg: 785,
    lithiumPerKg: 6100,
    plasticGlassPerKg: 42,
  };
}

function buildValueEstimator(latestSubmission) {
  if (!latestSubmission) {
    return {
      estimatedValue: 0,
      componentBreakdown: {
        gold: 0,
        copper: 0,
        lithium: 0,
        plasticGlass: 0,
        recovery: 0,
      },
      marketRates: getDefaultMarketRates(),
      suggestion: "Add a device to generate a transparent valuation.",
    };
  }

  return {
    estimatedValue: latestSubmission.estimatedValue || 0,
    componentBreakdown: latestSubmission.componentBreakdown || {
      gold: 0,
      copper: 0,
      lithium: 0,
      plasticGlass: 0,
      recovery: 0,
    },
    marketRates: latestSubmission.marketRates || getDefaultMarketRates(),
    suggestion: latestSubmission.suggestion || "Estimate not generated yet",
  };
}

function buildNearbyRecyclers(latestPickup) {
  return recyclers.map((recycler) => ({
    ...recycler,
    isSelected: latestPickup?.recyclerId === recycler.id,
    googleMapsQuery: encodeURIComponent(
      `${recycler.dropCenter}, ${recycler.location}`
    ),
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${recycler.dropCenter}, ${recycler.location}`
    )}`,
    googleMapsEmbedUrl: `https://www.google.com/maps?q=${encodeURIComponent(
      `${recycler.dropCenter}, ${recycler.location}`
    )}&output=embed`,
  }));
}

function buildTransactions(pickups) {
  return pickups.map((pickup) => ({
    transactionId: `txn-${pickup.pickupId}`,
    pickupId: pickup.pickupId,
    invoiceNumber: `INV-${pickup.pickupId.slice(0, 8).toUpperCase()}`,
    date: pickup.updatedAt || pickup.createdAt || pickup.pickupDate,
    recyclerName: pickup.recyclerName,
    amountReceived: Number(
      pickup.finalVerifiedValue || pickup.finalOffer || 0
    ),
    paymentMethod: pickup.paymentMethod || "UPI",
    paymentStatus: pickup.paymentStatus || "pending",
    rewardPointsEarned:
      pickup.rewardPointsEarned || Math.max(10, Math.round((pickup.finalOffer || 0) / 20)),
    status: pickup.status || "pending",
  }));
}

function buildPickupStatus(latestPickup) {
  if (!latestPickup) {
    return null;
  }

  const collectorStage = latestPickup.collectorStatus || "assigned";
  const recyclerStage = latestPickup.recyclerStatus || "awaiting_device";
  const isCompleted = latestPickup.status === "completed";

  const stages = [
    {
      key: "requested",
      label: "Requested",
      completed: true,
    },
    {
      key: "accepted",
      label: "Accepted",
      completed: ["assigned", "picked_up", "delivered_to_recycler"].includes(
        collectorStage
      ),
    },
    {
      key: "picked",
      label: "Picked",
      completed: ["picked_up", "delivered_to_recycler"].includes(collectorStage),
    },
    {
      key: "recycled",
      label: "Recycled",
      completed: recyclerStage === "processed",
    },
    {
      key: "completed",
      label: "Completed",
      completed: isCompleted,
    },
  ];

  return {
    requestId: latestPickup.pickupId,
    pickupDate: latestPickup.pickupDate,
    recyclerName: latestPickup.recyclerName,
    stages,
    agent: {
      name: latestPickup.assignedCollectorName || "Local Scrap Network",
      phone: latestPickup.assignedCollectorPhone || "Not shared yet",
      photo:
        latestPickup.assignedCollectorPhoto ||
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80",
    },
  };
}

function buildImpactSummary(user, submissions) {
  const totalCo2ReducedG = submissions.reduce(
    (total, submission) => total + Number(submission.impact?.co2ReducedG || 0),
    0
  );
  const totalTreesSaved = Number((totalCo2ReducedG / 21000).toFixed(2));
  const totalEnergySavedKwh = Number(
    ((user.ewasteSavedKg || 0) * 11.5).toFixed(2)
  );

  return {
    treesSaved: totalTreesSaved,
    energySavedKwh: totalEnergySavedKwh,
    co2ReducedKg: Number((totalCo2ReducedG / 1000).toFixed(2)),
    totalContribution: `${user.devicesRecycled || 0} devices recycled responsibly`,
  };
}

async function getDashboardSummary(requestedUserId, currentUser) {
  if (currentUser.role !== "admin" && currentUser.userId !== requestedUserId) {
    const error = new Error("You are not authorized to access this dashboard");
    error.statusCode = 403;
    throw error;
  }

  const user = await getUserById(requestedUserId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const [submissionSnapshot, pickupSnapshot, recentActivity] = await Promise.all([
    db.collection("deviceSubmissions").where("userId", "==", requestedUserId).get(),
    db.collection("pickupRequests").where("userId", "==", requestedUserId).get(),
    getRecentActivityForUser(requestedUserId),
  ]);

  const submissions = sortByNewest(
    submissionSnapshot.docs.map((document) => document.data())
  );
  const pickups = sortByNewest(
    pickupSnapshot.docs.map((document) => document.data())
  );
  const latestSubmission = submissions[0] || null;
  const latestPickup = pickups[0] || null;

  const stats = {
    devicesRecycled: user.devicesRecycled || 0,
    totalEarnings: user.totalEarnings || 0,
    pickupCount: user.pickupCount || 0,
    ewasteSavedKg: user.ewasteSavedKg || 0,
    submissionsCount: submissions.length,
    rewardPoints: user.rewardPoints || 0,
  };

  return {
    user,
    stats,
    submissions,
    pickups,
    myDevices: submissions,
    valueEstimator: buildValueEstimator(latestSubmission),
    nearbyRecyclers: buildNearbyRecyclers(latestPickup),
    transactions: buildTransactions(pickups),
    pickupStatus: buildPickupStatus(latestPickup),
    impactSummary: buildImpactSummary(user, submissions),
    recentActivity:
      recentActivity.length > 0
        ? recentActivity
        : buildFallbackActivity(submissions, pickups),
  };
}

module.exports = {
  getDashboardSummary,
};
