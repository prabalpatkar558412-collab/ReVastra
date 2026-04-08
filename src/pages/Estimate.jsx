import { useLocation, Link } from "react-router-dom";

export default function Estimate() {
  const location = useLocation();
  const data = location.state;

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <Link to="/sell" className="text-green-600 font-semibold">
          Go to Sell Page
        </Link>
      </div>
    );
  }

  const basePrices = {
    Phone: 20000,
    Laptop: 45000,
    Tablet: 18000,
    Headphones: 6000,
  };

  const basePrice = basePrices[data.deviceType] || 10000;

  const estimatedValue = Math.max(
    500,
    basePrice - Number(data.age) * 2000
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="bg-white shadow-lg rounded-3xl p-6 sm:p-8 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
            Estimated Device Value
          </h1>
          <p className="text-gray-500">
            Based on your inputs and smart valuation logic.
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2 bg-white shadow-md rounded-3xl p-6 sm:p-8">

            {/* IMAGE PREVIEW */}
            {data.imagePreview && (
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Uploaded Image</p>
                <img
                  src={data.imagePreview}
                  alt="Device"
                  className="w-full max-w-md rounded-2xl border shadow"
                />
              </div>
            )}

            {/* PRICE */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Estimated Value</p>
              <h2 className="text-4xl sm:text-5xl font-bold text-green-600">
                ₹{estimatedValue}
              </h2>
            </div>

            {/* DETAILS */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-gray-50 border">
                <p className="text-sm text-gray-500">Device</p>
                <h3 className="font-semibold">{data.deviceType}</h3>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border">
                <p className="text-sm text-gray-500">Brand</p>
                <h3 className="font-semibold">{data.brand}</h3>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border">
                <p className="text-sm text-gray-500">Model</p>
                <h3 className="font-semibold">{data.model}</h3>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border">
                <p className="text-sm text-gray-500">Age</p>
                <h3 className="font-semibold">{data.age} years</h3>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/sell"
                className="px-6 py-3 border rounded-xl text-gray-700 hover:bg-gray-100 text-center"
              >
                Back
              </Link>

              <Link
                to="/recyclers"
                state={{ ...data, estimatedValue }}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 text-center"
              >
                View Recyclers
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">

            {/* IMPACT */}
            <div className="bg-white shadow-md rounded-3xl p-6">
              <h3 className="text-xl font-bold mb-4">
                Environmental Impact 🌍
              </h3>

              <div className="space-y-3 text-gray-700">
                <div className="p-3 bg-green-50 border rounded-xl">
                  ♻️ 0.3kg e-waste saved
                </div>
                <div className="p-3 bg-blue-50 border rounded-xl">
                  🌿 180g CO₂ reduced
                </div>
                <div className="p-3 bg-yellow-50 border rounded-xl">
                  🔬 0.02g gold recovered
                </div>
              </div>
            </div>

            {/* SCORE */}
            <div className="bg-white shadow-md rounded-3xl p-6">
              <h3 className="text-xl font-bold mb-4">
                Sustainability Score
              </h3>

              <div className="w-full bg-gray-200 h-4 rounded-full">
                <div className="bg-green-600 h-4 rounded-full w-[80%]"></div>
              </div>

              <p className="mt-2 text-gray-600">
                80% recyclable potential
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}