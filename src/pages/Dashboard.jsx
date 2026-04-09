import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function formatStatus(status) {
  return String(status || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatCurrency(value) {
  return `\u20B9${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Not available";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateValue) {
  if (!dateValue) {
    return "Not available";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusStyle(status) {
  if (status === "completed") {
    return "bg-green-100 text-green-800";
  }
  if (status === "assigned") {
    return "bg-blue-100 text-blue-800";
  }
  if (status === "pickup_requested" || status === "pending") {
    return "bg-yellow-100 text-yellow-800";
  }
  if (status === "estimated") {
    return "bg-purple-100 text-purple-800";
  }
  return "bg-gray-100 text-gray-700";
}

function getActivityBadgeStyle(type) {
  if (type === "pickup_created" || type === "pickup_status_updated") {
    return "bg-blue-100 text-blue-700";
  }
  if (type === "estimate_generated") {
    return "bg-purple-100 text-purple-700";
  }
  return "bg-green-100 text-green-700";
}

export default function Dashboard() {
  const location = useLocation();
  const { authFetch, syncUser, user } = useAuth();
  const latestPickup = location.state?.pickupRequest;
  const [dashboardData, setDashboardData] = useState(null);
  const [expandedPickupId, setExpandedPickupId] = useState("");
  const [expandedSubmissionId, setExpandedSubmissionId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboard() {
      if (!user?.userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await authFetch(`/dashboard/${user.userId}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load dashboard");
        }

        if (isMounted) {
          setDashboardData(result.data);
          if (result.data?.user) {
            syncUser(result.data.user);
          }
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Something went wrong");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, [authFetch, syncUser, user?.userId]);

  const stats = dashboardData?.stats || {
    devicesRecycled: user?.devicesRecycled || 0,
    totalEarnings: user?.totalEarnings || 0,
    pickupCount: user?.pickupCount || 0,
    ewasteSavedKg: user?.ewasteSavedKg || 0,
  };
  const submissions = dashboardData?.submissions || [];
  const pickups = dashboardData?.pickups || [];
  const recentActivity = dashboardData?.recentActivity || [];

  const latestSubmission = submissions[0] || null;
  const latestPickupStatus = pickups[0] || null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow mb-8">
          <p className="text-sm text-green-600 font-semibold mb-2">
            Logged in as user
          </p>
          <h2 className="text-2xl font-bold text-gray-800">
            {user?.name || "ReVastra User"}
          </h2>
          <p className="text-gray-500">{user?.email}</p>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Your Dashboard {"\uD83D\uDCCA"}
        </h1>

        {latestPickup ? (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-gray-700">
            Pickup request created for {latestPickup.recyclerName} on{" "}
            {latestPickup.pickupDate}.
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div className="bg-white p-8 rounded-2xl shadow mb-8 text-center text-gray-600">
            Loading dashboard...
          </div>
        ) : null}

        {!isLoading ? (
          <>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-green-100 p-6 rounded-2xl">
                <p>Devices Recycled</p>
                <h2 className="text-2xl font-bold">{stats.devicesRecycled}</h2>
              </div>

              <div className="bg-blue-100 p-6 rounded-2xl">
                <p>Total Earnings</p>
                <h2 className="text-2xl font-bold">
                  {formatCurrency(stats.totalEarnings)}
                </h2>
              </div>

              <div className="bg-yellow-100 p-6 rounded-2xl">
                <p>Pickups</p>
                <h2 className="text-2xl font-bold">{stats.pickupCount}</h2>
              </div>

              <div className="bg-purple-100 p-6 rounded-2xl">
                <p>E-Waste Saved</p>
                <h2 className="text-2xl font-bold">{stats.ewasteSavedKg}kg</h2>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow">
                <p className="text-sm font-semibold text-green-600 mb-2">
                  Latest Pickup
                </p>
                {latestPickupStatus ? (
                  <>
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <h2 className="text-xl font-bold text-gray-800">
                        {latestPickupStatus.recyclerName}
                      </h2>
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusStyle(
                          latestPickupStatus.status
                        )}`}
                      >
                        {formatStatus(latestPickupStatus.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">
                      Pickup scheduled for {formatDate(latestPickupStatus.pickupDate)}
                    </p>
                    <p className="font-semibold text-green-600">
                      Final Offer: {formatCurrency(latestPickupStatus.finalOffer)}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-600">
                    No pickup scheduled yet. Choose a recycler to continue.
                  </p>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl shadow">
                <p className="text-sm font-semibold text-green-600 mb-2">
                  Latest Submission
                </p>
                {latestSubmission ? (
                  <>
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <h2 className="text-xl font-bold text-gray-800">
                        {latestSubmission.brand} {latestSubmission.model}
                      </h2>
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusStyle(
                          latestSubmission.status
                        )}`}
                      >
                        {formatStatus(latestSubmission.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{latestSubmission.deviceType}</p>
                    <p className="font-semibold text-green-600">
                      Estimate: {formatCurrency(latestSubmission.estimatedValue)}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-600">
                    Your latest device submission will appear here.
                  </p>
                )}
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow">
                <h2 className="text-xl font-bold mb-4">
                  Pickup History {"\uD83D\uDE9A"}
                </h2>

                <div className="space-y-4">
                  {pickups.length > 0 ? (
                    pickups.map((pickup) => {
                      const isExpanded = expandedPickupId === pickup.pickupId;

                      return (
                        <div
                          key={pickup.pickupId}
                          className="rounded-xl border bg-gray-50 p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-semibold text-gray-800">
                                {pickup.recyclerName}
                              </p>
                              <p className="text-sm text-gray-500">
                                Pickup Date: {formatDate(pickup.pickupDate)}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusStyle(
                                pickup.status
                              )}`}
                            >
                              {formatStatus(pickup.status)}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-4">
                            <p className="text-sm font-semibold text-green-600">
                              {formatCurrency(pickup.finalOffer)}
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedPickupId((currentPickupId) =>
                                  currentPickupId === pickup.pickupId
                                    ? ""
                                    : pickup.pickupId
                                )
                              }
                              className="text-sm font-semibold text-gray-700 underline"
                            >
                              {isExpanded ? "Hide Details" : "View Details"}
                            </button>
                          </div>

                          {isExpanded ? (
                            <div className="mt-4 rounded-xl border bg-white p-4 text-sm text-gray-700 space-y-2">
                              <p>
                                <span className="font-semibold">Device:</span>{" "}
                                {pickup.brand} {pickup.model}
                              </p>
                              <p>
                                <span className="font-semibold">Contact:</span>{" "}
                                {pickup.contact}
                              </p>
                              <p>
                                <span className="font-semibold">Address:</span>{" "}
                                {pickup.address}
                              </p>
                              <p>
                                <span className="font-semibold">Request ID:</span>{" "}
                                {pickup.pickupId}
                              </p>
                              <p>
                                <span className="font-semibold">Last Updated:</span>{" "}
                                {formatDateTime(pickup.updatedAt)}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-600">
                      No pickup requests yet. Complete the recycler step to
                      schedule your first pickup.
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow">
                <h2 className="text-xl font-bold mb-4">Submission History</h2>

                <div className="space-y-4">
                  {submissions.length > 0 ? (
                    submissions.map((submission) => {
                      const isExpanded =
                        expandedSubmissionId === submission.submissionId;

                      return (
                        <div
                          key={submission.submissionId}
                          className="rounded-xl border bg-gray-50 p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-semibold text-gray-800">
                                {submission.brand} {submission.model}
                              </p>
                              <p className="text-sm text-gray-500">
                                {submission.deviceType}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusStyle(
                                submission.status
                              )}`}
                            >
                              {formatStatus(submission.status)}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-4">
                            <p className="text-sm text-gray-600">
                              Estimate: {formatCurrency(submission.estimatedValue)}
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedSubmissionId((currentSubmissionId) =>
                                  currentSubmissionId === submission.submissionId
                                    ? ""
                                    : submission.submissionId
                                )
                              }
                              className="text-sm font-semibold text-gray-700 underline"
                            >
                              {isExpanded ? "Hide Details" : "View Details"}
                            </button>
                          </div>

                          {isExpanded ? (
                            <div className="mt-4 rounded-xl border bg-white p-4 text-sm text-gray-700 space-y-2">
                              <p>
                                <span className="font-semibold">Condition:</span>{" "}
                                {submission.condition}
                              </p>
                              <p>
                                <span className="font-semibold">Working:</span>{" "}
                                {submission.working}
                              </p>
                              <p>
                                <span className="font-semibold">Age:</span>{" "}
                                {submission.age} year(s)
                              </p>
                              <p>
                                <span className="font-semibold">Suggestion:</span>{" "}
                                {submission.suggestion || "Not generated yet"}
                              </p>
                              <p>
                                <span className="font-semibold">
                                  Sustainability Score:
                                </span>{" "}
                                {submission.sustainabilityScore || 0}%
                              </p>
                              <p>
                                <span className="font-semibold">Submission ID:</span>{" "}
                                {submission.submissionId}
                              </p>
                              <p>
                                <span className="font-semibold">Description:</span>{" "}
                                {submission.description || "No description provided"}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-600">
                      No linked submissions found yet.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow mb-8">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>

              {recentActivity.length > 0 ? (
                <ul className="space-y-3 text-gray-700">
                  {recentActivity.map((activity) => (
                    <li
                      key={activity.activityId || activity.id}
                      className="rounded-xl border bg-gray-50 p-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {activity.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getActivityBadgeStyle(
                              activity.type
                            )}`}
                          >
                            {formatStatus(activity.type || "activity")}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(activity.createdAt)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">
                  Your recent activity will appear here once you start creating
                  submissions and pickups.
                </p>
              )}
            </div>
          </>
        ) : null}

        <div className="flex gap-4">
          <Link
            to="/sell"
            className="bg-green-600 text-white px-6 py-3 rounded-lg"
          >
            Sell More
          </Link>

          <Link to="/" className="border px-6 py-3 rounded-lg">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
