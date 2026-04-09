import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="relative z-50 border-b border-slate-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link
          to="/"
          onClick={closeMenu}
          className="text-2xl font-bold tracking-tight text-emerald-600"
        >
          ReVastra
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            to="/register"
            className="rounded-lg border border-emerald-600 px-4 py-2 font-medium text-emerald-600 transition hover:bg-emerald-50"
          >
            Register
          </Link>

          <Link
            to="/login"
            className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-800"
          >
            Login
          </Link>
        </div>

        <button
          type="button"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-slate-200 md:hidden">
          <div className="flex flex-col gap-3 px-6 py-4">
            <Link
              to="/register"
              onClick={closeMenu}
              className="rounded-lg border border-emerald-600 px-4 py-3 text-center font-medium text-emerald-600 transition hover:bg-emerald-50"
            >
              Register
            </Link>

            <Link
              to="/login"
              onClick={closeMenu}
              className="rounded-lg bg-slate-900 px-4 py-3 text-center font-medium text-white transition hover:bg-slate-800"
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}