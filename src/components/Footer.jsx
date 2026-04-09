import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* TOP GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          {/* BRAND */}
          <div>
            <h2 className="text-3xl font-bold text-green-400 mb-4 tracking-wide">
              ReVastra ♻️
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              A smart circular economy platform that enables responsible 
              e-waste recycling, fair value exchange, and real-time 
              environmental impact tracking.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Quick Links
            </h3>

            <div className="flex flex-col gap-3 text-sm">
              {[
                { name: "Home", path: "/" },
                { name: "Sell Device", path: "/sell" },
                { name: "Dashboard", path: "/dashboard" },
                { name: "Admin Panel", path: "/admin" },
              ].map((link, i) => (
                <Link
                  key={i}
                  to={link.path}
                  className="hover:text-green-400 hover:translate-x-1 transition-all duration-200"
                >
                  → {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* FEATURES */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Platform Highlights
            </h3>

            <ul className="text-sm space-y-3">
              <li className="hover:text-green-400 transition">
                ♻️ Smart E-Waste Recycling
              </li>
              <li className="hover:text-green-400 transition">
                💰 Transparent Device Valuation
              </li>
              <li className="hover:text-green-400 transition">
                🚚 Pickup & Recycler Matching
              </li>
              <li className="hover:text-green-400 transition">
                🌍 Environmental Impact Tracking
              </li>
            </ul>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="border-t border-gray-700 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">

          {/* COPYRIGHT */}
          <p className="text-gray-500 text-sm text-center sm:text-left">
            © 2026 ReVastra. All rights reserved.
          </p>

          {/* TAGLINE */}
          <p className="text-gray-500 text-xs text-center sm:text-right">
            Built for sustainable tech ♻️
          </p>
        </div>
      </div>
    </footer>
  );
}