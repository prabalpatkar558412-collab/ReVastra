import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-300 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* BRAND */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-green-500/15 border border-green-400/20 flex items-center justify-center text-xl">
                ♻️
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">ReVastra</h2>
                <p className="text-xs text-green-400 uppercase tracking-widest">
                  Smart Recycling
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-400 leading-6">
              A smart circular economy platform enabling responsible e-waste
              recycling, fair value exchange, and real-time environmental impact tracking.
            </p>

            {/* SOCIAL ICONS */}
            <div className="flex gap-3 mt-6">
              {[FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn].map(
                (Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-gray-700 hover:bg-green-500 hover:text-white hover:border-green-500 transition"
                  >
                    <Icon size={16} />
                  </a>
                )
              )}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
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
            <h3 className="text-white text-lg font-semibold mb-4">
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

          {/* CONTACT */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              Contact Us
            </h3>

            <div className="space-y-4 text-sm text-gray-400">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-green-400" />
                <span>support@revastra.com</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={18} className="text-green-400" />
                <span>+91 98765 43210</span>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-green-400 mt-1" />
                <span>Bhopal, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 text-center md:text-left">
            © 2026 ReVastra. All rights reserved.
          </p>

          <div className="flex gap-4 text-xs text-gray-500">
            <Link to="/privacy" className="hover:text-green-400">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-green-400">
              Terms
            </Link>
            <Link to="/support" className="hover:text-green-400">
              Support
            </Link>
          </div>

          <p className="text-xs text-gray-500 text-center md:text-right">
            Built for sustainable tech ♻️
          </p>
        </div>
      </div>
    </footer>
  );
}