import { useEffect, useMemo, useState } from "react";
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

function formatDate(dateValue, withTime = false) {
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
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
}

function getStatusStyle(status) {
  if (status === "completed" || status === "processed") {
    return "bg-green-100 text-green-800";
  }
  if (status === "assigned" || status === "verified") {
    return "bg-blue-100 text-blue-800";
  }
  if (["pickup_requested", "pending", "awaiting_device"].includes(status)) {
    return "bg-yellow-100 text-yellow-800";
  }
  if (status === "estimated") {
    return "bg-purple-100 text-purple-800";
  }
  return "bg-gray-100 text-gray-700";
}

function buildInitialProfile(user) {
  return {
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    preferredPaymentMethod: user?.preferredPaymentMethod || "UPI",
    upiId: user?.upiId || "",
    bankAccount: user?.bankAccount || "",
    notificationPreferences: {
      sms: user?.notificationPreferences?.sms ?? true,
      email: user?.notificationPreferences?.email ?? true,
      app: user?.notificationPreferences?.app ?? true,
    },
  };
}

function downloadInvoice(transaction, profile) {
  const content = [
    "ReVastra Recycling Receipt",
    `Invoice: ${transaction.invoiceNumber}`,
    `Date: ${formatDate(transaction.date, true)}`,
    `Recycler: ${transaction.recyclerName}`,
    `Amount: ${formatCurrency(transaction.amountReceived)}`,
    `Payment: ${transaction.paymentMethod}`,
    `Reward Points: ${transaction.rewardPointsEarned}`,
    `Consumer: ${profile.name || "ReVastra User"}`,
    `Phone: ${profile.phone || "Not updated"}`,
    `Address: ${profile.address || "Not updated"}`,
  ].join("\n");

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${transaction.invoiceNumber}.txt`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const location = useLocation();
  const { authFetch, syncUser, user } = useAuth();
  const latestPickupNotice = location.state?.pickupRequest;
  const [dashboardData, setDashboardData] = useState(null);
  const [profileForm, setProfileForm] = useState(buildInitialProfile(user));
  const [selectedRecyclerId, setSelectedRecyclerId] = useState("");
  const [expandedPickupId, setExpandedPickupId] = useState("");
  const [expandedSubmissionId, setExpandedSubmissionId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
            setProfileForm(buildInitialProfile(result.data.user));
          }
          const selected =
            result.data?.nearbyRecyclers?.find((item) => item.isSelected) ||
            result.data?.nearbyRecyclers?.[0];
          setSelectedRecyclerId(selected?.id || "");
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

  const stats = dashboardData?.stats || {};
  const submissions = dashboardData?.submissions || [];
  const pickups = dashboardData?.pickups || [];
  const myDevices = dashboardData?.myDevices || submissions;
  const transactions = dashboardData?.transactions || [];
  const recentActivity = dashboardData?.recentActivity || [];
  const nearbyRecyclers = dashboardData?.nearbyRecyclers;
  const valueEstimator = dashboardData?.valueEstimator || {};
  const pickupStatus = dashboardData?.pickupStatus || null;
  const impactSummary = dashboardData?.impactSummary || {};
  const selectedRecycler = useMemo(
    () => {
      const recyclerList = dashboardData?.nearbyRecyclers || [];
      return (
        recyclerList.find((item) => item.id === selectedRecyclerId) ||
        recyclerList[0] ||
        null
      );
    },
    [dashboardData?.nearbyRecyclers, selectedRecyclerId]
  );

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
  };

  const handleNotificationChange = (event) => {
    const { name, checked } = event.target;
    setProfileForm((current) => ({
      ...current,
      notificationPreferences: {
        ...current.notificationPreferences,
        [name]: checked,
      },
    }));
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    try {
      setIsSavingProfile(true);
      setErrorMessage("");
      setSuccessMessage("");
      const response = await authFetch("/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save profile");
      }

      syncUser(result.data);
      setProfileForm(buildInitialProfile(result.data));
      setSuccessMessage("Profile settings saved successfully.");
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong");
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow mb-8">
          <p className="text-sm text-green-600 font-semibold mb-2">
            Logged in as consumer
          </p>
          <h2 className="text-2xl font-bold text-gray-800">
            {user?.name || "ReVastra User"}
          </h2>
          <p className="text-gray-500">{user?.email}</p>
          <p className="text-sm text-gray-500 mt-2">
            {user?.address ||
              "Update your address and payment details below for smooth pickups."}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Consumer Dashboard
            </h1>
            <p className="text-gray-500">
              Add devices, track pickups, review value, and manage your profile.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/sell"
              className="bg-green-600 text-white px-5 py-3 rounded-xl font-semibold text-center"
            >
              Add New Device
            </Link>
            <Link
              to="/sell"
              state={{ entryMode: "camera" }}
              className="border border-gray-300 px-5 py-3 rounded-xl font-semibold text-center hover:bg-gray-100"
            >
              Scan Device
            </Link>
            <Link
              to="/sell"
              state={{ entryMode: "manual" }}
              className="border border-gray-300 px-5 py-3 rounded-xl font-semibold text-center hover:bg-gray-100"
            >
              Manual Entry
            </Link>
          </div>
        </div>

        {latestPickupNotice ? (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-gray-700">
            Pickup request created for {latestPickupNotice.recyclerName} on{" "}
            {latestPickupNotice.pickupDate}.
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            {successMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div className="bg-white p-8 rounded-2xl shadow mb-8 text-center text-gray-600">
            Loading dashboard...
          </div>
        ) : null}

        {!isLoading ? (
          <>
            <div className="grid md:grid-cols-5 gap-6 mb-8">
              <div className="bg-green-100 p-6 rounded-2xl">
                <p>Devices Recycled</p>
                <h2 className="text-2xl font-bold">{stats.devicesRecycled || 0}</h2>
              </div>
              <div className="bg-blue-100 p-6 rounded-2xl">
                <p>Total Earnings</p>
                <h2 className="text-2xl font-bold">
                  {formatCurrency(stats.totalEarnings)}
                </h2>
              </div>
              <div className="bg-yellow-100 p-6 rounded-2xl">
                <p>Pickups</p>
                <h2 className="text-2xl font-bold">{stats.pickupCount || 0}</h2>
              </div>
              <div className="bg-purple-100 p-6 rounded-2xl">
                <p>E-Waste Saved</p>
                <h2 className="text-2xl font-bold">{stats.ewasteSavedKg || 0}kg</h2>
              </div>
              <div className="bg-orange-100 p-6 rounded-2xl">
                <p>Reward Points</p>
                <h2 className="text-2xl font-bold">{stats.rewardPoints || 0}</h2>
              </div>
            </div>

            <div className="grid xl:grid-cols-[1.15fr_0.85fr] gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-green-600 mb-2">
                      Recycler Near Me
                    </p>
                    <h2 className="text-xl font-bold text-gray-800">
                      Certified Nearby Recyclers
                    </h2>
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                    Map + list view
                  </span>
                </div>

                {selectedRecycler ? (
                  <div className="mb-5 overflow-hidden rounded-2xl border">
                    <iframe
                      title={`${selectedRecycler.name} map`}
                      src={selectedRecycler.googleMapsEmbedUrl}
                      className="h-72 w-full"
                      loading="lazy"
                    />
                  </div>
                ) : null}

                <div className="grid md:grid-cols-2 gap-4">
                  {(nearbyRecyclers || []).map((recycler) => (
                    <div
                      key={recycler.id}
                      className={`rounded-2xl border p-4 ${
                        recycler.id === selectedRecyclerId
                          ? "border-green-500 bg-green-50"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {recycler.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {recycler.location} | {recycler.distance}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-800">
                            {recycler.rating} / 5
                          </p>
                          {recycler.certified ? (
                            <span className="text-xs font-semibold text-green-700">
                              Certified
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-1">
                        Pickup available: {recycler.pickup ? "Yes" : "No"}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        Drop center: {recycler.dropCenter}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedRecyclerId(recycler.id)}
                          className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-white"
                        >
                          View Map
                        </button>
                        <a
                          href={recycler.googleMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-white"
                        >
                          Open Maps
                        </a>
                        <a
                          href={`tel:${recycler.contactPhone}`}
                          className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-white"
                        >
                          Contact
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow">
                <p className="text-sm font-semibold text-green-600 mb-2">
                  Pickup Status
                </p>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Live Progress Tracker
                </h2>

                {pickupStatus ? (
                  <>
                    <div className="space-y-3 mb-5">
                      {pickupStatus.stages?.map((stage) => (
                        <div
                          key={stage.key}
                          className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                            stage.completed
                              ? "border-green-200 bg-green-50 text-green-700"
                              : "border-gray-200 bg-gray-50 text-gray-500"
                          }`}
                        >
                          {stage.label}
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl border bg-gray-50 p-4">
                      <p className="font-semibold text-gray-800 mb-3">
                        Assigned Pickup Agent
                      </p>
                      <div className="flex items-center gap-4 mb-3">
                        <img
                          src={pickupStatus.agent?.photo}
                          alt={pickupStatus.agent?.name}
                          className="h-16 w-16 rounded-full object-cover border"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">
                            {pickupStatus.agent?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {pickupStatus.agent?.phone}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        Recycler: {pickupStatus.recyclerName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Pickup date: {formatDate(pickupStatus.pickupDate)}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600">
                    Your pickup tracker will appear here once you book a pickup.
                  </p>
                )}
              </div>
            </div>

            <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-green-600 mb-2">
                      My Transactions
                    </p>
                    <h2 className="text-xl font-bold text-gray-800">
                      Payment and Reward History
                    </h2>
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                    {transactions.length} entries
                  </span>
                </div>

                <div className="space-y-4">
                  {transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <div
                        key={transaction.transactionId}
                        className="rounded-xl border bg-gray-50 p-4"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {transaction.recyclerName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(transaction.date)} | {transaction.invoiceNumber}
                            </p>
                          </div>
                          <div className="text-left md:text-right">
                            <p className="text-lg font-bold text-green-600">
                              {formatCurrency(transaction.amountReceived)}
                            </p>
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                                transaction.paymentStatus
                              )}`}
                            >
                              {formatStatus(transaction.paymentStatus)}
                            </span>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-3 mt-4 text-sm">
                          <div className="rounded-xl border bg-white p-3">
                            <p className="text-gray-500">Payment Method</p>
                            <p className="font-semibold text-gray-800">
                              {transaction.paymentMethod}
                            </p>
                          </div>
                          <div className="rounded-xl border bg-white p-3">
                            <p className="text-gray-500">Reward Points</p>
                            <p className="font-semibold text-gray-800">
                              {transaction.rewardPointsEarned}
                            </p>
                          </div>
                          <div className="rounded-xl border bg-white p-3">
                            <p className="text-gray-500">Pickup Status</p>
                            <p className="font-semibold text-gray-800">
                              {formatStatus(transaction.status)}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => downloadInvoice(transaction, profileForm)}
                          className="mt-4 rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-white"
                        >
                          Download Invoice / Receipt
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">
                      No transactions yet. Once pickups are processed, payments and
                      reward points will appear here.
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow">
                <p className="text-sm font-semibold text-green-600 mb-2">
                  Environmental Impact
                </p>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Your Sustainability Contribution
                </h2>

                <div className="space-y-4">
                  <div className="rounded-xl border bg-green-50 p-4">
                    <p className="text-sm text-gray-500">Trees Saved Equivalent</p>
                    <p className="text-2xl font-bold text-green-700">
                      {impactSummary.treesSaved || 0}
                    </p>
                  </div>
                  <div className="rounded-xl border bg-blue-50 p-4">
                    <p className="text-sm text-gray-500">Energy Saved</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {impactSummary.energySavedKwh || 0} kWh
                    </p>
                  </div>
                  <div className="rounded-xl border bg-yellow-50 p-4">
                    <p className="text-sm text-gray-500">CO2 Reduced</p>
                    <p className="text-2xl font-bold text-yellow-700">
                      {impactSummary.co2ReducedKg || 0} kg
                    </p>
                  </div>
                  <div className="rounded-xl border bg-purple-50 p-4">
                    <p className="text-sm text-gray-500">Total Contribution</p>
                    <p className="font-semibold text-purple-700">
                      {impactSummary.totalContribution ||
                        "Start by adding your first device."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-green-600 mb-2">
                      My Devices
                    </p>
                    <h2 className="text-xl font-bold text-gray-800">Added Devices</h2>
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                    {myDevices.length} total
                  </span>
                </div>

                <div className="space-y-4">
                  {myDevices.length > 0 ? (
                    myDevices.slice(0, 4).map((device) => (
                      <div
                        key={device.submissionId}
                        className="rounded-xl border bg-gray-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {device.brand} {device.model}
                            </p>
                            <p className="text-sm text-gray-500">
                              {device.deviceType} • Added {formatDate(device.createdAt)}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                              device.status
                            )}`}
                          >
                            {formatStatus(device.status)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">
                      No devices added yet. Use the Add New Device button to start.
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow">
                <p className="text-sm font-semibold text-green-600 mb-2">
                  Value Estimator
                </p>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Residual Material Value
                </h2>

                <div className="p-5 rounded-2xl bg-green-50 border border-green-200 mb-4">
                  <p className="text-sm text-gray-600 mb-2">Latest Estimate</p>
                  <h3 className="text-4xl font-bold text-green-600">
                    {formatCurrency(valueEstimator.estimatedValue)}
                  </h3>
                  <p className="mt-2 text-gray-700">
                    {valueEstimator.suggestion || "No estimate generated yet"}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                  <div className="rounded-xl border bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Gold</p>
                    <p className="font-semibold text-gray-800">
                      {formatCurrency(valueEstimator.componentBreakdown?.gold)}
                    </p>
                  </div>
                  <div className="rounded-xl border bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Copper</p>
                    <p className="font-semibold text-gray-800">
                      {formatCurrency(valueEstimator.componentBreakdown?.copper)}
                    </p>
                  </div>
                  <div className="rounded-xl border bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Lithium</p>
                    <p className="font-semibold text-gray-800">
                      {formatCurrency(valueEstimator.componentBreakdown?.lithium)}
                    </p>
                  </div>
                  <div className="rounded-xl border bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Plastic / Glass</p>
                    <p className="font-semibold text-gray-800">
                      {formatCurrency(
                        valueEstimator.componentBreakdown?.plasticGlass
                      )}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border bg-blue-50 p-4 text-sm text-gray-700">
                  <p className="font-semibold mb-2">
                    Market snapshot updated on{" "}
                    {valueEstimator.marketRates?.updatedAt || "today"}
                  </p>
                  <p>
                    Gold: {formatCurrency(valueEstimator.marketRates?.goldPerG)} / g
                  </p>
                  <p>
                    Copper: {formatCurrency(valueEstimator.marketRates?.copperPerKg)} / kg
                  </p>
                  <p>
                    Lithium: {formatCurrency(valueEstimator.marketRates?.lithiumPerKg)} / kg
                  </p>
                  <p>
                    Plastic/Glass:{" "}
                    {formatCurrency(valueEstimator.marketRates?.plasticGlassPerKg)} / kg
                  </p>
                </div>
              </div>
            </div>

            <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow">
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-xl font-bold mb-4 text-gray-800">
                      Pickup History
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
                                    setExpandedPickupId((currentId) =>
                                      currentId === pickup.pickupId ? "" : pickup.pickupId
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
                                    <span className="font-semibold">Collector:</span>{" "}
                                    {pickup.assignedCollectorName || "Not assigned"}
                                  </p>
                                  <p>
                                    <span className="font-semibold">Collector Stage:</span>{" "}
                                    {formatStatus(pickup.collectorStatus)}
                                  </p>
                                  <p>
                                    <span className="font-semibold">Recycler Stage:</span>{" "}
                                    {formatStatus(pickup.recyclerStatus)}
                                  </p>
                                  <p>
                                    <span className="font-semibold">Payment:</span>{" "}
                                    {formatStatus(pickup.paymentStatus)}
                                  </p>
                                  <p>
                                    <span className="font-semibold">Last Updated:</span>{" "}
                                    {formatDate(pickup.updatedAt, true)}
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

                  <div>
                    <h2 className="text-xl font-bold mb-4 text-gray-800">
                      Submission History
                    </h2>
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
                                    setExpandedSubmissionId((currentId) =>
                                      currentId === submission.submissionId
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
                                    <span className="font-semibold">Collector Stage:</span>{" "}
                                    {formatStatus(submission.collectorStatus)}
                                  </p>
                                  <p>
                                    <span className="font-semibold">Recycler Stage:</span>{" "}
                                    {formatStatus(submission.recyclerStatus)}
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
              </div>

              <div className="bg-white p-6 rounded-2xl shadow">
                <p className="text-sm font-semibold text-green-600 mb-2">
                  Profile Settings
                </p>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Personal, Payment, and Notifications
                </h2>

                <form onSubmit={handleProfileSave} className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    placeholder="Full name"
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="text"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    placeholder="Phone number"
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <textarea
                    name="address"
                    value={profileForm.address}
                    onChange={handleProfileChange}
                    rows="3"
                    placeholder="Pickup address"
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <select
                    name="preferredPaymentMethod"
                    value={profileForm.preferredPaymentMethod}
                    onChange={handleProfileChange}
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Wallet">Wallet</option>
                    <option value="Cash">Cash</option>
                  </select>
                  <input
                    type="text"
                    name="upiId"
                    value={profileForm.upiId}
                    onChange={handleProfileChange}
                    placeholder="UPI ID"
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="text"
                    name="bankAccount"
                    value={profileForm.bankAccount}
                    onChange={handleProfileChange}
                    placeholder="Bank account reference"
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                  />

                  <div className="rounded-xl border bg-gray-50 p-4">
                    <p className="font-semibold text-gray-800 mb-3">
                      Notification Preferences
                    </p>
                    <div className="space-y-3 text-sm text-gray-700">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          name="sms"
                          checked={profileForm.notificationPreferences.sms}
                          onChange={handleNotificationChange}
                        />
                        SMS updates
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          name="email"
                          checked={profileForm.notificationPreferences.email}
                          onChange={handleNotificationChange}
                        />
                        Email updates
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          name="app"
                          checked={profileForm.notificationPreferences.app}
                          onChange={handleNotificationChange}
                        />
                        In-app updates
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition disabled:opacity-70"
                  >
                    {isSavingProfile ? "Saving..." : "Save Profile Settings"}
                  </button>
                </form>
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
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                              activity.type
                            )}`}
                          >
                            {formatStatus(activity.type || "activity")}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(activity.createdAt, true)}
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

            <div className="flex flex-wrap gap-4">
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
          </>
        ) : null}
      </div>
    </div>
  );
}
