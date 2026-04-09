import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function formatCurrency(value) {
  return `\u20B9${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatStatus(status) {
  return String(status || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getStatusStyle(status) {
  if (status === "pending") {
    return "bg-yellow-100 text-yellow-700";
  }
  if (status === "assigned") {
    return "bg-blue-100 text-blue-700";
  }
  if (status === "completed") {
    return "bg-green-100 text-green-700";
  }
  return "bg-gray-100 text-gray-700";
}

function getNextStatus(status) {
  if (status === "pending") {
    return "assigned";
  }
  if (status === "assigned") {
    return "completed";
  }
  return null;
}

function buildAdminQuery(filters) {
  const searchParams = new URLSearchParams();

  if (filters.q.trim()) {
    searchParams.set("q", filters.q.trim());
  }
  if (filters.status) {
    searchParams.set("status", filters.status);
  }
  if (filters.recycler) {
    searchParams.set("recycler", filters.recycler);
  }
  if (filters.date) {
    searchParams.set("date", filters.date);
  }

  const queryString = searchParams.toString();
  return queryString ? `/admin/requests?${queryString}` : "/admin/requests";
}

export default function AdminDashboard() {
  const { authFetch, user } = useAuth();
  const [adminData, setAdminData] = useState(null);
  const [expandedRequestId, setExpandedRequestId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updatingRequestId, setUpdatingRequestId] = useState("");
  const [filters, setFilters] = useState({
    q: "",
    status: "",
    recycler: "",
    date: "",
  });

  const fetchAdminData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await authFetch(buildAdminQuery(filters));
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load admin requests");
      }

      setAdminData(result.data);
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [authFetch, filters]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleFilterChange = (event) => {
    setFilters((previousFilters) => ({
      ...previousFilters,
      [event.target.name]: event.target.value,
    }));
    setExpandedRequestId(null);
  };

  const handleClearFilters = () => {
    setFilters({
      q: "",
      status: "",
      recycler: "",
      date: "",
    });
    setExpandedRequestId(null);
  };

  const handleStatusUpdate = async (request) => {
    const nextStatus = getNextStatus(request.status);

    if (!nextStatus) {
      return;
    }

    try {
      setUpdatingRequestId(request.pickupId);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await authFetch(`/admin/requests/${request.pickupId}/status`, {
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
        throw new Error(result.message || "Failed to update request status");
      }

      setSuccessMessage(
        `Request moved to ${formatStatus(nextStatus)} successfully.`
      );
      await fetchAdminData();
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong");
    } finally {
      setUpdatingRequestId("");
    }
  };

  const stats = useMemo(() => {
    return (
      adminData?.stats || {
        totalRequests: 0,
        pendingPickups: 0,
        assignedPickups: 0,
        completedPickups: 0,
        revenueProcessed: 0,
        topRecycler: "No recycler data yet",
      }
    );
  }, [adminData]);

  const requests = adminData?.requests || [];
  const submissions = adminData?.submissions || [];
  const availableRecyclers = adminData?.availableRecyclers || [];
  const hasActiveFilters = Boolean(
    filters.q || filters.status || filters.recycler || filters.date
  );

  const statCards = [
    {
      title: "Total Requests",
      value: stats.totalRequests,
      bg: "bg-green-100",
      text: "text-green-700",
    },
    {
      title: "Pending Pickups",
      value: stats.pendingPickups,
      bg: "bg-yellow-100",
      text: "text-yellow-700",
    },
    {
      title: "Completed Pickups",
      value: stats.completedPickups,
      bg: "bg-blue-100",
      text: "text-blue-700",
    },
    {
      title: "Revenue Processed",
      value: formatCurrency(stats.revenueProcessed),
      bg: "bg-purple-100",
      text: "text-purple-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-lg rounded-3xl p-6 sm:p-8 mb-8">
          <p className="text-green-600 font-semibold mb-2">
            Logged in as admin
          </p>
          <h2 className="text-2xl font-bold text-gray-800">
            {user?.name || "Admin"}
          </h2>
          <p className="text-gray-500">{user?.email}</p>
        </div>

        <div className="bg-white shadow-lg rounded-3xl p-6 sm:p-8 mb-8">
          <p className="text-green-600 font-semibold mb-2">
            Recycler Operations Panel
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Monitor incoming requests, manage pickup workflows, and track
            recycler operations from one place.
          </p>
        </div>

        <div className="bg-white shadow-md rounded-3xl p-5 sm:p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              Filters and Search
            </h2>
            <button
              type="button"
              onClick={handleClearFilters}
              className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-medium transition w-full sm:w-auto"
            >
              Clear Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <input
              type="text"
              name="q"
              value={filters.q}
              onChange={handleFilterChange}
              placeholder="Search user, device, recycler..."
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            />

            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="completed">Completed</option>
            </select>

            <select
              name="recycler"
              value={filters.recycler}
              onChange={handleFilterChange}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Recyclers</option>
              {availableRecyclers.map((recyclerName) => (
                <option key={recyclerName} value={recyclerName}>
                  {recyclerName}
                </option>
              ))}
            </select>

            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="mt-4 text-sm text-gray-500">
            {hasActiveFilters
              ? `Showing ${requests.length} filtered request(s).`
              : "Showing all requests."}
          </div>
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
            Loading admin dashboard...
          </div>
        ) : null}

        {!isLoading ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {statCards.map((stat) => (
                <div
                  key={stat.title}
                  className={`${stat.bg} rounded-2xl p-5 sm:p-6 shadow-sm`}
                >
                  <p className="text-sm sm:text-base text-gray-700 mb-2">
                    {stat.title}
                  </p>
                  <h2 className={`text-2xl sm:text-3xl font-bold ${stat.text}`}>
                    {stat.value}
                  </h2>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
              <div className="xl:col-span-2 bg-white shadow-md rounded-3xl p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Pickup Requests
                  </h2>
                  <button
                    type="button"
                    onClick={fetchAdminData}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium transition w-full sm:w-auto"
                  >
                    Refresh Data
                  </button>
                </div>

                <div className="space-y-4">
                  {requests.length > 0 ? (
                    requests.map((request) => {
                      const nextStatus = getNextStatus(request.status);
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
                                {request.user?.name || request.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">Type:</span>{" "}
                                {request.deviceType}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">Pickup Date:</span>{" "}
                                {request.pickupDate}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">Recycler:</span>{" "}
                                {request.recyclerName}
                              </p>
                            </div>

                            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
                              <span
                                className={`px-4 py-2 rounded-full text-sm font-semibold text-center ${getStatusStyle(
                                  request.status
                                )}`}
                              >
                                {formatStatus(request.status)}
                              </span>

                              <div className="text-left sm:text-right">
                                <p className="text-sm text-gray-500">Final Offer</p>
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
                                <span className="font-semibold">Address:</span>{" "}
                                {request.address}
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
                                <span className="font-semibold">Suggestion:</span>{" "}
                                {request.submission?.suggestion || "Not available"}
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
                                    ? null
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
                      No pickup requests match the current filters.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white shadow-md rounded-3xl p-5 sm:p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Workflow Status
                  </h2>

                  <div className="space-y-3 text-gray-700">
                    <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-100">
                      {"\uD83D\uDCE6"} {stats.pendingPickups} pickup requests waiting
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                      {"\uD83D\uDE9A"} {stats.assignedPickups} devices assigned for
                      pickup
                    </div>
                    <div className="p-3 rounded-xl bg-green-50 border border-green-100">
                      {"\u2705"} {stats.completedPickups} devices processed
                      successfully
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow-md rounded-3xl p-5 sm:p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Recycler Insights
                  </h2>

                  <div className="space-y-4 text-gray-700">
                    <div className="p-4 rounded-2xl bg-gray-50 border">
                      <p className="text-sm text-gray-500">Top Recycler</p>
                      <p className="font-semibold text-gray-800">
                        {stats.topRecycler}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 border">
                      <p className="text-sm text-gray-500">Avg. Offer Value</p>
                      <p className="font-semibold text-gray-800">
                        {requests.length > 0
                          ? formatCurrency(
                              Math.round(stats.revenueProcessed / requests.length)
                            )
                          : formatCurrency(0)}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 border">
                      <p className="text-sm text-gray-500">Completion Rate</p>
                      <p className="font-semibold text-gray-800">
                        {requests.length > 0
                          ? `${Math.round(
                              (stats.completedPickups / requests.length) * 100
                            )}%`
                          : "0%"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow-md rounded-3xl p-5 sm:p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Latest Submissions
                  </h2>

                  <div className="space-y-3">
                    {submissions.length > 0 ? (
                      submissions.slice(0, 5).map((submission) => (
                        <div
                          key={submission.submissionId}
                          className="rounded-2xl border bg-gray-50 p-4"
                        >
                          <p className="font-semibold text-gray-800">
                            {submission.brand} {submission.model}
                          </p>
                          <p className="text-sm text-gray-500">
                            {submission.deviceType}
                          </p>
                          <p className="text-sm text-gray-600 mt-2">
                            {formatStatus(submission.status)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600">
                        No user submissions match the current filters.
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white shadow-md rounded-3xl p-5 sm:p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Quick Actions
                  </h2>

                  <div className="flex flex-col gap-3">
                    <Link
                      to="/dashboard"
                      className="bg-green-600 hover:bg-green-700 text-white text-center px-4 py-3 rounded-xl font-medium transition"
                    >
                      User Dashboard
                    </Link>

                    <Link
                      to="/sell"
                      className="border border-gray-300 hover:bg-gray-100 text-gray-700 text-center px-4 py-3 rounded-xl font-medium transition"
                    >
                      Add New Device
                    </Link>

                    <Link
                      to="/"
                      className="border border-gray-300 hover:bg-gray-100 text-gray-700 text-center px-4 py-3 rounded-xl font-medium transition"
                    >
                      Back to Home
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
