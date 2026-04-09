import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

export default function Recyclers() {
  const location = useLocation();
  const initialData = location.state;
  const [recommendationData, setRecommendationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchRecommendations() {
      if (!initialData?.submissionId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await fetch(
          `${apiBaseUrl}/recyclers/recommendations/${initialData.submissionId}`
        );
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to fetch recycler recommendations"
          );
        }

        if (isMounted) {
          setRecommendationData(result.data);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Something went wrong");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchRecommendations();

    return () => {
      isMounted = false;
    };
  }, [initialData?.submissionId]);

  const data = recommendationData?.submission || initialData;
  const finalRecyclers = recommendationData?.recyclers || [];

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
                {data.deviceType}
              </h2>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border">
              <p className="text-sm text-gray-500">Base Value</p>
              <h2 className="text-lg font-semibold text-green-600">
                {"\u20B9"}
                {data.estimatedValue}
              </h2>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border">
              <p className="text-sm text-gray-500">Suggested Path</p>
              <h2 className="text-lg font-semibold text-gray-800">
                {data.suggestion}
              </h2>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border">
              <p className="text-sm text-gray-500">Sustainability Score</p>
              <h2 className="text-lg font-semibold text-gray-800">
                {data.sustainabilityScore}%
              </h2>
            </div>
          </div>
        </div>

        {errorMessage ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div className="bg-white shadow-md rounded-3xl p-8 text-center text-gray-600">
            Loading recycler recommendations...
          </div>
        ) : null}

        {!isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {finalRecyclers.map((recycler) => (
              <div
                key={recycler.id}
                className="bg-white shadow-md rounded-3xl p-6 border hover:shadow-lg transition relative"
              >
                {recycler.isBestMatch ? (
                  <div className="absolute -top-3 left-6 bg-green-600 text-white text-sm font-semibold px-4 py-1 rounded-full shadow">
                    {"\u2B50"} Best Match
                  </div>
                ) : null}

                <div className="flex items-start justify-between mb-5 mt-2">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {recycler.name}
                    </h2>
                    <p className="text-gray-500">{recycler.location}</p>
                  </div>

                  <span className="bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
                    {"\u2B50"} {recycler.rating}
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
                      {"\u20B9"}
                      {recycler.offerBonus}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 border">
                    <p className="text-sm text-gray-500">Final Offer</p>
                    <p className="font-semibold text-green-600">
                      {"\u20B9"}
                      {recycler.finalOffer}
                    </p>
                  </div>
                </div>

                <div className="mb-5 p-4 rounded-2xl bg-yellow-50 border border-yellow-200">
                  <h3 className="font-bold text-gray-800 mb-2">
                    Why choose this recycler?
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>{"\u2022"} Strong rating and trusted recycling partner</li>
                    <li>
                      {"\u2022"}{" "}
                      {recycler.pickup
                        ? "Pickup available for convenience"
                        : "Manual drop-off required"}
                    </li>
                    <li>
                      {"\u2022"} Better value alignment with your device estimate
                    </li>
                  </ul>
                </div>

                <Link
                  to="/pickup"
                  state={{
                    ...data,
                    recyclerId: recycler.id,
                    recyclerName: recycler.name,
                    finalOffer: recycler.finalOffer,
                    pickup: recycler.pickup,
                    recyclerLocation: recycler.location,
                    recyclerRating: recycler.rating,
                    recyclerScore: recycler.score,
                  }}
                  className="block text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition"
                >
                  Select Recycler
                </Link>
              </div>
            ))}
          </div>
        ) : null}

        {!isLoading && !errorMessage && finalRecyclers.length === 0 ? (
          <div className="bg-white shadow-md rounded-3xl p-8 text-center text-gray-600">
            No recycler recommendations are available right now.
          </div>
        ) : null}

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
