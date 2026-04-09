import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function getDashboardPath(role) {
  if (role === "admin") return "/admin";
  if (role === "collector") return "/collector";
  if (role === "recycler") return "/recycler";
  return "/dashboard";
}

function getDashboardLabel(role) {
  if (role === "admin") return "Admin";
  if (role === "collector") return "Collector";
  if (role === "recycler") return "Recycler";
  return "Dashboard";
}

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHome = location.pathname === "/";
  const dashboardPath = getDashboardPath(user?.role);
  const dashboardLabel = getDashboardLabel(user?.role);

  const navClass = isHome
    ? "fixed top-0 left-0 right-0 z-50 bg-gray-950/60 backdrop-blur-xl border-b border-white/5"
    : "sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100";

  const textClass = isHome ? "text-gray-300 hover:text-green-400" : "text-gray-700 hover:text-green-600";
  const logoClass = isHome ? "text-white" : "text-green-600";

  return (
    <nav className={navClass}>
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className={`text-2xl font-black tracking-tight ${logoClass} transition`}>
          ReVastra <span className="text-green-400">{"\u267B\uFE0F"}</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className={`text-sm font-medium transition ${textClass}`}>Home</Link>
          {(user?.role === "user" || !isAuthenticated) && (
            <Link to="/sell" className={`text-sm font-medium transition ${textClass}`}>Sell Device</Link>
          )}
          {isAuthenticated ? (
            <>
              <Link to={dashboardPath} className={`text-sm font-medium transition ${textClass}`}>{dashboardLabel}</Link>
              <button onClick={logout}
                className={`text-sm font-medium px-4 py-2 rounded-xl transition ${isHome ? "bg-white/10 hover:bg-white/15 text-white border border-white/10" : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"}`}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login"
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-green-500/20">
              Login
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className={`md:hidden ${isHome ? "text-white" : "text-gray-700"}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={`md:hidden px-6 pb-4 flex flex-col gap-3 ${isHome ? "bg-gray-950/90 backdrop-blur-xl" : "bg-white"}`}>
          <Link to="/" onClick={() => setMobileOpen(false)} className={`text-sm font-medium py-2 ${textClass}`}>Home</Link>
          {(user?.role === "user" || !isAuthenticated) && (
            <Link to="/sell" onClick={() => setMobileOpen(false)} className={`text-sm font-medium py-2 ${textClass}`}>Sell Device</Link>
          )}
          {isAuthenticated ? (
            <>
              <Link to={dashboardPath} onClick={() => setMobileOpen(false)} className={`text-sm font-medium py-2 ${textClass}`}>{dashboardLabel}</Link>
              <button onClick={() => { logout(); setMobileOpen(false); }}
                className={`text-sm font-medium py-2 text-left ${textClass}`}>Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileOpen(false)} className="bg-green-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl text-center">Login</Link>
          )}
        </div>
      )}
    </nav>
  );
}
