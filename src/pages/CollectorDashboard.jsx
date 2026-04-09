import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

function getStatusStyle(status) {
  if (status === "delivered_to_recycler") {
    return "bg-green-100 text-green-700";
  }
  if (status === "picked_up") {
    return "bg-blue-100 text-blue-700";
  }
  if (status === "assigned") {
    return "bg-yellow-100 text-yellow-700";
  }
  return "bg-gray-100 text-gray-700";
}

function getNextStatus(status) {
  if (status === "assigned") {
    return "picked_up";
  }
  if (status === "picked_up") {
    return "delivered_to_recycler";
  }
  return null;
}

export default function CollectorDashboard() {
  const { authFetch, user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [expandedRequestId, setExpandedRequestId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updatingRequestId, setUpdatingRequestId] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await authFetch("/collector/dashboard");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load collector dashboard");
      }

      setDashboardData(result.data);
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleStatusUpdate = async (request) => {
    const nextStatus = getNextStatus(request.collectorStatus);

    if (!nextStatus) {
      return;
    }

    try {
      setUpdatingRequestId(request.pickupId);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await authFetch(`/collector/requests/${request.pickupId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update collector status");
      }

      setSuccessMessage(
        `Request moved to ${formatStatus(nextStatus)} successfully.`
      );
      await fetchDashboard();
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong");
    } finally {
      setUpdatingRequestId("");
    }
  };

  const stats = useMemo(() => {
    return (
      dashboardData?.stats || {
        totalAssigned: 0,
        readyForPickup: 0,
        pickedUp: 0,
        delivered: 0,
      }
    );
  }, [dashboardData]);

  const requests = dashboardData?.requests || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-lg rounded-3xl p-6 sm:p-8 mb-8">
          <p className="text-green-600 font-semibold mb-2">
            Logged in as collector
          </p>
          <h2 className="text-2xl font-bold text-gray-800">
            {user?.name || "Collector Partner"}
          </h2>
          <p className="text-gray-500">{user?.email}</p>
          <p className="text-sm text-gray-500 mt-2">
            {user?.organizationName || "Local scrap network"} |{" "}
            {user?.serviceArea || "Service area not configured"}
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-3xl p-6 sm:p-8 mb-8">
          <p className="text-green-600 font-semibold mb-2">
            Local Collection Operations
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
            Collector Dashboard
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Accept assigned pickups, collect devices from users, and hand them
            over to certified recyclers.
          </p>
        </div>

        {errorMessage ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div className="bg-white shadow-lg rounded-3xl p-8 text-center text-gray-600 mb-8">
            Loading collector dashboard...
          </div>
        ) : null}

        {!isLoading ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <div className="bg-yellow-100 rounded-2xl p-5 sm:p-6">
                <p className="text-gray-700 mb-2">Total Assigned</p>
                <h2 className="text-3xl font-bold text-yellow-800">
                  {stats.totalAssigned}
                </h2>
              </div>

              <div className="bg-orange-100 rounded-2xl p-5 sm:p-6">
                <p className="text-gray-700 mb-2">Ready For Pickup</p>
                <h2 className="text-3xl font-bold text-orange-800">
                  {stats.readyForPickup}
                </h2>
              </div>

              <div className="bg-blue-100 rounded-2xl p-5 sm:p-6">
                <p className="text-gray-700 mb-2">Picked Up</p>
                <h2 className="text-3xl font-bold text-blue-800">
                  {stats.pickedUp}
                </h2>
              </div>

              <div className="bg-green-100 rounded-2xl p-5 sm:p-6">
                <p className="text-gray-700 mb-2">Delivered</p>
                <h2 className="text-3xl font-bold text-green-800">
                  {stats.delivered}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
              <div className="xl:col-span-2 bg-white shadow-md rounded-3xl p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Assigned Requests
                  </h2>
                  <button
                    type="button"
                    onClick={fetchDashboard}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium transition w-full sm:w-auto"
                  >
                    Refresh Data
                  </button>
                </div>

                <div className="space-y-4">
                  {requests.length > 0 ? (
                    requests.map((request) => {
                      const nextStatus = getNextStatus(request.collectorStatus);
                      const isExpanded = expandedRequestId === request.pickupId;

                      return (
                        <div
                          key={request.pickupId}
                          className="border rounded-2xl p-4 sm:p-5 bg-gray-50"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="space-y-2">
                              <h3 className="text-lg font-bold text-gray-800">
                                {request.brand} {request.model}
                              </h3>
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">User:</span>{" "}
                                {request.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">Address:</span>{" "}
                                {request.address}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">Pickup Date:</span>{" "}
                                {formatDate(request.pickupDate)}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">Recycler:</span>{" "}
                                {request.recyclerName}
                              </p>
                            </div>

                            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
                              <span
                                className={`px-4 py-2 rounded-full text-sm font-semibold text-center ${getStatusStyle(
                                  request.collectorStatus
                                )}`}
                              >
                                {formatStatus(request.collectorStatus)}
                              </span>

                              <div className="text-left sm:text-right">
                                <p className="text-sm text-gray-500">Offer Value</p>
                                <p className="text-xl font-bold text-green-600">
                                  {formatCurrency(request.finalOffer)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {isExpanded ? (
                            <div className="mt-4 rounded-2xl border bg-white p-4 text-sm text-gray-700 space-y-2">
                              <p>
                                <span className="font-semibold">Contact:</span>{" "}
                                {request.contact}
                              </p>
                              <p>
                                <span className="font-semibold">Device Type:</span>{" "}
                                {request.deviceType}
                              </p>
                              <p>
                                <span className="font-semibold">Drop Center:</span>{" "}
                                {request.dropCenter || "Not configured"}
                              </p>
                              <p>
                                <span className="font-semibold">Submission ID:</span>{" "}
                                {request.submissionId}
                              </p>
                              <p>
                                <span className="font-semibold">Estimate:</span>{" "}
                                {formatCurrency(request.submission?.estimatedValue)}
                              </p>
                              <p>
                                <span className="font-semibold">Condition:</span>{" "}
                                {request.submission?.condition || "Not available"}
                              </p>
                            </div>
                          ) : null}

                          <div className="mt-4 flex flex-col sm:flex-row gap-3">
                            <button
                              type="button"
                              onClick={() => handleStatusUpdate(request)}
                              disabled={!nextStatus || updatingRequestId === request.pickupId}
                              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-4 py-2 rounded-xl font-medium transition"
                            >
                              {updatingRequestId === request.pickupId
                                ? "Updating..."
                                : nextStatus
                                ? `Mark ${formatStatus(nextStatus)}`
                                : "Completed"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setExpandedRequestId((currentRequestId) =>
                                  currentRequestId === request.pickupId
                                    ? ""
                                    : request.pickupId
                                )
                              }
                              className="w-full sm:w-auto border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-medium transition"
                            >
                              {isExpanded ? "Hide Details" : "View Details"}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-2xl border bg-gray-50 p-6 text-gray-600">
                      No requests assigned to this collector yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white shadow-md rounded-3xl p-5 sm:p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Workflow Guide
                  </h2>

                  <div className="space-y-3 text-gray-700 text-sm">
                    <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-100">
                      1. Review the pickup assignment and contact details.
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                      2. Mark the request as picked up after collecting the device.
                    </div>
                    <div className="p-3 rounded-xl bg-green-50 border border-green-100">
                      3. Deliver the item to the linked recycler drop center.
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow-md rounded-3xl p-5 sm:p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Quick Actions
                  </h2>

                  <div className="flex flex-col gap-3">
                    <Link
                      to="/"
                      className="bg-green-600 hover:bg-green-700 text-white text-center px-4 py-3 rounded-xl font-medium transition"
                    >
                      Back to Home
                    </Link>

                    <Link
                      to="/login"
                      className="border border-gray-300 hover:bg-gray-100 text-gray-700 text-center px-4 py-3 rounded-xl font-medium transition"
                    >
                      Switch Account
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
