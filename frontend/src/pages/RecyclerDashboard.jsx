import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export default function RecyclerDashboard() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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
      await updateDoc(doc(db, "devices", deviceId), {
        status: newStatus,
      });

      setMessage(`Request updated to ${newStatus}`);
      fetchDevices();
    } catch (error) {
      console.error("Error updating status:", error);
      setMessage("Failed to update request status");
    }
  };

  const stats = useMemo(() => {
    const incoming = devices.filter(
      (item) => !item.status || item.status === "pending"
    ).length;

    const active = devices.filter(
      (item) =>
        item.status === "accepted" ||
        item.status === "pickup_scheduled" ||
        item.status === "picked"
    ).length;

    const completed = devices.filter(
      (item) => item.status === "completed"
    ).length;

    return { incoming, active, completed };
  }, [devices]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-lg font-medium text-gray-700">
            Loading recycler dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-2">
          Recycler Dashboard
        </h1>
        <p className="text-gray-600 mb-8">
          Manage recycling requests, offers, and pickups.
        </p>

        {message && (
          <div className="mb-6 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {message}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Incoming Requests</h2>
            <p className="text-3xl font-bold text-green-600">
              {stats.incoming}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Active Pickups</h2>
            <p className="text-3xl font-bold text-blue-600">
              {stats.active}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Completed Jobs</h2>
            <p className="text-3xl font-bold text-gray-800">
              {stats.completed}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 overflow-x-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Device Requests
          </h2>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-gray-700">
                <th className="py-3">Device</th>
                <th>User</th>
                <th>Email</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {devices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-500">
                    No recycling requests found
                  </td>
                </tr>
              ) : (
                devices.map((device) => (
                  <tr key={device.id} className="border-b">
                    <td className="py-3">{device.deviceType || "N/A"}</td>
                    <td>{device.name || "N/A"}</td>
                    <td>{device.email || "N/A"}</td>
                    <td>₹{device.estimatedValue || 0}</td>
                    <td className="capitalize">
                      {device.status || "pending"}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            handleStatusChange(device.id, "accepted")
                          }
                          className="rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-700"
                        >
                          Accept
                        </button>

                        <button
                          onClick={() =>
                            handleStatusChange(device.id, "rejected")
                          }
                          className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() =>
                            handleStatusChange(device.id, "picked")
                          }
                          className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                        >
                          Picked
                        </button>

                        <button
                          onClick={() =>
                            handleStatusChange(device.id, "completed")
                          }
                          className="rounded-lg bg-gray-800 px-3 py-2 text-white hover:bg-gray-900"
                        >
                          Complete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}