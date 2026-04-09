import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLink = (path) =>
    `text-sm font-medium transition ${
      isActive(path)
        ? "text-blue-600"
        : "text-slate-700 hover:text-blue-600"
    }`;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
            E
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">
              ElectroParts
            </p>
            <p className="text-xs text-slate-500 -mt-1">
              Mobile & Electronics Parts
            </p>
          </div>
        </Link>

        {/* LINKS */}
        <div className="flex items-center gap-5">

          <Link to="/" className={navLink("/")}>
            Home
          </Link>

          <Link to="/categories" className={navLink("/categories")}>
            Categories
          </Link>

          {currentUser ? (
            <>
              <Link to="/sell" className={navLink("/sell")}>
                Sell Parts
              </Link>

              <Link to="/dashboard" className={navLink("/dashboard")}>
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={navLink("/login")}>
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}