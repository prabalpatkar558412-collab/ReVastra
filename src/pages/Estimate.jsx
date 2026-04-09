import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

const MATERIAL_DATA = {
  Phone:      { gold: { g: 0.034, rate: 7500 }, copper: { g: 22,  rate: 0.85 }, lithium: { g: 8,   rate: 2.50 }, plastic: { g: 45,  rate: 0.03 }, glass: { g: 32,  rate: 0.01 } },
  Laptop:     { gold: { g: 0.08,  rate: 7500 }, copper: { g: 65,  rate: 0.85 }, lithium: { g: 25,  rate: 2.50 }, plastic: { g: 350, rate: 0.03 }, glass: { g: 85,  rate: 0.01 } },
  Tablet:     { gold: { g: 0.04,  rate: 7500 }, copper: { g: 30,  rate: 0.85 }, lithium: { g: 12,  rate: 2.50 }, plastic: { g: 120, rate: 0.03 }, glass: { g: 95,  rate: 0.01 } },
  Headphones: { gold: { g: 0.01,  rate: 7500 }, copper: { g: 12,  rate: 0.85 }, lithium: { g: 3,   rate: 2.50 }, plastic: { g: 100, rate: 0.03 }, glass: { g: 5,   rate: 0.01 } },
};
const MAT_ICONS = { gold: "\uD83D\uDC8E", copper: "\uD83D\uDD34", lithium: "\uD83D\uDD0B", plastic: "\u267B\uFE0F", glass: "\uD83E\uDE9F" };
const MAT_LABELS = { gold: "Gold", copper: "Copper", lithium: "Lithium", plastic: "Plastic", glass: "Glass" };
const MAT_UNITS = { gold: "g", copper: "g", lithium: "g", plastic: "g", glass: "g" };
const MAT_RATE_LABEL = { gold: "/g", copper: "/g", lithium: "/g", plastic: "/g", glass: "/g" };

