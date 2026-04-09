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

function getStatusStyle(status) {
  if (status === "processed") {
    return "bg-green-100 text-green-700";
  }
  if (status === "verified") {
    return "bg-blue-100 text-blue-700";
  }
  if (status === "awaiting_device") {
    return "bg-yellow-100 text-yellow-700";
  }
  return "bg-gray-100 text-gray-700";
}

function getNextStatus(status) {
  if (status === "awaiting_device") {
    return "verified";
  }
  if (status === "verified") {
    return "processed";
  }
  return null;
}

export default function RecyclerDashboard() {
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

      const response = await authFetch("/recycler-ops/dashboard");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load recycler dashboard");
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
    const nextStatus = getNextStatus(request.recyclerStatus);

    if (!nextStatus) {
      return;
    }

    try {
      setUpdatingRequestId(request.pickupId);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await authFetch(`/recycler-ops/requests/${request.pickupId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
          finalVerifiedValue: request.finalVerifiedValue || request.finalOffer,
          processingMethod:
            nextStatus === "processed"
              ? request.processingMethod || "material_recovery"
              : request.processingMethod || "inspection",
          recyclerNotes:
            nextStatus === "verified"
              ? "Device verified at recycler facility."
              : "Material recovery completed and payout can be processed.",
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update recycler status");
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
        totalDevices: 0,
        awaitingDevice: 0,
        verified: 0,
        processed: 0,
      }
    );
  }, [dashboardData]);

  const requests = dashboardData?.requests || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-lg rounded-3xl p-6 sm:p-8 mb-8">
          <p className="text-green-600 font-semibold mb-2">
            Logged in as recycler
          </p>
          <h2 className="text-2xl font-bold text-gray-800">
            {user?.organizationName || user?.name || "Recycler Partner"}
          </h2>
          <p className="text-gray-500">{user?.email}</p>
          <p className="text-sm text-gray-500 mt-2">
            Recycler ID: {user?.managedRecyclerId || "Not linked"} |{" "}
            {user?.serviceArea || "Service area not configured"}
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-3xl p-6 sm:p-8 mb-8">
          <p className="text-green-600 font-semibold mb-2">
            Certified Recycler Operations
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
            Recycler Dashboard
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Verify incoming devices, confirm recovery value, and complete the
            recycling or refurbishment workflow.
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
            Loading recycler dashboard...
          </div>
        ) : null}

        {!isLoading ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <div className="bg-yellow-100 rounded-2xl p-5 sm:p-6">
                <p className="text-gray-700 mb-2">Total Devices</p>
                <h2 className="text-3xl font-bold text-yellow-800">
                  {stats.totalDevices}
                </h2>
              </div>

              <div className="bg-orange-100 rounded-2xl p-5 sm:p-6">
                <p className="text-gray-700 mb-2">Awaiting Device</p>
                <h2 className="text-3xl font-bold text-orange-800">
                  {stats.awaitingDevice}
                </h2>
              </div>

              <div className="bg-blue-100 rounded-2xl p-5 sm:p-6">
                <p className="text-gray-700 mb-2">Verified</p>
                <h2 className="text-3xl font-bold text-blue-800">
                  {stats.verified}
                </h2>
              </div>

              <div className="bg-green-100 rounded-2xl p-5 sm:p-6">
                <p className="text-gray-700 mb-2">Processed</p>
                <h2 className="text-3xl font-bold text-green-800">
                  {stats.processed}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
              <div className="xl:col-span-2 bg-white shadow-md rounded-3xl p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Recycler Queue
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
                      const nextStatus = getNextStatus(request.recyclerStatus);
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
                                <span className="font-semibold">Collector:</span>{" "}
                                {request.assignedCollectorName || "Not assigned"}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">Consumer:</span>{" "}
                                {request.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">Processing:</span>{" "}
                                {formatStatus(request.processingMethod || "pending")}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">Payment:</span>{" "}
                                {formatStatus(request.paymentStatus || "pending")}
                              </p>
                            </div>

                            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
                              <span
                                className={`px-4 py-2 rounded-full text-sm font-semibold text-center ${getStatusStyle(
                                  request.recyclerStatus
                                )}`}
                              >
                                {formatStatus(request.recyclerStatus)}
                              </span>

                              <div className="text-left sm:text-right">
                                <p className="text-sm text-gray-500">
                                  Verified Value
                                </p>
                                <p className="text-xl font-bold text-green-600">
                                  {formatCurrency(
                                    request.finalVerifiedValue || request.finalOffer
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>

                          {isExpanded ? (
                            <div className="mt-4 rounded-2xl border bg-white p-4 text-sm text-gray-700 space-y-2">
                              <p>
                                <span className="font-semibold">Submission ID:</span>{" "}
                                {request.submissionId}
                              </p>
                              <p>
                                <span className="font-semibold">Device Type:</span>{" "}
                                {request.deviceType}
                              </p>
                              <p>
                                <span className="font-semibold">Estimated Value:</span>{" "}
                                {formatCurrency(request.submission?.estimatedValue)}
                              </p>
                              <p>
                                <span className="font-semibold">Suggestion:</span>{" "}
                                {request.submission?.suggestion || "Not available"}
                              </p>
                              <p>
                                <span className="font-semibold">Collector Stage:</span>{" "}
                                {formatStatus(request.collectorStatus)}
                              </p>
                              <p>
                                <span className="font-semibold">Notes:</span>{" "}
                                {request.recyclerNotes || "No recycler notes yet"}
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
                      No devices have reached this recycler queue yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white shadow-md rounded-3xl p-5 sm:p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Processing Flow
                  </h2>

                  <div className="space-y-3 text-gray-700 text-sm">
                    <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-100">
                      1. Receive the device from the assigned collector.
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                      2. Verify its real condition and residual value.
                    </div>
                    <div className="p-3 rounded-xl bg-green-50 border border-green-100">
                      3. Process for refurbishment or material recovery.
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
