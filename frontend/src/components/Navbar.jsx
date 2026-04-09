import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
      <Link to="/" className="text-2xl font-bold text-green-600">
        ReVastra
      </Link>

      <div className="flex items-center gap-4">
        <Link
          to="/register"
          className="px-4 py-2 rounded-lg border border-green-600 text-green-600 hover:bg-green-50"
        >
          Register
        </Link>

        <Link
          to="/login"
          className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
        >
          Login
        </Link>
      </div>
    </nav>
  );
}