export default function RecyclerDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-2">
          Recycler Dashboard
        </h1>
        <p className="text-gray-600 mb-8">
          Manage recycling requests, offers, and pickups.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Incoming Requests</h2>
            <p className="text-3xl font-bold text-green-600">12</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Active Pickups</h2>
            <p className="text-3xl font-bold text-blue-600">5</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Completed Jobs</h2>
            <p className="text-3xl font-bold text-gray-800">28</p>
          </div>
        </div>
      </div>
    </div>
  );
}