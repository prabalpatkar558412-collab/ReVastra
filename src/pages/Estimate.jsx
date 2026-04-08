import { useLocation, Link } from "react-router-dom";

export default function Estimate() {
  const location = useLocation();
  const data = location.state;

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white shadow-lg rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">No Device Data Found</h1>
          <Link to="/sell" className="text-green-600 font-semibold">
            Go back to Sell Page
          </Link>
        </div>
      </div>
    );
  }

  const basePrices = {
    Phone: 20000,
    Laptop: 40000,
    Tablet: 15000,
    Headphones: 5000,
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

  const basePrice = basePrices[data.deviceType] || 10000;
  const ageDeduction = Number(data.age) * 2000;
  const condDeduction = conditionDeduction[data.condition] || 0;
  const workDeduction = workingDeduction[data.working] || 0;

  const estimatedValue = Math.max(
    500,
    basePrice - ageDeduction - condDeduction - workDeduction
  );

  const suggestion =
    data.condition === "Dead" || data.working === "No"
      ? "Best for Recycling"
      : "Can be Resold or Recycled";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Estimated Device Value
        </h1>
        <p className="text-gray-500 mb-8">
          Here is the estimated value of your device based on the submitted details.
        </p>

        <div className="grid gap-4 mb-8">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="text-sm text-gray-600">Estimated Value</p>
            <h2 className="text-4xl font-bold text-green-600">₹{estimatedValue}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 border">
              <p><span className="font-semibold">Device:</span> {data.deviceType}</p>
              <p><span className="font-semibold">Brand:</span> {data.brand}</p>
              <p><span className="font-semibold">Model:</span> {data.model}</p>
              <p><span className="font-semibold">Age:</span> {data.age} years</p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border">
              <p><span className="font-semibold">Condition:</span> {data.condition}</p>
              <p><span className="font-semibold">Working:</span> {data.working}</p>
              <p><span className="font-semibold">Suggestion:</span> {suggestion}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
            <h3 className="font-bold text-lg mb-2">Why this price?</h3>
            <p>Base Price: ₹{basePrice}</p>
            <p>Age Deduction: ₹{ageDeduction}</p>
            <p>Condition Deduction: ₹{condDeduction}</p>
            <p>Working Status Deduction: ₹{workDeduction}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            to="/sell"
            className="px-6 py-3 rounded-lg border border-gray-300 font-semibold"
          >
            Back
          </Link>

          <Link
            to="/recyclers"
            state={{ ...data, estimatedValue, suggestion }}
            className="px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
          >
            View Recyclers
          </Link>
        </div>
      </div>
    </div>
  );
}