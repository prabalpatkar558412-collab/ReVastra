import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

export default function Recyclers() {
  const location = useLocation();
  const initialData = location.state;
  const [recommendationData, setRecommendationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!initialData?.submissionId) { setIsLoading(false); return; }
      try {
        setIsLoading(true);
        const res = await fetch(`${apiBaseUrl}/recyclers/recommendations/${initialData.submissionId}`);
        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result.message || "Failed to fetch");
        if (alive) setRecommendationData(result.data);
      } catch (e) { if (alive) setErrorMessage(e.message); }
      finally { if (alive) setIsLoading(false); }
    })();
    return () => { alive = false; };
  }, [initialData?.submissionId]);

  const data = recommendationData?.submission || initialData;
  const recyclers = recommendationData?.recyclers || [];

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center px-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center max-w-md shadow-2xl">
          <span className="text-5xl mb-4 block">{"\uD83C\uDFED"}</span>
          <h1 className="text-2xl font-black text-white mb-3">No Estimate Data</h1>
          <p className="text-gray-500 mb-6">Please estimate your device first.</p>
          <Link to="/sell" className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-green-500/20">
            Go to Sell Page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 py-10 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-green-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-green-400 text-xs font-semibold">{"\uD83C\uDFED"} Recycler Recommendations</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">
            Choose Your <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Recycler</span>
          </h1>
          <p className="text-gray-500 text-sm">Compare offers, ratings, and pickup availability</p>
        </div>

        {/* Device Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Device", value: data.deviceType, icon: "\uD83D\uDCF1" },
            { label: "Base Value", value: `\u20B9${data.estimatedValue?.toLocaleString("en-IN")}`, icon: "\uD83D\uDCB0" },
            { label: "Suggestion", value: data.suggestion, icon: "\uD83D\uDCA1" },
            { label: "Score", value: `${data.sustainabilityScore}%`, icon: "\uD83C\uDF0D" },
          ].map(c => (
            <div key={c.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-xs text-gray-500">{c.icon} {c.label}</p>
              <p className="text-white font-bold mt-1">{c.value}</p>
            </div>
          ))}
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{"\u26A0\uFE0F"} {errorMessage}</div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Finding best recyclers for you...</p>
          </div>
        )}

        {/* Recycler Cards */}
        {!isLoading && (
          <div className="grid md:grid-cols-2 gap-6">
            {recyclers.map((r, i) => (
              <div key={r.id} className={`relative bg-white/5 backdrop-blur-xl border rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-2xl ${r.isBestMatch ? "border-green-500/40 shadow-lg shadow-green-500/10" : "border-white/10"}`}>
                {r.isBestMatch && (
                  <div className="absolute -top-3 left-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg shadow-green-500/30">
                    {"\u2B50"} Best Match
                  </div>
                )}

                <div className="flex items-start justify-between mb-4 mt-1">
                  <div>
                    <h2 className="text-xl font-bold text-white">{r.name}</h2>
                    <p className="text-gray-500 text-sm">{"\uD83D\uDCCD"} {r.location}</p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-1.5">
                    <span className="text-green-400 font-bold text-sm">{"\u2B50"} {r.rating}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { label: "Distance", value: r.distance, icon: "\uD83D\uDCCD", color: "gray" },
                    { label: "Pickup", value: r.pickup ? "\u2705 Available" : "\u274C Not Available", icon: "\uD83D\uDE9A", color: r.pickup ? "green" : "red" },
                    { label: "Bonus", value: `\u20B9${r.offerBonus}`, icon: "\uD83C\uDF81", color: "blue" },
                    { label: "Final Offer", value: `\u20B9${r.finalOffer?.toLocaleString("en-IN")}`, icon: "\uD83D\uDCB0", color: "green" },
                  ].map(c => (
                    <div key={c.label} className={`p-3 rounded-xl bg-${c.color}-500/10 border border-${c.color}-500/15`}>
                      <p className="text-xs text-gray-500">{c.icon} {c.label}</p>
                      <p className={`font-bold text-sm text-${c.color === "gray" ? "white" : c.color + "-400"}`}>{c.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-5 p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-xs font-semibold text-gray-400 mb-2">Why this recycler?</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>{"\u2713"} Trusted recycling partner with strong rating</li>
                    <li>{"\u2713"} {r.pickup ? "Doorstep pickup available" : "Drop-off at facility"}</li>
                    <li>{"\u2713"} Competitive offer aligned with market rates</li>
                  </ul>
                </div>

                <Link to="/pickup"
                  state={{ ...data, recyclerId: r.id, recyclerName: r.name, finalOffer: r.finalOffer, pickup: r.pickup, recyclerLocation: r.location, recyclerRating: r.rating, recyclerScore: r.score }}
                  className="block text-center bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-500/20 hover:-translate-y-0.5">
                  Select {r.name.split(" ")[0]} {"\u2192"}
                </Link>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !errorMessage && recyclers.length === 0 && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center text-gray-500">No recommendations available</div>
        )}

        <div className="mt-8">
          <Link to="/estimate" state={data} className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 font-semibold px-6 py-3 rounded-xl transition">
            {"\u2190"} Back to Estimate
          </Link>
        </div>
      </div>
    </div>
  );
}
