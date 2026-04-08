import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-green-600">
          ReVastra ♻️
        </Link>

        <div className="flex items-center gap-6 text-gray-700 font-medium">
          <Link to="/" className="hover:text-green-600 transition">
            Home
          </Link>
          <Link to="/sell" className="hover:text-green-600 transition">
            Sell Device
          </Link>
          <Link to="/dashboard" className="hover:text-green-600 transition">
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}