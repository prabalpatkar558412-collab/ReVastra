import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-10">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* TOP GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* BRAND */}
          <div>
            <h2 className="text-2xl font-bold text-green-600 mb-3">
              ReVastra ♻️
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              A smart circular economy platform that helps users recycle
              electronic waste responsibly, earn value, and track environmental
              impact.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Quick Links
            </h3>

            <div className="flex flex-col gap-2 text-gray-600 text-sm">
              <Link to="/" className="hover:text-green-600 transition">
                Home
              </Link>
              <Link to="/sell" className="hover:text-green-600 transition">
                Sell Device
              </Link>
              <Link to="/dashboard" className="hover:text-green-600 transition">
                Dashboard
              </Link>
              <Link to="/admin" className="hover:text-green-600 transition">
                Admin Panel
              </Link>
            </div>
          </div>

          {/* CONTACT / INFO */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Platform Highlights
            </h3>

            <ul className="text-gray-600 text-sm space-y-2">
              <li>♻️ Smart E-Waste Recycling</li>
              <li>💰 Transparent Device Valuation</li>
              <li>🚚 Pickup & Recycler Matching</li>
              <li>🌍 Environmental Impact Tracking</li>
            </ul>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="border-t pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">

          {/* COPYRIGHT */}
          <p className="text-gray-500 text-sm text-center sm:text-left">
            © 2026 ReVastra. All rights reserved.
          </p>

          {/* SOCIAL / TAGLINE */}
          <p className="text-gray-400 text-xs text-center sm:text-right">
            Built for sustainable tech ♻️
          </p>
        </div>
      </div>
    </footer>
  );
}