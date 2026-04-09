import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const tabs = [
  { key: "user-login", label: "User Login", icon: "\uD83D\uDC64", color: "green" },
  { key: "user-register", label: "Register", icon: "\u2728", color: "blue" },
  { key: "collector-login", label: "Collector", icon: "\uD83D\uDE9A", color: "yellow" },
  { key: "recycler-login", label: "Recycler", icon: "\uD83C\uDFED", color: "purple" },
  { key: "admin-login", label: "Admin", icon: "\uD83D\uDC51", color: "red" },
];

function getRedirectPath(role, fallbackPath) {
  if (role === "admin") return "/admin";
  if (role === "collector") return "/collector";
  if (role === "recycler") return "/recycler";
  return fallbackPath || "/dashboard";
}

function getExpectedRole(activeTab) {
  if (activeTab === "admin-login") return "admin";
  if (activeTab === "collector-login") return "collector";
  if (activeTab === "recycler-login") return "recycler";
  return "user";
}

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoading, login, register } = useAuth();
  const [activeTab, setActiveTab] = useState("user-login");
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      if (activeTab === "user-register") {
        await register({ name: formData.name, email: formData.email, password: formData.password });
        navigate("/dashboard", { replace: true });
        return;
      }
      const user = await login({ email: formData.email, password: formData.password, role: getExpectedRole(activeTab) });
      navigate(getRedirectPath(user.role, location.state?.from?.pathname), { replace: true, state: location.state?.from?.state });
    } catch (error) {
      setErrorMessage(error.message || "Authentication failed");
    }
  };

  const activeColor = tabs.find((t) => t.key === activeTab)?.color || "green";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center py-12 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-semibold tracking-wide">Secure Access</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">
            Welcome to <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">ReVastra</span>
          </h1>
          <p className="text-gray-500 text-sm">Login or register to access your dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => (
              <button key={tab.key} type="button"
                onClick={() => { setActiveTab(tab.key); setErrorMessage(""); }}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? `bg-${tab.color}-500 text-white shadow-lg shadow-${tab.color}-500/25`
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300 border border-white/5"
                }`}>
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          {/* Info banners */}
          {activeTab === "admin-login" && (
            <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">
              {"\uD83D\uDC51"} Admin: admin@revastra.com / Admin@12345
            </div>
          )}
          {activeTab === "collector-login" && (
            <div className="mb-5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 px-4 py-3 text-sm text-yellow-300">
              {"\uD83D\uDE9A"} Demo: collector@revastra.com / Collector@123
            </div>
          )}
          {activeTab === "recycler-login" && (
            <div className="mb-5 rounded-xl bg-purple-500/10 border border-purple-500/20 px-4 py-3 text-sm text-purple-300">
              {"\uD83C\uDFED"} Demo: greencycle@revastra.com / Recycler@123
            </div>
          )}
          {errorMessage && (
            <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {"\u26A0\uFE0F"} {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === "user-register" && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition" />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition" />
            </div>
            <button type="submit" disabled={isLoading}
              className={`w-full bg-gradient-to-r from-${activeColor}-500 to-${activeColor === "green" ? "emerald" : activeColor}-500 hover:from-${activeColor}-400 hover:to-${activeColor === "green" ? "emerald" : activeColor}-400 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-${activeColor}-500/20 disabled:opacity-60 hover:-translate-y-0.5`}>
              {isLoading ? "Please wait..." : activeTab === "user-register" ? "\u2728 Create Account" : `\u2192 Login as ${getExpectedRole(activeTab).charAt(0).toUpperCase() + getExpectedRole(activeTab).slice(1)}`}
            </button>
          </form>

          {activeTab === "user-login" && (
            <p className="mt-4 text-center text-gray-500 text-sm">
              Don&apos;t have an account?{" "}
              <button type="button" onClick={() => setActiveTab("user-register")} className="text-green-400 font-semibold hover:underline">Register here</button>
            </p>
          )}
          {activeTab === "user-register" && (
            <p className="mt-4 text-center text-gray-500 text-sm">
              Already have an account?{" "}
              <button type="button" onClick={() => setActiveTab("user-login")} className="text-green-400 font-semibold hover:underline">Login here</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
