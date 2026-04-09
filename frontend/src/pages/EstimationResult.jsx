import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { calculateDeviceEstimate } from "../utils/pricing";

export default function Estimate() {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // First try to get data from router state
    if (location.state) {
      setData(location.state);

      // Save to localStorage so refresh/direct revisit still works
      localStorage.setItem("estimateData", JSON.stringify(location.state));
    } else {
      // If no router state, try localStorage
      const savedData = localStorage.getItem("estimateData");

      if (savedData) {
        try {
          setData(JSON.parse(savedData));
        } catch (error) {
          console.error("Failed to parse saved estimate data:", error);
          localStorage.removeItem("estimateData");
        }
      }
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [location.state]);

  const handleBackToSell = () => {
    navigate("/sell");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center">
              <div className="w-14 h-14 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-medium text-gray-700">
                Loading estimation...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white shadow-lg rounded-2xl p-8 text-center w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            No Data Found
          </h1>
          <p className="text-gray-500 mb-6">
            Please fill the sell form first.
          </p>
          <Link
            to="/sell"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            Go to Sell Page
          </Link>
        </div>
      </div>
    );
  }

  const { estimatedValue, suggestion, impactScore, breakdown } =
    calculateDeviceEstimate(data);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-lg rounded-2xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Estimated Value
          </h1>
          <p className="text-gray-500">
            Here is the smart estimate for your device.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white shadow-lg rounded-2xl p-6 space-y-4">
            <div className="p-4 rounded-xl bg-gray-50 border">
              <p className="text-sm text-gray-500">Device Type</p>
              <h2 className="text-lg font-semibold text-gray-800">
                {data.deviceType || "N/A"}
              </h2>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border">
              <p className="text-sm text-gray-500">Brand</p>
              <h2 className="text-lg font-semibold text-gray-800">
                {data.brand || "N/A"}
              </h2>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border">
              <p className="text-sm text-gray-500">Model</p>
              <h2 className="text-lg font-semibold text-gray-800">
                {data.model || "N/A"}
              </h2>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border">
              <p className="text-sm text-gray-500">Condition</p>
              <h2 className="text-lg font-semibold text-gray-800">
                {data.condition || "N/A"}
              </h2>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border">
              <p className="text-sm text-gray-500">Working Status</p>
              <h2 className="text-lg font-semibold text-gray-800">
                {data.working || "N/A"}
              </h2>
            </div>

            <div className="p-4 rounded-xl bg-green-50 border border-green-200">
              <p className="text-sm text-gray-500">Estimated Price</p>
              <h2 className="text-3xl font-bold text-green-600">
                ₹{estimatedValue}
              </h2>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border">
              <p className="text-sm text-gray-500 mb-2">Pricing Breakdown</p>
              <div className="space-y-1 text-sm text-gray-700">
                <p>Base Price: ₹{breakdown?.basePrice ?? 0}</p>
                <p>Brand Factor: {breakdown?.brandMultiplier ?? 1}x</p>
                <p>Condition Factor: {breakdown?.conditionMultiplier ?? 1}x</p>
                <p>Working Factor: {breakdown?.workingMultiplier ?? 1}x</p>
                <p>
                  Age Factor: {(breakdown?.ageMultiplier ?? 1).toFixed(2)}x
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-sm text-gray-500">Suggested Path</p>
              <h2 className="text-lg font-semibold text-gray-800">
                {suggestion || "No suggestion available"}
              </h2>
            </div>

            {data.firebaseId && (
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                <p className="text-sm text-gray-500">Firebase Record ID</p>
                <h2 className="text-sm font-semibold text-gray-800 break-all">
                  {data.firebaseId}
                </h2>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white shadow-lg rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Uploaded Image
              </h2>

              {data.imageURL || data.imagePreview ? (
                <img
                  src={data.imageURL || data.imagePreview}
                  alt="Uploaded Device"
                  className="w-full max-h-96 object-contain rounded-xl border"
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400 border rounded-xl bg-gray-50">
                  No image uploaded
                </div>
              )}
            </div>

            <div className="bg-white shadow-lg rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Impact Insights
              </h2>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                  ♻️ Impact Score: {impactScore ?? 0}%
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  🌿 CO₂ Saved: {data.deviceType === "Laptop" ? "450g" : "180g"}
                </div>
                <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-100">
                  🔋 E-waste diverted:{" "}
                  {data.deviceType === "Laptop" ? "1.2kg" : "0.4kg"}
                </div>
              </div>
            </div>

            {data.aiResult && (
              <div className="bg-white shadow-lg rounded-2xl p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  AI Analysis
                </h2>

                <div className="space-y-3 text-sm text-gray-700">
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                    <strong>Device Type:</strong>{" "}
                    {data.aiResult.deviceType || "Unknown"}
                  </div>

                  <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                    <strong>Likely Brand:</strong>{" "}
                    {data.aiResult.likelyBrand || "Unknown"}
                  </div>

                  <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-100">
                    <strong>Likely Model:</strong>{" "}
                    {data.aiResult.exactModelReliable
                      ? data.aiResult.likelyModel || "Unknown"
                      : "Model not confidently identified"}
                  </div>

                  <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                    <strong>Visible Condition:</strong>{" "}
                    {data.aiResult.visibleCondition || "Unknown"}
                  </div>

                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                    <strong>Confidence:</strong> {data.aiResult.confidence ?? 0}%
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 border">
                    <strong>Reasoning:</strong>{" "}
                    {data.aiResult.reasoning || "No reasoning available"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            to="/recyclers"
            state={{ ...data, estimatedValue, suggestion }}
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition text-center"
          >
            View Recyclers
          </Link>

          <button
            onClick={handleBackToSell}
            className="inline-block border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold px-6 py-3 rounded-lg transition text-center"
          >
            Back to Sell Page
          </button>
        </div>
      </div>
    </div>
  );
}