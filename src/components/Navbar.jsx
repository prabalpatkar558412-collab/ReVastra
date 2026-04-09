import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();

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
          <Link to="/sell" className="hover:text-green-600 transition">
            Sell Device
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hover:text-green-600 transition">
                Dashboard
              </Link>

              {user?.role === "admin" ? (
                <Link to="/admin" className="hover:text-green-600 transition">
                  Admin
                </Link>
              ) : null}

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
