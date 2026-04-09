import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Pickup() {
  const location = useLocation();
  const navigate = useNavigate();
  const { authFetch, isAuthenticated, syncUser } = useAuth();
  const data = location.state;
  const [formData, setFormData] = useState({ name: "", address: "", contact: "", pickupDate: "" });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-medium">Creating pickup request...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center px-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center max-w-md shadow-2xl">
          <span className="text-5xl mb-4 block">{"\uD83D\uDE9A"}</span>
          <h1 className="text-2xl font-black text-white mb-3">No Recycler Selected</h1>
          <p className="text-gray-500 mb-6">Please choose a recycler first to continue with pickup.</p>
          <Link to="/sell" className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-green-500/20">
            Go to Sell Page
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await authFetch("/pickups", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: data.submissionId, recyclerId: data.recyclerId, recyclerName: data.recyclerName, finalOffer: data.finalOffer, pickup: data.pickup, ...formData }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || "Failed to create pickup");
      if (result.data?.user) syncUser(result.data.user);
      navigate("/dashboard", { state: { pickupRequest: result.data?.pickupRequest || null } });
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 py-10 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/3 w-72 h-72 bg-green-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-green-400 text-xs font-semibold">{"\uD83D\uDE9A"} Doorstep Pickup</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">
            Schedule <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Pickup</span>
          </h1>
          <p className="text-gray-500 text-sm">Confirm your details for recycler: <span className="text-green-400 font-semibold">{data.recyclerName}</span></p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Recycler Summary */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <p className="text-xs text-gray-500">{"\uD83D\uDCB0"} Final Offer</p>
              <p className="text-xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{"\u20B9"}{data.finalOffer?.toLocaleString("en-IN")}</p>
            </div>
            <div className={`${data.pickup ? "bg-green-500/10 border-green-500/20" : "bg-yellow-500/10 border-yellow-500/20"} border rounded-xl p-4`}>
              <p className="text-xs text-gray-500">{"\uD83D\uDE9A"} Pickup</p>
              <p className={`font-bold ${data.pickup ? "text-green-400" : "text-yellow-400"}`}>{data.pickup ? "\u2705 Available" : "\u26A0\uFE0F Drop Required"}</p>
            </div>
          </div>

          {/* Auth warning */}
          {!isAuthenticated && (
            <div className="mb-6 rounded-xl bg-blue-500/10 border border-blue-500/20 px-4 py-3 text-sm text-blue-300">
              Please <Link to="/login" state={{ from: { pathname: "/pickup", state: data } }} className="font-bold underline text-blue-400">log in</Link> before confirming.
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{"\u26A0\uFE0F"} {errorMessage}</div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{"\uD83D\uDC64"} Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{"\uD83C\uDFE0"} Pickup Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Full pickup address" rows="3" required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{"\uD83D\uDCDE"} Contact Number</label>
              <input type="tel" name="contact" value={formData.contact} onChange={handleChange} placeholder="10-digit mobile number" required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{"\uD83D\uDCC5"} Preferred Pickup Date</label>
              <input type="date" name="pickupDate" value={formData.pickupDate} onChange={handleChange} required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition" style={{ colorScheme: "dark" }} />
            </div>

            <button type="submit" disabled={!isAuthenticated}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 hover:-translate-y-0.5">
              {"\u2705"} Confirm Pickup Request
            </button>
          </form>
        </div>

        <div className="mt-6">
          <Link to="/recyclers" state={data} className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 font-semibold px-6 py-3 rounded-xl transition inline-block">
            {"\u2190"} Back to Recyclers
          </Link>
        </div>
      </div>
    </div>
  );
}
