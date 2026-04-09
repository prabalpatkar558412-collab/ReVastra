import { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { recyclers } from "../data/recyclers";

export default function Recyclers() {
  const location = useLocation();

  const storedData = (() => {
    try {
      return JSON.parse(localStorage.getItem("deviceEstimate"));
    } catch {
      return null;
    }
  })();

  const data = location.state || storedData;

  const finalRecyclers = useMemo(() => {
    if (!data) return [];

    const estimatedValue = Number(data.estimatedValue || 0);

    return recyclers
      .map((recycler) => {
        const distanceNumber = Number.parseFloat(
          String(recycler.distance).replace(/[^\d.]/g, "")
        );

        const safeDistance = Number.isNaN(distanceNumber) ? 50 : distanceNumber;
        const ratingScore = Number(recycler.rating || 0) * 10;
        const pickupScore = recycler.pickup ? 30 : 0;
        const distanceScore = Math.max(0, 200 - safeDistance);
        const offerBonusScore = Number(recycler.offerBonus || 0) / 10;

        const score =
          pickupScore + ratingScore + distanceScore + offerBonusScore;

        return {
          ...recycler,
          finalOffer: estimatedValue + Number(recycler.offerBonus || 0),
          score,
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [data]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white shadow-lg rounded-2xl p-8 text-center w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            No Estimate Data Found
          </h1>
          <p className="text-gray-500 mb-6">
            Please estimate your device first to view recycler recommendations.
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

  const handleSelectRecycler = (recycler) => {
    const selectedRecyclerData = {
      ...data,
      recyclerName: recycler.name,
      finalOffer: recycler.finalOffer,
      pickup: recycler.pickup,
      recyclerLocation: recycler.location,
      recyclerRating: recycler.rating,
    };

    localStorage.setItem(
      "selectedRecyclerData",
      JSON.stringify(selectedRecyclerData)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-lg rounded-3xl p-8 mb-8">
          <p className="text-green-600 font-semibold mb-2">
            Recycler Recommendation Engine
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Available Recyclers
          </h1>
          <p className="text-gray-500 mb-6">
            Compare offers, pickup availability, ratings, and choose the best
            recycler for your device.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 border">
              <p className="text-sm text-gray-500">Device</p>
              <h2 className="text-lg font-semibold text-gray-800">
                {data.deviceType || "Unknown Device"}
              </h2>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border">
              <p className="text-sm text-gray-500">Base Value</p>
              <h2 className="text-lg font-semibold text-green-600">
                ₹{Number(data.estimatedValue || 0)}
              </h2>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border">
              <p className="text-sm text-gray-500">Suggested Path</p>
              <h2 className="text-lg font-semibold text-gray-800">
                {data.suggestion || "Recycle Responsibly"}
              </h2>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border">
              <p className="text-sm text-gray-500">Sustainability Score</p>
              <h2 className="text-lg font-semibold text-gray-800">
                {data.sustainabilityScore || 85}%
              </h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {finalRecyclers.map((recycler, index) => (
            <div
              key={recycler.id}
              className="bg-white shadow-md rounded-3xl p-6 border hover:shadow-lg transition relative"
            >
              {index === 0 && (
                <div className="absolute -top-3 left-6 bg-green-600 text-white text-sm font-semibold px-4 py-1 rounded-full shadow">
                  ⭐ Best Match
                </div>
              )}

              <div className="flex items-start justify-between mb-5 mt-2">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {recycler.name}
                  </h2>
                  <p className="text-gray-500">{recycler.location}</p>
                </div>

                <span className="bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
                  ⭐ {recycler.rating}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-3 rounded-xl bg-gray-50 border">
                  <p className="text-sm text-gray-500">Distance</p>
                  <p className="font-semibold text-gray-800">
                    {recycler.distance}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border">
                  <p className="text-sm text-gray-500">Pickup</p>
                  <p className="font-semibold text-gray-800">
                    {recycler.pickup ? "Available" : "Not Available"}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border">
                  <p className="text-sm text-gray-500">Bonus Offer</p>
                  <p className="font-semibold text-blue-600">
                    ₹{recycler.offerBonus}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border">
                  <p className="text-sm text-gray-500">Final Offer</p>
                  <p className="font-semibold text-green-600">
                    ₹{recycler.finalOffer}
                  </p>
                </div>
              </div>

              <div className="mb-5 p-4 rounded-2xl bg-yellow-50 border border-yellow-200">
                <h3 className="font-bold text-gray-800 mb-2">
                  Why choose this recycler?
                </h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Strong rating and trusted recycling partner</li>
                  <li>
                    •{" "}
                    {recycler.pickup
                      ? "Pickup available for convenience"
                      : "Manual drop-off required"}
                  </li>
                  <li>• Better value alignment with your device estimate</li>
                </ul>
              </div>

              <Link
                to="/pickup"
                state={{
                  ...data,
                  recyclerName: recycler.name,
                  finalOffer: recycler.finalOffer,
                  pickup: recycler.pickup,
                  recyclerLocation: recycler.location,
                  recyclerRating: recycler.rating,
                }}
                onClick={() => handleSelectRecycler(recycler)}
                className="block text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition"
              >
                Select Recycler
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link
            to="/estimate"
            state={data}
            className="inline-block px-6 py-3 rounded-xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-100 transition"
          >
            Back to Estimate
          </Link>
        </div>
      </div>
    </div>
  );
}