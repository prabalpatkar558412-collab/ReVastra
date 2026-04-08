import { useLocation, Link } from "react-router-dom";

export default function Estimate() {
  const location = useLocation();
  const data = location.state;

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white shadow-lg rounded-2xl p-8 text-center w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            No Device Data Found
          </h1>
          <p className="text-gray-500 mb-6">
            Please submit your device details first to get an estimate.
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

  const basePrices = {
    Phone: 20000,
    Laptop: 45000,
    Tablet: 18000,
    Headphones: 6000,
  };

  const brandBonus = {
    Apple: 4000,
    Samsung: 2500,
    Dell: 3000,
    HP: 2000,
    Lenovo: 2200,
    Sony: 1800,
  };

  const conditionDeduction = {
    Excellent: 1000,
    Good: 3000,
    Damaged: 7000,
    Dead: 12000,
  };

  const workingDeduction = {
    Yes: 0,
    Partially: 3000,
    No: 7000,
  };

  const normalizedBrand = data.brand?.trim();
  const basePrice = basePrices[data.deviceType] || 10000;
  const bonus = brandBonus[normalizedBrand] || 0;
  const ageDeduction = Number(data.age) * 2000;
  const condDeduction = conditionDeduction[data.condition] || 0;
  const workDeduction = workingDeduction[data.working] || 0;

  const estimatedValue = Math.max(
    500,
    basePrice + bonus - ageDeduction - condDeduction - workDeduction
  );

  const suggestion =
    data.condition === "Dead" || data.working === "No"
      ? "Best for Recycling"
      : "Can be Resold or Recycled";

  const sustainabilityScore =
    data.condition === "Dead" || data.working === "No" ? 92 : 78;

  const impact = {
    co2: data.deviceType === "Laptop" ? 420 : 180,
    ewaste: data.deviceType === "Laptop" ? 1.5 : 0.35,
    gold: data.deviceType === "Laptop" ? 0.05 : 0.02,
    copper: data.deviceType === "Laptop" ? 0.18 : 0.06,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-lg rounded-3xl p-8 mb-8">
          <p className="text-green-600 font-semibold mb-2">
            Smart Device Valuation
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Estimated Device Value
          </h1>
          <p className="text-gray-500">
            Transparent pricing based on device type, age, brand, condition, and
            working status.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white shadow-md rounded-3xl p-8">
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Estimated Value</p>
              <h2 className="text-5xl font-bold text-green-600">
                ₹{estimatedValue}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-gray-50 border">
                <p className="text-sm text-gray-500">Device Type</p>
                <h3 className="text-lg font-semibold text-gray-800">
                  {data.deviceType}
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border">
                <p className="text-sm text-gray-500">Brand / Model</p>
                <h3 className="text-lg font-semibold text-gray-800">
                  {data.brand} {data.model}
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border">
                <p className="text-sm text-gray-500">Age</p>
                <h3 className="text-lg font-semibold text-gray-800">
                  {data.age} years
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border">
                <p className="text-sm text-gray-500">Suggested Path</p>
                <h3 className="text-lg font-semibold text-gray-800">
                  {suggestion}
                </h3>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-yellow-50 border border-yellow-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Why this price?
              </h3>

              <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                <div className="p-4 bg-white rounded-xl border">
                  <p className="font-medium">Base Price</p>
                  <p className="text-lg font-bold text-green-600">₹{basePrice}</p>
                </div>

                <div className="p-4 bg-white rounded-xl border">
                  <p className="font-medium">Brand Bonus</p>
                  <p className="text-lg font-bold text-blue-600">₹{bonus}</p>
                </div>

                <div className="p-4 bg-white rounded-xl border">
                  <p className="font-medium">Age Deduction</p>
                  <p className="text-lg font-bold text-red-500">
                    -₹{ageDeduction}
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border">
                  <p className="font-medium">Condition Deduction</p>
                  <p className="text-lg font-bold text-red-500">
                    -₹{condDeduction}
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border md:col-span-2">
                  <p className="font-medium">Working Status Deduction</p>
                  <p className="text-lg font-bold text-red-500">
                    -₹{workDeduction}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white shadow-md rounded-3xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Sustainability Score
              </h3>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
                <div
                  className="bg-green-600 h-4 rounded-full"
                  style={{ width: `${sustainabilityScore}%` }}
                ></div>
              </div>
              <p className="text-gray-700 font-medium">
                {sustainabilityScore}% recycling potential
              </p>
            </div>

            <div className="bg-white shadow-md rounded-3xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Environmental Impact 🌍
              </h3>
              <div className="space-y-3 text-gray-700">
                <div className="p-3 rounded-xl bg-green-50 border border-green-100">
                  ♻️ E-waste diverted: <span className="font-semibold">{impact.ewaste} kg</span>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                  🌿 CO₂ saved: <span className="font-semibold">{impact.co2} g</span>
                </div>
                <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-100">
                  🔬 Gold recovered: <span className="font-semibold">{impact.gold} g</span>
                </div>
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                  ⚙️ Copper recovered: <span className="font-semibold">{impact.copper} kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/sell"
            className="text-center px-6 py-3 rounded-xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-100 transition"
          >
            Back to Form
          </Link>

          <Link
            to="/recyclers"
            state={{
              ...data,
              estimatedValue,
              suggestion,
              sustainabilityScore,
              impact,
            }}
            className="text-center px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
          >
            View Recyclers
          </Link>
        </div>
      </div>
    </div>
  );
}