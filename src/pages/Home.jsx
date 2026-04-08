import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-green-600 font-semibold mb-3">
              Smart E-Waste Circular Economy Platform
            </p>

            <h1 className="text-5xl font-bold text-gray-800 leading-tight mb-6">
              Turn Your Old Electronics Into
              <span className="text-green-600"> Value</span>
            </h1>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              ReVastra helps users evaluate end-of-life devices, connect with
              recyclers, request pickups, and track environmental impact through
              a smart and transparent digital platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/sell"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition text-center"
              >
                Sell Your Device
              </Link>

              <Link
                to="/dashboard"
                className="border border-gray-300 hover:bg-gray-100 text-gray-800 px-6 py-3 rounded-xl font-semibold transition text-center"
              >
                View Dashboard
              </Link>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              How ReVastra Works
            </h2>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-green-50 border border-green-100">
                <h3 className="font-semibold text-gray-800">1. Add Device</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Enter your old or damaged device details.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <h3 className="font-semibold text-gray-800">2. Get Estimate</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Receive transparent value estimation and recommendations.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-100">
                <h3 className="font-semibold text-gray-800">3. Choose Recycler</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Compare offers and pickup options from recyclers.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
                <h3 className="font-semibold text-gray-800">4. Track Impact</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Monitor earnings, pickups, and environmental benefits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">♻️ Sustainable</h3>
            <p className="text-gray-600">
              Divert e-waste from landfills and support responsible recycling.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">💰 Valuable</h3>
            <p className="text-gray-600">
              Get fair value estimation based on device type, age, and condition.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">🌍 Impactful</h3>
            <p className="text-gray-600">
              Track carbon savings, recycled material, and environmental impact.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}