const { db } = require("../config/firebase");
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

async function getDashboardSummary(requestedUserId, currentUser) {
  if (
    currentUser.role !== "admin" &&
    currentUser.userId !== requestedUserId
  ) {
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

  const stats = {
    devicesRecycled: user.devicesRecycled || 0,
    totalEarnings: user.totalEarnings || 0,
    pickupCount: user.pickupCount || 0,
    ewasteSavedKg: user.ewasteSavedKg || 0,
    submissionsCount: submissions.length,
  };

  return {
    user,
    stats,
    submissions,
    pickups,
    recentActivity:
      recentActivity.length > 0
        ? recentActivity
        : buildFallbackActivity(submissions, pickups),
  };
}

module.exports = {
  getDashboardSummary,
};
