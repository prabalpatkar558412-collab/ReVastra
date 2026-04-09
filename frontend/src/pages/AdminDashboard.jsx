import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const storedBooking = (() => {
    try {
      return JSON.parse(localStorage.getItem("pickupBooking"));
    } catch {
      return null;
    }
  })();

  const staticRequests = [
    {
      id: 1,
      user: "Rahul Sharma",
      device: "iPhone 11",
      type: "Phone",
      status: "Pending",
      pickupDate: "2026-04-09",
      offer: "₹12,200",
      recycler: "GreenCycle Recyclers",
    },
    {
      id: 2,
      user: "Anjali Verma",
      device: "Dell Inspiron",
      type: "Laptop",
      status: "Assigned",
      pickupDate: "2026-04-10",
      offer: "₹18,500",
      recycler: "EcoScrap Solutions",
    },
    {
      id: 3,
      user: "Mohit Jain",
      device: "Samsung Tab S6",
      type: "Tablet",
      status: "Completed",
      pickupDate: "2026-04-08",
      offer: "₹7,800",
      recycler: "Urban E-Waste Hub",
    },
  ];

  const dynamicRequest = storedBooking
    ? [
        {
          id: storedBooking.bookingId || 999,
          user: storedBooking.customerName || "New User",
          device: `${storedBooking.brand || ""} ${storedBooking.model || ""}`.trim() || "Uploaded Device",
          type: storedBooking.deviceType || "Unknown",
          status: storedBooking.bookingStatus || "Pickup Confirmed",
          pickupDate: storedBooking.pickupDate || "Not scheduled",
          offer: `₹${storedBooking.finalOffer || 0}`,
          recycler: storedBooking.recyclerName || "Assigned Recycler",
          address: storedBooking.customerAddress || "No address available",
          contact: storedBooking.customerContact || "No contact available",
          notes: storedBooking.notes || "No extra instructions",
          isLive: true,
        },
      ]
    : [];

  const requests = [...dynamicRequest, ...staticRequests];

  const totalRevenue = requests.reduce((acc, request) => {
    const amount = Number(String(request.offer).replace(/[^\d]/g, ""));
    return acc + (Number.isNaN(amount) ? 0 : amount);
  }, 0);

  const pendingCount = requests.filter(
    (request) =>
      request.status === "Pending" || request.status === "Pickup Confirmed"
  ).length;

  const assignedCount = requests.filter(
    (request) => request.status === "Assigned"
  ).length;

  const completedCount = requests.filter(
    (request) => request.status === "Completed"
  ).length;

  const stats = [
    {
      title: "Total Requests",
      value: requests.length,
      bg: "bg-green-100",
      text: "text-green-700",
    },
    {
      title: "Pending Pickups",
      value: pendingCount,
      bg: "bg-yellow-100",
      text: "text-yellow-700",
    },
    {
      title: "Completed Pickups",
      value: completedCount,
      bg: "bg-blue-100",
      text: "text-blue-700",
    },
    {
      title: "Revenue Processed",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      bg: "bg-purple-100",
      text: "text-purple-700",
    },
  ];

  const getStatusStyle = (status) => {
    if (status === "Pending") {
      return "bg-yellow-100 text-yellow-700";
    }
    if (status === "Assigned") {
      return "bg-blue-100 text-blue-700";
    }
    if (status === "Completed") {
      return "bg-green-100 text-green-700";
    }
    if (status === "Pickup Confirmed") {
      return "bg-purple-100 text-purple-700";
    }
    return "bg-gray-100 text-gray-700";
  };

  const topRecyclerMap = requests.reduce((acc, request) => {
    acc[request.recycler] = (acc[request.recycler] || 0) + 1;
    return acc;
  }, {});

  const topRecycler =
    Object.entries(topRecyclerMap).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "GreenCycle Recyclers";

  const averageOffer =
    requests.length > 0
      ? Math.round(totalRevenue / requests.length).toLocaleString("en-IN")
      : "0";

  const completionRate =
    requests.length > 0
      ? Math.round((completedCount / requests.length) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
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

        {storedBooking && (
          <div className="bg-green-50 border border-green-200 rounded-3xl p-5 sm:p-6 mb-8 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="text-green-700 font-semibold mb-1">
                  Live User Request Added
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {storedBooking.customerName} scheduled a pickup
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  Recycler: {storedBooking.recyclerName} • Offer: ₹
                  {storedBooking.finalOffer} • Date: {storedBooking.pickupDate}
                </p>
              </div>

              <div className="bg-white border border-green-200 rounded-2xl px-4 py-3">
                <p className="text-sm text-gray-500">Booking ID</p>
                <p className="font-bold text-green-700">
                  {storedBooking.bookingId}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="xl:col-span-2 bg-white shadow-md rounded-3xl p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                Pickup Requests
              </h2>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium transition w-full sm:w-auto">
                Export Data
              </button>
            </div>

            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className={`border rounded-2xl p-4 sm:p-5 ${
                    request.isLive
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-800">
                          {request.device}
                        </h3>
                        {request.isLive && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-600 text-white">
                            LIVE
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">User:</span>{" "}
                        {request.user}
                      </p>

                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Type:</span>{" "}
                        {request.type}
                      </p>

                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Pickup Date:</span>{" "}
                        {request.pickupDate}
                      </p>

                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Recycler:</span>{" "}
                        {request.recycler}
                      </p>

                      {request.address && (
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Address:</span>{" "}
                          {request.address}
                        </p>
                      )}

                      {request.contact && (
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Contact:</span>{" "}
                          {request.contact}
                        </p>
                      )}

                      {request.notes && request.isLive && (
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Notes:</span>{" "}
                          {request.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold text-center ${getStatusStyle(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>

                      <div className="text-left sm:text-right">
                        <p className="text-sm text-gray-500">Final Offer</p>
                        <p className="text-xl font-bold text-green-600">
                          {request.offer}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium transition">
                      Update Status
                    </button>
                    <button className="w-full sm:w-auto border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-medium transition">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white shadow-md rounded-3xl p-5 sm:p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Workflow Status
              </h2>

              <div className="space-y-3 text-gray-700">
                <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-100">
                  📦 {pendingCount} pickup requests waiting
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                  🚚 {assignedCount} devices assigned for pickup
                </div>
                <div className="p-3 rounded-xl bg-green-50 border border-green-100">
                  ✅ {completedCount} devices processed successfully
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
                  <p className="font-semibold text-gray-800">{topRecycler}</p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border">
                  <p className="text-sm text-gray-500">Avg. Offer Value</p>
                  <p className="font-semibold text-gray-800">₹{averageOffer}</p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border">
                  <p className="text-sm text-gray-500">Completion Rate</p>
                  <p className="font-semibold text-gray-800">
                    {completionRate}%
                  </p>
                </div>
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
      </div>
    </div>
  );
}