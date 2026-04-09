import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function formatStatus(status) {
  return String(status || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function Dashboard() {
  const location = useLocation();
  const { authFetch, syncUser, user } = useAuth();
  const latestPickup = location.state?.pickupRequest;
  const [dashboardData, setDashboardData] = useState(null);
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
                  {"\u20B9"}
                  {stats.totalEarnings}
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
                <h2 className="text-xl font-bold mb-4">
                  Pickup Tracking {"\uD83D\uDE9A"}
                </h2>

                <div className="space-y-4">
                  {pickups.length > 0 ? (
                    pickups.slice(0, 4).map((pickup) => (
                      <div
                        key={pickup.pickupId}
                        className="rounded-xl border bg-gray-50 p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {pickup.recyclerName}
                            </p>
                            <p className="text-sm text-gray-500">
                              Pickup Date: {pickup.pickupDate}
                            </p>
                          </div>
                          <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
                            {formatStatus(pickup.status)}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-green-600 font-semibold">
                          {"\u20B9"}
                          {pickup.finalOffer}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">
                      No pickup requests yet. Complete the recycler step to
                      schedule your first pickup.
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow">
                <h2 className="text-xl font-bold mb-4">Your Submissions</h2>

                <div className="space-y-4">
                  {submissions.length > 0 ? (
                    submissions.slice(0, 4).map((submission) => (
                      <div
                        key={submission.submissionId}
                        className="rounded-xl border bg-gray-50 p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {submission.brand} {submission.model}
                            </p>
                            <p className="text-sm text-gray-500">
                              {submission.deviceType}
                            </p>
                          </div>
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                            {formatStatus(submission.status)}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-gray-600">
                          Estimate: {"\u20B9"}
                          {submission.estimatedValue || 0}
                        </p>
                      </div>
                    ))
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
                      key={activity.id}
                      className="rounded-xl border bg-gray-50 p-4"
                    >
                      <p className="font-semibold text-gray-800">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.description}
                      </p>
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
