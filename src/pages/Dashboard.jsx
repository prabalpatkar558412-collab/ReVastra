import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Your Dashboard 📊
        </h1>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-green-100 p-6 rounded-2xl">
            <p>Devices Recycled</p>
            <h2 className="text-2xl font-bold">4</h2>
          </div>

          <div className="bg-blue-100 p-6 rounded-2xl">
            <p>Total Earnings</p>
            <h2 className="text-2xl font-bold">₹3200</h2>
          </div>

          <div className="bg-yellow-100 p-6 rounded-2xl">
            <p>Pickups</p>
            <h2 className="text-2xl font-bold">2</h2>
          </div>

          <div className="bg-purple-100 p-6 rounded-2xl">
            <p>E-Waste Saved</p>
            <h2 className="text-2xl font-bold">1.2kg</h2>
          </div>
        </div>

        {/* Pickup Tracking */}
        <div className="bg-white p-6 rounded-2xl shadow mb-8">
          <h2 className="text-xl font-bold mb-4">Pickup Tracking 🚚</h2>

          <div className="space-y-2">
            <p>📦 Request Placed</p>
            <p>🚚 Pickup Assigned</p>
            <p>✅ Completed</p>
          </div>
        </div>

        {/* Activity */}
        <div className="bg-white p-6 rounded-2xl shadow mb-8">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>

          <ul className="space-y-2 text-gray-700">
            <li>📱 iPhone submitted</li>
            <li>💰 ₹1200 earned</li>
            <li>♻️ Device recycled</li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <Link
            to="/sell"
            className="bg-green-600 text-white px-6 py-3 rounded-lg"
          >
            Sell More
          </Link>

          <Link
            to="/"
            className="border px-6 py-3 rounded-lg"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}