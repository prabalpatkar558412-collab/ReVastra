import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";

export default function RecyclerDashboard() {
  const navigate = useNavigate();

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setMessage("");

      const snapshot = await getDocs(collection(db, "devices"));

      const deviceList = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setDevices(deviceList);
    } catch (error) {
      console.error("Error fetching devices:", error);
      setMessage("Failed to load recycler requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleStatusChange = async (deviceId, newStatus) => {
    try {
      setUpdatingId(deviceId);
      setMessage("");

      await updateDoc(doc(db, "devices", deviceId), {
        status: newStatus,
      });

      setDevices((prev) =>
        prev.map((item) =>
          item.id === deviceId ? { ...item, status: newStatus } : item
        )
      );

      setMessage(`Request updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      setMessage("Failed to update request status");
    } finally {
      setUpdatingId("");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setMessage("Failed to logout");
    }
  };

  const stats = useMemo(() => {
    const incoming = devices.filter(
      (item) => !item.status || item.status === "pending"
    ).length;

    const active = devices.filter((item) =>
      ["accepted", "pickup_scheduled", "picked"].includes(item.status)
    ).length;

    const completed = devices.filter(
      (item) => item.status === "completed"
    ).length;

    const rejected = devices.filter(
      (item) => item.status === "rejected"
    ).length;

    return { incoming, active, completed, rejected };
  }, [devices]);

  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      const currentStatus = device.status || "pending";

      const matchesStatus =
        statusFilter === "all" ? true : currentStatus === statusFilter;

      const text = `${device.deviceType || ""} ${device.name || ""} ${
        device.email || ""
      } ${device.brand || ""}`.toLowerCase();

      const matchesSearch = text.includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [devices, statusFilter, searchTerm]);

  const getStatusClasses = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "picked":
        return "bg-blue-100 text-blue-700";
      case "pickup_scheduled":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl bg-white p-8 shadow-sm border">
            <p className="text-lg font-medium text-gray-700">
              Loading recycler dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm border md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-700">
              Recycler Dashboard
            </h1>
            <p className="mt-1 text-gray-600">
              Manage recycling requests, pickup flow, and completed jobs.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={fetchDevices}
              className="rounded-xl border border-green-200 bg-green-50 px-4 py-2 font-medium text-green-700 hover:bg-green-100"
            >
              Refresh
            </button>

            <button
              onClick={handleLogout}
              className="rounded-xl bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {message}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm border">
            <p className="text-sm font-medium text-gray-500">Incoming Requests</p>
            <h2 className="mt-2 text-3xl font-bold text-orange-600">
              {stats.incoming}
            </h2>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm border">
            <p className="text-sm font-medium text-gray-500">Active Pickups</p>
            <h2 className="mt-2 text-3xl font-bold text-blue-600">
              {stats.active}
            </h2>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm border">
            <p className="text-sm font-medium text-gray-500">Completed Jobs</p>
            <h2 className="mt-2 text-3xl font-bold text-green-600">
              {stats.completed}
            </h2>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm border">
            <p className="text-sm font-medium text-gray-500">Rejected</p>
            <h2 className="mt-2 text-3xl font-bold text-red-600">
              {stats.rejected}
            </h2>
          </div>
        </div>

        <div className="mb-6 rounded-3xl bg-white p-5 shadow-sm border">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Search by device, user, email, brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="pickup_scheduled">Pickup Scheduled</option>
              <option value="picked">Picked</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm border">
          <div className="border-b px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Device Requests
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Total showing: {filteredDevices.length}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-50">
                <tr className="text-sm text-gray-600">
                  <th className="px-6 py-4 font-semibold">Device</th>
                  <th className="px-6 py-4 font-semibold">Brand</th>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Price</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredDevices.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No recycling requests found
                    </td>
                  </tr>
                ) : (
                  filteredDevices.map((device) => {
                    const status = device.status || "pending";
                    const isUpdating = updatingId === device.id;

                    return (
                      <tr
                        key={device.id}
                        className="border-t align-top hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 font-medium text-gray-800">
                          {device.deviceType || "N/A"}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {device.brand || "N/A"}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {device.name || "N/A"}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {device.email || "N/A"}
                        </td>

                        <td className="px-6 py-4 font-semibold text-gray-800">
                          ₹{device.estimatedValue || 0}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                              status
                            )}`}
                          >
                            {status.replaceAll("_", " ")}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() =>
                                handleStatusChange(device.id, "accepted")
                              }
                              disabled={isUpdating}
                              className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                            >
                              Accept
                            </button>

                            <button
                              onClick={() =>
                                handleStatusChange(
                                  device.id,
                                  "pickup_scheduled"
                                )
                              }
                              disabled={isUpdating}
                              className="rounded-lg bg-yellow-500 px-3 py-2 text-sm text-white hover:bg-yellow-600 disabled:opacity-50"
                            >
                              Schedule
                            </button>

                            <button
                              onClick={() =>
                                handleStatusChange(device.id, "picked")
                              }
                              disabled={isUpdating}
                              className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                              Picked
                            </button>

                            <button
                              onClick={() =>
                                handleStatusChange(device.id, "completed")
                              }
                              disabled={isUpdating}
                              className="rounded-lg bg-gray-800 px-3 py-2 text-sm text-white hover:bg-gray-900 disabled:opacity-50"
                            >
                              Complete
                            </button>

                            <button
                              onClick={() =>
                                handleStatusChange(device.id, "rejected")
                              }
                              disabled={isUpdating}
                              className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}