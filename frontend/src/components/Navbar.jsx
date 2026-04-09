import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  Menu,
  X,
  Cpu,
  UserCircle2,
  LogOut,
  LayoutDashboard,
  PlusCircle,
} from "lucide-react";
import { auth } from "../firebase";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMobileOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `relative text-sm font-medium transition duration-200 ${
      isActive(path)
        ? "text-emerald-600"
        : "text-slate-700 hover:text-emerald-600"
    }`;

  const navItemUnderline = (path) =>
    isActive(path)
      ? "after:absolute after:left-0 after:-bottom-2 after:h-0.5 after:w-full after:rounded-full after:bg-emerald-600"
      : "";

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-5 md:px-6 md:py-4">
        <Link
          to="/"
          onClick={closeMobileMenu}
          className="flex min-w-0 items-center gap-2 sm:gap-3"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md sm:h-11 sm:w-11">
            <Cpu size={22} />
          </div>

          <div className="min-w-0 leading-tight">
            <p className="truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg">
              ElectroParts
            </p>
            <p className="truncate text-[11px] text-slate-500 sm:text-xs">
              Smart E-Waste & Electronics
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-5 lg:gap-6 md:flex">
          <Link
            to="/"
            className={`${navLinkClass("/")} ${navItemUnderline("/")}`}
          >
            Home
          </Link>

          <Link
            to="/categories"
            className={`${navLinkClass("/categories")} ${navItemUnderline("/categories")}`}
          >
            Categories
          </Link>

          {currentUser ? (
            <>
              <Link
                to="/sell"
                className={`${navLinkClass("/sell")} ${navItemUnderline("/sell")} flex items-center gap-1`}
              >
                <PlusCircle size={16} />
                Sell Parts
              </Link>

              <Link
                to="/dashboard"
                className={`${navLinkClass("/dashboard")} ${navItemUnderline("/dashboard")} flex items-center gap-1`}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>

              <div className="flex items-center gap-2 lg:gap-3 pl-2">
                <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 lg:flex">
                  <UserCircle2 size={18} className="text-emerald-600" />
                  <span className="max-w-[140px] xl:max-w-[160px] truncate text-sm text-slate-700">
                    {currentUser.email}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 md:px-4"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 lg:gap-3">
              <Link
                to="/login"
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-emerald-600 md:px-4"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-md transition hover:scale-[1.02] hover:shadow-lg md:px-4"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className={navLinkClass("/")}
            >
              Home
            </Link>

            <Link
              to="/categories"
              onClick={closeMobileMenu}
              className={navLinkClass("/categories")}
            >
              Categories
            </Link>

            {currentUser ? (
              <>
                <Link
                  to="/sell"
                  onClick={closeMobileMenu}
                  className={`${navLinkClass("/sell")} flex items-center gap-2`}
                >
                  <PlusCircle size={16} />
                  Sell Parts
                </Link>

                <Link
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className={`${navLinkClass("/dashboard")} flex items-center gap-2`}
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                  Signed in as
                  <div className="mt-1 truncate font-medium text-slate-800">
                    {currentUser.email}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}