export default function Estimate() {
  const location = useLocation();
  const data = location.state;
  const [estimateData, setEstimateData] = useState(data || null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showBreakdown, setShowBreakdown] = useState(false);

  const previewImage = useMemo(() => estimateData?.localImagePreview || estimateData?.imageUrl, [estimateData]);

  if (!estimateData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center px-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center max-w-md shadow-2xl">
          <span className="text-5xl mb-4 block">{"\uD83D\uDCF1"}</span>
          <h1 className="text-2xl font-black text-white mb-3">No Submission Found</h1>
          <p className="text-gray-500 mb-6">Please submit your device first to continue.</p>
          <Link to="/sell" className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-green-500/20">
            Go to Sell Page
          </Link>
        </div>
      </div>
    );
  }

  const handleGenerateEstimate = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(`${apiBaseUrl}/estimates/${estimateData.submissionId}`, { method: "POST" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Failed to generate estimate");
      setEstimateData((prev) => ({ ...prev, ...result.data }));
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong");
    } finally { setIsLoading(false); }
  };

  const hasEstimate = Number.isFinite(estimateData.estimatedValue);

  const InfoCard = ({ label, value, icon }) => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <p className="text-xs text-gray-500 mb-1">{icon} {label}</p>
      <p className="text-white font-bold text-sm break-all">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 py-10 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-20 w-72 h-72 bg-green-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-emerald-500/6 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-green-400 text-xs font-semibold tracking-wide">{hasEstimate ? "\u2705 Estimate Ready" : "\uD83D\uDD2C Generating Estimate"}</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">
            {hasEstimate ? "Your Device " : "Generate "}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Valuation</span>
          </h1>
          <p className="text-gray-500 text-sm">
            {hasEstimate ? "Your submission has been processed and the estimated value is ready." : "Your submission is saved. Click below to generate a real estimate."}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Error */}
            {errorMessage && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{"\u26A0\uFE0F"} {errorMessage}</div>
            )}

            {/* Image + Value */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              {previewImage && (
                <div className="mb-6">
                  <img src={previewImage} alt="Submitted device" className="w-full max-w-sm rounded-2xl border border-white/10 shadow-lg" />
                </div>
              )}

              {hasEstimate && (
                <div className="rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-6 mb-6">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Estimated Value</p>
                  <h2 className="text-5xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {"\u20B9"}{estimateData.estimatedValue?.toLocaleString("en-IN")}
                  </h2>
                  <p className="mt-3 text-gray-300 text-sm">
                    <span className="font-bold text-green-400">Suggestion:</span> {estimateData.suggestion}
                  </p>
                  {estimateData.sustainabilityScore && (
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all" style={{ width: `${estimateData.sustainabilityScore}%` }} />
                      </div>
                      <span className="text-green-400 font-bold text-sm">{estimateData.sustainabilityScore}%</span>
                    </div>
                  )}
                </div>
              )}

              {/* Material Breakdown */}
              {hasEstimate && (() => {
                const mats = MATERIAL_DATA[estimateData.deviceType] || MATERIAL_DATA.Phone;
                const rows = Object.entries(mats).map(([key, { g, rate }]) => ({ key, icon: MAT_ICONS[key], label: MAT_LABELS[key], g, rate, unit: MAT_UNITS[key], rateLabel: MAT_RATE_LABEL[key], value: +(g * rate).toFixed(2) }));
                const total = rows.reduce((s, r) => s + r.value, 0);
                return (
                  <div className="mb-6">
                    <button type="button" onClick={() => setShowBreakdown(p => !p)}
                      className="w-full flex items-center justify-between bg-gradient-to-r from-green-500/5 to-emerald-500/5 border border-green-500/20 rounded-2xl p-4 hover:border-green-500/40 transition-all group">
                      <span className="text-white font-bold text-sm">{"\uD83D\uDCB0"} Value Breakdown</span>
                      <span className={`text-green-400 text-sm font-bold transition-transform ${showBreakdown ? "rotate-180" : ""}`}>{"\u25BC"}</span>
                    </button>
                    {showBreakdown && (
                      <div className="mt-3 bg-white/5 backdrop-blur-xl border border-green-500/20 rounded-2xl p-5 shadow-lg" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(5,150,105,0.02) 100%)" }}>
                        <div className="space-y-2">
                          {rows.map((r, i) => (
                            <div key={r.key} className="flex items-center gap-3 text-sm">
                              <span className="text-gray-600 w-4">{i < rows.length - 1 ? "\u251C" : "\u2514"}</span>
                              <span className="text-lg">{r.icon}</span>
                              <span className="text-gray-400 flex-1">
                                <span className="text-white font-semibold">{r.label}</span>{" "}
                                <span className="text-gray-600">({r.g}{r.unit} \u00D7 \u20B9{r.rate.toLocaleString("en-IN")}{r.rateLabel})</span>
                              </span>
                              <span className="text-green-400 font-bold">= \u20B9{r.value.toLocaleString("en-IN")}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                          <span className="text-white font-bold">TOTAL (Materials)</span>
                          <span className="text-xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">\u20B9{total.toLocaleString("en-IN")}</span>
                        </div>
                        <p className="mt-2 text-[11px] text-gray-600">* Material value is part of the total estimated value. Final amount includes condition, market demand, and recycler offer.</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Device Details */}
              <div className="grid sm:grid-cols-3 gap-3">
                <InfoCard label="Device" value={estimateData.deviceType} icon={"\uD83D\uDCF1"} />
                <InfoCard label="Brand" value={estimateData.brand} icon={"\uD83C\uDFF7\uFE0F"} />
                <InfoCard label="Model" value={estimateData.model} icon={"\u2699\uFE0F"} />
                <InfoCard label="Condition" value={estimateData.condition} icon={"\uD83D\uDCCB"} />
                <InfoCard label="Age" value={`${estimateData.age} years`} icon={"\u23F0"} />
                <InfoCard label="Status" value={estimateData.status} icon={"\uD83D\uDCCA"} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/sell" className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 font-semibold px-6 py-3 rounded-xl text-center transition">
                {"\u2190"} Back
              </Link>
              {!hasEstimate ? (
                <button type="button" onClick={handleGenerateEstimate} disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-green-500/20 disabled:opacity-60 hover:-translate-y-0.5">
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</span>
                  ) : "\uD83D\uDD2C Generate Estimate"}
                </button>
              ) : (
                <Link to="/recyclers" state={estimateData}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold px-6 py-3.5 rounded-xl text-center transition-all shadow-lg shadow-green-500/20 hover:-translate-y-0.5">
                  {"\uD83C\uDFED"} View Recycler Recommendations {"\u2192"}
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Sync Status */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <h3 className="text-white font-bold mb-4">{"\uD83D\uDD04"} Processing Status</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-green-300 text-sm">Stored in Firestore</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-blue-300 text-sm">{estimateData.imageUrl ? "Image uploaded" : "Local preview"}</span>
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-xl ${hasEstimate ? "bg-green-500/10 border border-green-500/20" : "bg-yellow-500/10 border border-yellow-500/20"}`}>
                  <span className={`w-2 h-2 rounded-full ${hasEstimate ? "bg-green-400" : "bg-yellow-400 animate-pulse"}`} />
                  <span className={`text-sm ${hasEstimate ? "text-green-300" : "text-yellow-300"}`}>{hasEstimate ? "Estimate generated" : "Awaiting estimate"}</span>
                </div>
              </div>
            </div>

            {/* Environmental Impact */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <h3 className="text-white font-bold mb-4">{"\uD83C\uDF0D"} Environmental Impact</h3>
              {hasEstimate ? (
                <div className="space-y-3">
                  {[
                    { icon: "\u267B\uFE0F", label: "E-Waste Saved", value: `${estimateData.impact?.ewasteSavedKg}kg`, color: "green" },
                    { icon: "\uD83C\uDF3F", label: "CO2 Reduced", value: `${estimateData.impact?.co2ReducedG}g`, color: "blue" },
                    { icon: "\uD83D\uDD2C", label: "Gold Recovered", value: `${estimateData.impact?.goldRecoveredG}g`, color: "yellow" },
                  ].map(i => (
                    <div key={i.label} className={`p-3 rounded-xl bg-${i.color}-500/10 border border-${i.color}-500/20`}>
                      <span className={`text-${i.color}-300 text-sm font-medium`}>{i.icon} {i.value} {i.label.toLowerCase()}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-600 text-sm">Generate the estimate to see your impact.</p>}
            </div>

            {/* Description */}
            {estimateData.description && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <h3 className="text-white font-bold mb-3">{"\uD83D\uDCDD"} Description</h3>
                <p className="text-gray-400 text-sm">{estimateData.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
