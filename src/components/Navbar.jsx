import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function getDashboardPath(role) {
  if (role === "admin") {
    return "/admin";
  }
  if (role === "collector") {
    return "/collector";
  }
  if (role === "recycler") {
    return "/recycler";
  }
  return "/dashboard";
}

function getDashboardLabel(role) {
  if (role === "admin") {
    return "Admin";
  }
  if (role === "collector") {
    return "Collector";
  }
  if (role === "recycler") {
    return "Recycler";
  }
  return "Dashboard";
}

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const dashboardPath = getDashboardPath(user?.role);
  const dashboardLabel = getDashboardLabel(user?.role);

  return (
    <nav className="bg-white shadow-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-green-600">
          ReVastra {"\u267B\uFE0F"}
        </Link>

        <div className="flex items-center gap-6 text-gray-700 font-medium">
          <Link to="/" className="hover:text-green-600 transition">
            Home
          </Link>

          {user?.role === "user" || !isAuthenticated ? (
            <Link to="/sell" className="hover:text-green-600 transition">
              Sell Device
            </Link>
          ) : null}

          {isAuthenticated ? (
            <>
              <Link to={dashboardPath} className="hover:text-green-600 transition">
                {dashboardLabel}
              </Link>

              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="hover:text-green-600 transition">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
