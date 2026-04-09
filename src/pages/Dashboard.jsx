import { useEffect, useState } from "react";
import { getDevices } from "../services/deviceService";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const data = await getDevices();
        setDevices(data);
      } catch (error) {
        console.error("Failed to fetch devices:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDevices();
  }, []);

  const totalDevices = devices.length;
  const totalEarnings = devices.reduce((sum, device) => {
    const age = Number(device.age || 0);

    let basePrice = 0;
    if (device.deviceType === "Phone") basePrice = 15000;
    else if (device.deviceType === "Laptop") basePrice = 25000;
    else if (device.deviceType === "Tablet") basePrice = 12000;
    else if (device.deviceType === "Headphones") basePrice = 4000;
    else basePrice = 3000;

    let conditionDeduction = 0;
    if (device.condition === "Excellent") conditionDeduction = 500;
    else if (device.condition === "Good") conditionDeduction = 1000;
    else if (device.condition === "Damaged") conditionDeduction = 3000;
    else if (device.condition === "Dead") conditionDeduction = 5000;

    let workingDeduction = 0;
    if (device.working === "Partially") workingDeduction = 1500;
    else if (device.working === "No") workingDeduction = 3000;

    const ageDeduction = age * 1000;

    const estimatedValue = Math.max(
      basePrice - conditionDeduction - workingDeduction - ageDeduction,
      500
    );

    return sum + estimatedValue;
  }, 0);

  const totalEwaste = devices
    .reduce((sum, device) => {
      if (device.deviceType === "Laptop") return sum + 1.2;
      if (device.deviceType === "Tablet") return sum + 0.7;
      if (device.deviceType === "Headphones") return sum + 0.2;
      return sum + 0.4;
    }, 0)
    .toFixed(1);

  const completedPickups = Math.floor(totalDevices / 2);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-lg rounded-2xl p-8 mb-8">
          <p className="text-green-600 font-semibold mb-2">
            Firebase Powered Dashboard
          </p>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-500">
            Live submissions and insights from Cloud Firestore.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-green-100 text-green-700 p-6 rounded-2xl shadow-md">
            <p className="text-sm">Devices Submitted</p>
            <h2 className="text-3xl font-bold mt-2">{totalDevices}</h2>
          </div>

          <div className="bg-blue-100 text-blue-700 p-6 rounded-2xl shadow-md">
            <p className="text-sm">Estimated Earnings</p>
            <h2 className="text-3xl font-bold mt-2">₹{totalEarnings}</h2>
          </div>

          <div className="bg-yellow-100 text-yellow-700 p-6 rounded-2xl shadow-md">
            <p className="text-sm">Pickup Progress</p>
            <h2 className="text-3xl font-bold mt-2">{completedPickups}</h2>
          </div>

          <div className="bg-purple-100 text-purple-700 p-6 rounded-2xl shadow-md">
            <p className="text-sm">E-Waste Diverted</p>
            <h2 className="text-3xl font-bold mt-2">{totalEwaste} kg</h2>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Recent Submissions
          </h2>

          {loading ? (
            <p className="text-gray-500">Loading data...</p>
          ) : devices.length === 0 ? (
            <p className="text-gray-500">No devices found.</p>
          ) : (
            <div className="space-y-4">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="p-4 border rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {device.brand} {device.model}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {device.deviceType} • {device.condition} • {device.working}
                    </p>
                    <p className="text-sm text-gray-500">
                      Age: {device.age} year(s)
                    </p>
                    {device.createdAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        Submitted: {String(device.createdAt)}
                      </p>
                    )}
                  </div>

                  <div className="text-sm text-gray-600">
                    {device.status || "submitted"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/sell"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition text-center"
          >
            Add New Device
          </Link>

          <Link
            to="/"
            className="border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold px-6 py-3 rounded-lg transition text-center"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}